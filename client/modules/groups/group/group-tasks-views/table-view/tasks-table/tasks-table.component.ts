import { AfterViewInit, Component, EventEmitter, SimpleChanges, Injector, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { PublicFunctions } from 'modules/public.functions';
import { ColumnService } from 'src/shared/services/column-service/column.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

import moment from 'moment';
import { PostService } from 'src/shared/services/post-service/post.service';

@Component({
  selector: 'app-tasks-table',
  templateUrl: './tasks-table.component.html',
  styleUrls: ['./tasks-table.component.scss']
})
export class TasksTableComponent implements OnChanges, AfterViewInit {

  @Input() tasks = [];
  @Input() groupData;
  @Input() userData;
  @Input() section;
  @Input() sections;
  @Input() sortingBit: String;
  @Input() sortingData: any;
  @Input() isAdmin = false;
  @Input() customFields = [];
  @Input() isIdeaModuleAvailable = false;

  @Output() taskChangeSectionEmitter = new EventEmitter();
  @Output() taskClonnedEvent = new EventEmitter();

  customFieldsToShow = [];
  unchangedTasks: any;
  newColumnSelected;

  displayedColumns = ['title', 'tags', 'asignee', 'due_to', 'nsPercent', 'star'];

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector)

  dataSource: MatTableDataSource<any>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    public utilityService: UtilityService,
    private columnService: ColumnService,
    private postService: PostService,
    private injector: Injector
  ) { }

  async ngOnChanges(changes: SimpleChanges) {
    this.customFields = [...this.customFields];

    await this.initTable();
  }

  ngAfterViewInit() {
    if (this.section && this.section.custom_fields_to_show) {
      this.section.custom_fields_to_show.forEach(field => {
        if (this.displayedColumns.length - 1 >= 0) {
          const index = this.displayedColumns.indexOf(field.name);
          if (index < 0) {
            this.displayedColumns.splice(this.displayedColumns.length - 1, 0, field);
          }
        }
      });
    }
  }

  async initTable() {
    await this.loadCustomFieldsToShow();

    await this.sortNSValues();

    this.dataSource = new MatTableDataSource(this.tasks);
    this.dataSource.sort = this.sort;
  }

  sortNSValues() {
    this.tasks?.forEach(post => {
      if (!!post?.task?.northStar?.values) {
        post.task.northStar.values = post?.task?.northStar?.values?.sort((v1, v2) => (moment.utc(v1.date).isBefore(moment.utc(v2.date))) ? 1 : -1)
      }
    });
  }

  loadCustomFieldsToShow() {
    if (this.section && this.section.custom_fields_to_show && this.customFieldsToShow.length === 0) {
      this.section.custom_fields_to_show.forEach(field => {
        const cf = this.getCustomField(field);
        // Push the Column
        if (cf) {
          this.customFieldsToShow.push(cf);
        }
      });
    }
  }

  async fieldUpdated(res: any) {
    this.updateTask(res['post'], res['cfTrigger']);
  }

  getProgressPercent(northStar) {
    northStar.values = northStar?.values?.sort((v1, v2) => (moment.utc(v1.date).isBefore(moment.utc(v2.date))) ? 1 : -1)
    if (northStar.type !== 'Percent') {
      return (northStar.values[0].value) / northStar.target_value;
    }

    return northStar.values[0].value / 100;
  }

  getNSStatusClass(northStar) {
    let retClass = "percentlabel";
    const status = northStar.values[0].status;
    if (status === 'NOT STARTED') {
      retClass += ' not_started';
    } else if (status === 'ON TRACK') {
      retClass += ' on_track';
    } else if (status === 'IN DANGER') {
      retClass += ' in_danger';
    } else if (status === 'ACHIEVED') {
      retClass += ' achieved';
    }
    return retClass;
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
   * This function is responsible for opening a fullscreen dialog to edit a task
   */
  openFullscreenModal(postData: any): void {
    const canOpen = !this.groupData?.enabled_rights || postData?.canView || postData?.canEdit;
    const dialogRef = this.utilityService.openPostDetailsFullscreenModal(postData, this.groupData._id, canOpen, this.sections);

    if (dialogRef) {
      const deleteEventSubs = dialogRef.componentInstance.deleteEvent.subscribe((data) => {
        this.onDeleteEvent(data);
      });
      const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
        this.updateTask(data);
      });
      const parentAssignEventSubs = dialogRef.componentInstance.parentAssignEvent.subscribe((data) => {
        this.onDeleteEvent(data._id);
      });
      const taskClonnedEventSubs = dialogRef.componentInstance.taskClonnedEvent.subscribe((data) => {
        this.onTaskClonned(data);
      });
      const sectionChangedEventSubs = dialogRef?.componentInstance?.sectionChangedEvent?.subscribe(async (data) => {
        const sectionId = (data.task._column._id || data.task._column);
        const oldSectionId = (postData.task._column._id || postData.task._column);
        await this.columnService.triggerRefreshSection({sectionId, oldSectionId});
      });
      const datesChangeEventSub = dialogRef.componentInstance.datesChangeEvent.subscribe(async (data) => {
        postData.task.start_date = data.start_date;
        postData.task.due_to = data.due_date;
        this.updateTask(postData);
        this.tasks = await this.postService.sortTasks(this.tasks, this.sortingBit, this.sortingData);
      
        this.utilityService.updateIsLoadingSpinnerSource(false);
      });

      dialogRef.afterClosed().subscribe(result => {
        deleteEventSubs.unsubscribe();
        closeEventSubs.unsubscribe();
        parentAssignEventSubs.unsubscribe();
        taskClonnedEventSubs.unsubscribe();
        sectionChangedEventSubs.unsubscribe();
        datesChangeEventSub.unsubscribe();
      });
    }
  }

  onDeleteEvent(id) {
    // Find the index of the tasks inside the column
    const indexTask = this.tasks.findIndex((task: any) => task._id === id);
    if (indexTask !== -1) {
      this.tasks.splice(indexTask, 1);
      this.initTable();
      return;
    }
  }

  /**
   * This function is responsible for updating the task in the UI
   * @param post - post
   */
  async updateTask(post: any, cfTrigger?: any) {
    if (post) {

      if (cfTrigger) {
        post.task.custom_fields[cfTrigger.name] = cfTrigger.value;
      }
      // post = await this.publicFunctions.executedAutomationFlowsPropertiesFront(null, post, this.groupData?._id);
      await this.publicFunctions.executedAutomationFlowsPropertiesFront(null, post, this.groupData?._id).then(res => {
        post = res;
        this.columnService.triggerRefreshSection(this.section._id);
      });

      // // Find the index of the task
      // const indexTask = this.tasks.findIndex((task: any) => task._id === post._id);
      // if (indexTask != -1) {
      //   if (this.section._id == (post.task._column._id || post.task._column)) {
      //     // update the tasks from the array
      //     this.tasks[indexTask] = post;
      //   } else {
      //     this.tasks.splice(indexTask, 1);
      //     this.taskChangeSectionEmitter.emit({ post: post, oldSectionId: this.section._id });
      //   }
      // }

      // this.initTable();
    }
  }

  getCustomField(fieldName: string) {
    const index = this.customFields.findIndex((f: any) => f.name === fieldName);
    return this.customFields[index];
  }

  addNewColumn($event: Event) {
    // Find the index of the column to check if the same named column exist or not
    const index = this.customFieldsToShow.findIndex((f: any) => f.name.toLowerCase() === this.newColumnSelected.name.toLowerCase());

    // If index is found, then throw error notification
    if (index !== -1) {
      this.utilityService.warningNotification($localize`:@@taskTable.sectionAlreadyExists:Section already exists!`);
    } else {
      // If not found, then push the element
      // Create the Column

      this.section.custom_fields_to_show.push(this.newColumnSelected.name);
      this.customFieldsToShow.push(this.getCustomField(this.newColumnSelected.name));
      if (this.displayedColumns.length - 1 >= 0) {
        this.displayedColumns.splice(this.displayedColumns.length - 1, 0, this.newColumnSelected.name);
      }

      this.newColumnSelected = null;

      this.columnService.saveCustomFieldsToShow(this.section._id, this.section.custom_fields_to_show);
    }
  }

  removeColumn(field: any) {
    let index: number = this.customFieldsToShow.findIndex(cf => cf.name === field);
    if (index !== -1) {
      this.customFieldsToShow.splice(index, 1);
    }
    index = this.displayedColumns.indexOf(field.name);
    if (index !== -1) {
      this.displayedColumns.splice(index, 1);
    }
    index = this.section.custom_fields_to_show.indexOf(field.name);
    if (index !== -1) {
      this.section.custom_fields_to_show.splice(index, 1);
    }

    this.columnService.saveCustomFieldsToShow(this.section._id, this.section.custom_fields_to_show);
  }

  customFieldValues(fieldName: string) {
    const cf = this.getCustomField(fieldName);
    return (cf) ? cf.values.sort((v1, v2) => (v1 > v2) ? 1 : -1) : '';
  }

  onTaskClonned(data) {
    this.taskClonnedEvent.emit(data);
  }

  getTaskClass(status: string, isNorthStar: boolean, isMilestone: boolean, task: any) {
    let taskClass = '';
    if (task.task.shuttle_type) {
      const shuttleIndex = (task.task.shuttles) ? task.task.shuttles.findIndex(s => (s._shuttle_group._id || s._shuttle_group) == this.groupData?._id) : -1;
      const shuttleStatus = (shuttleIndex >= 0) ? task.task.shuttles[shuttleIndex].shuttle_status : status;
      if (shuttleStatus === 'to do') {
        taskClass = 'status-todo';
      } else if (shuttleStatus === 'in progress') {
        taskClass = 'status-inprogress';
      } else if (shuttleStatus === 'done') {
        taskClass = 'status-done';
      }
    } else {
      if (status === 'to do') {
        taskClass = 'status-todo';
      } else if (status === 'in progress') {
        taskClass = 'status-inprogress';
      } else if (status === 'done') {
        taskClass = 'status-done';
      }
    }

    if (isMilestone) {
      taskClass = taskClass + ' milestone'
    }

    return (isNorthStar) ? taskClass + ' north-star' : taskClass;
  }
}
