import { Component, OnInit, EventEmitter, Output, Inject, Injector } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { PublicFunctions } from 'modules/public.functions';
import { PostService } from 'src/shared/services/post-service/post.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import moment from 'moment';
// ShareDB Client
import { BehaviorSubject } from 'rxjs';
import { FlowService } from 'src/shared/services/flow-service/flow.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-group-create-post-dialog-component',
  templateUrl: './group-create-post-dialog-component.component.html',
  styleUrls: ['./group-create-post-dialog-component.component.scss']
})
export class GroupCreatePostDialogComponent implements OnInit {

  // Close Event Emitter - Emits when closing dialog
  @Output() closeEvent = new EventEmitter();
  @Output() deleteEvent = new EventEmitter();
  @Output() parentAssignEvent = new EventEmitter();
  @Output() taskClonnedEvent = new EventEmitter();
  @Output() pinEvent = new EventEmitter();

  postData: any;
  userData: any;
  groupId: string;
  columns: any;
  // shuttleColumns: any;
  tasks:any;
  customFields = [];
  selectedCFValues = [];
  groupData: any;
  shuttleIndex = -1;
  shuttle: any;
  // Title of the Post
  title: string = '';
  //ragTags = [];
  isIdeaModuleAvailable;
  isShuttleTasksModuleAvailable;

  // Quill Data Object
  quillData: any;
  canEdit: boolean = true;
  canView: boolean = true;

  // postEditor: any;

  // Content Mentions Variables keeps a track of mentioned members
  _content_mentions: any = [];

  // Tags Object
  tags: any = [];

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

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

  // Comments Array
  comments: any = [];

  eventAssignedToCount;

  showSubtasks = false;
  subtasks: any =  [];
  percentageSubtasksCompleted = 0;

  lastAssignedBy: any;

  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  flows = [];

  newComment;

  myWorkplace = this.router.snapshot.queryParamMap.has('myWorkplace') ? this.router.snapshot.queryParamMap.get('myWorkplace') : false;

  constructor(
    private postService: PostService,
    private groupService: GroupService,
    private utilityService: UtilityService,
    private flowService: FlowService,
    private injector: Injector,
    private router: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdDialogRef: MatDialogRef<GroupCreatePostDialogComponent>
    ) {}

  async ngOnInit() {
    // Start the loading spinner
    this.isLoading$.next(true);

    const postId = this.data.postId;
    this.postData = await this.publicFunctions.getPost(postId);
    this.groupId = this.data.groupId;
    this.columns = this.data.columns;
    this.isIdeaModuleAvailable = this.data.isIdeaModuleAvailable;

    this.tasks = await this.publicFunctions.getPosts(this.groupId, 'task');

    this.isShuttleTasksModuleAvailable = await this.publicFunctions.isShuttleTasksModuleAvailable();

    this.userData = await this.publicFunctions.getCurrentUser();

    this.groupData = await this.publicFunctions.getCurrentGroupDetails(this.groupId);

    this.flowService.getGroupAutomationFlows(this.groupId).then(res => {
      this.flows = res['flows'];
    });

    await this.initPostData();
    this.canEdit = await this.utilityService.canUserDoTaskAction(this.postData, this.groupData, this.userData, 'edit');
    if (!this.canEdit) {
      const hide = await this.utilityService.canUserDoTaskAction(this.postData, this.groupData, this.userData, 'hide');
      this.canView = await this.utilityService.canUserDoTaskAction(this.postData, this.groupData, this.userData, 'view') || !hide;
    } else {
      this.canView = true;
    }
  }

  formateDate(date){
    return moment(moment.utc(date), "YYYY-MM-DD").toDate();
  }

  async initPostData() {
    // Set the title of the post
    this.title = this.postData?.title;

    // Set the due date to be undefined
    this.dueDate = undefined;
    this.tags = [];

    if (this.postData?.type === 'task') {
      if (this.isShuttleTasksModuleAvailable && this.postData?.task?.shuttle_type && this.postData?.task?.shuttles) {
        this.shuttleIndex = await this.postData?.task?.shuttles?.findIndex(shuttle => (shuttle._shuttle_group._id || shuttle._shuttle_group) == this.groupData?._id);
        this.shuttle = this.postData?.task?.shuttles[this.shuttleIndex];
      }

      if(this.postData?.task?._parent_task && this.columns && (this.shuttle?._shuttle_group?._id || this.shuttle?._shuttle_group) != this.groupId){
        this.columns = null;
      }

      // Set the taskAssignee
      this.taskAssignee = this.postData?._assigned_to || [];

      // Set the due date variable for task
      if ((this.postData?.task.due_to && this.postData?.task.due_to != null)
        || (this.postData?.event.due_to && this.postData?.event.due_to != null)) {
        // Set the DueDate variable
        this.dueDate = moment(this.postData?.task.due_to || this.postData?.event.due_to);
      }

      // Set the due date variable for task
      if (this.postData?.task.start_date && this.postData?.task.start_date != null) {
        // Set the DueDate variable
        this.startDate = moment(this.postData?.task.start_date);
      }

      this.setAssignedBy(this.postData);

      this.customFields = [];
      this.selectedCFValues = [];
      this.groupService.getGroupCustomFields(this.groupId).then((res) => {
        if (res['group']['custom_fields']) {
          res['group']['custom_fields'].forEach(field => {
            this.customFields.push(field);

            if (!this.postData?.task.custom_fields) {
              this.postData.task.custom_fields = new Map<string, string>();
            }

            if (!this.postData?.task.custom_fields[field.name]) {
              this.postData.task.custom_fields[field.name] = '';
              this.selectedCFValues[field.name] = '';
            } else {
              this.selectedCFValues[field.name] = this.postData?.task.custom_fields[field.name];
            }
          });
        }
      });

      await this.postService.getSubTasks(this.postData?._id).then((res) => {
        this.subtasks = res['subtasks'];

        if (this.subtasks && this.subtasks.length > 0) {
          this.showSubtasks = true;
        }
      });
    }

    // If post type is event, set the dueTime
    if (this.postData?.type === 'event') {

      // Set the due date variable for both task and event type posts
      if (this.postData?.event.due_to && this.postData?.event.due_to != null) {

        // Set the DueDate variable
        this.dueDate = moment(this.postData?.task.due_to || this.postData?.event.due_to);
      }

      if (this.dueDate) {
        this.dueTime.hour = this.dueDate.getHours();
        this.dueTime.minute = this.dueDate.getMinutes();
      }
      this.eventAssignedToCount = (this.postData?._assigned_to) ? this.postData?._assigned_to.size : 0;
    }

    this.tags = this.postData?.tags;

    // Return the function via stopping the loader
    return this.isLoading$.next(false);
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
    return this.publicFunctions.checkOverdue(taskPost);
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

      if (this.subtasks && this.subtasks.length > 0) {
        this.subtasks.forEach(subtask => {
          subtask.task._parent_task.title = this.title;
        });
      }
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
      this.updateDate(dateObject.toDate(), property);
    }
    if (property === 'due_date') {
      this.dueDate = dateObject.toDate();
      this.updateDate(dateObject.toDate(), property);
    }
  }

  /**
   * This function is responsible to update the date if the date is valid.
   * @param date
   * @param property
   */
  async updateDate(date, property) {
    await this.utilityService.asyncNotification($localize`:@@groupCreatePostDialog.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
      if (property === 'due_date') {
            this.postService.changeTaskDueDate(this.postData?._id, date?moment(date).format('YYYY-MM-DD'):null)
            .then((res) => {
              this.postData = res['post'];
              this.dueDate = moment(this.postData?.task?.due_to);
              // Resolve with success
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupCreatePostDialog.dateUpdated:Date updated!`));
            })
            .catch(() => {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@groupCreatePostDialog.unableToUpdateDetails:Unable to update the details, please try again!`));
            });

      } else if(property === 'start_date') {
          this.postService.saveTaskDates(this.postData?._id, date?moment(date).format('YYYY-MM-DD'):null, property)
            .then((res) => {
              this.postData = res['post'];
              this.startDate = moment(this.postData?.task?.start_date);
              // Resolve with success
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupCreatePostDialog.dateUpdated:Date updated!`));
            })
            .catch(() => {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@groupCreatePostDialog.unableToUpdateDetails:Unable to update the details, please try again!`));
            });
      }
    }));
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

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

  onCloseDialog() {
    this.closeEvent.emit(this.postData);
  }

  newCommentAdded(comment) {
    // this.comments.unshift(comment);
    this.newComment = comment;
  }

  onPostPin(pin: any) {
    this.postData.pin_to_top = pin;
    this.pinEvent.emit({pin: pin, _id: this.postData?._id});
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

  saveInputCustomField(event: Event, customFieldName: string) {
    const customFieldValue = event.target['value'];
    this.saveCustomField(customFieldName, customFieldValue);
  }

  saveCustomField(customFieldName: string, customFieldValue: string) {
    this.utilityService.asyncNotification($localize`:@@groupCreatePostDialog.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
      this.postService.saveCustomField(this.postData?._id, customFieldName, customFieldValue, this.groupId, this.isShuttleTasksModuleAvailable)
        .then(async (res) => {
          this.selectedCFValues[customFieldName] = customFieldValue;
          this.postData.task.custom_fields[customFieldName] = customFieldValue;

          this.postData = await this.publicFunctions.executedAutomationFlowsPropertiesFront(this.flows, this.postData, this.groupId, false, this.shuttleIndex);

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupCreatePostDialog.detailsUpdated:Details updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@groupCreatePostDialog.unableToUpdateDetails:Unable to update the details, please try again!`));
        });
    }));
  }

  async updateDetails() {
    // Prepare the normal  object

    if(this.quillData && this.quillData?.mention){
      this._content_mentions = this.quillData.mention.users.map((user)=> user.insert.mention.id)
    }

    const post: any = {
      title: this.title,
      type: this.postData?.type,
      content: this.quillData ? JSON.stringify(this.quillData.contents) : this.postData?.content,
      _content_mentions: this._content_mentions,
      tags: this.tags,
      _read_by: this.postData?._read_by,
      isNorthStar: this.postData?.task.isNorthStar,
      is_idea: this.postData?.task.is_idea,
      is_milestone: this.postData?.task?.is_milestone || false,
      northStar: this.postData?.task.northStar,
      assigned_to: this.postData?._assigned_to
    };

    // If Post type is event, then add due_to property too
    if (this.postData?.type === 'event') {

      var due_to;

      if (this.dueDate == undefined || this.dueDate == null) {
        const now = moment();
        now.hours(this.dueTime.hour);
        now.minute(this.dueTime.minute);
        due_to = now;
      } else {
        // Create the due_to date
        const now = moment(this.dueDate.getFullYear(),this.dueDate.getMonth(),this.dueDate.getDate());
        now.hours(this.dueTime.hour);
        now.minute(this.dueTime.minute);
        due_to = now;
      }

      // Add event.due_to property to the postData and assignees
      post.event = {
        due_to: moment(due_to).format()
      }
    }

    if (this.postData?.type === 'task') {
      post.task = this.postData?.task;

      // Task due date
      post.date_due_to = this.dueDate;

      if (this.groupData.project_type) {
        post.start_date = this.startDate;
      }

      if (!this.postData?.task._parent_task) {
        // Task column
        post._column = this.postData?.task._column._id || this.postData?.task._column;
      }

      // Task status
      post.status = this.postData?.task.status;
    }

    // Create FormData Object
    let formData = new FormData();

    // Append Post Data
    formData.append('post', JSON.stringify(post));

    // Append all the file attachments
    if (this.files && this.files.length != 0) {
      for (let index = 0; index < this.files.length; index++) {
        formData.append('attachments', this.files[index], this.files[index]['name']);
      }
    }

    // Call the edit post function
    await this.editPost(this.postData?._id, formData);
  }

  async changeTaskStatus(event) {
    // Set the status
    this.postData.task.status = event;

    this.postData = await this.publicFunctions.executedAutomationFlowsPropertiesFront(this.flows, this.postData, this.groupId, false, this.shuttleIndex);
  }

  async changeShuttleTaskStatus(event) {
    // Set the status
    this.shuttle.shuttle_status = event;
    await this.utilityService.asyncNotification($localize`:@@groupCreatePostDialog.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise(async (resolve, reject) => {
      await this.publicFunctions.changeTaskShuttleStatus(this.postData?._id, this.shuttle?._shuttle_group, event)
        .then(async (res) => {
          // Resolve with success
          this.postData.task.shuttles[this.shuttleIndex].shuttle_status = event;

          this.postData = await this.publicFunctions.executedAutomationFlowsPropertiesFront(this.flows, this.postData, this.groupData?._id, false, this.shuttleIndex);

          resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupCreatePostDialog.detailsUpdated:Details updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@groupCreatePostDialog.unableToUpdateDetails:Unable to update the details, please try again!`));
        });
    }));
  }

  async moveTaskToColumn(event) {
    const columnId = event.newColumnId;
    await this.publicFunctions.changeTaskColumn(this.postData?._id, columnId, this.userData._id, this.groupId);
    this.postData.task._column = columnId;

    this.postData = await this.publicFunctions.executedAutomationFlowsPropertiesFront(this.flows, this.postData, this.groupId, false, this.shuttleIndex);
  }

  async moveShuttleTaskToSection(event) {
    const shuttleSectionId = event.newColumnId;

    await this.publicFunctions.changeTaskShuttleSection(this.postData?._id, this.groupId, shuttleSectionId);

    // Resolve with success
    this.postData.task._shuttle_section = shuttleSectionId;

    this.postData = await this.publicFunctions.executedAutomationFlowsPropertiesFront(this.flows, this.postData, this.groupData?._id, false, this.shuttleIndex);
  }

  async onAssigned(res) {
    this.postData = res['post'];
    this.setAssignedBy(this.postData);

    if (this.postData?.type === 'task') {
      this.postData = await this.publicFunctions.executedAutomationFlowsPropertiesFront(this.flows, this.postData, this.groupId, false, this.shuttleIndex);
    }
  }

  async setAssignedBy(post) {

    if (this.postData?.records && this.postData?.records.assignments && this.postData?.records.assignments.length > 0) {
      this.postData.records.assignments = this.postData?.records.assignments.sort((a1, a2) => (moment(a1.date).isBefore(a2.date)) ? 1 : -1);
      this.lastAssignedBy = await this.publicFunctions.getOtherUser(this.postData?.records.assignments[0]._assigned_from);
    }
  }

  /**
   * Call the asynchronous function to change the column
   */
  async editPost(postId: any, formData: FormData) {
    await this.utilityService.asyncNotification($localize`:@@groupCreatePostDialog.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
      this.postService.edit(postId, formData)
        .then((res) => {
          this.postData = res['post'];
          this.contentChanged = false;
          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupCreatePostDialog.detailsUpdated:Details updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@groupCreatePostDialog.unableToUpdateDetails:Unable to update the details, please try again!`));
        });
    }));
  }

  /**
   * Call function to delete post
   */
  deletePost() {
    const id = this.postData?._id;
    this.utilityService.asyncNotification($localize`:@@groupCreatePostDialog.pleaseWaitWeAreDeleting:Please wait we are deleting the post...`, new Promise((resolve, reject) => {
      this.postService.deletePost(this.postData?._id)
        .then((res) => {
          // Emit the Deleted post to all the compoents in order to update the UI
          this.deleteEvent.emit(id);
          // Close the modal
          this.mdDialogRef.close();

          resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupCreatePostDialog.postDeleted:Post deleted!`));
        }).catch((err) => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@groupCreatePostDialog.unableToDeletePost:Unable to delete post, please try again!`));
        });
    }));
  }

  transformToMileStone(data:any){

    this.postData.task.is_milestone = data;
    this.updateDetails();
  }

  transformToIdea(data:any){
    this.postData.task.is_idea = data;
    this.updateDetails();
  }

  async setShuttleGroup(data: any) {
    this.postData.task.shuttle_type = true;
    if (!this.postData?.task.shuttles) {
      this.postData.task.shuttles = [];
    }
    this.postData?.task.shuttles.unshift(data);
  }

  transformToNorthStart(data) {
    this.postData.task.isNorthStar = data;
    this.postData.task.northStar = {
      target_value: 0,
      values: [{
        date: Date.now(),
        value: 0
      }],
      type: 'Currency $',
      status: 'ON TRACK'
    };

    this.updateDetails();
  }

  saveNorthStar(newNorthStar) {
    this.postData.task.northStar = newNorthStar;

    this.updateDetails();
  }

  prepareToAddSubtasks() {
    this.showSubtasks = true;
  }

  async onOpenSubtask(subtask: any) {

    // Start the loading spinner
    this.isLoading$.next(true);

    this.postData = subtask;
    this.showSubtasks = false;

    this.customFields = [];
    this.selectedCFValues = [];

    this.comments = [];

    this.columns = null;

    await this.initPostData();
  }

  async openParentTask(taskId: string) {

    // Start the loading spinner
    this.isLoading$.next(true);

    await this.publicFunctions.getPost(taskId).then(post => {
      this.postData = post;
    });

    this.showSubtasks = false;

    this.customFields = [];
    this.selectedCFValues = [];

    this.comments = [];

    /**
     * Here we fetch all the columns available in a group, and if null we initialise them with the default one
     */
    this.columns = await this.publicFunctions.getAllColumns(this.groupId);

    await this.initPostData();
  }

  async onParentTaskSelected(post) {
    // Set loading state to be true
    this.isLoading$.next(true);

    this.postData = post;

    await this.initPostData();

    this.parentAssignEvent.emit(post);
  }

  async onDependencyTaskSelected(post) {
    // Set loading state to be true
    this.isLoading$.next(true);

    this.postData = post;

    await this.initPostData();
  }

  onTaskClonned ($event) {
    this.taskClonnedEvent.emit($event);
  }

  onAllocationChanged(allocation) {
    this.postData.task.allocation = allocation;
  }

  /**
   * This function is responsible for receiving the date from @module <app-date-picker></app-date-picker>
   * @param dateObject
   */
   getCFDate(dateObject: any, cfName: string) {
    this.saveCustomField(cfName, dateObject.toDate());
  }

  onAssigneeEmitter(itemData: any) {
    this.postData = itemData;
  }

  async onApprovalFlowLaunchedEmiter(itemData: any) {
    this.postData = itemData;
    this.postData = await this.publicFunctions.executedAutomationFlowsPropertiesFront(this.flows, this.postData, this.groupId, false, this.shuttleIndex);
    this.canEdit = !this.postData?.approval_flow_launched;
  }
}
