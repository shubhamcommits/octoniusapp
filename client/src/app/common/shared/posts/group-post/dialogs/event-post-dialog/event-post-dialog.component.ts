import { Component, OnInit, EventEmitter, Output, Inject, Injector } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { PostService } from 'src/shared/services/post-service/post.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { BehaviorSubject } from 'rxjs';
import { FlowService } from 'src/shared/services/flow-service/flow.service';
import moment from 'moment';
import { ColumnService } from 'src/shared/services/column-service/column.service';

@Component({
  selector: 'app-event-post-dialog',
  templateUrl: './event-post-dialog.component.html',
  styleUrls: ['./event-post-dialog.component.scss']
})
export class EventPostDialogComponent implements OnInit/*, AfterViewChecked, AfterViewInit*/ {

  // Close Event Emitter - Emits when closing dialog
  @Output() closeEvent = new EventEmitter();
  @Output() deleteEvent = new EventEmitter();
  @Output() datesChangeEvent = new EventEmitter();

  postData: any;
  userData: any;
  groupId: string;
  
  groupData: any;
  searchText: string = '';
  
  // Title of the Post
  title: string = '';

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

  lastAssignedBy: any;

  newComment;

  selectedTab = 0;

  myWorkplace = false;

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public utilityService: UtilityService,
    private postService: PostService,
    private groupService: GroupService,
    private flowService: FlowService,
    private columnService: ColumnService,
    private injector: Injector,
    private mdDialogRef: MatDialogRef<EventPostDialogComponent>
    ) {}

  async ngOnInit() {
    // Start the loading spinner
    this.isLoading$.next(true);

    const postId = this.data.postId;
    this.groupId = this.data.groupId;

    this.userData = await this.publicFunctions.getCurrentUser();

    if (!!postId) {
      this.postData = await this.publicFunctions.getPost(postId);

      if (!this.groupId) {
        this.groupId = (this.postData._group) ? (this.postData._group._id || this.postData._group) : null;
        this.myWorkplace = false;
      }

      if (!!this.groupId) {
        this.groupData = await this.publicFunctions.getGroupDetails(this.groupId);
        this.myWorkplace = this.publicFunctions.isPersonalNavigation(this.groupData, this.userData);
      }

      this.isIndividualSubscription = await this.publicFunctions.checkIsIndividualSubscription();
      this.isBusinessSubscription = await this.publicFunctions.checkIsBusinessSubscription();

      await this.initPostData();
    }
  }

  async initPostData() {
    // Set the title of the post
    this.title = this.postData?.title;

    // Set the due date to be undefined
    this.dueDate = undefined;
    this.tags = [];

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

    this.tags = this.postData?.tags;

    this.canEdit = await this.utilityService.canUserDoTaskAction(this.postData, this.groupData, this.userData, 'edit');
    if (!this.canEdit) {
      const hide = await this.utilityService.canUserDoTaskAction(this.postData, this.groupData, this.userData, 'hide');
      this.canView = await this.utilityService.canUserDoTaskAction(this.postData, this.groupData, this.userData, 'view') || !hide;
    } else {
      this.canView = true;
    }

    // Return the function via stopping the loader
    return this.isLoading$.next(false);
  }

  // selectedDefaultTab() {
  //   let tabsLength = 1;
  //   if (this.showSubtasks && (!this.postData?.task?.shuttle_type || this.groupData?._id == this.postData?._group?._id)) {
  //     tabsLength++;
  //   }
  //   if (this.postData?.comments_count > 0) {
  //     tabsLength++;
  //   }
  //   if (this.postData?.task?.isNorthStar) {
  //     tabsLength++;
  //   }
  //   if (this.postData?.type === 'task' && this.postData?.approval_active && this.postData?.approval_history && this.postData?.approval_history?.length > 0 && this.isBusinessSubscription) {
  //     tabsLength++;
  //   }
  //   if (this.postData?.logs && this.postData?.logs?.length > 0) {
  //     tabsLength++;
  //   }
  //   if (this.postData?.task?.is_crm_order) {
  //     tabsLength++;
  //   }

  //   if (this.showSubtasks && (!this.postData?.task?.shuttle_type || this.groupData?._id == this.postData?._group?._id)) {
  //     this.selectedTab = 0;
  //   } else if (this.postData?.comments_count > 0 && length > 1) {
  //     this.selectedTab = 1;
  //   } else if (this.postData?.task?.isNorthStar && length > 2) {
  //     this.selectedTab = 2;
  //   } else if (this.postData?.type === 'task' && this.postData?.approval_active && this.postData?.approval_history && this.postData?.approval_history?.length > 0 && this.isBusinessSubscription && length > 3) {
  //     this.selectedTab = 3;
  //   } else if (this.postData?.logs && this.postData?.logs?.length > 0 && length > 4) {
  //     this.selectedTab = 4;
  //   } else {
  //     this.selectedTab = 0;
  //   }
  // }

  /**
   * This function is mapped with the event change of @variable - title
   * Show update detail option if title has been changed
   * @param event - new title value
   */
  async titleChange(event: any) {
    const newTitle = event.target.value;
    if (newTitle !== this.title) {
      this.title = newTitle;

      await this.utilityService.asyncNotification($localize`:@@eventPostDialog.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
        this.postService.editTitle(this.postData?._id, newTitle)
          .then((res) => {
            this.postData = res['post'];
            this.contentChanged = false;
            // Resolve with success
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@eventPostDialog.detailsUpdated:Details updated!`));
          })
          .catch(() => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@eventPostDialog.unableToUpdateDetails:Unable to update the details, please try again!`));
          });
      }));
    }
  }

  quillContentChanged(event: any) {
    if (this.canEdit) {
      this.contentChanged = true;
      this.quillData = event;
    }
  }

  /**
   * This function is responsible for receiving the start date from @module <app-post-dates></app-post-dates>
   * @param timeObject
   */
   getStartDate(dateObject: any) {
    this.startDate = dateObject;
    this.postData.task.start_date = dateObject;
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
    this.postData.task.due_to = dateObject;
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

  onCloseDialog() {
    this.closeEvent.emit(this.postData);
  }

  newCommentAdded(comment) {
    // this.comments.unshift(comment);
    this.newComment = comment;
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

  async updateDetails(logAction: string) {
    // Prepare the normal  object

    if(this.quillData && this.quillData?.mention){
      this._content_mentions = this.quillData.mention.users.map((user)=> user.insert.mention.id)
    }

    const post: any = {
      title: this.title,
      type: this.postData?.type,
      _group: this.groupId,
      content: this.quillData ? JSON.stringify(this.quillData.contents) : this.postData?.content,
      _content_mentions: this._content_mentions,
      tags: this.tags,
      _read_by: this.postData?._read_by,
      isNorthStar: this.postData?.task?.isNorthStar || false,
      is_idea: this.postData?.task?.is_idea || false,
      is_crm_task: this.postData?.task?.is_crm_task || false,
      is_crm_order: this.postData?.task?.is_crm_order || false,
      is_milestone: this.postData?.task?.is_milestone || false,
      northStar: this.postData?.task?.northStar || false,
      assigned_to: this.postData?._assigned_to
    };

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

  async onAssigned(res) {
    this.postData = res['post'];
    this.setAssignedBy();
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
    await this.utilityService.asyncNotification($localize`:@@eventPostDialog.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
      this.postService.edit(postId, this.userData?._workspace?._id || this.userData?._workspace, formData)
        .then(async (res) => {
          this.postData = res['post'];

          await this.initPostData();

          this.contentChanged = false;
          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@eventPostDialog.detailsUpdated:Details updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@eventPostDialog.unableToUpdateDetails:Unable to update the details, please try again!`));
        });
    }));
  }

  /**
   * Call function to delete post
   */
  deletePostEvent() {
    const id = this.postData?._id;
    this.utilityService.asyncNotification($localize`:@@eventPostDialog.pleaseWaitWeAreDeleting:Please wait we are deleting the post...`, new Promise((resolve, reject) => {
      this.postService.deletePost(this.postData?._id)
        .then((res) => {
          // Emit the Deleted post to all the compoents in order to update the UI
          this.deleteEvent.emit(id);
          // Close the modal
          this.mdDialogRef.close();

          resolve(this.utilityService.resolveAsyncPromise($localize`:@@eventPostDialog.postDeleted:Post deleted!`));
        }).catch((err) => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@eventPostDialog.unableToDeletePost:Unable to delete post, please try again!`));
        });
    }));
  }

  onAssigneeEmitter(itemData: any) {
    this.postData = itemData;
  }

  objectExists(object: any) {
    return this.utilityService.objectExists(object);
  }
}
