import { Component, OnInit, EventEmitter, Output, Inject, Injector } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { PublicFunctions } from 'modules/public.functions';
import { PostService } from 'src/shared/services/post-service/post.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { NewNorthStarDialogComponent } from 'modules/work/north-star-page/new-north-start-dialog/new-north-start-dialog.component';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
import { ColorPickerDialogComponent } from '../../color-picker-dialog/color-picker-dialog.component';

@Component({
  selector: 'app-global-north-star-dialog',
  templateUrl: './global-north-star-dialog.component.html',
  styleUrls: ['./global-north-star-dialog.component.scss']
})
export class GlobalNorthStarDialogComponent implements OnInit {

  // Close Event Emitter - Emits when closing dialog
  @Output() closeEvent = new EventEmitter();
  @Output() deleteEvent = new EventEmitter();

  postData: any;
  userData: any;

  // Title of the Post
  editTitle = false;
  title: string = '';

  editContent = false;
  htmlContent = '';
  quillData: any;
  canEdit: boolean = true;
  canView: boolean = true;
  _content_mentions: any = [];

  // Variable to enable or disable save button
  contentChanged = false;

  lastAssignedBy: any;

  showSubtasks = true;
  subtasks: any =  [];
  percentageSubtasksCompleted = 0;

  northStarValues = [];

  myWorkplace = false;

  chartLabels = [$localize`:@@globalNorthStarDialog.completed:Completed`, $localize`:@@globalNorthStarDialog.goalsPending:Targets pending`];
  chartReady = false;
  chartData = [0];
  chartType = 'doughnut';
  chartOptions = {
    cutoutPercentage: 50,
    responsive: true,
    legend: {
      display: false
    }
  };
  chartColors = [{
    backgroundColor: [
      '#17B2E3',
      '#F9FAFA'
    ]
  }];
  chartPlugins = [];

  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  constructor(
    private postService: PostService,
    private utilityService: UtilityService,
    private injector: Injector,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdDialogRef: MatDialogRef<GlobalNorthStarDialogComponent>
    ) {}

  async ngOnInit() {
    // Start the loading spinner
    this.isLoading$.next(true);

    const postId = this.data.postId;
    const parentTaskId = this.data.parentTaskId;

    if (parentTaskId) {
      this.openSubtask(postId);
      this.postData = await this.publicFunctions.getPost(parentTaskId);
    } else {
      this.postData = await this.publicFunctions.getPost(postId);
    }
    
    this.userData = await this.publicFunctions.getCurrentUser();

    await this.initPostData();

    this.initGraph();

    this.canEdit = await this.utilityService.canUserDoTaskAction(this.postData, null, this.userData, 'edit');
    if (!this.canEdit) {
      const hide = await this.utilityService.canUserDoTaskAction(this.postData, null, this.userData, 'hide');
      this.canView = await this.utilityService.canUserDoTaskAction(this.postData, null, this.userData, 'view') || !hide;
    } else {
      this.canView = true;
    }
  }

  async initPostData() {
    // Set the title of the post
    this.title = this.postData?.title;

    if (this.postData?.content){
      let converter = new QuillDeltaToHtmlConverter(JSON.parse(this.postData?.content)['ops'], {});
      if (converter) {
        // Convert into html
        this.htmlContent = converter.convert();
      }
    }

    await this.postService.getSubTasks(this.postData?._id).then((res) => {
      this.subtasks = res['subtasks'];

      if (this.subtasks && this.subtasks.length > 0) {
        this.subtasks.forEach(st => {
          const nsValues = this.mapNSValues(st);
          
          this.northStarValues = this.northStarValues.concat(nsValues);
        });

        this.northStarValues = this.northStarValues.sort((v1, v2) => (moment.utc(v1.date).isBefore(v2.date)) ? 1 : -1);
        this.showSubtasks = true;
      }
    });

    // Return the function via stopping the loader
    return this.isLoading$.next(false);
  }

  async initGraph() {
    if (this.subtasks && this.subtasks.length > 0) {
      let northStarValues = [];
      this.subtasks.forEach(st => {
        const value = st?.task?.northStar?.values[st?.task?.northStar?.values?.length-1];
        const nsValues = {
            value: value?.value,
            status: value?.status,
          };
        
        northStarValues = northStarValues.concat(nsValues);
      });
      this.postData.northStarValues = northStarValues;

      const completed = await this.postData.northStarValues?.filter(value => value?.status == 'ACHIEVED');
      const numCompleted = (completed) ? this.postData.northStarValues.length - completed.length : 0;
      this.chartData = [this.postData.northStarValues.length - numCompleted, numCompleted];

      this.chartReady = true;
    }
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
      this.updateDetails('change_title');

      if (this.subtasks && this.subtasks.length > 0) {
        this.subtasks.forEach(subtask => {
          subtask.task._parent_task.title = this.title;
        });
      }

      this.editTitle = !this.editTitle;
    }
  }

  quillContentChanged(event: any) {
    this.contentChanged = true;
    this.quillData = event;
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return this.utilityService.objectExists(object);
  }

  onCloseDialog() {
    this.closeEvent.emit(this.postData);
  }

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
      _read_by: this.postData?._read_by,
      isNorthStar: this.postData?.task?.isNorthStar,
      is_idea: this.postData?.task?.is_idea,
      is_milestone: this.postData?.task?.is_milestone || false,
      northStar: this.postData?.task?.northStar,
      assigned_to: this.postData?._assigned_to
    };

    if (this.postData?.type === 'task') {
      post.task = this.postData?.task;
    }

    // Create FormData Object
    let formData = new FormData();

    // Append Post Data
    formData.append('post', JSON.stringify(post));
    formData.append('logAction', logAction);

    // Call the edit post function
    await this.editPost(this.postData?._id, formData);
  }

  async onAssigned(res) {
    this.postData = res['post'];
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

  async openSubtask(subtaskId: string) {
    const dialogRef = this.utilityService.openPostDetailsFullscreenModal(subtaskId, null, false, true);

    if (dialogRef) {
      const deleteEventSubs = dialogRef.componentInstance.deleteEvent.subscribe((data) => {
        this.onDeleteSubTaskEvent(data);
      });

      const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
        this.initPostData();
        // this.updateSubTask(data);
      });
      
      dialogRef.afterClosed().subscribe(result => {
        closeEventSubs.unsubscribe();
        deleteEventSubs.unsubscribe();
      });
    }
  }

  createNS() {
    const dialogRef = this.dialog.open(NewNorthStarDialogComponent, {
      data: {
        userId: this.userData?._id,
        _parent_task: this.postData?._id
      },
      hasBackdrop: true
    });

    const nsCreatedEventSubs = dialogRef.componentInstance.nsCreatedEvent.subscribe((data) => {
      if (!this.subtasks) {
        this.subtasks = [];
      }

      this.subtasks.push(data);
    });

    dialogRef.afterClosed().subscribe(result => {
      nsCreatedEventSubs.unsubscribe();
      // this.changeDetection.detectChanges();
    });
  }

  openColorPicker() {
    const dialogRef = this.dialog.open(ColorPickerDialogComponent, {
      width: '67%',
      height: '50%',
      disableClose: false,
      hasBackdrop: true,
      data: { colorSelected: this.postData?.task?.northStar?.header_background_color }
    });

    const colorPickedSubs = dialogRef.componentInstance.colorPickedEvent.subscribe(async (data) => {
      this.postData.task.northStar.header_background_color = data;
      await this.updateDetails('ns_background_color');
    });

    dialogRef.afterClosed().subscribe(result => {
      colorPickedSubs.unsubscribe();
    });
  }
  
  prepareToAddSubtasks() {
    this.showSubtasks = true;
  }

  onDeleteSubTaskEvent(id) {
    const indexTask = this.subtasks.findIndex((task: any) => task._id === id);
    if (indexTask !== -1) {
      this.subtasks.splice(indexTask, 1);
      return;
    }
  }

  // updateSubTask(task) {
  //   const indexTask = this.subtasks.findIndex((t: any) => t._id === task._id);
  //   if (indexTask !== -1) {
  //     this.subtasks[indexTask] = task;
  //     const nsValues = this.mapNSValues(task);

  //     this.northStarValues = this.northStarValues.filter(v => v._task != task._id);

  //     this.northStarValues = this.northStarValues.concat(nsValues);
  //     return;
  //   }
  // }

  mapNSValues(task) {
    return task?.task?.northStar?.values.map((value, index, array) => {
        return {
          _task: task._id,
          currency: task?.task?.northStar?.currency,
          type: task?.task?.northStar?.type,
          value: value?.value,
          status: value?.status,
          date: value?.date,
          _user: value?._user,
          post_title: task?.title,
          difference: (array[index-1]) ? (value?.value - array[index-1].value) : value?.value
        };
      });
  }

  getProgressPercent(northStar: any) {
    if (!northStar.values || northStar.values.length == 0 || !northStar.target_value) {
      return 0;
    }

    if (northStar.type !== 'Percent') {
      return (northStar.values[northStar.values.length - 1].value)/northStar.target_value;
    }

    return northStar.values[northStar.values.length - 1].value / 100;
  }

  getNSStatusColor(status: string) {
    if (status === 'ON TRACK') {
      return '#26A69A';
    } else if (status === 'IN DANGER') {
      return '#EB5757';
    } else if (status === 'ACHIEVED') {
      return '#4A90E2';
    } else {
      return '#FFAB00';
    }
  }

  formateDate(date) {
    return (date) ? moment(moment.utc(date), "YYYY-MM-DD").toDate() : '';
  }
}
