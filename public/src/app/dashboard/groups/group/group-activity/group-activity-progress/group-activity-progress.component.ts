import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import * as moment from "moment";
import {BehaviorSubject} from "rxjs/Rx";
import {GroupService} from "../../../../../shared/services/group.service";

@Component({
  selector: 'group-activity-progress',
  templateUrl: './group-activity-progress.component.html',
  styleUrls: ['./group-activity-progress.component.scss']
})
export class GroupActivityProgressComponent implements OnInit {

  @Input('group') group;
  @Input('isItMyWorkplace') isItMyWorkplace;
  @Input('user') user;

  isLoading$ = new BehaviorSubject(false);

  pendingToDoTaskCount = 0;
  pendingInProgressTaskCount = 0;
  completedTaskCount = 0;

  todoPercent = 0;
  inprogressPercent = 0;
  completedPercent = 0;
  completedTasks: any = [];
  pendingTasks: any = [];


  constructor(private groupService: GroupService) { }

  async ngOnInit() {
    await this.statusChanged();

    this.groupService.taskStatusChanged
      .subscribe(() => {
        this.statusChanged();
      });
  }

  async getPendingTasks() {
    return new Promise((resolve, reject) => {
      const getcurrentweek = moment(Date.now()).format('w');
      var taskDueToWeek: any = '';
      console.log(getcurrentweek);
      this.pendingToDoTaskCount = 0;
      this.pendingInProgressTaskCount = 0;
      this.isLoading$.next(true);
      this.groupService.getGroupTasks(this.group._id)
        .subscribe((res) => {
            this.pendingTasks = res['posts'];

            for(let i = 0; i < this.pendingTasks.length; i++){
              if(this.pendingTasks[i]['task']['status'] == 'to do'){
                taskDueToWeek = moment(this.pendingTasks[i]['task']['due_to']).format('w');
                if(taskDueToWeek === getcurrentweek) {
                  this.pendingToDoTaskCount++;
                }
              }
              if(this.pendingTasks[i]['task']['status'] == 'in progress'){
                taskDueToWeek = moment(this.pendingTasks[i]['task']['due_to']).format('w');

                if(taskDueToWeek === getcurrentweek){
                  this.pendingInProgressTaskCount++;
                }
              }
            }
            this.isLoading$.next(false);
            resolve();
          },
          (err) => {
            console.log('Error Fetching the Pending Tasks Posts', err);
            this.isLoading$.next(false);
            reject();
          });
    })
  }

  async getCompletedTasks() {
    return new Promise((resolve, reject) => {
      const getcurrentweek = moment(Date.now()).format('w');
      let taskDueToWeek: any = '';
      this.completedTaskCount = 0;
      this.isLoading$.next(true);
      this.groupService.getCompletedGroupTasks(this.group._id)
        .subscribe((res) => {
            this.completedTasks = res['posts'];
            console.log(this.completedTasks);
            for(var i = 0 ; i < this.completedTasks.length; i++){
              if(this.completedTasks[i]['task']['status'] == 'done'){
                taskDueToWeek = moment(this.completedTasks[i]['task']['due_to']).format('w');
                if(taskDueToWeek === getcurrentweek){
                  this.completedTaskCount++;
                }
              }

            }
            this.isLoading$.next(false);
            console.log('Completed Tasks Count', this.completedTaskCount);
            resolve();

          },
          (err) => {
            console.log('Error Fetching the Completed Tasks Posts', err);
            this.isLoading$.next(false);
            reject();
          });
    })
  }

  async statusChanged() {
    await this.getPendingTasks()
      .then( async () => {
        await this.getCompletedTasks()
          .then(async () => {
            this.todoPercent = Math.round(this.pendingToDoTaskCount/(this.pendingInProgressTaskCount+this.pendingToDoTaskCount+this.completedTaskCount)*100);
            this.inprogressPercent = Math.round(this.pendingInProgressTaskCount/(this.pendingInProgressTaskCount+this.pendingToDoTaskCount+this.completedTaskCount)*100);
            this.completedPercent = Math.round(this.completedTaskCount/(this.pendingInProgressTaskCount+this.pendingToDoTaskCount+this.completedTaskCount)*100);
          })
          .catch((err) => {
            console.log('Error while getting done tasks', err);
          })
          .catch((err) => {
            console.log('Error while getting pending tasks', err);
          })
      })
  }
}
