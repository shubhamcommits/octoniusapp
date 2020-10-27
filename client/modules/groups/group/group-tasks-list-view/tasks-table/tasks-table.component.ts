import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource, Sort } from '@angular/material';
import moment from 'moment';
import { environment } from 'src/environments/environment';
import { ColumnService } from 'src/shared/services/column-service/column.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

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

  @Input() isAdmin = false;
  @Input() customFields = [];

  @Output() taskChangeSectionEmitter = new EventEmitter();

  customFieldsToShow = [];

  newColumnSelected

  // Base URL of the uploads
  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  displayedColumns = ['title', 'tags', 'asignee', 'due_to', 'nsPercent', 'star'];

  dataSource: MatTableDataSource<any>;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(
    public utilityService: UtilityService,
    private columnService: ColumnService
  ) { }

  async ngOnChanges() {
    this.customFields = [...this.customFields];
    await this.initTable();
  }

  ngAfterViewInit() {
    this.section.custom_fields_to_show.forEach(field => {
      if (this.displayedColumns.length - 1 >= 0) {
        const index = this.displayedColumns.indexOf(field.name);
        if (index < 0) {
          this.displayedColumns.splice(this.displayedColumns.length - 1, 0, field);
        }
      }
    });
  }

  async initTable() {
    await this.loadCustomFieldsToShow();

    const doneTasks = [...this.tasks['done']];
    this.tasks = [...this.tasks];
    this.tasks['done'] = doneTasks;

    this.dataSource = new MatTableDataSource(this.tasks);
    this.dataSource.sort = this.sort;
  }

  loadCustomFieldsToShow() {
    if (this.customFieldsToShow.length === 0){
      this.section.custom_fields_to_show.forEach(field => {
        const cf = this.getCustomField(field);
        // Push the Column
        if (cf) {
          this.customFieldsToShow.push(cf);
        }
      });
    }
  }

  fieldUpdated(post, task) {
    task = post;
  }

  getProgressPercent(northStar) {
    if (northStar.type !== 'Percent') {
      return (northStar.values[northStar.values.length - 1].value)/northStar.target_value;
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
    // Today's date object
    const today = moment().local().startOf('day').format('YYYY-MM-DD');
    return moment(taskPost.task.due_to).format('YYYY-MM-DD') < today;
  }

  /**
   * This function is responsible for opening a fullscreen dialog to edit a task
   */
  openFullscreenModal(postData: any): void {
    const dialogRef = this.utilityService.openCreatePostFullscreenModal(postData, this.userData, this.groupData._id, this.sections);

    const deleteEventSubs = dialogRef.componentInstance.deleteEvent.subscribe((data) => {
      this.onDeleteEvent(data);
    });
    const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
      this.updateTask(data);
    });
    dialogRef.afterClosed().subscribe(result => {
      deleteEventSubs.unsubscribe();
      closeEventSubs.unsubscribe();
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
  updateTask(post: any) {
    if (post) {
      // Find the index of the task
      const indexTask = this.tasks.findIndex((task: any) => task._id === post._id);
      if (indexTask !== -1) {
        if (this.section.title.toLowerCase() === post.task._column.title.toLowerCase()) {
          if (post.task.status === 'done') {
            this.tasks['done'].unshift(post);
            this.tasks.splice(indexTask, 1);
          } else {
            // update the tasks from the array
            this.tasks[indexTask]= post;
          }
        } else {
          this.tasks.splice(indexTask, 1);
          this.taskChangeSectionEmitter.emit({post: post, oldSection: this.section.title});
        }
      } else {
        // if is coming from the done tasks
        if (this.section.title.toLowerCase() === post.task._column.title.toLowerCase()) {
          if (post.task.status !== 'done') {
            this.tasks.unshift(post);
          }
        } else {
          this.taskChangeSectionEmitter.emit({post: post, oldSection: this.section.title});
        }
      }

      this.initTable();
    }
  }

  async onCloseDoneTaskModalEvent(post) {
    this.updateTask(post);
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
      this.utilityService.warningNotification('Column already exist!');
    } else {
      // If not found, then push the element
      // Create the Column

      this.section.custom_fields_to_show.push(this.newColumnSelected.name);
      this.customFieldsToShow.push(this.getCustomField(this.newColumnSelected.name));
      if (this.displayedColumns.length - 1 >= 0) {
        this.displayedColumns.splice(this.displayedColumns.length - 1, 0, this.newColumnSelected.name);
      }

      this.newColumnSelected = null;

      this.columnService.saveCustomFieldsToShow(this.groupData._id, this.section.title, this.section.custom_fields_to_show);
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

    this.columnService.saveCustomFieldsToShow(this.groupData._id, this.section.title, this.section.custom_fields_to_show);
  }

  customFieldValues(fieldName: string) {
    const index = this.groupData.custom_fields.findIndex((field: any) => field.name === fieldName);
    return (this.groupData.custom_fields[index]) ? this.groupData.custom_fields[index].values : '';
  }
}
