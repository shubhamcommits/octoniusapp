import { Component, OnInit, Injector, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import { ActivatedRoute } from '@angular/router';
import { ColumnService } from 'src/shared/services/column-service/column.service';
import { environment } from 'src/environments/environment';
import moment from 'moment/moment';
import { MatDialog } from '@angular/material';
import { PostService } from 'src/shared/services/post-service/post.service';
import { FlowService } from 'src/shared/services/flow-service/flow.service';

@Component({
  selector: 'app-group-kanban-boards',
  templateUrl: './group-kanban-boards.component.html',
  styleUrls: ['./group-kanban-boards.component.scss']
})
export class GroupKanbanBoardsComponent implements OnInit {

  constructor(
    private router: ActivatedRoute,
    public utilityService: UtilityService,
    private injector: Injector,
    public dialog: MatDialog,
    private flowService: FlowService
  ) { }

  // Base URL of the uploads
  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  // Fetch groupId from router snapshot
  groupId = this.router.snapshot.queryParamMap.get('group');

  // Current Group Data
  @Input() groupData: any;
  // Current User Data
  @Input() userData: any;
  @Input() columns: any;
  // Task Posts array variable
  @Input() tasks: any;

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  // Today's date object
  today = moment().local().startOf('day').format('YYYY-MM-DD');

  flows = [];

  async ngOnInit() {

    this.flowService.getGroupAutomationFlows(this.groupId).then(res => {
      this.flows = res['flows'];
    });

    this.columns.forEach( column => {
      let tasks = [];
      let doneTasks = [];
      if(column.tasks.done !== undefined){
        column.tasks.done.forEach(doneTask =>{
          if(doneTask.bars !== undefined && doneTask.bars.length > 0){
              doneTask.bars.forEach(bar => {
                if(bar.tag_members.includes(this.userData._id) || this.userData.role !== "member") {
                  doneTasks.push(doneTask);
                }
              });
            } else {
              doneTasks.push(doneTask);
            }
          }
        );
      }
      column.tasks.forEach( task => {
        if(task.bars && task.bars !== undefined && task.bars.length > 0){
          task.bars.forEach(bar => {
            if(bar.tag_members.includes(this.userData._id) || this.userData.role !== "member") {
              tasks.push(task);
            }
          });
        } else {
          tasks.push(task);
        }
      });
      column.tasks = tasks;
      column.tasks.done = doneTasks;
    });
  }

  getTaskClass(status, isNorthStar) {
    let taskClass = '';
    if (status === 'to do') {
      taskClass = 'status-todo';
    } else if (status === 'in progress') {
      taskClass = 'status-inprogress';
    } else if (status === 'done') {
      taskClass = 'status-done';
    }
    return (isNorthStar) ? taskClass + ' north-star' : taskClass ;
  }

  /**
   * Standard Angular CDK Event which monitors the drop functionality between different columns
   * @param event
   */
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {

      // Move items in array
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

    } else {
      var post: any = event.previousContainer.data[event.previousIndex];

      // Update the task column when changed with dropping events to reflect back in the task view modal
      event.previousContainer.data[event.previousIndex]['task']._column.title = event.container.id

      // Call move task to a new column
      this.moveTaskToNewColumn(post, event.previousContainer.id, event.container.id);
    }

    if (event.previousContainer !== event.container || event.previousIndex !== event.currentIndex) {
      // Post Service Instance
      let postService = this.injector.get(PostService);
      //always, recalculate the order of the container (the list to drag)
      event.container.data.forEach((task,index)=>{
        task['task']._column.order=index;
        postService.updateTaskOrderInColumn(task['_id'], index);
      });
    }
  }

  /**
   * This function recieves the output from the other component for creating column
   * @param column
   */
  addColumn(column: any) {

    // Find the index of the column to check if the same named column exist or not
    let index = this.columns.findIndex((col: any) => col.title.toLowerCase() === column.title.toLowerCase())

    // If index is found, then throw error notification
    if (index != -1) {
      this.utilityService.warningNotification('Column with the same title aready exist, please try with different name!')
    }

    // If not found, then push the element
    else {

      // Create the Column asynchronously
      this.createNewColumn(this.groupId, column.title)

      // Assign the tasks to be []
      column.tasks = []

      // Push the Column
      this.columns.push(column)
    }

  }

  /**
   * This function creates a new column and add it to the current column array
   * @param groupId = this.groupId
   * @param columnName
   * Makes a HTTP Post request
   */
  createNewColumn(groupId: string, columnName: string) {

    // Column Service Instance
    let columnService = this.injector.get(ColumnService)

    // Utility Service Instance
    let utilityService = this.injector.get(UtilityService)

    // Call the HTTP Service function
    utilityService.asyncNotification('Please wait we are creating a new column...', new Promise((resolve, reject) => {
      columnService.addColumn(groupId, columnName)
        .then((res) => {
          resolve(utilityService.resolveAsyncPromise('New Column Created!'));
        })
        .catch((err) => {
          reject(utilityService.rejectAsyncPromise('Unable to create the column at the moment, please try again!'))
        })
    }))
  }

  /**
   * This function is responsible for removing the column
   * @param groupId
   * @param columnName
   */
  removeColumn(groupId: string, columnName: string){

    // Column Service Instance
    let columnService = this.injector.get(ColumnService)

    // Utility Service Instance
    let utilityService = this.injector.get(UtilityService)

    // Call the HTTP Service function
    utilityService.asyncNotification('Please wait we are removing your column...', new Promise((resolve, reject) => {
      columnService.deleteColumn(groupId, columnName)
        .then((res) => {
          resolve(utilityService.resolveAsyncPromise('Column Removed!'));
        })
        .catch((err) => {
          reject(utilityService.rejectAsyncPromise('Unable to removed the column at the moment, please try again!'))
        })
    }))
  }

  /**
   * This function is responsible for renaming a column
   * @param oldCol
   * @param newColTitle
   */
  editColumn(oldCol: any, newColTitle: any) {

    // Find the index of the column to check if the same named column exist or not
    let index = this.columns.findIndex((col: any) => col.title.toLowerCase() === newColTitle.toLowerCase())

    // If index is found, then throw error notification
    if (index != -1) {
      this.utilityService.warningNotification('Column with the same title aready exist, please try with different name!')
    }

    // If not found, then change the element details
    else if (index === -1) {
      let oldTitle = oldCol.title;
      oldCol.title = newColTitle
      // Column Service Instance
      let columnService = this.injector.get(ColumnService)

      // Call the HTTP Service function
      this.utilityService.asyncNotification('Please wait we are renaming your column...', new Promise((resolve, reject) => {
        columnService.editColumnName(this.groupId, oldTitle, newColTitle)
        .then((res) => {

          // rename the column in the tasks
          oldCol['tasks'].forEach(task => {
            task.task._column.title = newColTitle;
          });

          resolve(this.utilityService.resolveAsyncPromise('Column Renamed!'));
        })
        .catch((err) => {
          reject(this.utilityService.rejectAsyncPromise('Unable to rename the column at the moment, please try again!'))
        })
      }))
    }
  }

  /**
   * This function is responsible for deleting a column from the board
   * @param column
   */
  deleteColumn(column: any) {

    // Open the Confirm Dialog to ask for permission
    this.utilityService.getConfirmDialogAlert('Are you sure?', 'By doing this all the tasks from this column will be transfered to the default column!')
      .then((res) => {
        if (res.value) {
          // Find the index of the column to check if the same named column exist or not
          let index = this.columns.findIndex((col: any) => col.title.toLowerCase() === column.title.toLowerCase())

          // If index is found or it is the last column, then throw error notification
          if (index === -1 || this.columns.length === 1) {
            this.utilityService.warningNotification('Unable to delete the column, please try again!')
          }

          // If not found, then remove the element
          else if (index != -1 && this.columns.length > 1) {

            // Move All the columns' task to other column
            if(this.columns[index]['tasks'].length > 0){

              // Call for each task present in the board
              this.columns[index]['tasks'].forEach((task)=>{
                let newColumnTitle = 'to do';
                if (index - 1 >= 0) {
                  newColumnTitle = this.columns[index - 1]['title'];
                } else if (index + 1 < this.columns.length) {
                  newColumnTitle = this.columns[index + 1]['title'];
                }

                // Call the HTTP Request to move the task
                this.moveTaskToNewColumn(task, this.columns[index]['title'], newColumnTitle);
              })
            }
            // Remove the column from the array
            this.columns.splice(index, 1)

            // This function removes the column
            this.removeColumn(this.groupId, column.title)
          }
        }
      })
  }

  /**
   * This function is responsible for removing the task from the UI
   * @param column - column data
   * @param post - post
   */
  removeTask(column: any, post: any){

    // Find the index of the tasks inside the column
    let index = column.tasks.findIndex((task: any)=> task._id == post._id)

    // If the index is not found
    if(index != -1){

      // Remove the tasks from the array
      column.tasks.splice(index, 1)
    }
  }

  /**
   * This function is responsible for fetching the post
   * @param post
   * @param column
   */
  getPost(post: any, column: any) {

    // Adding the post to column
    column.tasks.unshift(post)
  }

  /**
   * This function handles the response of moving the task to another column
   * @param task
   * @param oldColumn
   * @param newColumn
   */
  async moveTaskToNewColumn(task: any, oldColumn: string, newColumn: string) {
    this.publicFunctions.changeTaskColumn(task._id, newColumn, this.userData._id);

    task = await this.publicFunctions.executedAutomationFlowsPropertiesFront(task, newColumn, this.flows);

    // Prepare Event
    let columnEvent = {
      post: task,
      oldColumn: oldColumn,
      newColumn: task.task._column.title
    }

    this.moveTaskToColumnFront(columnEvent)
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

  async onModalCloseEvent(data) {
    this.updateTask(data);
  }

  onDeleteDoneEvent(id) {
    this.columns.forEach((col, indexColumn) => {
      // Find the index of the tasks inside the column
      const indexTask = col.tasks.done.findIndex((task: any) => task._id === id);
      if (indexTask !== -1) {
        this.columns[indexColumn].tasks.done.splice(indexTask, 1);
        return;
      }
    });
  }

  onDeleteEvent(id) {
    this.columns.forEach((col, indexColumn) => {
      // Find the index of the tasks inside the column
      const indexTask = col.tasks.findIndex((task: any) => task._id === id);
      if (indexTask !== -1) {
        this.columns[indexColumn].tasks.splice(indexTask, 1);
        return;
      }
    });
  }

  /**
   * This function is responsible for opening a fullscreen dialog to edit a task
   */
  openFullscreenModal(postData: any): void {
    const dialogRef = this.utilityService.openCreatePostFullscreenModal(postData, this.userData, this.groupId, this.columns);
    const deleteEventSubs = dialogRef.componentInstance.deleteEvent.subscribe((data) => {
      this.onDeleteEvent(data);
    });
    const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
      this.updateTask(data);
    });
    const parentAssignEventSubs = dialogRef.componentInstance.parentAssignEvent.subscribe((data) => {
      this.onDeleteEvent(data._id);
    });


    dialogRef.afterClosed().subscribe(result => {
      closeEventSubs.unsubscribe();
      deleteEventSubs.unsubscribe();
      parentAssignEventSubs.unsubscribe();
    });
  }

  /**
   * This function is responsible for updating the task in the UI
   * @param post - post
   */
  updateTask(post: any) {

    this.columns.forEach((col, indexColumn) => {
      // Find the index of the tasks inside the column
      const indexTask = col.tasks.findIndex((task: any) => task._id === post._id);
      if (indexTask !== -1) {
        if (col.title.toLowerCase() === post.task._column.title.toLowerCase()) {
          if (post.task.status === 'done') {
            this.columns[indexColumn].tasks.done.unshift(post);
            this.columns[indexColumn].tasks.splice(indexTask, 1);
            return;
          } else {
            // update the tasks from the array
            this.columns[indexColumn].tasks[indexTask]= post;
            return;
          }
        } else {
          let indexNewColumn = this.columns.findIndex((column: any) => column.title.toLowerCase() === post.task._column.title.toLowerCase());
          if (indexNewColumn !== -1) {
            if (post.task.status === 'done') {
              this.columns[indexNewColumn].tasks.done.unshift(post);
            } else {
              this.columns[indexNewColumn].tasks.unshift(post);
            }
            this.columns[indexColumn].tasks.splice(indexTask, 1);
            return;
          }
        }
      } else {
        // if the task was not found in the column, check if it is in the done tasks array
        const indexDoneTask = col.tasks.done.findIndex((task: any) => task._id === post._id);
        if (indexDoneTask !== -1) {
          if (col.title.toLowerCase() === post.task._column.title.toLowerCase()) {
            if (post.task.status === 'done') {
              // update the tasks from the array
              this.columns[indexColumn].tasks.done[indexDoneTask]= post;
              return;
            } else {
              this.columns[indexColumn].tasks.unshift(post);
              this.columns[indexColumn].tasks.done.splice(indexDoneTask, 1);
              return;
            }
          } else {
            let indexNewColumn = this.columns.findIndex((column: any) => column.title.toLowerCase() === post.task._column.title.toLowerCase());
            if (indexNewColumn !== -1) {
              if (post.task.status === 'done') {
                this.columns[indexNewColumn].tasks.done.unshift(post);
              } else {
                this.columns[indexNewColumn].tasks.unshift(post);
              }
              this.columns[indexColumn].tasks.done.splice(indexDoneTask, 1);
              return;
            }
          }
        }
      }
    });
  }

  /**
   * This function handles the UI updation of the moving tasks into various columns
   * @param $event
   */
  moveTaskToColumnFront(columnEvent: any) {

    // Find the oldColumnIndex in which task existed
    let oldColumnIndex = this.columns.findIndex((column: any) => column.title.toLowerCase() === columnEvent.oldColumn.toLowerCase());

    // Find the newColumnIndex in which task is to be shifted
    let newColumnIndex = this.columns.findIndex((column: any) => column.title.toLowerCase() === columnEvent.newColumn.toLowerCase());

    // Remove the task from the old Column
    this.columns[oldColumnIndex]['tasks'].splice(this.columns[oldColumnIndex]['tasks'].findIndex((post: any) => post._id === columnEvent.post._id), 1);

    // Add the task into the new column
    this.columns[newColumnIndex]['tasks'].unshift(columnEvent.post);
  }

  /**
   * This function updates the status on the UI
   * @param task
   * @param status
   */
  changeStatus(task: any, status: any) {

    // Set the status
    task.task.status = status
  }

  /**
   * This function changes the assignee
   * @param task
   * @param memberMap
   */
  changeAssignee(task: any, memberMap: any) {

    // Call the HTTP Request to change the assignee
    this.publicFunctions.changeTaskAssignee(task._id, memberMap['_id'])

    // Set the assigned_to variable
    task._assigned_to = memberMap
  }

  /**
   * This function is responsible for changing the due date
   * @param task
   * @param dueDate
   */
  changeDueDate(task: any, dueDate: any) {

    // dueDate = new Date(dueDate)

    // dueDate = new Date(dueDate.getFull
    dueDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())

    dueDate = moment(dueDate).format()

    // Call the HTTP Request to change the due date
    this.publicFunctions.changeTaskDueDate(task._id, dueDate)

    // Set the task due date on the UI
    task.task.due_to = moment(dueDate).format('YYYY-MM-DD')
  }

  /**
   * This function changes the details on the UI
   * @param task
   * @param post
   */
  changeDetails(task: any, post: any) {

    // Update task title
    task.title = post.title

    // Update task content
    task.content = post.content

    // Update task tags
    task.tags = post.tags

    // Update task files
    task.files = post.files

    // Update the liked by
    task._liked_by = post._liked_by

    // Update the content mentions
    task._content_mentions = post._content_mentions

    // Update the task comments
    task.comments = post.comments

  }

  /**
   * This function checks the task board if a particular task is overdue or not
   * @param taskPost
   * And applies the respective ng-class
   *
   * -----Tip:- Don't make the date functions asynchronous-----
   *
   */
  checkOverdue(taskPost: any) {
    return (taskPost.task && moment(taskPost.task.due_to).format('YYYY-MM-DD') < this.today);
  }

  /**
   * This function is responsible for closing the modals
   */
  closeModal() {
    this.utilityService.closeAllModals()
  }

}
