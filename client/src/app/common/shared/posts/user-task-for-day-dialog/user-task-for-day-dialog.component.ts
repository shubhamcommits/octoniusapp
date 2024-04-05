import { Component, OnInit, Injector, ViewChild, TemplateRef, Input, OnDestroy, Output, EventEmitter, Inject } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import { DateTime } from 'luxon';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PostService } from 'src/shared/services/post-service/post.service';

@Component({
  selector: 'app-user-task-for-day-dialog',
  templateUrl: './user-task-for-day-dialog.component.html',
  styleUrls: ['./user-task-for-day-dialog.component.scss']
})
export class UserTaskForDayDialogComponent implements OnInit, OnDestroy {

  @Input() memberData: any;
  
  // Modal Content
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  @Output() closeEvent = new EventEmitter();

  status = '';
  selectedDay: any;
  selectedUser: any;

  tasksForTheDay: any = [];

  groupData;
  userData;

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector,
    private utilityService: UtilityService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
  }

  async ngOnInit() {
    this.status = this.data.status;
    this.selectedDay = this.data.selectedDay;
    this.selectedUser = this.data.selectedUser;

    this.loadTasks();
  }

  ngOnDestroy() {
    this.utilityService.closeAllModals();
  }

  async loadTasks() {
    this.tasksForTheDay = await this.publicFunctions.filterRAGTasks(await this.getTasks(), this.userData);

    this.markOverdueTasks();
  }

  async getTasks() {
    return new Promise((resolve, reject) => {
      let postService = this.injector.get(PostService);
      postService.getTasksPerGroupUserStatusAndDate(this.groupData._id, this.selectedUser._id, this.status, this.selectedDay.toJSDate())
        .then((res) => {
          res['posts'] = res['posts'].filter((task)=> {
            return task._group != null;
          });

          resolve(res['posts']);
        })
        .catch(() => {
          reject([]);
        })
    })
  }

  private markOverdueTasks() {
    this.tasksForTheDay = this.tasksForTheDay.map(async task => {
      // task.overdue = (this.status == 'overdue') ? true : false;
      task.overdue = await this.isOverDue(DateTime.fromJSDate(task.task.due_to), DateTime.now())
      return task;
    });
  }

  isOverDue(day1: DateTime, day2: DateTime) {
    return day1.startOf('day') < day2.startOf('day');
  }

  async openModal(post: any) {
    // Open the Modal
    let columns = [];
    const canOpen = !this.userData?._private_group?.enabled_rights || post?.canView || post?.canEdit;
    await this.publicFunctions.getAllColumns(post._group._id).then((data: any) => columns = data);
    const dialogRef = this.utilityService.openPostDetailsFullscreenModal(post._id, this.groupData?._id, canOpen, columns);

    if (dialogRef) {
      const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
        this.updateTask(data);
      });
      const deleteEventSubs = dialogRef.componentInstance.deleteEvent.subscribe((data) => {
        this.onDeleteTask(data);
      });
      dialogRef.afterClosed().subscribe(result => {
        closeEventSubs.unsubscribe();
        deleteEventSubs.unsubscribe();
      });
    }
  }

  updateTask(task) {
    let index = this.tasksForTheDay.findIndex((t: any) => t._id === task._id);
    if (index !== -1) {
      this.tasksForTheDay[index] = task;
    }

    this.markOverdueTasks();
  }

  onDeleteTask(deletedTaskId) {
      // Find the index of the tasks inside the section
      let indexTask = this.tasksForTheDay.findIndex((task: any) => task._id === deletedTaskId);
      if (indexTask != -1) {
        this.tasksForTheDay.splice(indexTask, 1);
        return;
      }
  }

  getTaskStatusClass(task: any) {
    return (task.task.status === 'to do')
      ? 'media card-tile overview-task todo-bar'
      : (task.task.status === 'in progress')
        ? 'media card-tile overview-task working-bar'
        : (task.task.status.trim() === 'completed' || task.task.status.trim() === 'done')
          ? 'media card-tile overview-task done-bar'
          : '';
  }

  getPriorityClass(priority: string) {
    return 'label-priority ' + priority.toLocaleLowerCase();
  }

  sortTasksByPriority(tasks: any) {
    return tasks.sort((t1, t2) => {
      return (t1?.task?.custom_fields && t2?.task?.custom_fields)
        ? (((t1?.task?.custom_fields['priority'] == 'High' && t2?.task?.custom_fields['priority'] != 'High') || (t1?.task?.custom_fields['priority'] == 'Medium' && t2?.task?.custom_fields['priority'] == 'Low'))
          ? -1 : (((t1?.task?.custom_fields['priority'] != 'High' && t2?.task?.custom_fields['priority'] == 'High') || (t1?.task?.custom_fields['priority'] == 'Low' && t2?.task?.custom_fields['priority'] == 'Medium'))
            ? 1 : 0))
        : ((t1?.task?.custom_fields && !t2?.task?.custom_fields)
          ? -1 : ((!t1?.task?.custom_fields && t2?.task?.custom_fields))
            ? 1 : 0);
    });
  }

  formateDate(date) {
    return this.utilityService.formateDate(date, DateTime.DATE_MED);
  }
}
