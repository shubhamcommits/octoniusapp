import { Component, OnInit, EventEmitter, Output, Inject, Injector } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { environment } from 'src/environments/environment';
import { PublicFunctions } from 'modules/public.functions';
import { PostService } from 'src/shared/services/post-service/post.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { CommentService } from 'src/shared/services/comment-service/comment.service';
import moment from 'moment';
// ShareDB Client
import * as ShareDB from 'sharedb/lib/client';

@Component({
  selector: 'app-group-create-post-dialog-component',
  templateUrl: './group-create-post-dialog-component.component.html',
  styleUrls: ['./group-create-post-dialog-component.component.scss']
})
export class GroupCreatePostDialogComponent implements OnInit {

  // Close Event Emitter - Emits when closing dialog
  @Output() closeEvent = new EventEmitter();
  @Output() deleteEvent = new EventEmitter();

  // BASE URL OF THE APPLICATION
  baseUrl = environment.UTILITIES_BASE_URL;

  postData: any;
  userData: any;
  groupId: string;
  columns: any;
  customFields = [];
  selectedCFValues = [];
  groupData: any;
  // Title of the Post
  title: string = '';
  barTags = [];

  // Quill Data Object
  quillData: any;

  // postEditor: any;

  // Content Mentions Variables keeps a track of mentioned members
  _content_mentions: any = [];

  // Tags Object
  tags: any = [];

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  // Variable to enable or disable save button
  contentChanged = false;

  /* Task Variables */

  // Task Assignee Variable
  taskAssignee = {
    profile_pic: '',
    role: '',
    first_name: '',
    last_name: '',
    email: ''
  };

  // Assigned State of Task
  assigned: boolean = false;

  startDate: any;
  endDate: any;

  // Date Object to map the due dates
  dueDate: any;
  dueTime: any = {
    hour: 1,
    minute: 30
  };

  // Files Variable
  files: any = [];

  // Cloud files
  cloudFiles: any = [];

  eventAssignees: any = [];

  // Members Map of Event Asignee
  eventMembersMap: any = new Map();

  // Comments Array
  comments: any = [];

  eventAssignedToCount;

  constructor(
    private postService: PostService,
    private groupService: GroupService,
    private utilityService: UtilityService,
    private injector: Injector,
    private commentService: CommentService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdDialogRef: MatDialogRef<GroupCreatePostDialogComponent>
    ) {}

  async ngOnInit() {
    this.postData = this.data.postData;
    this.userData = this.data.userData;
    this.groupId = this.data.groupId;
    this.columns = this.data.columns;
    // Set the title of the post
    this.title = this.postData.title;
    if(this.postData.bars !== undefined){
      this.barTags = this.postData.bars.map( bar => bar.bar_tag);
    }
    this.groupData = await this.publicFunctions.getGroupDetails(this.groupId);
    // Set the due date to be undefined
    this.dueDate = undefined;
    if (this.postData.type === 'task') {
      // If Post is not unassigned
      if (!this.postData.task.unassigned) {
        // Set the taskAssignee
        this.taskAssignee = this.postData.task._assigned_to;
      }

      // Set the due date variable for task
      if (this.postData.task.due_to && this.postData.task.due_to != null) {

        // Set the DueDate variable
        this.dueDate = new Date(this.postData.task.due_to || this.postData.event.due_to);
      }

      this.groupService.getGroupCustomFields(this.groupId).then((res) => {
        if (res['group']['custom_fields']) {
          res['group']['custom_fields'].forEach(field => {
            this.customFields.push(field);

            if (!this.postData.task.custom_fields) {
              this.postData.task.custom_fields = new Map<string, string>();
            }

            if (!this.postData.task.custom_fields[field.name]) {
              this.postData.task.custom_fields[field.name] = '';
              this.selectedCFValues[field.name] = '';
            } else {
              this.selectedCFValues[field.name] = this.postData.task.custom_fields[field.name];
            }
          });
        }
      });
    }

    // If post type is event, set the dueTime
    if (this.postData.type === 'event') {

      // Set the due date variable for both task and event type posts
      if (this.postData.event.due_to && this.postData.event.due_to != null) {

        // Set the DueDate variable
        this.dueDate = new Date(this.postData.task.due_to || this.postData.event.due_to);
      }

      if (this.dueDate) {
        this.dueTime.hour = this.dueDate.getHours();
        this.dueTime.minute = this.dueDate.getMinutes();
      }
      this.eventMembersMap = this.postData.event._assigned_to;
      this.eventAssignedToCount = (this.postData.event._assigned_to) ? this.postData.event._assigned_to.size : 0;
    }

    this.tags = this.postData.tags;

    this.fetchComments();
  }

  getMemberDetails(memberMap: any) {
    if (this.postData.type == 'event') {
      this.eventMembersMap = memberMap;
      this.eventAssignees = (this.eventMembersMap.has('all')) ? 'all' : Array.from(this.eventMembersMap.keys());

      this.eventAssignedToCount = (this.eventMembersMap) ? ((this.eventMembersMap.has('all')) ? 'all' : this.eventMembersMap.size) : 0;
    }
    this.updateDetails();
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
    return moment(taskPost.due_to).format('YYYY-MM-DD') < moment().local().startOf('day').format('YYYY-MM-DD');
  }

  /**
   * This function checks if the map consists of all team as the assignee for the event type selection
   * @param map
   */
  eventAssignedToAll() {
    return (this.eventMembersMap && this.eventMembersMap['all']) ? true : false;
  }

  async moveTaskToColumn(event) {
    await this.utilityService.asyncNotification('Please wait we are updating the contents...', new Promise((resolve, reject) => {
      this.postService.changeTaskColumn(this.postData._id, event.post.task._column.title)
        .then((res) => {
          this.postData = res['post'];
          this.contentChanged = false;
          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise(`Details updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise(`Unable to update the details, please try again!`));
        });
    }));
  }

  changeTaskStatus(event) {
    // Set the status
    this.postData.task.status = event;
  }

  /**
   * This function is mapped with the event change of @variable - title
   * Show update detail option if title has been changed
   * @param event - new title value
   */
  titleChange(event: any) {
    const newTitle = event.target.value;
    if (newTitle !== this.title) {
      this.title = newTitle;
      this.updateDetails();
    }
  }

  quillContentChanged(event: any) {
    this.contentChanged = true;
    this.quillData = event;
  }

  /**
   * This function is responsible for receiving the date from @module <app-date-picker></app-date-picker>
   * @param dateObject
   */
  getDate(dateObject: any, property: string) {

    if (property === 'start_date') {
      this.startDate = dateObject.toDate();
    }
    if (property === 'end_date') {
      this.endDate = dateObject.toDate();
    }
    if (property === 'due_date') {
      this.dueDate = dateObject.toDate();
    }

    this.updateDetails();
  }

  /**
   * This function is responsible for receiving the time from @module <app-time-picker></app-time-picker>
   * @param timeObject
   */
  getTime(timeObject: any) {
    this.dueTime = timeObject;

    this.updateDetails();
  }

  /**
   * This function receives the output from the tags components
   * @param tags
   */
  getTags(tags: any) {

    // Set the tags value
    this.tags = tags;

    this.updateDetails();
  }

  async addNewBarTag(event){
    let bar;
    this.groupData.bars.forEach(element => {
      if(element.bar_tag === event){
        bar = element;
      }
    });
    await this.utilityService.asyncNotification('Please wait we are updating the contents...', new Promise((resolve, reject) => {
      this.postService.addBar(this.postData._id, bar)
        .then((res) => {
          // Resolve with success
        this.postData.bars.push(bar);
        this.barTags.push(event);
          resolve(this.utilityService.resolveAsyncPromise(`Details updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise(`Unable to update the details, please try again!`));
        });
    }));
  }

  async removeBarTag(index, event){
    let bar;
    this.groupData.bars.forEach(element => {
      if(element.bar_tag === event){
        bar = element;
      }
    });
    await this.utilityService.asyncNotification('Please wait we are updating the contents...', new Promise((resolve, reject) => {
      this.postService.removeBar(this.postData._id, bar)
        .then((res) => {
          // Resolve with success
          this.barTags.splice(index, 1);
          this.postData.bars = this.postData.bars.filter(barTag => barTag.bar_tag !== event);
          resolve(this.utilityService.resolveAsyncPromise(`Details updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise(`Unable to update the details, please try again!`));
        });
    }));
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

  onCloseDialog() {
    this.closeEvent.emit(this.postData);
  }

  /**
   * Fetch Comments
   */
  fetchComments() {
    this.commentService.getComments(this.postData._id).subscribe((res) => {
      this.comments = res.comments;
    });
  }

  newCommentAdded(event) {
    this.comments.unshift(event);
  }

  removeComment(index: number) {
    this.comments.splice(index, 1);
  }

  /**
   * This function is responsible for receiving the files
   * @param files
   */
  onAttach(files: any) {

    // Set the current files variable to the output of the module
    this.files = files;

    this.updateDetails();
  }

  /**
   * This function is responsible for receiving the files
   * @param files
   */
  onCloudFileAttach(cloudFiles: any) {
    // Set the current files variable to the output of the module
    this.cloudFiles = cloudFiles;

    this.updateDetails();
  }

  onCustomFieldChange(event: Event, customFieldName: string) {
    const customFieldValue = event['value'];
    this.saveCustomField(customFieldName, customFieldValue);
  }

  saveCustomField(customFieldName: string, customFieldValue: string) {
    this.utilityService.asyncNotification('Please wait we are updating the contents...', new Promise((resolve, reject) => {
      this.postService.saveCustomField(this.postData._id, customFieldName, customFieldValue)
        .then((res) => {
          this.postData.task.custom_fields[customFieldName] = customFieldValue;
          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise(`Details updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise(`Unable to update the details, please try again!`));
        });
    }));
  }

  updateDetails() {
    // Prepare the normal  object
    const post: any = {
      title: this.title,
      type: this.postData.type,
      content: this.quillData ? JSON.stringify(this.quillData.contents) : this.postData.content,
      _content_mentions: this._content_mentions,
      tags: this.tags,
      _read_by: this.postData._read_by,
      isNorthStar: this.postData.task.isNorthStar,
      northStar: this.postData.task.northStar
    };

    // If Post type is event, then add due_to property too
    if (this.postData.type === 'event') {

      var due_to;

      if (this.dueDate == undefined || this.dueDate == null) {
        due_to = new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          new Date().getDate(),
          this.dueTime.hour,
          this.dueTime.minute
        );
      } else {
        // Create the due_to date
        due_to = new Date(
          this.dueDate.getFullYear(),
          this.dueDate.getMonth(),
          this.dueDate.getDate(),
          this.dueTime.hour,
          this.dueTime.minute);
      }

      // Add event.due_to property to the postData and assignees
      post.event = {
        due_to: moment(due_to).format(),
        _assigned_to: this.eventAssignees
      }
    }

    if (this.postData.type === 'task') {
      post.task = this.postData.task;

      // Adding unassigned property for previous tasks model
      if (this.postData.task.unassigned == 'No') {
        this.postData.task.unassigned = false;
      }

      // Adding unassigned property for previous tasks model
      if (this.postData.task.unassigned == 'Yes') {
        this.postData.task.unassigned = true;
      }

      // Unassigned property
      post.unassigned = this.postData.task.unassigned;

      // Task due date
      post.date_due_to = this.dueDate;

      if (this.groupData.project_type) {
        post.start_date = this.startDate;
        post.end_date = this.endDate;
      }

      // Task Assigned to
      if (post.unassigned !== null && !post.unassigned) {
        post.assigned_to = this.postData.task._assigned_to._id;
      }

      // Task column
      post._column = {
        title: this.postData.task._column.title
      };

      // Task status
      post.status = this.postData.task.status;
    }

    // Create FormData Object
    let formData = new FormData();

    // Append Post Data
    formData.append('post', JSON.stringify(post));

    // Append all the file attachments
    if (this.files.length != 0) {
      for (let index = 0; index < this.files.length; index++) {
        formData.append('attachments', this.files[index], this.files[index]['name']);
      }
    }

    // Call the edit post function
    this.editPost(this.postData._id, formData);
  }

  /**
   * Call the asynchronous function to change the column
   */
  async editPost(postId: any, formData: FormData) {
    await this.utilityService.asyncNotification('Please wait we are updating the contents...', new Promise((resolve, reject) => {
      this.postService.edit(postId, formData)
        .then((res) => {
          this.postData = res['post'];
          this.contentChanged = false;
          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise(`Details updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise(`Unable to update the details, please try again!`));
        });
    }));
  }

  /**
   * Call function to delete post
   */
  deletePost() {
    const id = this.postData._id;
    this.utilityService.asyncNotification('Please wait we are deleting the post...', new Promise((resolve, reject) => {
      this.postService.deletePost(this.postData._id)
        .then((res) => {
          // Emit the Deleted post to all the compoents in order to update the UI
          this.deleteEvent.emit(id);
          // Close the modal
          this.mdDialogRef.close();

          resolve(this.utilityService.resolveAsyncPromise('Post deleted!'));
        }).catch((err) => {
          reject(this.utilityService.rejectAsyncPromise('Unable to delete post, please try again!'));
        });
    }));
  }

  transformToNorthStart() {
    this.postData.task.isNorthStar = true;
    this.postData.task.northStar = {
      target_value: 0,
      values: {
        date: Date.now(),
        value: 0
      },
      type: 'Currency $',
      status: 'ON TRACK'
    };

    this.updateDetails();
  }

  saveNorthStar(newNorthStar) {
    this.postData.task.northStar = newNorthStar;

    this.updateDetails();
  }
}
