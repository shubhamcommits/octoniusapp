import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommentSectionComponent } from '../../../../../common/components/comments/comment-section/comment-section.component';
import { PostService } from '../../../../../shared/services/post.service';
import { GroupService } from '../../../../../shared/services/group.service';
import { SnotifyService } from 'ng-snotify';
import { environment } from '../../../../../../environments/environment';
import moment from 'moment';

@Component({
  selector: 'app-group-kanban-task-view',
  templateUrl: './group-kanban-task-view.component.html',
  styleUrls: ['./group-kanban-task-view.component.scss']
})
export class GroupKanbanTaskViewComponent implements OnInit {

  constructor(public modalService: NgbModal, 
    public postService: PostService,
    private groupService: GroupService,
    private snotifyService: SnotifyService) { }

  @Input('task') task: any;
  @Input('columns') columns: any;
  @Input('allMembersId') allMembersId: any;
  @Input('groupData') groupData: any;
  @Input('socket') socket: any;
  @Input ('quillModules') quillModules: any;
  @Output() closeModal = new EventEmitter();
  @Output() moveTask = new EventEmitter();
  @ViewChild(CommentSectionComponent, { static: true }) commentSectionComponent;

  user = JSON.parse(localStorage.getItem('user_data'));
  user_data = JSON.parse(localStorage.getItem('user'));

  // whether we display certain sections of template
  commentsDisplayed = false;
  displayCommentEditor = false;
  displayEditPostSection = false;

  // the total amount of comments that this post has
  commentCount = 0;

  // collection of loaded comments
  comments = [];

  // Users in a group
  usersInGroup = [];

  // Environment Variables
  BASE_URL = environment.BASE_URL;

  // Date Model
  modelDate;

  // Task Content
  taskContent;

  // Title
  editingTitle = false;
  postTitle;

  ngOnInit() {
    const dateTask = moment(this.task.task.due_to);
    this.modelDate = {year: dateTask.year(), month: dateTask.month() + 1, day: dateTask.date()};
    this.taskContent = this.task.content;
    this.postTitle = this.task.title;
  }

  /**
   * This function closes the modal via event emitter
   */
  sendCloseModalMessage() {
    this.closeModal.emit("close");
  }

  /**
   * This function replicates the functioanlity of CDK Drag and Drop Event
   * @param task 
   * @param oldColumn 
   * @param newColumn 
   * Hence emits an message to the parent when the task is moved from one column to another via dropdown
   */
  sendMoveTaskMessage(task, oldColumn, newColumn){
    // updating the task column status before emitting the message
    task.task._column.title = newColumn;
    this.moveTask.emit({
      task, oldColumn, newColumn
    });
    
  }

  /**
   * This function changes the task status from the drop down
   * @param post 
   * @param status 
   * Makes a HTTP Put request to change the status to as 'to do', 'in progress', 'done'
   */
  async changeStatus(post, status){
    const object = {
      status: status
    }
    return new Promise((resolve)=>{
      this.postService.complete(post._id, object)
      .subscribe((res)=>{
        post.task.status = status;
        resolve();
      })
    })
  }

  /**
   * This function searches for the member present in the group
   * @param $event 
   * Makes a HTTP GET Request to retrieve the results
   */
  async onSearchMember($event){
    return new Promise((resolve, reject)=>{
      if($event.target.value.length == 0)
        resolve([]);
      else{
        this.groupService.searchGroupUsers(this.groupData._id, $event.target.value)
        .subscribe((res)=>{
          // console.log(res);
          this.usersInGroup = res['users'];
          resolve(res['users']);
        }, (err)=>{
          this.snotifyService.error('Unable to fetch the users, please try again!');
          console.log('Error occured while searching the group members', err);
          reject([]);
        })
      }
    })
  }

  /**
   * This function changes the task assignee 
   * @param task - data of current task
   * @param user - data of assignee
   * Makes a HTTP PUT request
   */
  async onSelectUser(task, user){
    // console.log(task, user, assignee);
    const assigneeId = {
      assigneeId: user._id
    }
    return new Promise((resolve, reject)=>{
      this.groupService.changeTaskAssignee(task._id, assigneeId)
      .subscribe((res)=>{
        this.task = res['post'];
        this.snotifyService.success('Task reassigned successfully!');
        resolve();
      }, (err)=>{
        this.snotifyService.error('Unepxected error occured while re-assigning, please try again!');
        console.log('Error occured while searching the group members', err);
        reject();
      })
    })
  }

  /**
   * This function only changes the due date for a given task
   * @param task - Task Post Details
   * @param $event - Contains the Due Date details
   * Irrespective of anything it calls the edit post API, maybe make a separate date changing API only for tasks and events?
   */
  async setDate(task, $event){
    // console.log($event)
    let date = new Date($event.year, ($event.month-1), $event.day)
    this.task.task.due_to = moment(date).format('YYYY-MM-DD')
    return new Promise((resolve, reject)=>{
      
      const taskPost = {
        title: task.title,
        type: task.type,
        content: task.content,
        _content_mentions: task._content_mentions,
        tags: task.tags,
        _read_by: [],
        unassigned: task.task.unassigned,
        date_due_to: moment(date).format('YYYY-MM-DD'),
        assigned_to: task.task._assigned_to,
        _column: {
          title:task.task._column.title
        },
        status: task.task.status
      }
      // console.log(taskPost)
      this.postService.editPost(task._id, taskPost)
      .subscribe((res)=>{
        console.log(res);
        // this.task.task.due_to = res['post'].task.due_to;
        this.snotifyService.success('Due date changed successfully!');
        resolve()
      }, (err)=>{
        this.snotifyService.error('There\'s some unexpected error occured, please try again later!');
        console.log('Error occured while moving the task to the column', err);
        reject();
      })
    })
  }

  async onContentChanged($event){
    this.taskContent = $event.html;
  }

  /**
   * This function saves the task content
   * @param task - Task details
   * Irrespective of anything it calls the edit post API
   */
  async saveTaskContent(task){
    this.task.content = this.taskContent;
    this.task.title = this.postTitle;
    this.snotifyService.async('Please Wait, we are updating the task!', new Promise((resolve, reject)=>{
      const taskPost = {
        title: this.postTitle,
        type: task.type,
        content: this.taskContent,
        _content_mentions: task._content_mentions,
        tags: task.tags,
        _read_by: [],
        unassigned: task.task.unassigned,
        date_due_to: task.task.due_to,
        assigned_to: task.task._assigned_to,
        _column: {
          title:task.task._column.title
        },
        status: task.task.status
      }
      // console.log(taskPost)
      this.postService.editPost(task._id, taskPost)
      .subscribe((res)=>{
        // console.log(res);
        this.task.content = res['post'].content;
        resolve({
          body: 'Task updated successfully!',
          config:{
          timeout: 3000,
          closeOnClick: true,
          pauseOnHover: true,
          showProgressBar: true
          }
        });
      }, (err)=>{
        console.log('Error occured while updating the task content', err);
        reject({
          body: 'There\'s some unexpected error occured, please try again later!',
          config:{
            timeout: 3000,
            type: 'error',
            showProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            }
        });
      })
    }))
  
  }

  setComments(comments) {
    this.comments = comments;
  }

  toggleComments() {
    this.commentsDisplayed = !this.commentsDisplayed;

    if (!this.commentsDisplayed) {
      this.comments = [];
    }
  }

  editPost() {
    // show the edit section
    this.displayEditPostSection = true;
  }

  deletePost() {
  }

  togglePostCommentEditor() {
    this.commentSectionComponent.displayCommentEditor = !this.commentSectionComponent.displayCommentEditor;
  }

}
