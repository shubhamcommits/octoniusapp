import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {PostService} from "../../../../shared/services/post.service";
import {Subject} from "rxjs/Subject";
import {takeUntil} from "rxjs/operators";
import { saveAs } from 'file-saver';
import {GroupService} from "../../../../shared/services/group.service";
import {CommentSectionComponent} from "../../comments/comment-section/comment-section.component";
import * as moment from 'moment';
import { GroupActivityComponent } from '../../../../dashboard/groups/group/group-activity/group-activity.component';
import {SnotifyService} from "ng-snotify";

@Component({
  selector: 'task-group-post',
  templateUrl: './task-group-post.component.html',
  styleUrls: ['./task-group-post.component.scss']
})
export class TaskGroupPostComponent implements OnInit {
  @ViewChild(CommentSectionComponent) commentSectionComponent;
  @ViewChild('taskStatusList') taskStatusList;
  @Input() groupactivity: GroupActivityComponent;

  @Input() post;
  @Input('group') group;
  @Input('user') user;
  @Input('user_data') user_data;
  @Input('allMembersId') allMembersId;
  @Input('socket') socket;
  @Input('modules') modules;
  @Input('isItMyWorkplace') isItMyWorkplace;

  @Output('deletePost') removePost = new EventEmitter();

  @Output() statusChanged: EventEmitter<any> = new EventEmitter();

  // alerts & messages
  staticAlertClosed = false;
  alert = {
    class: '',
    message: ''
  };
  _message = new Subject<string>();

  // whether we display certain sections of template
  commentsDisplayed = false;
  displayCommentEditor = false;
  displayEditPostSection = false;

  // the total amount of comments that this post has
  commentCount = 0;

  // collection of loaded comments
  comments = [];

  // edit post
  edit_content = '';
  selectedGroupUsers = [];
  assignment = 'UnAssigned';
  model_date;

  // editor
  editor;

  // mentions
  content_mentions = [];

  ngUnsubscribe = new Subject();

  tags: any = [];

  constructor(
    private postService: PostService,
    private groupService: GroupService,
    private snotifyService: SnotifyService) { }

  ngOnInit() {
    this.commentCount = this.post.comments.length;

            // saving the app from getting crashed because it might be undefined
            if (this.post['tags'] != undefined) {
              this.tags = this.post.tags;
            }
            else {
              this.tags = [];
            }
  }

  deletePost() {
    this.removePost.emit(this.post._id);
  }

  editPost() {
    // set the values for the modal so that they display the current values of the post
    const dateObj = moment(this.post.task.due_to, 'YYYY-MM-DD');
    this.model_date = {year: dateObj.year(), month: dateObj.month(), day: dateObj.date()};
    this.selectedGroupUsers = [this.post.task._assigned_to];
    this.assignment = 'Assigned';

    // set the initial value of the editor
    this.edit_content = this.post.content;

    // show the edit section
    this.displayEditPostSection = true;
  }

  onDownloadFile(fileName) {
    this.groupService.downloadGroupFile(this.group._id, fileName)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((file_toDownload) => {
        saveAs(file_toDownload, fileName);
      }, (err) => {});
  }

  onEditorCreated(quill) {
    this.editor = quill;
  }

  // The following three functions can be merged into one

  OnMarkTaskToDo() {
    // hide the dropdown after picking an item
    this.toggleTaskStatusList();

    const post = {
      'status': 'to do'
    };



    this.postService.complete(this.post._id, post)
      .subscribe((res: any) => {
        this.playAudio();
        // Change the status on the frontend to match up with the backend
        this.post.task.status = res.post.task.status;
        this.groupService.taskStatusChanged.next();

        this.snotifyService.success("Task updated sucessfully!", "Good Job!");

      }, (err) => {
        console.log('Error:', err);
      });
  }

  OnMarkTaskInProgress() {
    // hide the dropdown after picking an item
    this.toggleTaskStatusList();

    const post = {
      'status': 'in progress'
    };
    this.postService.complete(this.post._id, post)
      .subscribe((res: any) => {
        this.playAudio();

        // Change the status on the frontend to match up with the backend
        this.post.task.status = res.post.task.status;
        this.groupService.taskStatusChanged.next();

        this.snotifyService.success('Task updated sucessfully!', 'Good Job!');
      }, (err) => {
        console.log('Error:', err);
      });
  }


  OnMarkTaskCompleted() {
    // hide the dropdown after picking an item
    this.toggleTaskStatusList();

    const post = {
      'status': 'done'
    };

    this.postService.complete(this.post._id, post)
      .subscribe((res: any) => {

        this.playAudio();

        this.alert.class = 'success';
        this._message.next(res['message']);

        // change its status on the frontend to match up with the backend
        this.post.task.status = res.post.task.status;

        this.snotifyService.success('Task updated sucessfully!', 'Good Job!');
        this.groupService.taskStatusChanged.next();

      }, (err) => {
        if (err.status) {
          this._message.next(err.error.message);
        } else {
          this._message.next('Error! either server is down or no internet connection');
        }
      });
  }

  // this function can become a shared one on a service;
  OnSaveEditPost() {

    // we create a new date object based on whether we added time
    const date_due_to = new Date(this.model_date.year, this.model_date.month - 1, this.model_date.day);

    const post = {
      'content': this.edit_content,
      '_content_mentions': this.content_mentions,
      'type': this.post.type,
      'assigned_to': this.selectedGroupUsers,
      'date_due_to': moment(date_due_to).format(),
      'status': this.post.task.status,
      'tags': this.tags
    };

    // handle mentions
    const scanned_content = post.content;
    var el = document.createElement('html');
    el.innerHTML = scanned_content;

    if (el.getElementsByClassName('mention').length > 0) {

      // console.log('Element',  el.getElementsByClassName( 'mention' ));
      for (var i = 0; i < el.getElementsByClassName('mention').length; i++) {
        if (el.getElementsByClassName('mention')[i]['dataset']['value'] === "all") {
          this.content_mentions = [...this.content_mentions, ...this.allMembersId];
        } else {
          if (!this.content_mentions.includes(el.getElementsByClassName('mention')[i]['dataset']['id']))
            this.content_mentions.push(el.getElementsByClassName('mention')[i]['dataset']['id']);
        }
      }

      for (var i = 0; i < this.content_mentions.length; i++) {
        post._content_mentions = this.content_mentions;
      }
    }

    if(this.tags.length>0){
      for(let i = 0 ; i < this.tags.length; i ++){
        post.tags = this.tags;
      }
    }

    // SERVER REQUEST
    this.postService.editPost(this.post._id, post)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res) => {
        this.alert.class = 'success';
        this._message.next(res['message']);

        // we don't want to display the editor after editing
        this.displayEditPostSection = false;
        this.resetEditPostForm();

        // mirror the backend data to keep the user up-to-date
        this.post = res.post;

        // socket notifications
        const data = {
          // it should get automatically, something like workspace: this.workspace_name
          workspace: this.user_data.workspace.workspace_name,
          // it should get automatically, something like group: this.group_name
          group: this.group.group_name,
          userId: this.user_data.user_id,
          postId: res['post']._id,
          groupId: this.group._id,
          type: 'post'
        };

        this.socket.emit('newPost', data);
        this.content_mentions = [];
        this.tags = this.post.tags;
      }, (err) => {

        this.alert.class = 'danger';
        this.content_mentions = [];
        this.tags = this.post.tags;

        if (err.status) {
          this._message.next(err.error.message);
        } else {
          this._message.next('Error! either server is down or no internet connection');
        }

      });
  }

  openAssignPicker() {
    // open the assign users modal
    this.postService.openAssignUsers.next(
      {
        options: {centered: true},
        selectedGroupUsers: this.selectedGroupUsers,
        group: this.group,
        // these are the setting for picking a user, later we might want to add this in
        // the modal component itself and link it to post.type
        settings: {
          text: 'Select Group Members',
          classes: 'myclass custom-class',
          singleSelection: true,
          primaryKey: '_id',
          labelKey: 'full_name',
          noDataLabel: 'Search Members...',
          enableSearchFilter: true,
          searchBy: ['full_name', 'capital']
        }
      });

    // when the user completed adding users then we receive the result here
    this.postService.usersAssigned.subscribe((data: any) => {
      this.selectedGroupUsers = data.selectedGroupUsers || [];
      this.assignment = data.assignment || 'UnAssigned';
    });
  }

  openDatePicker() {
    // trigger the datepicker modal to open
    this.postService.openDatePicker.next(
      {
        options: {centered: true},
        isItMyWorkplace: this.isItMyWorkplace,
        model_date: this.model_date
      });

    // when the date is picked in the modal we receive the result here.
    this.postService.datePicked
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(model_date => this.model_date = model_date);
  }

  playAudio() {
    this.postService.playAudio();
  }

  resetEditPostForm() {
    this.model_date = null;
    this.edit_content = '';
    this.content_mentions = [];
    this.selectedGroupUsers = [];
  }

  setComments(comments) {
    this.comments = comments;
  }

  setDate(pickedDate) {
    this.model_date = pickedDate;
  }

  toggleComments() {
    this.commentsDisplayed = !this.commentsDisplayed;

    if (!this.commentsDisplayed) {
      this.comments = [];
    }
  }

  togglePostCommentEditor() {
    this.commentSectionComponent.displayCommentEditor = !this.commentSectionComponent.displayCommentEditor;
  }

  toggleTaskStatusList() {
    // we hide or display the possible task statuses
    this.taskStatusList.nativeElement.style.display =
      this.taskStatusList.nativeElement.style.display === 'block' ? 'none' : 'block';
  }

  usersSelected(users) {
    this.selectedGroupUsers = users;
    this.assignment = users.length < 1 ? "UnAssigned" : "Assigned";
  }

  addTags() {
    const tag = document.getElementById('tags');
    this.tags.push(tag['value']);
    this.post.tags = this.tags;
    tag['value'] = '';
    console.log(this.tags);
  }

  removeTag(index) {
    this.tags.pop(index);
    this.post.tags = this.tags;
  }

}
