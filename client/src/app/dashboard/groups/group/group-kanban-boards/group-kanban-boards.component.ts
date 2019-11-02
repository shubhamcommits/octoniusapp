import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { GroupDataService } from '../../../../shared/services/group-data.service';
import { GroupService } from '../../../../shared/services/group.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ColumnService } from '../../../../shared/services/column.service';
import { PostService } from '../../../../shared/services/post.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import io from 'socket.io-client';
import { environment } from '../../../../../environments/environment';
import { SnotifyService } from 'ng-snotify';
import moment from 'moment';
import { ReplaySubject } from 'rxjs/internal/ReplaySubject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';

@Component({
  selector: 'app-group-kanban-boards',
  templateUrl: './group-kanban-boards.component.html',
  styleUrls: ['./group-kanban-boards.component.scss']
})
export class GroupKanbanBoardsComponent implements OnInit {

  constructor(
    private dataService: GroupDataService,
    private groupService: GroupService,
    private route: ActivatedRoute,
    private location: Location,
    private columnService: ColumnService,
    private postService: PostService,
    private modalService: NgbModal,
    private snotifyService: SnotifyService) { }

  // Groups
  groupData: any = {};
  groupId;
  allMembersId;

  // Columns
  createColumn = false;
  newColumnName = '';
  columns: any = [];

  // Tasks
  newTaskTitle = '';

  // Quill Modules
  quillModules = {}

  /*Initiating socket and related data*/
  socket = io(environment.BASE_URL, {
    path: '/socket.io',
    transports: ['websocket'],
    secure: true,
  });

  // Today's date object
  today = moment().local().startOf('day').format('YYYY-MM-DD');

  // Unsubscribe the Data
  private unSubscribe$: ReplaySubject<boolean> = new ReplaySubject(1);

  async ngOnInit() {
    this.groupId = await this.fetchGroupId();
    this.groupData = await this.getGroupData();
    /**
     * If we found that groupData from the shared service is empty, then we call the HTTP request from server to fetch the updated information
     */
    if(JSON.stringify(this.groupData) === JSON.stringify({})){
      this.groupData = await this.getGroup(this.groupId);
    }
    // console.log(this.groupData);
    this.allMembersId = this.groupData._members.map((member)=>{
      return member._id;
    })
    // console.log(this.allMembersId);
    /**
     * Here we fetch all the columns available in a group, and if null we initialise them with the basic 3 ones
     */
    this.columns =  await this.getAllColums(this.groupId);
    if(this.columns == null){
      this.columns = await this.initialiseColumns(this.groupId);
    }

    // console.log(this.columns);
    await this.getTasks(this.groupId);
    // console.log(this.columns);

    this.quillModules = await this.getGroupQuillModules();
    // console.log(this.quillModules);
  }

  /**
   * Fetching groupId from the activatedRoute observable and returning it as a new Promise
   */
  async fetchGroupId(){
    return new Promise((resolve)=>{
      this.route.params
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe((params) => {
        resolve(params['id']);
      });
    })
  }

  /**
   * Returns data as the new promise from groupDataService(shared)
   * This service is fetching data from Group Header Component
   * This function is made to reduce the HTTP calls and load on server
   */
  async getGroupData(){
    return new Promise((resolve)=>{
      this.dataService.currentGroupData
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe((res)=>{
        resolve(res);
      })
    })
  }

  /**
   * Returns data as the new promise from groupDataService(shared)
   * This service is fetching data from Group Activity Component
   * This function is made to reduce the HTTP calls and load on server
   */
  async getGroupQuillModules(){
    return new Promise((resolve)=>{
      this.dataService.currentGroupQuillModules
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe((res)=>{
        resolve(res);
      })
    })
  }

  /**
   * This function initialises the basic columns - todo, inprogress and done states
   * @param groupId 
   */
  async initialiseColumns(groupId){
    return new Promise((resolve, reject)=>{
      this.columnService.initColumns(groupId)
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe((res)=>{
        resolve(res['columns']);
      }, (err)=>{
        this.snotifyService.error('Unable to initialise the columns, please try again later!');
        console.log('Error occured while initiliasing columns', err);
        reject({});
      })
    })
  }

  /**
   * This functions fetches all the columns present in a Group Board
   * @param groupId 
   */
  async getAllColums(groupId){
    return new Promise((resolve, reject)=>{
      this.columnService.getAllColumns(groupId)
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe(async (res)=>{
        if(res == null)
          resolve(null)
        else
        resolve(res['columns']);
      }, (err)=>{
        this.snotifyService.error('Unable to fetch the columns from the server, please try again later!');
        console.log('Error occured while fetching columns', err);
        reject({});
      })
    })
  }

  /**
   * Standard Angular CDK Event which monitors the drop functionality between different columns
   * @param event 
   */
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      var post = event.previousContainer.data[event.previousIndex];
      this.moveTaskToNewColumn(post, event.previousContainer.id, event.container.id);
      transferArrayItem(event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex);
    }
  }

  /**
   * GET Request to fetch the group data, and it returns a new Promise with the logic below
   * This function will be called if groupDataService has an empty object
   * @param groupId 
   */
  async getGroup(groupId){
    return new Promise((resolve, reject)=>{
      this.groupService.getGroup(groupId)
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe((res)=>{
        // console.log('Group Data', res);
        resolve(res['group']);
      }, (err)=>{
        this.snotifyService.error('Unable to fetch current group details from the server, please try again later!');
        console.log('Error while fetching the data', err);
        reject({});
      })
    })
  }

  /**
   * Go back to the previous route
   */
  goBack(){
    this.location.back();
  }

  /**
   * This function fetches all the task the tasks which are having status as todo or inprogress
   * @param groupId 
   */
  async getTasks(groupId) { 
    return new Promise((resolve, reject)=>{
      this.groupService.getGroupTasks(groupId)
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe(async (res) => {
        for(let i = 0; i < this.columns.length; i++){
          // if(this.columns[i]['title'] != 'done'){
            this.columns[i]['tasks'] = res['posts']
            .filter(post => post.task.hasOwnProperty('_column') === true && post.task._column != null && post.task._column.title === this.columns[i]['title'])
          // }
          // if(this.columns[i]['title'] != 'done'){
            Array.prototype.push.apply(this.columns[i]['tasks'], res['posts']
            .filter(post => post.task.status === this.columns[i]['title'] && post.task.hasOwnProperty('_column') === false && post.task._column != null));
          // }
        }
        // await this.getCompletedTasks(groupId);
        resolve(this.columns)
      }, (err) => {
        this.snotifyService.error('Unable to fetch the tasks from the server, please try again later!');
        console.log('Error Fetching the Pending Tasks Posts', err);
        reject({});
      });
    })
  }

  /**
   * GET Recent 20 Completed tasks, which will be displayed in the done column
   * @param groupId 
   */
  async getCompletedTasks(groupId) {
    return new Promise((resolve, reject)=>{
      this.groupService.getCompletedGroupTasks(groupId)
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe((res) => {
        let index = this.columns.findIndex((column)=> column.title === 'done');
        this.columns[index]['tasks'] = res['posts'].filter(completedTask => completedTask.task.status == 'done');
        resolve();
      }, (err) => {
        this.snotifyService.error('Unable to fetch all the completed tasks from the server, please try again later!');
        console.log('Error Fetching the Completed Tasks Posts', err);
        reject([]);
      });
    })
  }

  /**
   * This function creates a new column and add it to the current column array
   * @param groupId = this.groupId
   * @param columnName = this.newColumnName
   * Makes a HTTP Post request
   */
  async createNewColumn(groupId, columnName){
    return new Promise((resolve, reject)=>{
      this.columnService.addColumn(groupId, columnName)
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe((res)=>{
        this.columns.push({
          title: columnName,
          taskCount: 0,
          tasks:[]
        })
        this.createColumn = false;
        this.snotifyService.success('New Column created sucessfully!');
        resolve();
      }, (err)=>{
        this.snotifyService.error('There\'s some unexpected error occured, please try again later!');
        console.log('Error occured while creating a new Column', err);
        this.createColumn = false;
        reject({});
      })
    })
  }

  /**
   * This Function edits the column name present in the board
   * @param groupId 
   * @param currentColumnName 
   * @param newColumnName 
   * Makes a HTTP PUT Request
   */
  async editExistingColumn(groupId, currentColumnName, newColumnName){
    return new Promise((resolve, reject)=>{
      this.columnService.editColumnName(groupId, currentColumnName, newColumnName)
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe((res)=>{
        let index = this.columns.findIndex(column => column.title === currentColumnName);
        if(index != -1)
          this.columns[index]['title'] = newColumnName;
        this.snotifyService.success('Column name edited sucessfully!');
        resolve();
      }, (err)=>{
        this.snotifyService.error('There\'s some unexpected error occured, please try again later!');
        console.log('Error occured while editing the column', err);
        reject();
      })
    })
  }

  /**
   * This function deletes the existing column in the kanban board
   * @param groupId 
   * @param columnName 
   * Makes a HTTP PUT Request(? Change to DELETE maybe)
   */
  async deleteColumn(groupId, column){
    if(column.tasks.length == 0){
      return new Promise((resolve, reject)=>{
        this.columnService.deleteColumn(groupId, column.title)
        .pipe(takeUntil(this.unSubscribe$))
        .subscribe((res)=>{
          let index = this.columns.findIndex(col => col.title === column.title);
          if(index != -1)
            this.columns.splice(index, 1);
          this.snotifyService.success('Column deleted sucessfully!');
          resolve();
        }, (err)=>{
          this.snotifyService.error('There\'s some unexpected error occured, please try again later!');
          console.log('Error occured while removing the column', err);
          reject();
        })
      })
    } else{
      this.snotifyService.warning('You can\'t delete a column, with having tasks in it!');
    }

  }

  /**
   * This function creates an unassigned task and feeds the column property in a task
   * We can sort the tasks based on their columns titles
   * @param column 
   * @param taskTitle 
   * Makes a HTTP POST Request to add a new Unassigned task
   */
  async createNewTask(column, taskTitle){
    return new Promise((resolve, reject)=>{
      
      let taskStatus = '';
      switch(column.title){
        case 'to do':
          taskStatus = 'to do';
          break;
      }

      const taskPost = {
        title: taskTitle,
        content: '',
        type: 'task',
        _group: this.groupId,
        _posted_by: JSON.parse(localStorage.getItem('user')).user_id,
        task:{
          unassigned: 'Yes',
          status: (taskStatus === '') ? 'to do' : taskStatus,
          _column:{
            title: column.title
          }
        }
      }
      this.postService.addNewTaskPost(taskPost)
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe((res)=>{
        // console.log(res);
        let index = this.columns.findIndex(col => col.title === column.title);
        if(index != -1){
          this.columns[index]['tasks'].unshift(res['post']);
        }
        this.snotifyService.success('New task created sucessfully!');
        resolve(res['post']);
      }, (err)=>{
        this.snotifyService.error('There\'s some unexpected error occured, please try again later!');
        console.log('Error occured while adding the task to the column', err);
        reject();
      })
    })
  }

  /**
   * This function is responsible for moving the tasks from one column to another
   * And Updating the _column field
   * @param task 
   * @param oldColumn 
   * @param newColumn 
   */
  async moveTaskToNewColumn(task, oldColumn, newColumn){
    return new Promise((resolve, reject)=>{
      let taskStatus = task.task.status;
      switch(newColumn){
        case 'to do':
          taskStatus = 'to do';
          break;
      }

      const taskPost = {
        title: task.title,
        type: task.type,
        content: task.content,
        _content_mentions: task._content_mentions,
        tags: task.tags,
        _read_by: [],
        unassigned: task.task.unassigned,
        date_due_to: (task.task.due_to) ? task.task.due_to: null,
        assigned_to: task.task._assigned_to,
        _column: {
          title:newColumn
        },
        status: (taskStatus === task.task.status)? task.task.status : taskStatus
      }
      // console.log(taskPost)
      this.postService.editPost(task._id, taskPost)
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe((res)=>{
        // console.log(res);
        task.task._column.title = newColumn;
        resolve()
      }, (err)=>{
        this.snotifyService.error('There\'s some unexpected error occured, please try again later!');
        console.log('Error occured while moving the task to the column', err);
        reject();
      })
    })
  }

  /**
   * @param $event - recieves task, oldColumn and newColumn object
   * In order that we can perform this function from modal's change task column as well
   */
  async moveTaskFromDropDown($event){
    this.moveTaskToNewColumn($event.task, $event.oldColumn, $event.newColumn);
    let oldColumnIndex = this.columns.findIndex((column)=> column.title.toLowerCase() === $event.oldColumn.toLowerCase());
    let newColumnIndex = this.columns.findIndex((column)=> column.title.toLowerCase() === $event.newColumn.toLowerCase());
    this.columns[oldColumnIndex]['tasks'].splice($event.task, 1);
    this.columns[newColumnIndex]['tasks'].unshift($event.task);
  }

  /**
   * @param $event - recieves task, currentUser, and columnIndex and deletes the task from the current view 
   * As soon as we hit the delete post API
   */
  async deleteTask($event){
    let columnIndex = this.columns.findIndex((column)=> column.title.toLowerCase() === $event.task.task._column.title.toLowerCase());
    // this.columns[columnIndex]['tasks'].splice(, 1);
    let taskIndex = this.columns[columnIndex]['tasks'].findIndex((task)=> task._id === $event.task._id);
    // console.log(columnIndex, taskIndex);
    this.columns[columnIndex]['tasks'].splice(taskIndex, 1);
  }

  /**
   * This function checks the task board if a particular task is overdue or not
   * @param taskPost 
   * And applies the respective ng-class
   * 
   * -----Tip:- Don't make the date functions asynchronous-----
   * 
   */
   checkOverdue(taskPost) {
     return taskPost.task.due_to < this.today;
   }
  
   /**
    * This function opens up the task content in a new modal, and takes #content in the ng-template inside HTML layout
    * @param content 
    */
  async openTask(content){
    this.modalService.open(content, {'size': 'xl'}); 
  }

  /**
   * This function closes all the active modals in NGBMODAL module
   * @param $event 
   */
  closeTaskModal($event){
    this.modalService.dismissAll();
  }

  /**
   * The trackBy function takes the index and the current item as arguments 
   * and returns the unique identifier by which that item should be tracked
   * @param index 
   * @param element 
   * This is used to avoid heavy DOM Manipulations at run-time and improve performance in *ngFor
   */
  trackByIdx(index, element){
    return element._id;
  }

  /**
   * This function recieves the emitted value of updated task after reassigning from task-assignment component
   * @param $event 
   */
  getUpdatedTask(oldTask, columnIndex, taskIndex,  $event){
    oldTask = $event.task;
    this.columns[columnIndex]['tasks'][taskIndex] = $event.task;
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.modalService.dismissAll();
    this.unSubscribe$.next(true);
    this.unSubscribe$.complete();
  }


}
