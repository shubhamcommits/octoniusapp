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
  
  groupData;
  userData;

  tasksForTheDay: any = [];
  
  post: any;

  columns;

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector,
    private utilityService: UtilityService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.userData = this.data.userData;
    this.groupData = this.data.groupData;
    this.selectedDay = this.data.selectedDay;
    this.selectedUser = this.data.selectedUser;
    this.status = this.data.status;
console.log(this.userData);
console.log(this.groupData);
console.log(this.selectedDay);
console.log(this.selectedUser);
console.log(this.status);
    this.loadTasks();
  }

  async ngOnInit() { }

  ngOnDestroy() {
    this.utilityService.closeAllModals();
  }

  async loadTasks() {
    const tasks = await this.getTasks();
console.log({tasks});
    this.tasksForTheDay = await this.publicFunctions.filterRAGTasks(tasks, this.userData);

    this.markOverdueTasks();
console.log(this.tasksForTheDay);
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
    this.tasksForTheDay = this.tasksForTheDay.map(task => {
      task.overdue = (this.status == 'overdue') ? true : false;
      return task;
    });
  }

  async openModal(task) {

    this.post = task;

    // Open the Modal
    let dialogRef;
    const canOpen = !this.userData?._private_group?.enabled_rights || this.post?.canView || this.post?.canEdit;
    if (this.post.type === 'task' && !this.post.task._parent_task) {
      await this.publicFunctions.getAllColumns(this.post._group._id).then(data => this.columns = data);
      dialogRef = this.utilityService.openPostDetailsFullscreenModal(this.post._id, this.userData?._private_group?._id, canOpen, this.columns);
    } else {
      // for subtasks it is not returning the parent information, so need to make a workaround
      if (this.post.task._parent_task && !this.post.task._parent_task._id) {
          await this.publicFunctions.getPost(this.post.task._parent_task).then(post => {
            this.post.task._parent_task = post;
          });
      }
      dialogRef = this.utilityService.openPostDetailsFullscreenModal(this.post._id, this.userData?._private_group?._id, canOpen);
    }

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
