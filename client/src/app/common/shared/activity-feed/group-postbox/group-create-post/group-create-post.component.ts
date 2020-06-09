import { Component, OnInit, Input, Output, EventEmitter, Injector } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PostService } from 'src/shared/services/post-service/post.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import moment from 'moment/moment';
import { HotkeysService, Hotkey, HotkeyModule } from 'angular2-hotkeys';

@Component({
  selector: 'app-group-create-post',
  templateUrl: './group-create-post.component.html',
  styleUrls: ['./group-create-post.component.scss']
})
export class GroupCreatePostComponent implements OnInit {

  constructor(
    private postService: PostService,
    private utilityService: UtilityService,
    private injector: Injector,
    private hotKeyService: HotkeysService
  ) { }

  // BASE URL OF THE APPLICATION
  baseUrl = environment.UTILITIES_BASE_URL;

  // Date Object to map the due dates
  dueDate: any;

  // Files Variable 
  files: any = []

  // Title of the Post
  title: string = ''

  // Quill Data Object
  quillData: any

  // Content Mentions Variables keeps a track of mentioned members
  _content_mentions: any = []

  // Tags Object
  tags: any = []

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector)

  // Show Update Details Variable
  showUpdateDetails = false

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

  // Move Task to another column output event emitter
  @Output('moveTask') moveTask = new EventEmitter();

  // Change task status output event emitter
  @Output('taskStatus') taskStatus = new EventEmitter();

  // Output the task assignee
  @Output('member') member = new EventEmitter()

  // Output the task due date
  @Output('date') date = new EventEmitter()

  /* Task Variables */

  /* Event Variables */

  // Members Map of Event Asignee
  eventMembersMap: any = new Map()

  eventAssignees: any = [];

  // Due Time Object to map the due dates
  dueTime: any = {
    hour: 1,
    minute: 30
  }

  /* Event Variables */

  // PostData Variable which is used for showing post content
  @Input('post') postData: any

  // Edit Check variable to keep a track whether the modal opened is in the edit mode or not
  @Input('edit') edit: boolean = false;

  // Columns variable to keep a track of for list of kanban columns
  @Input('columns') columns: any

  // UserData Object
  @Input('userData') userData: any;

  // GroupId variable
  @Input('groupId') groupId: any;

  // Post Type = 'normal', 'task', or 'event'
  @Input('type') type: string = 'normal';

  // Close event emitter takes care of closing the modal
  @Output('close') close = new EventEmitter();

  // Post Event Emitter - Emits the post to the other components
  @Output('post') post = new EventEmitter()

  // Edited EVent Emitter - Emits edited event
  @Output('edited') edited = new EventEmitter();

  // Delete Event Emitter - Emits delete event
  @Output('delete') delete = new EventEmitter();

  ngOnInit() {

    this.hotKeyService.add(new Hotkey(['meta+return', 'meta+enter'], (event: KeyboardEvent, combo: string): boolean => {
      console.log('hotkey');
      this.createPost();
      return false;
    }));

    if (this.edit) {

      // Set the title of the post
      this.title = this.postData.title

      // If Post is task and is not unassigned
      if (!this.postData.task.unassigned && this.type == 'task') {

        // Set the taskAssignee
        this.taskAssignee = this.postData.task._assigned_to

        // Set the due date to be undefined
        this.dueDate = undefined
      }

      // Set the due date variable for both task and event type posts
      if ((this.postData.task.due_to && this.postData.task.due_to != null) ||
        (this.postData.event.due_to && this.postData.event.due_to != null)) {

        // Set the DueDate variable
        this.dueDate = new Date(this.postData.task.due_to || this.postData.event.due_to)
      }

      // If post type is event, set the dueTime
      if (this.type == 'event') {
        this.dueTime.hour = this.dueDate.getHours();
        this.dueTime.minute = this.dueDate.getMinutes();
        this.eventMembersMap = this.postData.event._assigned_to;
      }

      this.tags = this.postData.tags;

    }
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
    this._content_mentions = this.quillData.mention.users.map((user) => user.insert.mention.id)

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

  moveTaskToColumn($event) {
    this.moveTask.emit($event)
  }

  changeTaskStatus($event) {
    this.taskStatus.emit($event)
  }

  closeModal() {
    this.close.emit()
  }

  getMemberDetails(memberMap: any) {

    this.member.emit(memberMap)

    if (this.type == 'event') {
      this.eventMembersMap = memberMap;
      this.eventAssignees = (this.eventMembersMap.has('all')) ? 'all' : Array.from(this.eventMembersMap.keys());
      console.log(this.eventAssignees);
      this.showUpdateDetails = true;
    }

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

  /**
   * This function is responsible for receiving the date from @module <app-date-picker></app-date-picker>
   * @param dateObject 
   */
  getDate(dateObject: any) {
    this.dueDate = new Date(dateObject.year, dateObject.month - 1, dateObject.day)

    if (this.edit) {
      this.date.emit(this.dueDate);
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
  createPost() {

    // Prepare Post Data
    let postData: any = {
      title: this.title,
      content: this.quillData ? JSON.stringify(this.quillData.contents) : "",
      type: this.type,
      _posted_by: this.userData._id,
      _group: this.groupId,
      _content_mentions: this._content_mentions,
      tags: this.tags
    }

    // If Post type is event, then add due_to property too
    if (this.type === 'event') {

      var due_to;

      if (this.dueDate == undefined || this.dueDate == null) {
        due_to = new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          new Date().getDate(),
          this.dueTime.hour,
          this.dueTime.minute
        );
      }

      // Create the due_to date
      else {
        due_to = new Date(
          new Date(this.dueDate).getFullYear(),
          new Date(this.dueDate).getMonth(),
          new Date(this.dueDate).getDate(),
          this.dueTime.hour,
          this.dueTime.minute)
      }

      // Add event.due_to property to the postData
      postData.event = {
        due_to: moment(due_to).format(),
        _assigned_to: (this.eventMembersMap.has('all')) ? 'all' : Array.from(this.eventMembersMap.keys())
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

    // Call the Helper Function
    this.onCreatePost(formData)

  }

  /**
   * This function is responsible for calling add post service functions
   * @param postData 
   */
  onCreatePost(postData: FormData) {
    this.utilityService.asyncNotification('Please wait we are creating the post...', new Promise((resolve, reject) => {
      this.postService.create(postData)
        .then((res) => {

          // Emit the Post to the other compoentns
          this.post.emit(res['post'])

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise('Post Created!'))
          this.closeModal();
        })
        .catch((err) => {

          // Catch the error and reject the promise
          reject(this.utilityService.rejectAsyncPromise('Unable to create post, please try again!'))
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
      this.dueDate = new Date(
        new Date(this.dueDate).getFullYear(),
        new Date(this.dueDate).getMonth(),
        new Date(this.dueDate).getDate(),
        this.dueTime.hour,
        this.dueTime.minute)
      
      // Adding Due Date to event
      post.date_due_to = this.dueDate
      
      // Adding assigned to for the events
      post.assigned_to = this.eventAssignees
    }

    // If type is task, then add following properties too
    if(this.type == 'task'){

      // Unassigned property
      post.unassigned = this.postData.task.unassigned

      // Task due date
      post.date_due_to = this.dueDate

      // Task Assigned to
      if(!post.unassigned)
        post.assigned_to = this.postData.task._assigned_to._id

      // Task column
      post._column = {
        title: this.postData.task._column.title
      },

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
    this.utilityService.asyncNotification('Please wait we are updating the contents...', new Promise((resolve, reject) => {
      this.postService.edit(postId, formData)
        .then((res) => {

          // Emit the post to other components
          // let post = res['post'];
          this.post.emit(res['post'])

          this.edited.emit(res)

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise(`Details updated!`))

          this.closeModal();
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise(`Unable to update the details, please try again!`))
        })
    }))
  }

  /**
   * Call function to delete post
   * @param postId 
   */
  deletePost() {
    this.utilityService.asyncNotification('Please wait we are deleting the post...', new Promise((resolve, reject) => {
      this.postService.deletePost(this.postData._id)
        .then((res) => {

          // Emit the Deleted post to all the compoents in order to update the UI
          this.delete.emit(res['post'])

          // Close the modal
          this.closeModal()

          resolve(this.utilityService.resolveAsyncPromise('Post deleted!'));
        }).catch((err) => {
          reject(this.utilityService.rejectAsyncPromise('Unable to delete post, please try again!'));
        })
    }))
  }
}
