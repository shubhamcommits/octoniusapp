import { Component, OnInit, EventEmitter, Output, Inject, Injector, ChangeDetectorRef } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef, MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { PublicFunctions } from 'modules/public.functions';
import { PostService } from 'src/shared/services/post-service/post.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { NewNorthStarDialogComponent } from 'modules/work/north-star-page/new-north-start-dialog/new-north-start-dialog.component';
;
import { ColorPickerDialogComponent } from '../../color-picker-dialog/color-picker-dialog.component';
import { SearchTaskDialogComponent } from 'modules/work/north-star-page/search-task-dialog/search-task-dialog.component';
import { ColumnService } from 'src/shared/services/column-service/column.service';

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

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public utilityService: UtilityService,
    public dialog: MatDialog,
    private postService: PostService,
    private columService: ColumnService,
    private injector: Injector,
    private changeDetectorRef: ChangeDetectorRef,
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
      this.htmlContent = await this.publicFunctions.convertQuillToHTMLContent(JSON.parse(this.postData?.content)['ops']);
    }

    await this.postService.getSubTasks(this.postData?._id).then((res) => {
      this.subtasks = res['subtasks'];

      if (this.subtasks && this.subtasks.length > 0) {
        let northStarValues = [];
        this.subtasks.forEach(st => {
          let lastNSValues: any = {};
          if (st.task.isNorthStar) {
            st.task.northStar.values = st?.task?.northStar?.values?.sort((v1, v2) => (moment.utc(v1.date).isBefore(moment.utc(v2.date))) ? 1 : -1)
            const nsValues = this.mapNSValues(st);
            this.northStarValues = this.northStarValues.concat(nsValues);

            const lastValue = st?.task?.northStar?.values[0];
            lastNSValues = {
                value: lastValue?.value,
                status: lastValue?.status,
              };
          } else {
            const taskLogs = this.mapTaskLogs(st);
            this.northStarValues = this.northStarValues.concat(taskLogs);

            lastNSValues = {
              value: 0,
              status: st?.task?.status,
            };
          }

          northStarValues = northStarValues.concat(lastNSValues);

          if (st?.task?._column) {
            this.columService.getSection(st?.task?._column).then(res2 => {
              st.task._column = res2['section'];
            });
          }
        });

        this.postData.northStarValues = northStarValues;

        this.northStarValues = this.northStarValues.sort((v1, v2) => (moment.utc(v1.date).isBefore(v2.date)) ? 1 : -1);
        this.showSubtasks = true;
      }
    });

    this.initGraph();

    // Return the function via stopping the loader
    return this.isLoading$.next(false);
  }

  async initGraph() {
    if (this.subtasks && this.subtasks.length > 0) {
      const completed = await this.subtasks?.filter(st => {
        return (!!st?.task?.isNorthStar && !!st?.task?.northStar && !!st?.task?.northStar?.values
            && !!st?.task?.northStar?.values[0] && st?.task?.northStar?.values[0].status == 'ACHIEVED')
          || (!st?.task?.isNorthStar && st?.task?.status?.toUpperCase() == 'DONE')
      });
      const numCompleted = (!!completed) ? completed.length : 0;
      this.chartData = [numCompleted, this.subtasks.length - numCompleted];
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
      this.postService.edit(postId, this.userData?._workspace?._id || this.userData?._workspace, formData)
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

  async openSubtask(subtask: any) {

    let canOpen = true;
    if (subtask?._group?.enabled_rights) {
      const canEdit = await this.utilityService.canUserDoTaskAction(subtask, subtask?._group, this.userData, 'edit');
      let canView = false;
      if (!canEdit) {
        const hide = await this.utilityService.canUserDoTaskAction(subtask, subtask?._group, this.userData, 'hide');
        canView = await this.utilityService.canUserDoTaskAction(subtask, subtask?._group, this.userData, 'view') || !hide;
      }
      canOpen = canView || canEdit;
    }

    let columns = null;
    if (subtask?.task?._column) {
      columns = await this.publicFunctions.getAllColumns(subtask?._group?._id)
    }

    const dialogRef = this.utilityService.openPostDetailsFullscreenModal(subtask, subtask?._group?._id, canOpen, columns);

    if (dialogRef) {
      const deleteEventSubs = dialogRef.componentInstance.deleteEvent.subscribe((data) => {
        this.onDeleteSubTaskEvent(data);
      });

      const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
        this.initPostData();
        // this.updateSubTask(data);
        
        this.changeDetectorRef.detectChanges();
      });
      
      dialogRef.afterClosed().subscribe(result => {
        closeEventSubs.unsubscribe();
        deleteEventSubs.unsubscribe();
        
        this.changeDetectorRef.detectChanges();
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
      this.pushTask(data);
    });

    dialogRef.afterClosed().subscribe(result => {
      nsCreatedEventSubs.unsubscribe();
    });
  }

  openSearchTaskDialog() {
    const dialogRef = this.dialog.open(SearchTaskDialogComponent, {
      data: {
        userId: this.userData?._id,
        parentTaskId: this.postData?._id
      },
      width: '40%',
      height: '75%',
      disableClose: false,
      hasBackdrop: true,
    });

    const taskSelectedEventSubs = dialogRef.componentInstance.taskSelectedEvent.subscribe((data) => {
      this.pushTask(data);
    });

    dialogRef.afterClosed().subscribe(result => {
      taskSelectedEventSubs.unsubscribe();
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

  pushTask(post: any) {
    if (!this.subtasks) {
      this.subtasks = [];
    }

    this.subtasks.push(post);
  }

  removeTaskFromNS(taskId: string) {
    this.postService.setParentTask(taskId, null).then(res => {
      this.onDeleteSubTaskEvent(taskId);
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

  mapNSValues(task) {
    return task?.task?.northStar?.values.map((value, index, array) => {
        return {
          _task: task._id,
          isNorthStar: true,
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

  mapTaskLogs(task) {
    let logs = [];
    task?.logs?.forEach(async log => {
        if (log?.action == 'change_status' || log?.action == 'change_section') {
          let sectionTitle;
          if (log?.action == 'change_section' && log?._new_section) {
            sectionTitle = this.getSectionTitle(log?._new_section);
          }

          logs.push({
            _task: task._id,
            isNorthStar: false,
            action: log?.action,
            new_status: log?.new_status,
            _new_section: sectionTitle,
            date: log?.action_date,
            _user: log?._actor,
            post_title: task?.title
          });
        }
      });

    return logs;
  }

  getSectionTitle(sectionId: string) {
    return new Promise((resolve, reject) => {
      this.columService.getSection(sectionId).then((res: any) => {
          resolve(res?.section?.title);
        })
        .catch((err) => {
            // Catch the error and reject the promise
            reject(err)
        });
    });
  }

  getProgressPercent(northStar: any) {
    if (!northStar.values || northStar.values.length == 0 || !northStar.target_value) {
      return 0;
    }

    if (northStar.type !== 'Percent') {
      return (northStar.values[0].value)/northStar.target_value;
    }

    return northStar.values[0].value / 100;
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
