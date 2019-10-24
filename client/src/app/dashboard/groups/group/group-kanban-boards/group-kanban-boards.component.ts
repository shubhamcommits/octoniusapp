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
      this.route.params.subscribe((params) => {
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
      // console.log(post, event.previousContainer, event.container);
        // if(event.previousContainer.id == 'done' && (event.container.id == 'to do' || event.container.id == 'in progress')){
        //   transferArrayItem(event.previousContainer.data,
        //     event.container.data,
        //     event.previousIndex,
        //     event.currentIndex);
        //     this.moveTaskToNewColumn(post, event.previousContainer.id, event.container.id);
        // }
        // else if(event.previousContainer.id != 'done'){
        //   transferArrayItem(event.previousContainer.data,
        //     event.container.data,
        //     event.previousIndex,
        //     event.currentIndex);
        //   this.moveTaskToNewColumn(post, event.previousContainer.id, event.container.id);
        // }
        // else
        //   console.log('Not allowed');
          transferArrayItem(event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex);
            console.log(event, event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
            this.moveTaskToNewColumn(post, event.previousContainer.id, event.container.id);
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
      .subscribe(async (res) => {
        for(let i = 0; i < this.columns.length; i++){
          // if(this.columns[i]['title'] != 'done'){
            this.columns[i]['tasks'] = res['posts']
            .filter(post => post.task.hasOwnProperty('_column') === true && post.task._column.title === this.columns[i]['title'])
          // }
          // if(this.columns[i]['title'] != 'done'){
            Array.prototype.push.apply(this.columns[i]['tasks'], res['posts']
            .filter(post => post.task.status === this.columns[i]['title'] && post.task.hasOwnProperty('_column') === false));
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
      .subscribe((res) => {
        // if (res['posts'].length == 0){
        //   this.loadCount = 0;
        // }
  
        // else{
        //   this.loadCount = 1;
        // }
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
        // case 'in progress':
        //   taskStatus = 'in progress';
        //   break;
        // case 'done':
        //   taskStatus = 'done';
        //   break;
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
      .subscribe((res)=>{
        console.log(res);
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
        // case 'in progress':
        //   taskStatus = 'in progress';
        //   break;
        // case 'done':
        //   taskStatus = 'done';
        //   break;
      }

      const taskPost = {
        title: task.title,
        type: task.type,
        content: task.content,
        _content_mentions: task._content_mentions,
        tags: task.tags,
        _read_by: [],
        unassigned: task.task.unassigned,
        due_to: task.task.due_to,
        assigned_to: task.task._assigned_to,
        _column: {
          title:newColumn
        },
        status: (taskStatus === task.task.status)? task.task.status : taskStatus
      }
      // console.log(taskPost)
      this.postService.editPost(task._id, taskPost)
      .subscribe((res)=>{
        // console.log(res);
        resolve()
      }, (err)=>{
        this.snotifyService.error('There\'s some unexpected error occured, please try again later!');
        console.log('Error occured while moving the task to the column', err);
        reject();
      })
    })
  }

  async moveTaskFromDropDown($event){
    this.moveTaskToNewColumn($event.task, $event.oldColumn, $event.newColumn);
    let oldColumnIndex = this.columns.findIndex((column)=> column.title.toLowerCase() === $event.oldColumn.toLowerCase());
    let newColumnIndex = this.columns.findIndex((column)=> column.title.toLowerCase() === $event.newColumn.toLowerCase());
    this.columns[oldColumnIndex]['tasks'].splice($event.task, 1);
    this.columns[newColumnIndex]['tasks'].unshift($event.task);
  }
  
  async openTask(content){
    this.modalService.open(content, {'size': 'xl'}); 
  }

  closeTaskModal($event){
    this.modalService.dismissAll();
  }

  trackByIdx(index, element){
    return element._id;
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.modalService.dismissAll();
  }


}
