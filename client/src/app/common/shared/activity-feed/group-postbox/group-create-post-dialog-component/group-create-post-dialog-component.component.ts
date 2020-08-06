import { Component, OnInit, EventEmitter, Output, Inject, Injector } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { environment } from 'src/environments/environment';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { PostService } from 'src/shared/services/post-service/post.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { CommentService } from 'src/shared/services/comment-service/comment.service';

@Component({
  selector: 'app-group-create-post-dialog-component',
  templateUrl: './group-create-post-dialog-component.component.html',
  styleUrls: ['./group-create-post-dialog-component.component.scss']
})
export class GroupCreatePostDialogComponent implements OnInit {

  // Close Event Emitter - Emits when closing dialog
  @Output() closeEvent = new EventEmitter();
  
  // BASE URL OF THE APPLICATION
  baseUrl = environment.UTILITIES_BASE_URL;

  postData: any;
  userData: any;
  groupId: string;
  columns: any;
  customFields = [];
  selectedCFValues = [];

  // Title of the Post
  title: string = '';

  // Quill Data Object
  quillData: any;

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
  };

  // Assigned State of Task
  assigned: boolean = false;

  // Date Object to map the due dates
  dueDate: any;;

  // Files Variable 
  files: any = [];

  eventAssignees: any = [];

  // Members Map of Event Asignee
  eventMembersMap: any = new Map();

  // Comments Array
  comments: any = []
  
  constructor(
    private postService: PostService,
    private groupService: GroupService,
    private utilityService: UtilityService,
    private injector: Injector,
    private commentService: CommentService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdDialogRef: MatDialogRef<GroupCreatePostDialogComponent>
    ) { }

  ngOnInit() {
    this.postData = this.data.postData;
    this.userData = this.data.userData;
    this.groupId = this.data.groupId;
    this.columns = this.data.columns;

    // Set the title of the post
    this.title = this.postData.title;

    // If Post is task and is not unassigned
    if (!this.postData.task.unassigned) {

      // Set the taskAssignee
      this.taskAssignee = this.postData.task._assigned_to;

      // Set the due date to be undefined
      this.dueDate = undefined;

      this.groupService.getGroupCustomFields(this.groupId).then((res) => {
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
      });
      
      // Set the due date variable for both task and event type posts
      if ((this.postData.task.due_to && this.postData.task.due_to != null) ||
        (this.postData.event.due_to && this.postData.event.due_to != null)) {

        // Set the DueDate variable
        this.dueDate = new Date(this.postData.task.due_to || this.postData.event.due_to);
      }

      this.tags = this.postData.tags;

    }
    
    this.fetchComments();
  }

  moveTaskToColumn($event) {
    this.updateDetails();
  }

  changeTaskStatus($event) {
    this.updateDetails();
  }

  /**
   * This function is mapped with the event change of @variable - title
   * Show update detail option if title has been changed
   * @param event - new title value
   */
  titleChange(event: any) {
    if (event === this.title)
      this.showUpdateDetails = false;
    else {
      this.showUpdateDetails = true;
      this.title = event;
    }
  }

  /**
   * This function is responsible for receiving the date from @module <app-date-picker></app-date-picker>
   * @param dateObject 
   */
  getDate(dateObject: any) {
    this.dueDate = new Date(dateObject.year, dateObject.month - 1, dateObject.day)

    this.updateDetails();
  }

  /**
   * This function receives the output from the tags components
   * @param tags 
   */
  getTags(tags: any) {

    // Set the tags value
    this.tags = tags;
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

  onCloseDialog() {
    this.closeEvent.emit();
  }

  /**
   * Get Quill Data from the @module <quill-editor></quill-editor>
   *  Show update detail option if post content has been changed
   * @param quillData
   */
  getQuillData(quillData: any) {

    // Set the quill data object to the quillData output
    this.quillData = quillData;

    // Filter the Mention users content and map them into arrays of Ids
    this._content_mentions = this.quillData.mention.users.map((user) => user.insert.mention.id);

    // If content mentions has 'all' then only pass 'all' inside the array
    if (this._content_mentions.includes('all')) {
      this._content_mentions = ['all'];
    }

    // Set the values of the array
    this._content_mentions = Array.from(new Set(this._content_mentions));

    if (this.postData.content === JSON.stringify(this.quillData.contents)) {
      this.showUpdateDetails = false;
    } else {
      this.showUpdateDetails = true;
    }
    
    this.updateDetails();
  }

  /**
   * Fetch Comments
   */
  fetchComments() {
    this.commentService.getComments(this.postData._id).then((res)=>{
        this.comments = res['comments'];
      }).catch((err)=>{
        console.log(err);
    });
  }

  removeComment(index: number){
    this.comments.splice(index, 1);
  }

  /**
   * This function is responsible for receiving the files
   * @param files 
   */
  onAttach(files: any) {

    // Set the current files variable to the output of the module
    this.files = files;

    this.showUpdateDetails = true;

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
      type: 'task',
      content: this.quillData ? JSON.stringify(this.quillData.contents) : this.postData.content,
      _content_mentions: this._content_mentions,
      tags: this.tags,
      _read_by: this.postData._read_by,
      task: this.postData.task
    };

    // Adding unassigned property for previous tasks model
    if(this.postData.task.unassigned == 'No') {
      this.postData.task.unassigned = false;
    }

    // Adding unassigned property for previous tasks model
    if(this.postData.task.unassigned == 'Yes') {
      this.postData.task.unassigned = true;
    }

    // Unassigned property
    post.unassigned = this.postData.task.unassigned;

    // Task due date
    post.date_due_to = this.dueDate;

    // Task Assigned to
    if(post.unassigned!== null && !post.unassigned) {
      post.assigned_to = this.postData.task._assigned_to._id;
    }

    // Task column
    post._column = {
      title: this.postData.task._column.title
    };

    // Task status
    post.status = this.postData.task.status;

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
  editPost(postId: any, formData: FormData) {
    // if (!sync) {
      this.utilityService.asyncNotification('Please wait we are updating the contents...', new Promise((resolve, reject) => {
        this.postService.edit(postId, formData)
          .then((res) => {
            // Resolve with success
            resolve(this.utilityService.resolveAsyncPromise(`Details updated!`));
          })
          .catch(() => {
            reject(this.utilityService.rejectAsyncPromise(`Unable to update the details, please try again!`));
          });
      }));
      /*
    } else {
      this.postService.edit(postId, formData)
        .then((res) => {
          this.edited.emit(res['post']);
        });
    }
    */
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
          this.closeEvent.emit();
          // Close the modal
          this.mdDialogRef.close();

          resolve(this.utilityService.resolveAsyncPromise('Post deleted!'));
        }).catch((err) => {
          reject(this.utilityService.rejectAsyncPromise('Unable to delete post, please try again!'));
        });
    }));
  }
}
