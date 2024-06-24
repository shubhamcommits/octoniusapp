import { Component, OnInit, Injector, OnDestroy, Inject, AfterViewInit } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment/moment';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PortfolioService } from 'src/shared/services/portfolio-service/portfolio.service';
import { SubSink } from 'subsink';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-portfolio-user-workload-dialog',
  templateUrl: './portfolio-user-workload-dialog.component.html',
  styleUrls: ['./portfolio-user-workload-dialog.component.scss']
})
export class PortfolioUserWorkloadDialogComponent implements OnInit, OnDestroy {

  portfolioId;

  todayTasks: any = [];
  thisWeekTasks: any = [];
  nextWeekTasks: any = [];
  futureTasks: any = [];
  overdueTasks: any = [];
  overdueAndTodayTasks: any = [];

  userData: any;

  post: any;

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector)

  columns;

  isLoading$ = new BehaviorSubject(false);

  private subSink = new SubSink();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdDialogRef: MatDialogRef<PortfolioUserWorkloadDialogComponent>,
    private injector: Injector,
    private portfolioService: PortfolioService,
    public utilityService: UtilityService,
  ) {
  }

  async ngOnInit() {

    this.isLoading$.next(true);

    this.portfolioId = this.data.portfolioId;
    this.userData = await this.publicFunctions.getOtherUser(this.data.userId);

    await this.loadTasks();
    this.overdueAndTodayTasks = await this.sortTasksByPriority(this.overdueTasks.concat(this.todayTasks));

    this.isLoading$.next(false);
  }

  ngOnDestroy() {
    this.subSink.unsubscribe();
  }

  async loadTasks() {
    this.todayTasks = this.filterRAGTasks(await this.getUserTodayTasks());
    this.thisWeekTasks = this.filterRAGTasks(await this.getUserThisWeekTasks());
    this.overdueTasks = this.filterRAGTasks(await this.getUserOverdueTasks());
    this.nextWeekTasks = this.filterRAGTasks(await this.getUserNextWeekTasks());
    this.futureTasks = this.filterRAGTasks(await this.getUserFutureTasks());

    this.markOverdueTasks();
  }

  filterRAGTasks(tasks) {
    let tasksTmp = [];

    if (tasks) {
      // Filtering other tasks
      tasks.forEach(async task => {
        if (task?.permissions && task?.permissions?.length > 0) {
          const canEdit = await this.utilityService.canUserDoTaskAction(task, this.userData?._private_group, this.userData, 'edit');
          let canView = false;
          if (!canEdit) {
            const hide = await this.utilityService.canUserDoTaskAction(task, this.userData?._private_group, this.userData, 'hide');
            canView = await this.utilityService.canUserDoTaskAction(task, this.userData?._private_group, this.userData, 'view') || !hide;
          }

          if (canEdit || canView) {
            task.canView = true;
            tasksTmp.push(task);
          }
        } else {
          task.canView = true;
          tasksTmp.push(task);
        }
      });
    }

    return tasksTmp;
  }

  formateDate(date) {
    return (date) ? moment.utc(date).format("MMM D, YYYY") : '';
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

  async getUserTodayTasks() {
    return new Promise((resolve, reject) => {
      this.portfolioService.getUserTodayTasks(this.portfolioId, this.userData?._id)
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
      this.portfolioService.getUserThisWeekTasks(this.portfolioId, this.userData?._id)
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
      this.portfolioService.getUserNextWeekTasks(this.portfolioId, this.userData?._id)
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
      this.portfolioService.getUserFutureTasks(this.portfolioId, this.userData?._id)
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
      this.portfolioService.getUserOverdueTasks(this.portfolioId, this.userData?._id)
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

  closeDialog() {
    this.mdDialogRef.close();
  }
}
