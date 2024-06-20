import { Component, OnInit, EventEmitter, Output, Inject, Injector } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { PostService } from 'src/shared/services/post-service/post.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { BehaviorSubject } from 'rxjs';
import { ColumnService } from 'src/shared/services/column-service/column.service';
import moment from 'moment';

@Component({
  selector: 'app-add-task-resource-management-dialog',
  templateUrl: './add-task-resource-management-dialog.component.html',
  styleUrls: ['./add-task-resource-management-dialog.component.scss']
})
export class AddTaskResourceManagementDialogComponent implements OnInit/*, AfterViewChecked, AfterViewInit*/ {

  // Close Event Emitter - Emits when closing dialog
  @Output() closeEvent = new EventEmitter();
  @Output() taskSelectedEvent = new EventEmitter();

  postData: any;
  userData: any;
  groupId: string;
  columns: any;
  selectedDate: any;
  selectedUser: any;

  searchText: string = '';

  // shuttleColumns: any;
  tasks:any;
  groupData: any;
  // Title of the Post
  title: string = '';
  isIdeaModuleAvailable;

  canEdit: boolean = true;
  canView: boolean = true;

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  constructor(
    private postService: PostService,
    private utilityService: UtilityService,
    private columnService: ColumnService,
    private injector: Injector,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdDialogRef: MatDialogRef<AddTaskResourceManagementDialogComponent>
    ) {}

  async ngOnInit() {
    // Start the loading spinner
    this.isLoading$.next(true);

    this.groupId = this.data.groupId;
    this.columns = this.data.columns;
    this.selectedDate = this.data.selectedDate;
    this.selectedUser = this.data.selectedUser;

    this.userData = await this.publicFunctions.getCurrentUser();

    if (!!this.groupId) {
      this.groupData = await this.publicFunctions.getGroupDetails(this.groupId);
    } else {
      this.groupData = await this.publicFunctions.getCurrentGroupDetails();
      this.groupId = this.groupData._id;
    }

    this.tasks = await this.publicFunctions.getPosts(this.groupId, 'task');

    this.postData = {
      title: '',
      content: '',
      type: 'task',
      _posted_by: this.userData._id,
      created_date:  moment().format(),
      _group: this.groupData._id,
      _content_mentions: [],
      _assigned_to: [this.selectedUser],
      task: {
        status: 'to do',
        due_to: this.selectedDate,
        custom_fields: [],
        _column: null,
        isNorthStar: false,
        northStar: null,
        is_milestone: false,
        is_idea: false,
        is_crm_task: false
      }
    };

    // Return the function via stopping the loader
    return this.isLoading$.next(false);
  }

  onCloseDialog() {
    this.closeEvent.emit(this.postData);
  }

  async updateDetails(logAction: string) {
    // Prepare the normal  object
    const post: any = {
      title: this.title,
      type: this.postData?.type,
      content: '',
      _content_mentions: [],
      tags: [],
      _read_by: this.postData?._read_by,
      isNorthStar: this.postData?.task?.isNorthStar || false,
      is_idea: this.postData?.task?.is_idea || false,
      is_crm_task: this.postData?.task?.is_crm_task || false,
      is_crm_order: this.postData?.task?.is_crm_order || false,
      is_milestone: this.postData?.task?.is_milestone || false,
      northStar: this.postData?.task?.northStar || false,
      assigned_to: this.postData?._assigned_to
    };

    if (this.postData?.type === 'task') {
      post.task = this.postData?.task;
      post.date_due_to = this.selectedDate;
      post._column = this.postData?.task._column._id || this.postData?.task._column;
      post.status = this.postData?.task.status;
    }

    // Create FormData Object
    let formData = new FormData();

    // Append Post Data
    formData.append('post', JSON.stringify(post));

    // Call the edit post function
    await this.editPost(this.postData?._id, formData);
  }

  /**
   * Call the asynchronous function to change the column
   */
  async editPost(postId: any, formData: FormData) {
    await this.utilityService.asyncNotification($localize`:@@groupCreatePostDialog.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
      this.postService.edit(postId, this.userData?._workspace?._id || this.userData?._workspace, formData)
        .then(async (res) => {
          this.taskSelectedEvent.emit(res['post']);
          this.mdDialogRef.close();
          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupCreatePostDialog.detailsUpdated:Details updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@groupCreatePostDialog.unableToUpdateDetails:Unable to update the details, please try again!`));
        });
    }));
  }

  async onNewTaskColumnSelected(newColumnId: string) {
    await this.columnService.getSection(newColumnId).then(async res => {
      this.postData.task._column = res['section'];
      this.postData.task._column.addTask = false;
    });
  }

  /**
   * This function is responsible for fetching the post
   * @param post
   * @param column
   */
  async createPost(post: any) {
    post.canEdit = true;
    const section = this.postData.task._column;
    this.postData = post;
    this.postData.task._column = section;
    this.postData.task.due_to = this.selectedDate,
    this.postData._assigned_to = [this.selectedUser];

    this.title = this.postData.title;

    await this.updateDetails('created');
  }

  async selectTaskToAssign(task: any) {
    this.postData = task;
    this.searchText = '';

    if (!this.postData._assigned_to) {
      this.postData._assigned_to = [this.selectedUser];
    } else {
      this.postData._assigned_to.push(this.selectedUser);
    }

    this.postData._assigned_to = await this.utilityService.removeDuplicates(this.postData._assigned_to, '_id');

    this.postData.task.due_to = moment(this.selectedDate).format(),

    this.title = this.postData.title;

    await this.updateDetails('assigned_to');
  }

  objectExists(object: any) {
    return this.utilityService.objectExists(object);
  }
}
