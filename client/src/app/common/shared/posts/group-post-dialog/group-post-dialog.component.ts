import { Component, OnInit, EventEmitter, Output, Inject, Injector, AfterViewInit, AfterViewChecked } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { PostService } from 'src/shared/services/post-service/post.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import moment from 'moment';
// ShareDB Client
import { BehaviorSubject } from 'rxjs';
import { FlowService } from 'src/shared/services/flow-service/flow.service';
import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';

@Component({
  selector: 'app-group-post-dialog',
  templateUrl: './group-post-dialog.component.html',
  styleUrls: ['./group-post-dialog.component.scss']
})
export class GroupPostDialogComponent implements OnInit, AfterViewChecked {

  // Close Event Emitter - Emits when closing dialog
  @Output() closeEvent = new EventEmitter();
  @Output() deleteEvent = new EventEmitter();
  @Output() parentAssignEvent = new EventEmitter();
  @Output() taskClonnedEvent = new EventEmitter();
  @Output() pinEvent = new EventEmitter();
  @Output() datesChangeEvent = new EventEmitter();

  postData: any;
  userData: any;
  groupId: string;
  columns: any;
  // shuttleColumns: any;
  tasks:any;
  customFields;
  selectedCFValues = [];
  groupData: any;
  shuttleIndex = -1;
  shuttle: any;
  // Title of the Post
  title: string = '';
  //ragTags = [];
  isIdeaModuleAvailable;
  isShuttleTasksModuleAvailable;
  isIndividualSubscription = true;
  isBusinessSubscription = false;

  // Quill Data Object
  quillData: any;
  canEdit: boolean = true;
  canView: boolean = true;

  // Content Mentions Variables keeps a track of mentioned members
  _content_mentions: any = [];

  // Tags Object
  tags: any = [];

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

  flows = [];

  newComment;

  selectedTab = 0;

  myWorkplace = false;

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  constructor(
    private postService: PostService,
    private groupService: GroupService,
    private utilityService: UtilityService,
    private flowService: FlowService,
    private managementPortalService: ManagementPortalService,
    private injector: Injector,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdDialogRef: MatDialogRef<GroupPostDialogComponent>
    ) {}

  async ngOnInit() {
    // Start the loading spinner
    this.isLoading$.next(true);

    const postId = this.data.postId;
    this.postData = await this.publicFunctions.getPost(postId);
    this.groupId = this.data.groupId;
    this.columns = this.data.columns;

    if (!this.groupId) {
      this.groupId = (this.postData._group) ? (this.postData._group._id || this.postData._group) : null;
      this.myWorkplace = false;
    }

    if (this.groupId) {
      this.tasks = await this.publicFunctions.getPosts(this.groupId, 'task');

      this.groupData = await this.publicFunctions.getGroupDetails(this.groupId);

      this.myWorkplace = this.publicFunctions.isPersonalNavigation(this.groupData, this.userData);

      this.flowService.getGroupAutomationFlows(this.groupId).then(res => {
        this.flows = res['flows'];
      });
    }

    this.isShuttleTasksModuleAvailable = await this.publicFunctions.isShuttleTasksModuleAvailable();
    this.isIdeaModuleAvailable = await this.publicFunctions.checkIdeaStatus();
    this.isIndividualSubscription = await this.managementPortalService.checkIsIndividualSubscription();
    this.isBusinessSubscription = await this.managementPortalService.checkIsBusinessSubscription();

    this.userData = await this.publicFunctions.getCurrentUser();

    await this.initPostData();
  }

  ngAfterViewChecked() {
    this.selectedDefaultTab();
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

      if (this.postData?.task?._parent_task && this.postData?.task?._parent_task?._group == undefined) {
        this.postData.task._parent_task._group = null;
      }

      if((this.postData?.task?._parent_task && this.postData?.task?._parent_task?._group) && this.columns && (this.shuttle?._shuttle_group?._id || this.shuttle?._shuttle_group) != this.groupId){
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

      this.setAssignedBy();

      await this.postService.getSubTasks(this.postData?._id).then((res) => {
        this.subtasks = res['subtasks'];

        if (this.subtasks && this.subtasks.length > 0) {
          this.showSubtasks = true;
        }
      });

      await this.sortNSValues();
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

    this.canEdit = await this.utilityService.canUserDoTaskAction(this.postData, this.groupData, this.userData, 'edit');
    if (!this.canEdit) {
      const hide = await this.utilityService.canUserDoTaskAction(this.postData, this.groupData, this.userData, 'hide');
      this.canView = await this.utilityService.canUserDoTaskAction(this.postData, this.groupData, this.userData, 'view') || !hide;
    } else {
      this.canView = true;
    }

    if (this.groupId) {

      this.customFields = null;
      this.selectedCFValues = [];
  
      this.initCustomFields();
    }

    // Return the function via stopping the loader
    return this.isLoading$.next(false);
  }

  async initCustomFields() {
    let customFieldsTmnp = this.groupData?.custom_fields;

    if (!customFieldsTmnp) {
      await this.groupService.getGroupCustomFields(this.groupId).then((res) => {
        if (res['group']['custom_fields']) {
          customFieldsTmnp = res['group']['custom_fields'];
        }
      });
    }

    if (customFieldsTmnp) {
      this.customFields = [];
      
      customFieldsTmnp.forEach(field => {
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
  }

  sortNSValues() {
    if (!!this.postData?.task?.northStar?.values) {
      this.postData.task.northStar.values = this.postData?.task?.northStar?.values?.sort((v1, v2) => (moment.utc(v1.date).isBefore(moment.utc(v2.date))) ? 1 : -1)
    }
  }

  selectedDefaultTab() {
    let tabsLength = 1;
    if (this.showSubtasks && (!this.postData?.task?.shuttle_type || this.groupData?._id == this.postData?._group?._id)) {
      tabsLength++;
    }
    if (this.postData?.comments_count > 0) {
      tabsLength++;
    }
    if (this.postData?.task?.isNorthStar) {
      tabsLength++;
    }
    if (this.postData?.type === 'task' && this.postData?.approval_active && this.postData?.approval_history && this.postData?.approval_history?.length > 0 && this.isBusinessSubscription) {
      tabsLength++;
    }
    if (this.postData?.logs && this.postData?.logs?.length > 0) {
      tabsLength++;
    }

    if (this.showSubtasks && (!this.postData?.task?.shuttle_type || this.groupData?._id == this.postData?._group?._id)) {
      this.selectedTab = 0;
    } else if (this.postData?.comments_count > 0 && length > 1) {
      this.selectedTab = 1;
    } else if (this.postData?.task?.isNorthStar && length > 2) {
      this.selectedTab = 2;
    } else if (this.postData?.type === 'task' && this.postData?.approval_active && this.postData?.approval_history && this.postData?.approval_history?.length > 0 && this.isBusinessSubscription && length > 3) {
      this.selectedTab = 3;
    } else if (this.postData?.logs && this.postData?.logs?.length > 0 && length > 4) {
      this.selectedTab = 4;
    } else {
      this.selectedTab = 0;
    }
  }

  /**
   * This function is mapped with the event change of @variable - title
   * Show update detail option if title has been changed
   * @param event - new title value
   */
  async titleChange(event: any) {
    const newTitle = event.target.value;
    if (newTitle !== this.title) {
      this.title = newTitle;

      await this.utilityService.asyncNotification($localize`:@@groupCreatePostDialog.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
        this.postService.editTitle(this.postData?._id, newTitle)
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
      // this.updateDetails('change_title');

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
   * This function is responsible for receiving the start date from @module <app-post-dates></app-post-dates>
   * @param timeObject
   */
   getStartDate(dateObject: any) {
    this.startDate = dateObject;
    this.datesChangeEvent.emit({
        start_date: this.startDate,
        due_date: this.dueDate
      });
  }

  /**
   * This function is responsible for receiving the due date from @module <app-post-dates></app-post-dates>
   * @param timeObject
   */
   getDueDate(dateObject: any) {
    this.dueDate = dateObject;
  }

  /**
   * This function is responsible for receiving the time from @module <app-post-dates></app-post-dates>
   * @param timeObject
   */
  getTime(timeObject: any) {
    this.dueTime = timeObject;
    this.updateDetails('change_time');
  }

  /**
   * This function receives the output from the tags components
   * @param tags
   */
  getTags(tags: any) {

    // Set the tags value
    this.tags = tags;

    this.updateDetails('updated_tags');
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
    this.updateDetails('attach_file');
  }

  /**
   * This function is responsible for receiving the files
   * @param files
   */
  onCloudFileAttach(cloudFiles: any) {
    // Set the current files variable to the output of the module
    this.cloudFiles = cloudFiles;

    this.updateDetails('attach_file_cloud');
  }

  onCustomFieldChange(event: Event, customFieldName: string, customFieldTitle: string) {
    const customFieldValue = event['value'];
    this.saveCustomField(customFieldName, customFieldTitle, customFieldValue);
  }

  saveInputCustomField(event: Event, customFieldName: string, customFieldTitle: string) {
    const customFieldValue = event.target['value'];
    this.saveCustomField(customFieldName, customFieldTitle, customFieldValue);
  }

  saveCustomField(customFieldName: string, customFieldTitle: string, customFieldValue: string) {
    this.utilityService.asyncNotification($localize`:@@groupCreatePostDialog.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
      this.postService.saveCustomField(this.postData?._id, customFieldName, customFieldTitle, customFieldValue, this.groupId, this.isShuttleTasksModuleAvailable, this.isIndividualSubscription)
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

  // async updateContent() {
  //   if(this.quillData && this.quillData?.mention){
  //     this._content_mentions = this.quillData.mention.users.map((user)=> user.insert.mention.id)
  //   }

  //   const post: any = {
  //     content: this.quillData ? JSON.stringify(this.quillData.contents) : this.postData?.content,
  //     _content_mentions: this._content_mentions,
  //   };

  //   // Create FormData Object
  //   let formData = new FormData();

  //   // Append Post Data
  //   formData.append('post', JSON.stringify(post));

  //   // Append all the file attachments
  //   if (this.files && this.files.length != 0) {
  //     for (let index = 0; index < this.files.length; index++) {
  //       formData.append('attachments', this.files[index], this.files[index]['name']);
  //     }
  //   }

  //   await this.utilityService.asyncNotification($localize`:@@groupCreatePostDialog.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
  //     this.postService.editContent(this.postData?._id, formData)
  //       .then((res) => {
  //         this.postData = res['post'];
  //         this.contentChanged = false;
  //         // Resolve with success
  //         resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupCreatePostDialog.detailsUpdated:Details updated!`));
  //       })
  //       .catch(() => {
  //         reject(this.utilityService.rejectAsyncPromise($localize`:@@groupCreatePostDialog.unableToUpdateDetails:Unable to update the details, please try again!`));
  //       });
  //   }));
  // }

  async updateDetails(logAction: string) {
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
      isNorthStar: this.postData?.task?.isNorthStar || false,
      is_idea: this.postData?.task?.is_idea || false,
      is_crm_task: this.postData?.task?.is_crm_task || false,
      is_milestone: this.postData?.task?.is_milestone || false,
      northStar: this.postData?.task?.northStar || false,
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

      if (this.groupData && this.groupData.project_type) {
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
    formData.append('logAction', logAction);

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
    this.setAssignedBy();

    if (this.postData?.type === 'task') {
      this.postData = await this.publicFunctions.executedAutomationFlowsPropertiesFront(this.flows, this.postData, this.groupId, false, this.shuttleIndex);
    }
  }

  async setAssignedBy() {

    if (this.postData?.logs && this.postData?.logs?.length > 0) {
      const logs = this.postData?.logs
        .filter(log => (log.action == 'assigned_to' || log.action == 'removed_assignee') && log?._actor)
        .sort((l1, l2) => (moment(l1.action_date).isBefore(l2.action_date)) ? 1 : -1);

      if (logs[0]) {
        this.lastAssignedBy = await this.publicFunctions.getOtherUser(logs[0]._actor?._id);
      }
    }
  }

  /**
   * Call the asynchronous function to change the column
   */
  async editPost(postId: any, formData: FormData) {
    await this.utilityService.asyncNotification($localize`:@@groupCreatePostDialog.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
      this.postService.edit(postId, this.userData?._workspace?._id || this.userData?._workspace, formData)
        .then(async (res) => {
          this.postData = res['post'];

          await this.initPostData();

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

  transformToMileStone(data:any) {

    this.postData.task.is_milestone = data;
    const makeMilestoneLogAction = (this.postData.task.is_milestone) ? 'make_milestone' : 'make_no_milestone';
    this.updateDetails(makeMilestoneLogAction);
  }

  transformToIdea(data:any) {
    this.postData.task.is_idea = data;
    const makeIdeaLogAction = (this.postData.task.is_idea) ? 'make_idea' : 'make_no_idea';
    this.updateDetails(makeIdeaLogAction);
  }

  transformToCRMLead(data:any) {
    this.postData.task.is_crm_task = data;
    const makeCRMLeadLogAction = (this.postData.task.is_crm_task) ? 'make_crm_task' : 'make_no_crm_task';
    this.updateDetails(makeCRMLeadLogAction);
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
        value: 0,
        status: 'NOT STARTED',
        _user: this.userData?._id
      }],
      type: 'Currency',
      currency: 'USD'
    };
    const makeNSLogAction = (this.postData.task.isNorthStar) ? 'make_ns' : 'make_no_ns';
    this.updateDetails(makeNSLogAction);
  }

  saveNorthStar(newNorthStar) {
    this.postData.task.northStar = newNorthStar;

    this.updateDetails('update_ns');
  }

  prepareToAddSubtasks() {
    this.showSubtasks = true;
  }

  async onOpenSubtask(subtask: any) {

    // Start the loading spinner
    this.isLoading$.next(true);

    this.postData = subtask;
    this.showSubtasks = false;

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

    this.comments = [];

     /**
     * Here we fetch all the columns available in a group, and if null we initialise them with the default one
     */
    if (this.groupId) {
      this.columns = await this.publicFunctions.getAllColumns(this.groupId);
    }

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
  getCFDate(dateObject: any, cfName: string, cfTitle: string) {
    this.saveCustomField(cfName, cfTitle, dateObject.toDate());
  }

  onAssigneeEmitter(itemData: any) {
    this.postData = itemData;
  }

  async onApprovalFlowLaunchedEmiter(itemData: any) {
    this.postData = itemData;
    this.postData = await this.publicFunctions.executedAutomationFlowsPropertiesFront(this.flows, this.postData, this.groupId, false, this.shuttleIndex);
    this.canEdit = !this.postData?.approval_flow_launched;
  }

  formateDate(date) {
    return (date) ? moment(moment.utc(date), "YYYY-MM-DD").toDate() : '';
  }
}
