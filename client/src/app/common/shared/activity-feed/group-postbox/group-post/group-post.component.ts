import { Component, OnInit, Input, Output, EventEmitter, Injector, Inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PostService } from 'src/shared/services/post-service/post.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment/moment';
import { FlowService } from 'src/shared/services/flow-service/flow.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-group-post',
  templateUrl: './group-post.component.html',
  styleUrls: ['./group-post.component.scss']
})
export class GroupPostComponent implements OnInit {

  @Input('post') postData: any
  @Input('edit') edit: boolean = false;
  @Input('columns') columns: any
  @Input('userData') userData: any;
  @Input('groupId') groupId: any;
  @Input('type') type: string = 'normal';

  @Output('moveTask') moveTask = new EventEmitter();
  @Output('taskStatus') taskStatus = new EventEmitter();
  @Output('member') member = new EventEmitter()
  @Output('date') date = new EventEmitter()
  @Output() pinEvent = new EventEmitter();
  @Output('close') close = new EventEmitter();
  @Output('post') post = new EventEmitter()
  @Output('edited') edited = new EventEmitter();
  @Output('delete') delete = new EventEmitter();

  // BASE URL OF THE APPLICATION
  baseUrl = environment.UTILITIES_BASE_URL;

  // Date Object to map the due dates
  dueDate: any;

  startDate: any;
  endDate: any;

  // Files Variable
  files: any = []

  // Title of the Post
  title: string = ''

  // Quill Data Object
  quillData: any

  // Content Mentions Variables keeps a track of mentioned members
  _content_mentions: any = [];

  // Tags Object
  tags: any = [];

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  // Show Update Details Variable
  showUpdateDetails = false;

  /* Task Variables */

  // Task Assignee Variable
  taskAssignee = {
    profile_pic: '',
    role: '',
    first_name: '',
    last_name: '',
    email: ''
  }

  // Assigned State of Task
  assigned: boolean = false;

  // Asignees
  eventAssignees: any = [];

  /* Task Variables */

  /* Event Variables */
  // Due Time Object to map the due dates
  dueTime: any = {
    hour: 1,
    minute: 30
  }

  groupData: any;

  flows = [];

  constructor(
    private postService: PostService,
    private utilityService: UtilityService,
    private flowService: FlowService,
    private injector: Injector,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdDialogRef: MatDialogRef<GroupPostComponent>
  ) { }

  async ngOnInit() {

    if (this.data) {
      this.postData = this.data.postData;
      this.edit = this.data.edit;
      this.columns = this.data.columns;
      this.userData = this.data.userData;
      this.groupId = this.data.groupId;
      this.type = this.data.type;
    }

    this.groupData = await this.publicFunctions.getGroupDetails(this.groupId);

    /*
    this.hotKeyService.add(new Hotkey(['meta+return', 'meta+enter'], (event: KeyboardEvent, combo: string): boolean => {
      this.createPost();
      return false;
    }));
    */

    if (this.edit) {

      // Set the title of the post
      this.title = this.postData.title;

      // If Post is task and is assigned
      if (this.postData._assigned_to && this.type == 'task') {

        // Set the taskAssignee
        this.taskAssignee = this.postData._assigned_to

        // Set the due date to be undefined
        this.dueDate = undefined
      }

      // Set the due date variable for both task and event type posts
      if ((this.postData.task.due_to && this.postData.task.due_to != null) ||
        (this.postData.event.due_to && this.postData.event.due_to != null)) {

        // Set the DueDate variable
        this.dueDate = moment(this.postData.task.due_to || this.postData.event.due_to)
      }

      // If post type is event, set the dueTime
      if (this.type == 'event') {
        this.dueTime.hour = this.dueDate.getHours();
        this.dueTime.minute = this.dueDate.getMinutes();
      }

      this.eventAssignees = this.postData._assigned_to || [];

      this.tags = this.postData.tags;

    }

    this.flowService.getGroupAutomationFlows(this.groupId).then(res => {
      this.flows = res['flows'];
    });
  }

  /**
   * This function is mapped with the event change of @variable - title
   * Show update detail option if title has been changed
   * @param event - new title value
   */
  titleChange(event: any) {
    if (this.edit) {
      if (event === this.title)
        this.showUpdateDetails = false
      else {
        this.showUpdateDetails = true
        this.title = event;
      }
    } else if (this.edit === false) {
      this.title = event
    }
  }

  /**
   * Get Quill Data from the @module <quill-editor></quill-editor>
   *  Show update detail option if post content has been changed
   * @param quillData
   */
  getQuillData(quillData: any) {

    // Set the quill data object to the quillData output
    this.quillData = quillData

    // Filter the Mention users content and map them into arrays of Ids

    if(this.quillData && this.quillData?.mention){
      this._content_mentions = this.quillData?.mention?.users?.map((user) => user.insert.mention.id);
    }

    // If content mentions has 'all' then only pass 'all' inside the array
    if (this._content_mentions.includes('all'))
      this._content_mentions = ['all']

    // Set the values of the array
    this._content_mentions = Array.from(new Set(this._content_mentions))

    if (this.edit) {
      if (this.postData.content === JSON.stringify(this.quillData.contents)) {
        this.showUpdateDetails = false
      } else {
        this.showUpdateDetails = true
      }
    }
  }


  async changeTaskStatus(event) {
    // Set the status
    this.postData.task.status = event;

    this.postData = await this.publicFunctions.executedAutomationFlowsPropertiesFront(this.flows, this.postData, this.groupId);

    this.taskStatus.emit(event);
  }

  async moveTaskToColumn(event) {
    const columnId = event.newColumnId;
    await this.publicFunctions.changeTaskColumn(this.postData._id, columnId, this.userData._id, this.groupId);
    this.postData.task._column = columnId;

    this.postData = await this.publicFunctions.executedAutomationFlowsPropertiesFront(this.flows, this.postData, this.groupId);

    this.moveTask.emit(event);
  }

  async onAssigned(res) {

    if (this.postData) {
      this.postData = res['post'];
      if (this.type === 'task') {
        this.postData = await this.publicFunctions.executedAutomationFlowsPropertiesFront(this.flows, this.postData, this.groupId);
      }
    } else {
      this.eventAssignees.push(res['assigneeId']);
    }
  }

  closeModal() {
    this.close.emit();
    this.mdDialogRef.close();
  }

  postModalCloseEvent() {
    this.closeModal();
  }

  /**
   * This function is responsible for receiving the files
   * @param files
   */
  onAttach(files: any) {

    // Set the current files variable to the output of the module
    this.files = files

    if (this.edit) {
      this.showUpdateDetails = true
    }
  }

  onPostPin(pin: any) {
    this.pinEvent.emit(pin);
  }

  /**
   * This function is responsible for receiving the date from @module <app-date-picker></app-date-picker>
   * @param dateObject
   */
  getDate(dateObject: any, property: string) {
    if (property === 'start_date') {
      this.startDate = dateObject.toDate() || null;
    }
    if (property === 'due_date') {
      this.dueDate = dateObject.toDate() || null;
    }
    if (this.edit) {
      this.date.emit({startDate: this.startDate, endDate: this.endDate, dueDate: this.dueDate});
    }
  }

  /**
   * This function is responsible for receiving the time from @module <app-time-picker></app-time-picker>
   * @param timeObject
   */
  getTime(timeObject: any) {
    this.dueTime = timeObject
  }

  /**
   * This function receives the output from the tags components
   * @param tags
   */
  getTags(tags: any) {

    // Set the tags value
    this.tags = tags
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

  /**
   * This function creates a new post in the activity
   */
  async createPost() {
    const today = moment().format();
    // Prepare Post Data
    let postData: any = {
      title: this.title,
      content: this.quillData ? JSON.stringify(this.quillData.contents) : "",
      type: this.type,
      _posted_by: this.userData._id,
      created_date: today,
      _group: this.groupId,
      _content_mentions: this._content_mentions,
      tags: this.tags,
      _assigned_to: this.eventAssignees || []
    }

    // If Post type is event, then add due_to property too
    if (this.type === 'event') {

      var due_to;

      if (this.dueDate == undefined || this.dueDate == null) {
        const now = moment();
        now.hours(this.dueTime.hour);
        now.minute(this.dueTime.minute);
        due_to = now;
      }

      // Create the due_to date
      else {
        const now = moment(this.dueDate.getFullYear(),this.dueDate.getMonth(),this.dueDate.getDate());
        now.hours(this.dueTime.hour);
        now.minute(this.dueTime.minute);
        due_to = now;
      }

      // Add event.due_to property to the postData
      postData.event = {
        due_to: moment(due_to).format("YYYY-MM-DD")
      }
    }

    // Create FormData Object
    let formData = new FormData();

    // Append Post Data
    formData.append('post', JSON.stringify(postData))

    // Append all the file attachments
    if (this.files.length != 0) {
      for (let index = 0; index < this.files.length; index++) {
        formData.append('attachments', this.files[index], this.files[index]['name']);
      }
    }

    formData.append('isShuttleTasksModuleAvailable', (await this.publicFunctions.isShuttleTasksModuleAvailable()).toString());

    // Call the Helper Function
    this.onCreatePost(formData)

  }

  /**
   * This function is responsible for calling add post service functions
   * @param postData
   */
  onCreatePost(postData: FormData) {
    this.utilityService.asyncNotification($localize`:@@groupCreatePost.pleaseWaitWeCreatingPost:Please wait we are creating the post...`, new Promise((resolve, reject) => {
      this.postService.create((this.groupData?._workspace?._id || this.groupData?._workspace), postData)
        .then(async (res) => {

          this.postData = res['post'];

          this.postData = await this.publicFunctions.executedAutomationFlowsPropertiesFront(this.flows, this.postData, this.groupId);

          // Emit the Post to the other components
          this.post.emit(this.postData)

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupCreatePost.postCreated:Post Created!`))
          this.closeModal();
        })
        .catch((err) => {
          this.utilityService.clearAllNotifications();
          if (err.status === 0) {
            reject(this.utilityService.errorNotification($localize`:@@groupCreatePost.connectionError:Sorry, we are having a hard time connecting to the server. You have a poor connection. The post can't be created.`));
          } else {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@groupCreatePost.unableToCreatePost:Unable to create post, please try again!`))
          }
        })
    }))
  }

  updateDetails() {

    // Prepare the normal  object
    const post: any = {
      title: this.title,
      type: this.type,
      content: this.quillData ? JSON.stringify(this.quillData.contents) : this.postData.content,
      _content_mentions: this._content_mentions,
      tags: this.tags,
      _read_by: []
    }

    // If type is event, then add the following properties too
    if (this.type == 'event') {

      // Set the due date for the events
      const now = moment(this.dueDate.getFullYear(),this.dueDate.getMonth(),this.dueDate.getDate());
      now.hours(this.dueTime.hour);
      now.minute(this.dueTime.minute);
      this.dueDate  = now;
      // Adding Due Date to event
      post.date_due_to = moment(this.dueDate).format("YYYY-MM-DD");

      // Adding assigned to for the events
      post.assigned_to = this.eventAssignees
    }

    // If type is task, then add following properties too
    if(this.type == 'task'){

      // Task due date
      post.date_due_to = moment(this.dueDate).format("YYYY-MM-DD");

      // Task Assigned to
      if(this.postData._assigned_to)
        post.assigned_to = this.postData._assigned_to._id

      // Task column
      post._column = this.postData.task._column._id || this.postData.task._column,

      // Task status
      post.status = this.postData.task.status
    }

    // Create FormData Object
    let formData = new FormData();

    // Append Post Data
    formData.append('post', JSON.stringify(post))

    // Append all the file attachments
    if (this.files.length != 0) {
      for (let index = 0; index < this.files.length; index++) {
        formData.append('attachments', this.files[index], this.files[index]['name']);
      }
    }

    // Call the edit post function
    this.editPost(this.postData._id, formData)
  }

  /**
   * Call the asynchronous function to change the column
   */
  editPost(postId: any, formData: FormData) {
    this.utilityService.asyncNotification($localize`:@@groupCreatePost.pleaseWaitWeUpdatingContent:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
      this.postService.edit(postId, (this.groupData?._workspace?._id || this.groupData?._workspace), formData)
        .then((res) => {

          // Emit the post to other components
          // let post = res['post'];
          this.post.emit(res['post'])

          this.edited.emit(res['post'])

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupCreatePost.detailsUpdated:Details updated!`))

          this.closeModal();
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@groupCreatePost.unableToUpdatePost:Unable to update the details, please try again!`))
        })
    }))
  }

  /**
   * Call function to delete post
   * @param postId
   */
  deletePost() {
    this.utilityService.asyncNotification($localize`:@@groupCreatePost.pleaseWaitWeDeletingPost:Please wait we are deleting the post...`, new Promise((resolve, reject) => {
      this.postService.deletePost(this.postData._id)
        .then((res) => {

          // Emit the Deleted post to all the compoents in order to update the UI
          this.delete.emit(res['post'])

          // Close the modal
          this.closeModal()

          resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupCreatePost.postDeleted:Post deleted!`));
        }).catch((err) => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@groupCreatePost.unableToDeletePost:Unable to delete post, please try again!`));
        })
    }))
  }
}
