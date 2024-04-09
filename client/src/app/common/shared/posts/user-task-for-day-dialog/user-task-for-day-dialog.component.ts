import { Component, OnInit, Injector, ViewChild, TemplateRef, Input, OnDestroy, Output, EventEmitter, Inject } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import { DateTime } from 'luxon';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatesService } from 'src/shared/services/dates-service/dates.service';

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
    private datesService: DatesService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
  }

  async ngOnInit() {
    this.status = this.data.status;
    this.selectedDay = this.data.selectedDay;
    this.selectedUser = this.data.selectedUser;
    this.tasksForTheDay = this.data.tasksForTheDay;

    this.userData = await this.publicFunctions.getCurrentUser();
    this.groupData = await this.publicFunctions.getCurrentGroupDetails();

    this.loadTasks();
  }

  ngOnDestroy() {
    this.utilityService.closeAllModals();
  }

  async loadTasks() {
    // this.tasksForTheDay = await this.publicFunctions.filterRAGTasks(await this.getTasks(), this.userData);
    this.tasksForTheDay = await this.publicFunctions.filterRAGTasks(this.tasksForTheDay, this.userData);
  }

  // async getTasks() {
  //   return new Promise((resolve, reject) => {
  //     let postService = this.injector.get(PostService);
  //     postService.getTasksPerGroupUserStatusAndDate(this.groupData._id, this.selectedUser._id, this.status, this.selectedDay.toJSDate())
  //       .then((res) => {
  //         res['posts'] = res['posts'].filter((task)=> {
  //           return task._group != null;
  //         });

  //         resolve(res['posts']);
  //       })
  //       .catch(() => {
  //         reject([]);
  //       })
  //   })
  // }

  async openModal(post: any) {
    if (!!post) {
      // Open the Modal
      let columns = [];
      const canOpen = !this.userData?._private_group?.enabled_rights || post?.canView || post?.canEdit;
      await this.publicFunctions.getAllColumns(this.groupData?._id).then((data: any) => columns = data);
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
  }

  updateTask(task) {
    let index = this.tasksForTheDay.findIndex((t: any) => t._id === task._id);
    if (index !== -1) {
      this.tasksForTheDay[index] = task;
    }
  }

  onDeleteTask(deletedTaskId) {
      // Find the index of the tasks inside the section
      let indexTask = this.tasksForTheDay.findIndex((task: any) => task._id === deletedTaskId);
      if (indexTask != -1) {
        this.tasksForTheDay.splice(indexTask, 1);
        return;
      }
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

  getTaskStatusClass(task: any) {
    return (!!task && !!task.task)
      ? (task.task.status === 'to do')
        ? 'media card-tile overview-task todo-bar'
        : (task.task.status === 'in progress')
          ? 'media card-tile overview-task working-bar'
          : (task.task.status.trim() === 'completed' || task.task.status.trim() === 'done')
            ? 'media card-tile overview-task done-bar'
            : ''
      : '';
  }

  getPriorityClass(priority: string) {
    return 'label-priority ' + priority.toLocaleLowerCase();
  }

  isOverDue(day1: any) {
    return (!!day1 && day1 instanceof DateTime)
      ? day1.startOf('day') < DateTime.now().startOf('day')
      : (!!day1)
        ? DateTime.fromISO(day1).startOf('day') < DateTime.now().startOf('day')
        : false;
  }

  formateDate(date) {
    return this.datesService.formateDate(date);
  }
}
