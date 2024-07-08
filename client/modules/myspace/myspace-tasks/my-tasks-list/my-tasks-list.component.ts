import { Component, OnInit, Injector, ViewChild, TemplateRef, Input, OnDestroy } from '@angular/core';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment/moment';

@Component({
  selector: 'app-my-tasks-list',
  templateUrl: './my-tasks-list.component.html',
  styleUrls: ['./my-tasks-list.component.scss']
})
export class MyTasksListComponent implements OnInit, OnDestroy {

  @Input() userData: any;
  
  // Modal Content
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  todayTasks: any = [];
  thisWeekTasks: any = [];
  nextWeekTasks: any = [];
  futureTasks: any = [];
  overdueTasks: any = [];
  overdueAndTodayTasks: any = [];

  post: any;

  columns;

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    private injector: Injector,
  ) { }

  async ngOnInit() {

    // Fetch the current user
    this.userData = await this.publicFunctions.getCurrentUser();

    await this.loadTasks();
    this.overdueAndTodayTasks = this.sortTasksByPriority(this.overdueTasks.concat(this.todayTasks));

    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'home'
    });
  }

  ngOnDestroy() {
    this.utilityService.closeAllModals();
  }

  async loadTasks() {
    this.todayTasks = await this.publicFunctions.filterRAGTasks(await this.getUserTodayTasks(), this.userData);
    this.thisWeekTasks = await this.publicFunctions.filterRAGTasks(await this.getUserThisWeekTasks(), this.userData);
    this.overdueTasks = await this.publicFunctions.filterRAGTasks(await this.getUserOverdueTasks(), this.userData);
    this.nextWeekTasks = await this.publicFunctions.filterRAGTasks(await this.getUserNextWeekTasks(), this.userData);
    this.futureTasks = await this.publicFunctions.filterRAGTasks(await this.getUserFutureTasks(), this.userData);

    this.markOverdueTasks();
  }

  async getUserTodayTasks() {
    return new Promise((resolve, reject) => {
      let userService = this.injector.get(UserService);
      userService.getUserTodayTasks()
        .then((res) => {
          res['tasks'] = res['tasks'].filter((task)=> {
            return task._group != null;
          });

          resolve(res['tasks']);
        })
        .catch(() => {
          reject([]);
        })
    })
  }

  async getUserThisWeekTasks() {
    return new Promise((resolve, reject) => {
      let userService = this.injector.get(UserService);
      userService.getUserThisWeekTasks()
        .then((res) => {
          res['tasks'] = this.sortTasksByPriority(res['tasks'].filter((task)=> {
            return task._group != null
          }));
          resolve(res['tasks'])
        })
        .catch(() => {
          reject([])
        })
    })
  }

  async getUserNextWeekTasks() {
    return new Promise((resolve, reject) => {
      let userService = this.injector.get(UserService);
      userService.getUserNextWeekTasks()
        .then((res) => {
          res['tasks'] = this.sortTasksByPriority(res['tasks'].filter((task)=> {
            return task._group != null
          }));
          resolve(res['tasks'])
        })
        .catch(() => {
          reject([])
        })
    })
  }

  async getUserFutureTasks() {
    return new Promise((resolve, reject) => {
      let userService = this.injector.get(UserService);
      userService.getUserFutureTasks()
        .then((res) => {
          res['tasks'] = this.sortTasksByPriority(res['tasks'].filter((task)=> {
            return task._group != null
          }));
          resolve(res['tasks'])
        })
        .catch(() => {
          reject([])
        })
    })
  }

  async getUserOverdueTasks() {
    return new Promise((resolve, reject) => {
      let userService = this.injector.get(UserService);
      userService.getUserOverdueTasks()
        .then((res) => {
          res['tasks'] = res['tasks'].filter((task)=> {
            return task._group != null
          })
          resolve(res['tasks'])
        })
        .catch(() => {
          reject([])
        })
    })
  }

  private markOverdueTasks() {
    this.overdueTasks = this.overdueTasks.map(task => {
      task.overdue = true;
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
      dialogRef = this.utilityService.openPostDetailsFullscreenModal(this.post, this.userData?._private_group?._id, canOpen, this.columns);
    } else {
      // for subtasks it is not returning the parent information, so need to make a workaround
      if (this.post.task._parent_task && !this.post.task._parent_task._id) {
          await this.publicFunctions.getPost(this.post.task._parent_task).then(post => {
            this.post.task._parent_task = post;
          });
      }
      dialogRef = this.utilityService.openPostDetailsFullscreenModal(this.post, this.userData?._private_group?._id, canOpen);
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
    let index = this.overdueAndTodayTasks.findIndex((t: any) => t._id === task._id);
    if (index !== -1) {
      this.overdueAndTodayTasks[index] = task;
    }

    index = this.thisWeekTasks.findIndex((t: any) => t._id === task._id);
    if (index !== -1) {
      this.thisWeekTasks[index] = task;
    }
    this.markOverdueTasks();
  }

  onDeleteTask(deletedTaskId) {
      // Find the index of the tasks inside the section
      let indexTask = this.overdueAndTodayTasks.findIndex((task: any) => task._id === deletedTaskId);
      if (indexTask != -1) {
        this.overdueAndTodayTasks.splice(indexTask, 1);
        return;
      }

      indexTask = this.thisWeekTasks.findIndex((task: any) => task._id === deletedTaskId);
      if (indexTask != -1) {
        this.thisWeekTasks.splice(indexTask, 1);
        return;
      }

      indexTask = this.nextWeekTasks.findIndex((task: any) => task._id === deletedTaskId);
      if (indexTask != -1) {
        this.nextWeekTasks.splice(indexTask, 1);
        return;
      }

      indexTask = this.futureTasks.findIndex((task: any) => task._id === deletedTaskId);
      if (indexTask != -1) {
        this.futureTasks.splice(indexTask, 1);
        return;
      }
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
    return (date) ? moment.utc(date).format("MMM D, YYYY") : '';
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return !(JSON.stringify(object) === JSON.stringify({}))
  }
}
