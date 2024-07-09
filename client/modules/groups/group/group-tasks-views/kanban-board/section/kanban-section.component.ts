import { Component, Injector, Input, OnChanges, SimpleChanges, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import { ColumnService } from 'src/shared/services/column-service/column.service';
import { MatDialog } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import { DatesService } from 'src/shared/services/dates-service/dates.service';
import { ShowCustomFieldsColumnDialogComponent } from './show-custom-fields-column-dialog/show-custom-fields-column-dialog.component';
import { CreateProjectColumnDialogComponent } from './create-project-column-dialog/create-project-column-dialog.component';
import { SubSink } from 'subsink';
import { PostService } from 'src/shared/services/post-service/post.service';

@Component({
  selector: 'app-kanban-section',
  templateUrl: './kanban-section.component.html',
  styleUrls: ['./kanban-section.component.scss']
})
export class KanbanSectionComponent implements OnChanges, OnDestroy {

  @Input() section: any;
  @Input() sections: any;
  @Input() groupData: any;
  @Input() userData: any;
  @Input() sortingBit: String;
  @Input() sortingData: any;
  @Input() filteringBit: String;
  @Input() filteringData: any;
  @Input() isIdeaModuleAvailable = false;
  @Input() isShuttleTasksModuleAvailable = false;
  @Input() isMobile = false;
  @Input() canEdit: boolean = true;
  @Input() isIndividualSubscription = true;
  
  @Output() editSectionEvent = new EventEmitter();
  @Output() deleteSectionEvent = new EventEmitter();
  @Output() archiveSectionEvent = new EventEmitter();

  tasks: any = [];

  unchangedTasks: any;
  
  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink();
  
  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    private columnService: ColumnService,
    private postService: PostService,
    private datesService: DatesService,
    private injector: Injector,
    public dialog: MatDialog
  ) {
    this.subSink.add(this.columnService.refresh$.subscribe((data) => {
      if (!!data && !!this.section && (data?.sectionId == this.section?._id || data?.oldSectionId == this.section?._id)) {
        this.initSection();
      }
    }));
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (!this.utilityService.objectExists(this.groupData)) {
      this.groupData =  await this.publicFunctions.getCurrentGroupDetails();
    }
    await this.initSection();

    this.utilityService.updateIsLoadingSpinnerSource(true);

    for (const propName in changes) {
      if (propName === 'sortingBit') {
        this.sortingBit = changes[propName].currentValue;
      }
      if (propName === 'sortingData') {
        this.sortingData = changes[propName].currentValue;
      }
      if (propName === 'filteringBit' || propName === 'filteringData') {
        this.tasks = await this.postService.filterTasks(this.tasks, this.filteringBit, this.filteringData, this.userData);
      }
    }

    this.tasks = await this.postService.sortTasks(this.tasks, this.sortingBit, this.sortingData);

    this.utilityService.updateIsLoadingSpinnerSource(false);
  }

  /**
   * This functions unsubscribes all the observables subscription to avoid memory leak
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  async initSection() {
    if (!!this.section && !!this.section._id) {
      this.tasks = await this.postService.getTasksBySectionPromise(this.section?._id);

      if (this.groupData?.enabled_rights) {
        this.tasks = await this.postService.filterRAGTasks(this.unchangedTasks?.tasksList, this.groupData, this.userData);
      }
      
      this.countDoneTasks();
    }

    this.utilityService.updateIsLoadingSpinnerSource(false);
  }

  /**
   * Standard Angular CDK Event which monitors the drop functionality of tasks
   * @param event
   */
  drop(event: CdkDragDrop<string[]>) {
    const oldColumn = this.sections[this.sections.findIndex(sec => sec._id == event.previousContainer.id)];
    const newColumn = this.sections[this.sections.findIndex(sec => sec._id == event.container.id)];
    if (oldColumn && newColumn && oldColumn.canEdit && newColumn.canEdit) {
      if (event.previousContainer === event.container) {
        // Move items in array
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      } else {
        // var post: any = event.previousContainer.data[event.previousIndex];

        // Call move task to a new column
        this.moveTaskToSection(event.previousContainer.data[event.previousIndex], event.container.id, oldColumn._id/*, shuttleIndex, event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex*/);
      }
    }
  }

  /**
   * This function is responsible for renaming a section
   * @param oldSection
   * @param newSectionTitle
   */
  editSection(oldSection: any, newSectionTitle: any) {
    this.editSectionEvent.emit({ oldSection: oldSection, newSectionTitle: newSectionTitle });
  }

  /**
   * This function is responsible for deleting a section from the board
   * @param section
   */
  deleteSection(section: any) {
    this.deleteSectionEvent.emit(section);
  }

  /**
   * This function is responsible for removing the task from the UI
   * @param column - column data
   * @param post - post
   */
  removeTask(post: any) {
    // Find the index of the tasks inside the column
    let index = (this.tasks) ? this.tasks.findIndex((task: any) => task._id == post._id) : -1;

    // If the index is not found
    if (index != -1) {
      // Remove the tasks from the array
      this.tasks.splice(index, 1)
    }
  }

  /**
   * This function is responsible for deleting a column from the board
   * @param section
   */
  archiveSection(section: any) {
    this.archiveSectionEvent.emit(section);
  }

  /**
   * This function is responsible for fetching the post
   * @param post
   * @param column
   */
  getPost(post: any) {
    // this.initSection();
    post.canEdit = true;

    // Adding the post to column
    this.tasks.unshift(post)
  }

  /**
   * This function handles the response of moving the task to another column
   * @param task
   * @param columnId
   */
  async moveTaskToSection(post: any, sectionId: string, oldSectionId: string/*, shuttleIndex: number, previousData, currentData, previousIndex, currentIndex*/) {
    const shuttleIndex = (!!post && !!post.task && !!post.task.shuttles) ? post.task.shuttles.findIndex(shuttle => (shuttle._shuttle_group._id || shuttle._shuttle_group) == this.groupData?._id) : -1;
    // Update the task column when changed with dropping events to reflect back in the task view modal
    if (post?.task?.shuttle_type && (shuttleIndex >= 0)) {
      post.task.shuttles[shuttleIndex]._shuttle_section = sectionId;

      await this.publicFunctions.changeTaskShuttleSection(post?._id, this.groupData?._id, sectionId).then(async res => {
        await this.updateTaskSectionFront(post, shuttleIndex, sectionId, oldSectionId);
      });
    } else {
      post.task._column = sectionId;
    
      this.changeTaskColumn(post, sectionId, shuttleIndex, oldSectionId);
    }
  }
  changeTaskColumn(post: any, sectionId: string, shuttleIndex: string, oldSectionId: string) {
    this.utilityService.asyncNotification($localize`:@@kanbanSection.pleaseWaitWeAreMovingTaskToSection:Please wait we are moving the task to a new section...`,
        new Promise(async (resolve, reject) => {
            const isShuttleTasksModuleAvailable = await this.publicFunctions.isShuttleTasksModuleAvailable();
            const isIndividualSubscription = await this.publicFunctions.checkIsIndividualSubscription();
            // Call HTTP Request to change the request
            await this.postService.changeTaskColumn(post._id, sectionId, this.userData._id, this.groupData?._id, isShuttleTasksModuleAvailable, isIndividualSubscription)
                .then(async (res) => {
                    await this.updateTaskSectionFront(post, shuttleIndex, sectionId, oldSectionId);
                    resolve(this.utilityService.resolveAsyncPromise($localize`:@@kanbanSection.tasksMoved:Task moved`));
                })
                .catch(() => {
                    reject(this.utilityService.rejectAsyncPromise($localize`:@@kanbanSection.unableToMoveTask:Unable to move the task, please try again!`));
                });
      }));
  }

  async updateTaskSectionFront(post, shuttleIndex, sectionId, oldSectionId) {
    await this.publicFunctions.executedAutomationFlowsPropertiesFront(null, post, this.groupData?._id, false, shuttleIndex);

    await this.columnService.triggerRefreshSection({sectionId, oldSectionId});
  }

  /**
   * This function is responsible for updating the task in the UI
   * @param post - post
   */
  async updateTask(post: any) {
    // Find the index of the tasks inside the column
    const indexTask = (!!this.tasks && !!post && !!post._id) ? this.tasks.findIndex((task: any) => task._id === post._id) : -1;
    if (indexTask != -1) {
      if ((!!post.task._column && !!this.section && this.section._id == (post.task._column._id || post.task._column)) || (post.task._shuttle_section && this.section._id == (post.task._shuttle_section._id || post.task._shuttle_section))) {
        // update the tasks from the array
        this.tasks[indexTask] = post;
      } else {
        this.tasks.splice(indexTask, 1);
      }

      // Calculate number of done tasks
      this.countDoneTasks();

      return;
    }

    this.tasks = await this.postService.sortTasks(this.tasks, this.sortingBit, this.sortingData);
  }

  makeColumnProjectDialog(column: any) {
    if (!column?.project_type) {
      this.utilityService.asyncNotification($localize`:@@kanbanSection.pleaseWaitWeCreateProject:Please wait we are creating a project from your section...`, new Promise((resolve, reject) => {
        this.columnService.changeColumnProjectType(column._id, true)
          .then((res) => {
            column.project_type = true;
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@kanbanSection.sectionTypeChanged:Section type changed!`));
          })
          .catch((err) => {
            column.project_type = false;
            reject(this.utilityService.rejectAsyncPromise($localize`:@@kanbanSection.unableToChangeSectionType:Unable to change the section type at the moment, please try again!`))
          })
      }));
    }
    this.openMakeColumnProjectDialog(column);
  }

  openMakeColumnProjectDialog(section: any) {
    const data = {
        column: section
      }

    const dialogRef = this.dialog.open(CreateProjectColumnDialogComponent, {
      data: data,
      hasBackdrop: true
    });
    const closeEventSubs = dialogRef?.componentInstance?.closeEvent.subscribe((data) => {
      this.section = section;
    });

    dialogRef.afterClosed().subscribe(result => {
      closeEventSubs.unsubscribe();
    });
  }

  openShowCFDialog(column) {
    const data = {
      column: column,
    }

    const dialogRef = this.dialog.open(ShowCustomFieldsColumnDialogComponent, {
      data: data,
      hasBackdrop: true
    });

    const customFieldsUpdatedEventSubs = dialogRef?.componentInstance?.customFieldsUpdatedEvent.subscribe((data) => {
      this.section = data;
    });

    dialogRef.afterClosed().subscribe(result => {
      customFieldsUpdatedEventSubs.unsubscribe();
    });
  }

  /**
   * This function is responsible for opening a dialog to edit permissions
   */
  openPermissionModal(item: any): void {
    const dialogRef = this.utilityService.openPermissionModal(item, this.groupData, this.userData, 'section');

    if (dialogRef) {
      const closeEventSubs = dialogRef?.componentInstance?.closeEvent.subscribe((data) => {

      });

      dialogRef.afterClosed().subscribe(result => {
        closeEventSubs.unsubscribe();
      });
    }
  }

  /**
   * This function is responsible for opening a fullscreen dialog to edit a task
   */
  openFullscreenModal(postData: any): void {
    const canOpen = !this.groupData?.enabled_rights || postData?.canView || postData?.canEdit;
    const dialogRef = this.utilityService.openPostDetailsFullscreenModal(postData, this.groupData._id, canOpen, this.sections);
    if (dialogRef) {
      const deleteEventSubs = dialogRef?.componentInstance?.deleteEvent?.subscribe(async (data) => {
        this.onDeleteEvent(data);
        this.tasks = await this.postService.sortTasks(this.tasks, this.sortingBit, this.sortingData);
      });
      const closeEventSubs = dialogRef?.componentInstance?.closeEvent?.subscribe((data) => {
        this.updateTask(data);
      });
      const parentAssignEventSubs = dialogRef?.componentInstance?.parentAssignEvent?.subscribe(async (data) => {
        this.onDeleteEvent(data._id);
        this.tasks = await this.postService.sortTasks(this.tasks, this.sortingBit, this.sortingData);
      });
      const taskClonnedEventSubs = dialogRef?.componentInstance?.taskClonnedEvent?.subscribe(async (data) => {
        this.onTaskClonned(data);
        this.tasks = await this.postService.sortTasks(this.tasks, this.sortingBit, this.sortingData);
      });
      const sectionChangedEventSubs = dialogRef?.componentInstance?.sectionChangedEvent?.subscribe(async (data) => {
        await this.updateTaskSectionFront(data, -1, (data.task._column._id || data.task._column), (postData.task._column._id || postData.task._column));
      });
      const datesChangeEventSub = dialogRef?.componentInstance?.datesChangeEvent?.subscribe(async (data) => {
        postData.task.start_date = data.start_date;
        postData.task.due_to = data.due_date;
        this.updateTask(postData);
        this.tasks = await this.postService.sortTasks(this.tasks, this.sortingBit, this.sortingData);
      });


      dialogRef.afterClosed().subscribe(result => {
        closeEventSubs?.unsubscribe();
        deleteEventSubs?.unsubscribe();
        parentAssignEventSubs?.unsubscribe();
        taskClonnedEventSubs?.unsubscribe();
        datesChangeEventSub?.unsubscribe();
        sectionChangedEventSubs?.unsubscribe();
      });
    }
  }

  async onModalCloseEvent(data) {
    this.updateTask(data);
  }

  onDeleteEvent(id) {
    // Find the index of the tasks
    const indexTask = (this.tasks) ? this.tasks.findIndex((task: any) => task._id === id) : -1;
    if (indexTask !== -1) {
      this.tasks.splice(indexTask, 1);
      return;
    }
  }

  onTaskClonned(data) {
    this.initSection();
  }

  isDelay(realDueDate: any, dueDate: any) {
    return this.datesService.isBefore(DateTime.fromISO(dueDate), DateTime.fromISO(realDueDate));
  }

  calculateCFStatistics(cfName: string) {
    let calculation = 0;
    this.tasks?.forEach(task => {
      calculation += (task.task.custom_fields && task.task.custom_fields[cfName] && !isNaN(task.task.custom_fields[cfName]))
        ? +task.task.custom_fields[cfName]
        : 0;
    });
    return calculation;
  }

  countDoneTasks() {
    this.section.numDoneTasks = this.tasks.filter((post) => post?.task?.status?.toLowerCase() == 'done').length;
  }

  isGroupManager() {
    return (this.groupData && this.groupData._admins) ? (this.groupData?._admins.findIndex((admin: any) => (admin._id || admin) == this.userData?._id) >= 0) : false;
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return this.utilityService.objectExists(object);
  }
}
