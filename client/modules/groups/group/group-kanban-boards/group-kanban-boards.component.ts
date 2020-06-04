import { Component, OnInit, Injector } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { SubSink } from 'subsink';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { ActivatedRoute } from '@angular/router';
import { ColumnService } from 'src/shared/services/column-service/column.service';
import { environment } from 'src/environments/environment';
import moment from 'moment/moment';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

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
  ) { }

  columns: any = []

  // Base URL of the uploads
  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  // Fetch groupId from router snapshot
  groupId = this.router.snapshot.queryParamMap.get('group');

  // Task Posts array variable
  tasks: any = []

  // Current Group Data
  groupData: any;

  // Current User Data
  userData: any;

  // Subsink Object
  subSink = new SubSink();

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  // Today's date object
  today = moment().local().startOf('day').format('YYYY-MM-DD');

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  async ngOnInit() {

    // Start the loading spinner
    this.isLoading$.next(true);

    // Fetch current group from the service
    this.subSink.add(this.utilityService.currentGroupData.subscribe(async (res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {

        // Assign the GroupData
        this.groupData = res;
      }
    }))

    // Fetch current user details
    this.userData = await this.publicFunctions.getCurrentUser();

    /**
     * Here we fetch all the columns available in a group, and if null we initialise them with the default one
     */
    this.columns = await this.publicFunctions.getAllColumns(this.groupId);
    if (this.columns == null) {
      this.columns = await this.initialiseColumns(this.groupId);
    }

    /**
     * Adding the property of tasks in every column
     */
    this.columns.forEach((column: any) => {
      column.tasks = []
    });

    // Fetch all the tasks posts from the server
    this.tasks = await this.publicFunctions.getPosts(this.groupId, 'task');

    // console.log('Tasks', this.tasks)

    /**
     * Sort the tasks into their respective columns
     */
    this.sortTasksInColumns(this.columns, this.tasks)

    // Return the function via stopping the loader
    return this.isLoading$.next(false);

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

      // If new column is 'to do' then, set the status of the task to 'to do' as well
      if (event.container.id === 'to do') {
        event.previousContainer.data[event.previousIndex]['task'].status = 'to do'

        // Change the task status
        this.publicFunctions.changeTaskStatus(post._id, 'to do')
      }

      // Call move task to a new column
      this.moveTaskToNewColumn(post, event.previousContainer.id, event.container.id);

      // Trasnfer Items into another array list
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

  /**
   * This function initialises the default column - todo
   * @param groupId 
   */
  async initialiseColumns(groupId: string) {

    // Column Service Instance
    let columnService = this.injector.get(ColumnService)

    // Call the HTTP Put request
    return new Promise((resolve, reject) => {
      columnService.initColumns(groupId)
        .then((res) => {
          resolve(res['columns']);
        })
        .catch((err) => {
          this.utilityService.errorNotification('Unable to initialise the columns, please try again later!');
          reject({});
        })
    })
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
      oldCol.title = newColTitle
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

          // If index is found, then throw error notification
          if (index === -1) {
            this.utilityService.warningNotification('Unable to delete the column, please try again!')
          }

          // If not found, then remove the element
          else if (index != -1) {

            // Move All the columns' task to 'to do' column
            if(this.columns[index]['tasks'].length > 0){

              // Call for each task present in the board
              this.columns[index]['tasks'].forEach((task)=>{

                // Prepare Event
                let columnEvent = {
                  post: task,
                  oldColumn: this.columns[index]['title'],
                  newColumn: 'to do'
                }
  
                // Call HTTP Put request to move the tasks
                this.moveTaskToColumn(columnEvent)
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
   * This Function is responsible for sorting the tasks into columns
   * @param columns 
   * @param tasks 
   */
  sortTasksInColumns(columns: any, tasks: any) {

    columns.forEach((column: any) => {

      // Feed the tasks into that column which has matching property _column with the column title
      column['tasks'] = tasks
        .filter((post: any) => post.task.hasOwnProperty('_column') === true && post.task._column != null && post.task._column.title === column['title'])

      // Array.prototype.push.apply(column['tasks'], tasks
      // .filter((post: any) => post.task.status === column['title'] && post.task.hasOwnProperty('_column') === false && post.task._column != null));
    });
  }

  /**
   * This function handles the response of moving the task to another column
   * @param task 
   * @param oldColumn 
   * @param newColumn 
   */
  moveTaskToNewColumn(task: any, oldColumn: string, newColumn: string) {

    this.publicFunctions.changeTaskColumn(task._id, newColumn);

    // If new column is 'to do' then set the taskStatus as 'to do' too
    switch (newColumn) {
      case 'to do':
        this.changeStatus(task, newColumn)
        break;
    }

  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

  /**
   * This function is responsible for opening the modal
   * @param content 
   */
  openModal(content: any) {
    this.utilityService.openModal(content, {
      size: 'xl',
    });
  }

  /**
   * This function handles the UI updation of the moving tasks into various columns
   * @param $event 
   */
  moveTaskToColumn($event: any) {

    // Call the HTTP Request to move the task
    this.moveTaskToNewColumn($event.post, $event.oldColumn, $event.newColumn)

    // Find the oldColumnIndex in which task existed
    let oldColumnIndex = this.columns.findIndex((column: any) => column.title.toLowerCase() === $event.oldColumn.toLowerCase());

    // Find the newColumnIndex in which task is to be shifted
    let newColumnIndex = this.columns.findIndex((column: any) => column.title.toLowerCase() === $event.newColumn.toLowerCase());

    // Remove the task from the old Column
    this.columns[oldColumnIndex]['tasks'].splice(this.columns[oldColumnIndex]['tasks'].findIndex((post: any) => post._id === $event.post._id), 1);

    // Add the task into the new column
    this.columns[newColumnIndex]['tasks'].unshift($event.post);

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

    // Set the unassigned to be false on the UI
    task.task.unassigned = false

    // Set the assigned_to variable
    task.task._assigned_to = memberMap
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
    return moment(taskPost.task.due_to).format('YYYY-MM-DD') < this.today;
  }

  /**
   * This function is responsible for closing the modals
   */
  closeModal() {
    this.utilityService.closeAllModals()
  }

  /**
   * Unsubscribe all the observables to avoid memory leaks
   */
  ngOnDestroy() {
    this.subSink.unsubscribe()
    this.isLoading$.complete()
  }

}
