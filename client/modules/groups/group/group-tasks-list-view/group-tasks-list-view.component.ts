import { Component, OnInit, Input, Injector, EventEmitter, Output, ViewChild } from '@angular/core';
import moment from 'moment/moment';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { MatDialog, MatAccordion } from '@angular/material';
import { GroupCreatePostDialogComponent } from 'src/app/common/shared/activity-feed/group-postbox/group-create-post-dialog-component/group-create-post-dialog-component.component';
import { ColumnService } from 'src/shared/services/column-service/column.service';

@Component({
  selector: 'app-group-tasks-list-view',
  templateUrl: './group-tasks-list-view.component.html',
  styleUrls: ['./group-tasks-list-view.component.scss']
})
export class GroupTasksListViewComponent implements OnInit {

  // Current Group Data
  @Input() groupData: any;
  // Current User Data
  @Input() userData: any;
  @Input() columns: any;
  // Task Posts array variable
  @Input() tasks: any;
  @Input() customFields: any;

  @Input() isAdmin = false;

  @ViewChild(MatAccordion, { static: true }) accordion: MatAccordion;

  customFieldsToShow: any[] = [];

  // Today's date object
  today = moment().local().startOf('day').format('YYYY-MM-DD');

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  // Fetch groupId from router snapshot
  groupId = this.router.snapshot.queryParamMap.get('group');

  // Base URL of the uploads
  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  // Property to know the selected field to add as column
  field: string;

  newColumnSelected;

  constructor(
      public utilityService: UtilityService,
      private groupService: GroupService,
      private injector: Injector,
      private router: ActivatedRoute,
      public dialog: MatDialog
    ) {}

  async ngOnInit() {
    await this.groupService.getGroupCustomFieldsToShow(this.groupId).then((res) => {
      if (res['group']['custom_fields_to_show']) {
        res['group']['custom_fields_to_show'].forEach(field => {
          const cf = this.getCustomField(field);
          // Push the Column
          if (cf) {
            this.customFieldsToShow.push(cf);
          }
        });
      }
    });
    this.columns.forEach( column => {
      let tasks = [];
      column.tasks = column.tasks.forEach( task => {
        if(task.bars !== undefined){
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
    })
  }

  /**
   * This function is responsible for fetching the post
   * @param post
   * @param column
   */
  getPost(post: any, column: any) {
    // Adding the post to column
    column.tasks.unshift(post);
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return !(JSON.stringify(object) === JSON.stringify({}));
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

  async onModalCloseEvent(data) {
    this.updateTask(data);
  }

  /**
   * This function is responsible for opening a fullscreen dialog to edit a task
   */
  openFullscreenModal(postData: any): void {
    const dialogRef = this.utilityService.openCreatePostFullscreenModal(postData, this.userData, this.groupId, this.columns);

    const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
      this.updateTask(data);
    });
    dialogRef.afterClosed().subscribe(result => {
      closeEventSubs.unsubscribe();
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

  getStatusColor(status: string) {
    let color = '';
    if (status === 'to do') {
      color = 'pumpkin-orange';
    } else if (status === 'in progress') {
      color = 'turquoise';
    } else if (status === 'done') {
      color = 'dark-sky-blue';
    }
    return color;
  }

  addNewColumn($event: Event) {

    // Find the index of the column to check if the same named column exist or not
    const index = this.customFieldsToShow.findIndex((f: any) => f.name.toLowerCase() === this.newColumnSelected.name.toLowerCase());

    // If index is found, then throw error notification
    if (index !== -1) {
      this.utilityService.warningNotification('Column already exist!');
    } else {
      // If not found, then push the element

      // Create the Column
      this.saveCustomFieldsToShow(this.newColumnSelected.name);
      this.newColumnSelected = null;
    }
  }

  /**
   * This function recieves the output from the other component for creating column
   * @param column
   */
  addSection(column: any) {

    // Find the index of the column to check if the same named column exist or not
    let index = this.columns.findIndex((col: any) => col.title.toLowerCase() === column.title.toLowerCase())

    // If index is found, then throw error notification
    if (index != -1) {
      this.utilityService.warningNotification('Column with the same title aready exist, please try with different name!')
    }

    // If not found, then push the element
    else {

      // Create the Column asynchronously
      this.createNewSection(this.groupId, column.title)

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
  createNewSection(groupId: string, columnName: string) {

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

  saveCustomFieldsToShow(fieldName) {
    const cf = this.getCustomField(fieldName);
    // Push the Column
    if (cf) {
      this.customFieldsToShow.push(cf);
    }

    let customFieldsToShowNames = [];
    this.customFieldsToShow.forEach(cf => {
      customFieldsToShowNames.push(cf.name);
    });

    this.groupService.saveCustomFieldsToShow(this.groupData._id, customFieldsToShowNames);
  }

  getCustomField(fieldName: string) {
    const index = this.customFields.findIndex((f: any) => f.name === fieldName);
    return this.customFields[index];
  }

  removeColumn(field: any) {
    const index: number = this.customFieldsToShow.indexOf(field);
    if (index !== -1) {
        this.customFieldsToShow.splice(index, 1);
    }
    this.groupService.saveCustomFieldsToShow(this.groupData._id, this.customFieldsToShow);
  }

  customFieldValues(fieldName: string) {
    const index = this.groupData.custom_fields.findIndex((field: any) => field.name === fieldName);
    return (this.groupData.custom_fields[index]) ? this.groupData.custom_fields[index].values : '';
  }

  fieldUpdated(post, task) {
    task = post;
  }
}
