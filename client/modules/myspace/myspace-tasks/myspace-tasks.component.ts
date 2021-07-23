import { Component, OnInit, Injector, ViewChild, TemplateRef, Input, OnDestroy } from '@angular/core';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment/moment';

@Component({
  selector: 'app-myspace-tasks',
  templateUrl: './myspace-tasks.component.html',
  styleUrls: ['./myspace-tasks.component.scss']
})
export class MyspaceTasksComponent implements OnInit, OnDestroy {

  @Input() isIdeaModuleAvailable;

  // Modal Content
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  todayTasks: any = [];
  thisWeekTasks: any = [];
  nextWeekTasks: any = [];
  futureTasks: any = [];
  overdueTasks: any = [];
  overdueAndTodayTasks: any = [];

  userData: any

  post: any;

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector)

  columns;

  constructor(
    private injector: Injector,
    private utilityService: UtilityService,
    private modal: NgbModal,
  ) { }

  async ngOnInit() {

    // Fetch the current user
    this.userData = await this.publicFunctions.getCurrentUser();

    await this.loadTasks();
    this.overdueAndTodayTasks = this.sortTasksByPriority(this.overdueTasks.concat(this.todayTasks));

    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'home'
    })
  }

  ngOnDestroy() {
    this.utilityService.closeAllModals()
  }

  async loadTasks() {
    this.todayTasks = await this.getUserTodayTasks();
    this.thisWeekTasks = await this.getUserThisWeekTasks();
    this.overdueTasks = await this.getUserOverdueTasks();
    this.nextWeekTasks = await this.getUserNextWeekTasks();
    this.futureTasks = await this.getUserFutureTasks();

    this.markOverdueTasks();
  }

  formateDate(date){
    return date ? moment.utc(date).format("MMM D, YYYY") : '';
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return !(JSON.stringify(object) === JSON.stringify({}))
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
    if (this.post.type === 'task' && !this.post.task._parent_task) {
      await this.publicFunctions.getAllColumns(this.post._group._id).then(data => this.columns = data);
      dialogRef = this.utilityService.openCreatePostFullscreenModal(this.post, this.userData, this.post._group._id, this.isIdeaModuleAvailable, this.columns);
    } else {
      // for subtasks it is not returning the parent information, so need to make a workaround
      if (this.post.task._parent_task && !this.post.task._parent_task._id) {
          await this.publicFunctions.getPost(this.post.task._parent_task).then(post => {
            this.post.task._parent_task = post;
          });
      }
      dialogRef = this.utilityService.openCreatePostFullscreenModal(this.post, this.userData, this.post._group._id, this.isIdeaModuleAvailable);
    }

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
}
