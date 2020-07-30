import { Component, OnInit, Input, Injector } from '@angular/core';
import moment from 'moment/moment';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { GroupService } from 'src/shared/services/group-service/group.service';

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
  customFields = [];

  constructor(
      public utilityService: UtilityService,
      private groupService: GroupService,
      private injector: Injector,
      private router: ActivatedRoute
    ) {}

  ngOnInit() {
    this.groupService.getGroupCustomFieldsToShow(this.groupId).then((res) => {
      res['group']['custom_fields_to_show'].forEach(field => {
        this.customFieldsToShow.push(field);
      });
    });

    this.groupService.getGroupCustomFields(this.groupId).then((res) => {
      res['group']['custom_fields'].forEach(field => {
        this.customFields.push(field);
      });
    });
  }

  /**
   * This function is responsible for removing the task from the UI
   * @param column - column data
   * @param post - post
   */
  removeTask(column: any, post: any) {

    // Find the index of the tasks inside the column
    const index = column.tasks.findIndex((task: any) => task._id === post._id);

    // If the index is not found
    if (index !== -1) {

      // Remove the tasks from the array
      column.tasks.splice(index, 1);
    }
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
   * This function is responsible for closing the modals
   */
  closeModal() {
    this.utilityService.closeAllModals();
  }
  
  /**
   * This function updates the status on the UI
   * @param task 
   * @param status 
   */
  changeStatus(task: any, status: any) {

    // Set the status
    task.task.status = status;
  }

  /**
   * This function changes the assignee
   * @param task
   * @param memberMap
   */
  changeAssignee(task: any, memberMap: any) {

    // Call the HTTP Request to change the assignee
    this.publicFunctions.changeTaskAssignee(task._id, memberMap['_id']);

    // Set the unassigned to be false on the UI
    task.task.unassigned = false;

    // Set the assigned_to variable
    task.task._assigned_to = memberMap;
  }

  /**
   * This function is responsible for changing the due date
   * @param task
   * @param dueDate
   */
  changeDueDate(task: any, dueDate: any) {

    // dueDate = new Date(dueDate)

    // dueDate = new Date(dueDate.getFull
    dueDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

    dueDate = moment(dueDate).format();

    // Call the HTTP Request to change the due date
    this.publicFunctions.changeTaskDueDate(task._id, dueDate);

    // Set the task due date on the UI
    task.task.due_to = moment(dueDate).format('YYYY-MM-DD');
  }

  /**
   * This function changes the details on the UI
   * @param task
   * @param post
   */
  changeDetails(task: any, post: any) {

    // Update task title
    task.title = post.title;

    // Update task content
    task.content = post.content;

    // Update task tags
    task.tags = post.tags;

    // Update task files
    task.files = post.files;

    // Update the liked by
    task._liked_by = post._liked_by;

    // Update the content mentions
    task._content_mentions = post._content_mentions;

    // Update the task comments
    task.comments = post.comments;

  }

  /**
   * This function handles the UI updation of the moving tasks into various columns
   * @param $event
   */
  moveTaskToColumn($event: any) {

    // Call the HTTP Request to move the task
    this.moveTaskToNewColumn($event.post, $event.oldColumn, $event.newColumn)

    // Find the oldColumnIndex in which task existed
    const oldColumnIndex = this.columns.findIndex((column: any) => column.title.toLowerCase() === $event.oldColumn.toLowerCase());

    // Find the newColumnIndex in which task is to be shifted
    const newColumnIndex = this.columns.findIndex((column: any) => column.title.toLowerCase() === $event.newColumn.toLowerCase());

    // Remove the task from the old Column
    this.columns[oldColumnIndex]['tasks']
      .splice(this.columns[oldColumnIndex]['tasks'].findIndex((post: any) => post._id === $event.post._id), 1);

    // Add the task into the new column
    this.columns[newColumnIndex]['tasks'].unshift($event.post);
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
       this.changeStatus(task, newColumn);
       break;
   }
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
      this.saveCustomFieldsToShow(this.newColumnSelected);
    }
  }

  saveCustomFieldsToShow(field) {
    // Push the Column
    this.customFieldsToShow.push(field);

    this.groupService.saveCustomFieldsToShow(this.groupData._id, this.customFieldsToShow);
  }

  removeColumn(field: any) {
    const index: number = this.customFieldsToShow.indexOf(field);
    if (index !== -1) {
        this.customFieldsToShow.splice(index, 1);
    }
    this.groupService.saveCustomFieldsToShow(this.groupData._id, this.customFieldsToShow);
  }

  customFieldValues(fieldName: string) {
    const index = this.customFieldsToShow.findIndex((field: any) => field.name === fieldName);
    return this.customFieldsToShow[index].values;
  }
}
