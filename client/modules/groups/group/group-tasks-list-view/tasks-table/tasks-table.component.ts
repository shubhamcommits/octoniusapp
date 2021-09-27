import { AfterViewInit, Component, EventEmitter, SimpleChanges, Injector, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PublicFunctions } from 'modules/public.functions';
import { environment } from 'src/environments/environment';
import { ColumnService } from 'src/shared/services/column-service/column.service';
import { FlowService } from 'src/shared/services/flow-service/flow.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

import moment from 'moment';

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

  // Base URL of the uploads
  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  displayedColumns = ['title', 'tags', 'asignee', 'due_to', 'nsPercent', 'star'];

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector)

  flows = [];

  dataSource: MatTableDataSource<any>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    public utilityService: UtilityService,
    private columnService: ColumnService,
    private flowService: FlowService,
    private injector: Injector
  ) { }

  async ngOnChanges(changes: SimpleChanges) {
    this.customFields = [...this.customFields];
    this.flowService.getGroupAutomationFlows(this.groupData._id).then(res => {
      this.flows = res['flows'];
    });

    for (const propName in changes) {
      const change = changes[propName];
      const to = change.currentValue;
      const from = change.previousValue;

      if (propName === 'sortingBit') {
        this.sortingBit = to;
      }
      if (propName === 'sortingData') {
        this.sortingData = to;
      }
    }
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

    let taskslist = [];
    if (this.tasks) {
      this.tasks.forEach(val => taskslist.push(Object.assign({}, val)));
    }
    let unchangedTasks: any = { tasksList: taskslist };
    this.unchangedTasks = JSON.parse(JSON.stringify(unchangedTasks));

    this.tasks = [...this.tasks];
    await this.sorting();

    this.dataSource = new MatTableDataSource(this.tasks);
    this.dataSource.sort = this.sort;
  }

  async sorting() {
    if ((this.sortingBit == 'due_date' || this.sortingBit == 'none') && this.tasks) {
      this.tasks.sort((t1, t2) => {
        if (t1.task?.due_to && t2.task?.due_to) {
          if (moment.utc(t1.task?.due_to).isBefore(moment.utc(t2.task?.due_to))) {
            return this.sortingBit == 'due_date' ? -1 : 1;
          } else {
            return this.sortingBit == 'due_date' ? 1 : -1;
          }
        } else {
          if (t1.task?.due_to && !t2.task?.due_to) {
            return -1;
          } else if (!t1.task?.due_to && t2.task?.due_to) {
            return 1;
          }
        }
      });
    } else if (this.sortingBit == 'custom_field' && this.tasks) {
        if (this.sortingData && this.sortingData.name == 'priority') {
          this.tasks.sort((t1, t2) => {
            return (t1?.task?.custom_fields && t2?.task?.custom_fields)
              ? (((t1?.task?.custom_fields['priority'] == 'High' && t2?.task?.custom_fields['priority'] != 'High') || (t1?.task?.custom_fields['priority'] == 'Medium' && t2?.task?.custom_fields['priority'] == 'Low'))
                ? -1 : (((t1?.task?.custom_fields['priority'] != 'High' && t2?.task?.custom_fields['priority'] == 'High') || (t1?.task?.custom_fields['priority'] == 'Low' && t2?.task?.custom_fields['priority'] == 'Medium'))
                  ? 1 : 0))
              : ((t1?.task?.custom_fields && !t2?.task?.custom_fields)
                ? -1 : ((!t1?.task?.custom_fields && t2?.task?.custom_fields))
                  ? 1 : 0);
          });
        } else {
          this.tasks.sort((t1, t2) => {
            return (t1?.task?.custom_fields && t2?.task?.custom_fields)
              ? (t1?.task?.custom_fields[this.sortingData.name] && t2?.task?.custom_fields[this.sortingData.name])
                ?((t1?.task?.custom_fields[this.sortingData.name] > t2?.task?.custom_fields[this.sortingData.name])
                  ? -1 : (t1?.task?.custom_fields < t2?.task?.custom_fields)
                    ? 1 : 0)
                : ((t1?.task?.custom_fields[this.sortingData.name] && !t2?.task?.custom_fields[this.sortingData.name])
                  ? -1 : ((!t1?.task?.custom_fields[this.sortingData.name] && t2?.task?.custom_fields[this.sortingData.name]))
                    ? 1 : 0)
              : ((t1?.task?.custom_fields && !t2?.task?.custom_fields)
                ? -1 : ((!t1?.task?.custom_fields && t2?.task?.custom_fields))
                  ? 1 : 0);
          });
      }
    } else if ((this.sortingBit == 'tags') && this.tasks) {
      this.tasks.sort((t1, t2) => {
        if (t1?.tags.length > 0 && t2?.tags.length > 0) {
          const name1 = t1?.tags[0]?.toLowerCase();
          const name2 = t2?.tags[0]?.toLowerCase();
          if (name1 > name2) { return 1; }
          if (name1 < name2) { return -1; }
          return 0;
        } else {
          if (t1?.tags.length > 0 && t2?.tags.length == 0) {
            return -1;
          } else if (t1?.tags.length == 0 && t2?.tags.length > 0) {
            return 1;
          }
          return 0;
        }
      });
    } else if ((this.sortingBit == 'status') && this.tasks) {
      this.tasks.sort((t1, t2) => {
        return (t1?.task?.status && t2?.task?.status)
          ? (((t1?.task?.status == 'to do' && t2?.task?.status != 'to do') || (t1?.task?.status == 'in progress' && t2?.task?.status == 'done'))
            ? -1 : (((t1?.task?.status != 'to do' && t2?.task?.status == 'to do') || (t1?.task?.status == 'done' && t2?.task?.status == 'in progress'))
              ? 1 : 0))
          : ((t1?.task?.status && !t2?.task?.status)
            ? -1 : ((!t1?.task?.status && t2?.task?.status))
              ? 1 : 0);
      });
    } else if ((this.sortingBit == 'ideas') && this.tasks) {
      this.tasks.sort((t1, t2) => {
        return ((t1?.task?.idea?.positive_votes?.length || 0 - t1?.task?.idea?.negative_votes || 0) > (t2?.task?.idea?.positive_votes || 0 - t2?.task?.idea?.negative_votes?.length || 0)) ? -1 : 1;
      });
    } else if ((this.sortingBit == 'reverse' || this.sortingBit == 'inverse') && this.tasks) {
      this.tasks.reverse();
    }
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
    if (northStar.type !== 'Percent') {
      return (northStar.values[northStar.values.length - 1].value) / northStar.target_value;
    }

    return northStar.values[northStar.values.length - 1].value / 100;
  }

  getNSStatusClass(northStar) {
    let retClass = "percentlabel";
    const status = northStar.values[northStar.values.length - 1].status;
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
    const dialogRef = this.utilityService.openCreatePostFullscreenModal(postData, this.userData, this.groupData._id, this.isIdeaModuleAvailable, this.sections,this.tasks);

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

    dialogRef.afterClosed().subscribe(result => {
      deleteEventSubs.unsubscribe();
      closeEventSubs.unsubscribe();
      parentAssignEventSubs.unsubscribe();
      taskClonnedEventSubs.unsubscribe();
    });
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
      post = await this.publicFunctions.executedAutomationFlowsPropertiesFront(this.flows, post, this.groupData?._id);

      // Find the index of the task
      const indexTask = this.tasks.findIndex((task: any) => task._id === post._id);
      if (indexTask != -1) {
        if (this.section._id == (post.task._column._id || post.task._column)) {
          // update the tasks from the array
          this.tasks[indexTask] = post;
        } else {
          this.tasks.splice(indexTask, 1);
          this.taskChangeSectionEmitter.emit({ post: post, oldSectionId: this.section._id });
        }
      }

      this.initTable();
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
      const shuttleIndex = task.task.shuttles.findIndex(s => (s._shuttle_group._id || s._shuttle_group) == this.groupData?._id);
      const shuttleStatus = task.task.shuttles[shuttleIndex].shuttle_status;
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
