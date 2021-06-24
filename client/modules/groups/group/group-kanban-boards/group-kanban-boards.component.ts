import { Component, OnInit, Injector, Input, OnChanges, AfterViewInit, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import { ActivatedRoute } from '@angular/router';
import { ColumnService } from 'src/shared/services/column-service/column.service';
import { environment } from 'src/environments/environment';
import moment from 'moment/moment';
import { MatDialog } from '@angular/material/dialog';
import { FlowService } from 'src/shared/services/flow-service/flow.service';
import { CreateProjectColumnDialogComponent } from './create-project-column-dialog/create-project-column-dialog.component';
import { ProjectBudgetDialogComponent } from 'src/app/common/shared/project-budget-dialog/project-budget-dialog.component';

@Component({
  selector: 'app-group-kanban-boards',
  templateUrl: './group-kanban-boards.component.html',
  styleUrls: ['./group-kanban-boards.component.scss']
})
export class GroupKanbanBoardsComponent implements OnInit, OnChanges, AfterViewInit {

  constructor(
    private router: ActivatedRoute,
    public utilityService: UtilityService,
    private columnService: ColumnService,
    private flowService: FlowService,
    private injector: Injector,
    public dialog: MatDialog
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
  @Input() filteringData: any;

  @Input() sortingBit: String

  @Input() filteringBit: String

  tasktest: any;

  unchangedColumns: any;

  isMobile = false;

  @Output() taskClonnedEvent = new EventEmitter();
  @Output() newSectionEvent = new EventEmitter();
  @Output() moveSectionEvent = new EventEmitter();

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  // Today's date object
  today = moment().startOf('day').format('YYYY-MM-DD');

  flows = [];

  canSeeBudget = false;

  async ngOnInit() {
    let col = [];
    this.columns.forEach(val => col.push(Object.assign({}, val)));
    let unchangedColumns: any = { columns: col };
    this.unchangedColumns = JSON.parse(JSON.stringify(unchangedColumns));
    this.flowService.getGroupAutomationFlows(this.groupId).then(res => {
      this.flows = res['flows'];
    });

    this.canSeeBudget = this.userData?.role == 'owner' || this.userData?.role == 'admin' || this.userData?.role == 'manager'
                        || (this.groupData?._admins.findIndex((admin: any) => (admin._id || admin) == this.userData?._id)>=0);
  }

  async ngOnChanges(changes: SimpleChanges) {

    for (const propName in changes) {
      const change = changes[propName];
      const to = change.currentValue;
      const from = change.previousValue;
      if (propName === 'sortingBit') {
        this.sortingBit = to;
        await this.sorting();
      }
      if (propName === 'filteringBit') {
        this.filtering(to);
      }
      if (propName === 'filteringData') {
        this.filteringData = to;
        if(this.filteringData){
          this.filtering(this.filteringBit);
        }
      }
    }
  }

  ngAfterViewInit() {
    this.publicFunctions.isMobileDevice().then(res => this.isMobile = res);

  }

  formateDate(date: any, format: string) {
    return date ? moment.utc(date).format(format) : '';
  }

  async filtering(to) {
    if (to == "mytask") {
      let myClonedUnchnaged = Object.assign({}, this.unchangedColumns);
      let tasks = JSON.parse(JSON.stringify(myClonedUnchnaged));
      for (let index = 0; index < tasks.columns.length; index++) {
        this.columns[index].tasks = tasks.columns[index].tasks.filter((task: any) => {
          var bit = false;
          if (task && task._assigned_to) {
            task._assigned_to.forEach(element => {
              if (element._id == this.userData._id) {
                bit = true
              }
            });
          }
          return bit;
        })
      }
      this.unchangedColumns = tasks;
    } else if (to == "priority_high") {
      let myClonedUnchnaged = Object.assign({}, this.unchangedColumns);
      let tasks = JSON.parse(JSON.stringify(myClonedUnchnaged));
      for (let index = 0; index < tasks.columns.length; index++) {
        this.columns[index].tasks = tasks.columns[index].tasks.filter((task: any) => (
          task.task.custom_fields?.priority === "High"))
      }
      this.unchangedColumns = tasks;
    } else if (to == "priority_medium") {
      let myClonedUnchnaged = Object.assign({}, this.unchangedColumns);
      let tasks = JSON.parse(JSON.stringify(myClonedUnchnaged));
      for (let index = 0; index < tasks.columns.length; index++) {
        this.columns[index].tasks = tasks.columns[index].tasks.filter((task: any) => (
          task.task.custom_fields?.priority === "Medium"))
      }
      this.unchangedColumns = tasks;
    } else if (to == "priority_low") {
      let myClonedUnchnaged = Object.assign({}, this.unchangedColumns);
      let tasks = JSON.parse(JSON.stringify(myClonedUnchnaged));
      for (let index = 0; index < tasks.columns.length; index++) {
        this.columns[index].tasks = tasks.columns[index].tasks.filter((task: any) => (
          task.task.custom_fields?.priority === "Low"))
      }
      this.unchangedColumns = tasks;
    } else if (to == 'due_before_today'){
      let myClonedUnchnaged = Object.assign({}, this.unchangedColumns);
      let tasks = JSON.parse(JSON.stringify(myClonedUnchnaged));
      for (let index = 0; index < tasks.columns.length; index++) {
        this.columns[index].tasks = tasks.columns[index].tasks.filter((task: any) => (
          (task?.task?.due_to)? moment.utc(task?.task?.due_to).isBefore(moment().add(-1,'days')):false))
      }
      this.unchangedColumns = tasks;
    } else if (to == 'due_today'){
      let myClonedUnchnaged = Object.assign({}, this.unchangedColumns);
      let tasks = JSON.parse(JSON.stringify(myClonedUnchnaged));
      for (let index = 0; index < tasks.columns.length; index++) {
        this.columns[index].tasks = tasks.columns[index].tasks.filter((task: any) => (
          (task?.task?.due_to)? moment.utc(task?.task?.due_to).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD'):false))
      }
      this.unchangedColumns = tasks;
    } else if (to == 'due_today'){
      let myClonedUnchnaged = Object.assign({}, this.unchangedColumns);
      let tasks = JSON.parse(JSON.stringify(myClonedUnchnaged));
      for (let index = 0; index < tasks.columns.length; index++) {
        this.columns[index].tasks = tasks.columns[index].tasks.filter((task: any) => (
          (task?.task?.due_to)? moment.utc(task?.task?.due_to).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD'):false))
      }
      this.unchangedColumns = tasks;
    } else if (to == 'due_tomorrow'){
      let myClonedUnchnaged = Object.assign({}, this.unchangedColumns);
      let tasks = JSON.parse(JSON.stringify(myClonedUnchnaged));
      for (let index = 0; index < tasks.columns.length; index++) {
        this.columns[index].tasks = tasks.columns[index].tasks.filter((task: any) => (
          (task?.task?.due_to)? moment.utc(task?.task?.due_to).format('YYYY-MM-DD') == moment().add(1,'days').format('YYYY-MM-DD'):false))
      }
      this.unchangedColumns = tasks;
    } else if (to == 'due_week'){
      let myClonedUnchnaged = Object.assign({}, this.unchangedColumns);
      let tasks = JSON.parse(JSON.stringify(myClonedUnchnaged));
      for (let index = 0; index < tasks.columns.length; index++) {
        this.columns[index].tasks = tasks.columns[index].tasks.filter((task: any) => {
          const first = moment().startOf('week').format();
          const last = moment().endOf('week').add(1,'days').format();
          if(task?.task?.due_to){
            if((moment.utc(task?.task?.due_to).isAfter(first)) && (moment.utc(task?.task?.due_to).isBefore(last))){
              return true;
            }else{
              return false;
            }
          } else {
            return false;
          }

        })
      }
      this.unchangedColumns = tasks;
    } else if (to == 'due_next_week'){
      let myClonedUnchnaged = Object.assign({}, this.unchangedColumns);
      let tasks = JSON.parse(JSON.stringify(myClonedUnchnaged));
      for (let index = 0; index < tasks.columns.length; index++) {
        this.columns[index].tasks = tasks.columns[index].tasks.filter((task: any) => {
          const first = moment().endOf('week').add(1,'days').format();
          const last = moment().endOf('week').add(9,'days').format();
          if(task?.task?.due_to){
            if((moment.utc(task?.task?.due_to).isAfter(first)) && (moment.utc(task?.task?.due_to).isBefore(last))){
              return true;
            }else{
              return false;
            }
          } else {
            return false;
          }

        })
      }
      this.unchangedColumns = tasks;
    } else if (to == 'due_14_days'){
      let myClonedUnchnaged = Object.assign({}, this.unchangedColumns);
      let tasks = JSON.parse(JSON.stringify(myClonedUnchnaged));
      for (let index = 0; index < tasks.columns.length; index++) {
        this.columns[index].tasks = tasks.columns[index].tasks.filter((task: any) => {
          const first = moment().format();
          const last = moment().add(14,'days').format();
          if(task?.task?.due_to){
            if((moment.utc(task?.task?.due_to).isAfter(first)) && (moment.utc(task?.task?.due_to).isBefore(last))){
              return true;
            }else{
              return false;
            }
          } else {
            return false;
          }

        })
      }
      this.unchangedColumns = tasks;
    }else if (to == "users") {
      let myClonedUnchnaged = Object.assign({}, this.unchangedColumns);
      let tasks = JSON.parse(JSON.stringify(myClonedUnchnaged));
      for (let index = 0; index < tasks.columns.length; index++) {
        this.columns[index].tasks = tasks.columns[index].tasks.filter((task: any) => {
          var bit = false;
          if (task && task._assigned_to) {
            task._assigned_to.forEach(element => {
              if (element._id == this.filteringData) {
                bit = true
              }
            });
          }
          return bit;
        })
      }
      this.unchangedColumns = tasks;
    } else if (to == "ideas") {
      let myClonedUnchnaged = Object.assign({}, this.unchangedColumns);
      let tasks = JSON.parse(JSON.stringify(myClonedUnchnaged));
      for (let index = 0; index < tasks.columns.length; index++) {
        this.columns[index].tasks = tasks.columns[index].tasks.filter((task: any) => (
          task.task.is_idea == true));
      }
      this.unchangedColumns = tasks;
    } else {
      this.columns = this.unchangedColumns.columns;
    }
  }

  async sorting() {

    if (this.sortingBit == 'due_date' || this.sortingBit == 'none') {
      for (let index = 0; index < this.columns.length; index++) {
        let task = this.columns[index].tasks;
        task.sort((t1, t2) => {
          if (t1.task?.due_to && t2.task?.due_to) {
            if (moment.utc(t1.task?.due_to).isBefore(t2.task?.due_to)) {
              return this.sortingBit == 'due_date' ? -1 : 1;
            } else {
              return this.sortingBit == 'due_date' ? 1 : -1;
            }
          } else {
            if (t1.task?.due_to && !t2.task?.due_to) {
              return -1;
            } else if (!t1.task?.due_to && t2.task?.due_to) {
              return 1;
            }
          }

        })
        this.columns[index].tasks = task;
      }
    } else if (this.sortingBit == 'priority') {
      for (let index = 0; index < this.columns.length; index++) {
        let task = this.columns[index].tasks;
        task.sort((t1, t2) => {
          return (t1?.task?.custom_fields && t2?.task?.custom_fields)
            ? (((t1?.task?.custom_fields['priority'] == 'High' && t2?.task?.custom_fields['priority'] != 'High') || (t1?.task?.custom_fields['priority'] == 'Medium' && t2?.task?.custom_fields['priority'] == 'Low'))
              ? -1 : (((t1?.task?.custom_fields['priority'] != 'High' && t2?.task?.custom_fields['priority'] == 'High') || (t1?.task?.custom_fields['priority'] == 'Low' && t2?.task?.custom_fields['priority'] == 'Medium'))
                ? 1 : 0))
            : ((t1?.task?.custom_fields && !t2?.task?.custom_fields)
              ? -1 : ((!t1?.task?.custom_fields && t2?.task?.custom_fields))
                ? 1 : 0);
        });
        this.columns[index].tasks = task;
      }
    } else if (this.sortingBit == 'tags') {
      for (let index = 0; index < this.columns.length; index++) {
        let task = this.columns[index].tasks;
        task.sort((t1, t2) => {
          if (t1?.tags.length > 0 && t2?.tags.length > 0) {
            const name1 = t1?.tags[0]?.toLowerCase();
            const name2 = t2?.tags[0]?.toLowerCase();
            if (name1 > name2) { return 1; }
            if (name1 < name2) { return -1; }
            return 0;
          } else {
            if (t1?.tags.length > 0 && t2?.tags.length == 0) {
              return -1;
            } else if (t1?.tags.length == 0 && t2?.tags.length > 0) {
              return 1;
            }
          }
        });
        this.columns[index].tasks = task;
      }
    } else if (this.sortingBit == 'status') {

      for (let index = 0; index < this.columns.length; index++) {
        let task = this.columns[index].tasks;
        task.sort((t1, t2) => {
          return (t1?.task?.status && t2?.task?.status)
            ? (((t1?.task?.status == 'to do' && t2?.task?.status != 'to do') || (t1?.task?.status == 'in progress' && t2?.task?.status == 'done'))
              ? -1 : (((t1?.task?.status != 'to do' && t2?.task?.status == 'to do') || (t1?.task?.status == 'done' && t2?.task?.status == 'in progress'))
                ? 1 : 0))
            : ((t1?.task?.status && !t2?.task?.status)
              ? -1 : ((!t1?.task?.status && t2?.task?.status))
                ? 1 : 0);
        });
        this.columns[index].tasks = task;
      }
    } else if(this.sortingBit == 'reverse'){
      this.columns.forEach(column => {
        column.tasks.reverse();
      });
    } else if (this.sortingBit == 'invert'){
      this.columns.forEach(column => {
        column.tasks.reverse();
      });
    }
  }

  /**
   * Standard Angular CDK Event which monitors the drop functionality of tasks
   * @param event
   */
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {

      // Move items in array
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

    } else {
      var post: any = event.previousContainer.data[event.previousIndex];

      // Update the task column when changed with dropping events to reflect back in the task view modal
      post['task']._column = event.container.id

      // Call move task to a new column
      this.moveTaskToNewColumn(post, event.previousContainer.id, event.container.id);
    }
  }

  /**
   * Standard Angular CDK Event which monitors the drop functionality of different columns
   * @param event
   */
  dropColumn(event: CdkDragDrop<string[]>) {
    // Utility Service Instance
    let utilityService = this.injector.get(UtilityService)

    // Call the HTTP Service function
    utilityService.asyncNotification('Please wait we are save the column order...', new Promise((resolve, reject) => {
      // Move items in array
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

      const columnsMap = event.container.data.map((col, index) => { return { _id: col['_id'], position: index }});
      this.columnService.updateColumnsPosition(columnsMap)
        .then((res) => {
          resolve(utilityService.resolveAsyncPromise('Order saved!'));
        })
        .catch((err) => {
          reject(utilityService.rejectAsyncPromise('Unable to save the order of the columns at the moment, please try again!'));
        });
    }));
  }

  /**
   * This function recieves the output from the other component for creating column
   * @param column
   */
  async addColumn(column: any) {

    // Find the index of the column to check if the same named column exist or not
    let index = this.columns.findIndex((col: any) => (col._id || col) == column._id)

    // If index is found, then throw error notification
    if (index != -1) {
      this.utilityService.warningNotification('Section with the same title aready exist, please try with different name!')
    }

    // If not found, then push the element
    else {
      // Create the Column asynchronously
      await this.createNewColumn(this.groupId, column.title);
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
    utilityService.asyncNotification('Please wait we are creating a new section...', new Promise((resolve, reject) => {
      columnService.addColumn(groupId, columnName)
        .then((res) => {
          let column = res['column'];

          // Assign the tasks to be []
          column.tasks = [];

          // Push the Column
          this.columns.push(column);

          this.newSectionEvent.emit(column);

          resolve(utilityService.resolveAsyncPromise('New Section Created!'));
        })
        .catch((err) => {
          reject(utilityService.rejectAsyncPromise('Unable to create the section at the moment, please try again!'))
        });
    }));
  }

  /**
   * This function is responsible for removing the column
   * @param groupId
   */
  removeColumn(columnId: string) {

    // Column Service Instance
    let columnService = this.injector.get(ColumnService)

    // Utility Service Instance
    let utilityService = this.injector.get(UtilityService)

    // Call the HTTP Service function
    utilityService.asyncNotification('Please wait we are removing your column...', new Promise((resolve, reject) => {
      columnService.deleteColumn(columnId)
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
      const columnId = oldCol._id;
      oldCol.title = newColTitle
      // Column Service Instance
      let columnService = this.injector.get(ColumnService)

      // Call the HTTP Service function
      this.utilityService.asyncNotification('Please wait we are renaming your column...', new Promise((resolve, reject) => {
        columnService.editColumnName(columnId, newColTitle)
          .then((res) => {
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
    this.utilityService.getConfirmDialogAlert('Are you sure?', 'By doing this all the tasks from this column will be deleted!')
      .then((res) => {
        if (res.value) {
          // Find the index of the column to check if the same named column exist or not
          let index = this.columns.findIndex((col: any) => col._id === column._id);
          // Remove the column from the array
          this.columns.splice(index, 1)

          // This function removes the column
          this.removeColumn(column._id)
        }
      })
  }

  /**
   * This function is responsible for removing the task from the UI
   * @param column - column data
   * @param post - post
   */
  removeTask(column: any, post: any) {

    // Find the index of the tasks inside the column
    let index = column.tasks.findIndex((task: any) => task._id == post._id)

    // If the index is not found
    if (index != -1) {

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
   * @param columnId
   */
  async moveTaskToNewColumn(task: any, oldColumnId: string, columnId: string) {
    this.publicFunctions.changeTaskColumn(task._id, columnId, this.userData._id, this.groupId);

    task = await this.publicFunctions.executedAutomationFlowsPropertiesFront(this.flows, task, this.userData._id);

    // Prepare Event
    let columnEvent = {
      post: task,
      newColumn: (task?.task?._column?._id || task?.task?._column),
      oldColumn: oldColumnId
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
    const dialogRef = this.utilityService.openCreatePostFullscreenModal(postData, this.userData, this.groupId, this.columns,this.tasks);
    const deleteEventSubs = dialogRef.componentInstance.deleteEvent.subscribe((data) => {
      this.onDeleteEvent(data);
      this.sorting();
    });
    const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
      this.updateTask(data);
      // this.sorting();
    });
    const parentAssignEventSubs = dialogRef.componentInstance.parentAssignEvent.subscribe((data) => {
      this.onDeleteEvent(data._id);
      this.sorting();
    });
    const taskClonnedEventSubs = dialogRef.componentInstance.taskClonnedEvent.subscribe((data) => {
      this.onTaskClonned(data);
      this.sorting();
    });


    dialogRef.afterClosed().subscribe(result => {
      closeEventSubs.unsubscribe();
      deleteEventSubs.unsubscribe();
      parentAssignEventSubs.unsubscribe();
      taskClonnedEventSubs.unsubscribe();
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
      if (indexTask != -1) {
        if (col._id == (post.task._column._id || post.task._column)) {
          // update the tasks from the array
          this.columns[indexColumn].tasks[indexTask] = post;
        } else {
          let indexNewColumn = this.columns.findIndex((column: any) => column._id == (post.task._column._id || post.task._column));
          if (indexNewColumn != -1) {
            this.columns[indexNewColumn].tasks.unshift(post);
            this.columns[indexColumn].tasks.splice(indexTask, 1);
          }
        }
        // Find the hightes due date on the tasks of the column
        //col.real_due_date = moment(Math.max(...col.tasks.map(post => moment(post.task.due_to))));
        col.real_due_date = this.publicFunctions.getHighestDate(col.tasks);

        // Calculate number of done tasks
        col.numDoneTasks = col.tasks.filter((post) => post?.task?.status?.toLowerCase() == 'done').length;

        return;
      }
    });

    this.sorting();
  }

  /**
   * This function handles the UI updation of the moving tasks into various columns
   * @param $event
   */
  moveTaskToColumnFront(columnEvent: any) {

    // Find the oldColumnIndex in which task existed
    let oldColumnIndex = this.columns.findIndex((column: any) => column._id == columnEvent.oldColumn);

    // Find the newColumnIndex in which task is to be shifted
    let newColumnIndex = this.columns.findIndex((column: any) => column._id == columnEvent.newColumn);

    // Remove the task from the old Column
    this.columns[oldColumnIndex]['tasks'].splice(this.columns[oldColumnIndex]['tasks'].findIndex((post: any) => post._id === columnEvent.post._id), 1);
    // Find the highest due date on the tasks of the column
    if (this.columns[oldColumnIndex]['tasks'].length == 0) {
      this.columns[oldColumnIndex].real_due_date = null;
    } else {
      //this.columns[oldColumnIndex].real_due_date = moment(Math.max(...this.columns[oldColumnIndex].tasks.map(post => moment(post.task.due_to))));
      this.columns[oldColumnIndex].real_due_date = this.publicFunctions.getHighestDate(this.columns[oldColumnIndex].tasks);
    }

    // Add the task into the new column
    this.columns[newColumnIndex]['tasks'].unshift(columnEvent.post);
    // Find the highest due date on the tasks of the column
    if (this.columns[newColumnIndex]['tasks'].length == 0) {
      this.columns[newColumnIndex].real_due_date = null;
    } else {
      //this.columns[newColumnIndex].real_due_date = moment(Math.max(...this.columns[newColumnIndex].tasks.map(post => moment(post.task.due_to))));
      this.columns[newColumnIndex].real_due_date = this.publicFunctions.getHighestDate(this.columns[newColumnIndex].tasks);
    }

    // Calculate number of done tasks
    this.columns[oldColumnIndex].numDoneTasks = this.columns[oldColumnIndex].tasks.filter((post) => post?.task?.status?.toLowerCase() == 'done').length;
    this.columns[newColumnIndex].numDoneTasks = this.columns[newColumnIndex].tasks.filter((post) => post?.task?.status?.toLowerCase() == 'done').length;
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
   * This function is responsible for closing the modals
   */
  closeModal() {
    this.utilityService.closeAllModals()
  }

  onTaskClonned(data) {
    this.taskClonnedEvent.emit(data);
  }

  makeColumnProjectDialog(column: any) {
    if (!column?.project_type) {
      this.utilityService.asyncNotification('Please wait we are creating a project from your column...', new Promise((resolve, reject) => {
        this.columnService.changeColumnProjectType(column._id, true)
          .then((res) => {
            column.project_type = true;
            resolve(this.utilityService.resolveAsyncPromise('Column type changed!'));
          })
          .catch((err) => {
            column.project_type = false;
            reject(this.utilityService.rejectAsyncPromise('Unable to change the column type at the moment, please try again!'))
          })
      }));
    }
    this.openMakeColumnProjectDialog(column);
  }

  openMakeColumnProjectDialog(column: any) {
    const data = {
        column: column
      }

    const dialogRef = this.dialog.open(CreateProjectColumnDialogComponent, {
      data: data,
      hasBackdrop: true
    });
    const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
      const index = this.columns.findIndex(col => col._id == column._id);
      if (index >= 0) {
        this.columns[index] = column;
      }
    });


    dialogRef.afterClosed().subscribe(result => {
      closeEventSubs.unsubscribe();
    });
  }

  isDelay(realDueDate: any, dueDate: any) {
    return moment(realDueDate).isAfter(moment(dueDate), 'day');
  }
}
