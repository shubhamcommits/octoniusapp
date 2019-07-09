import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import moment from "moment";
import {BehaviorSubject} from "rxjs";
import {GroupService} from "../../../../../shared/services/group.service";
import {ColumnService} from '../../../../../shared/services/column.service';
import {Column} from '../../../../../shared/models/column.model';

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

  // number of tasks
  totalTasks = 0;
  todoTasks = 0;
  inProgressTasks = 0;
  doneTasks = 0;

  // task percentage
  todoPercent = 0;
  inProgressPercent = 0;
  donePercent = 0;

  bgColor = [
    '#fd7714',
    '#0bc6a0',
    '#4a90e2',
    '#d46a6a',
    '#b45a81',
    '#674f91',
    '#4e638e',
    '#489074',
    '#4b956f',
    '#a7c763',
    '#d4cb6a',
    '#d49b6a',
    '#d4746a'
  ];

  constructor(private groupService: GroupService, private columnService: ColumnService) { }

  async ngOnInit() {
    //this.allColumns.length = 0;
    // await this.getTasks();
    await this.getPulseTotalNumTasks();
    await this.getPulseNumTodoTasks();
    await this.getPulseNumInProgressTasks();
    await this.getPulseNumDoneTasks();
    this.groupService.taskStatusChanged
    .subscribe(() => {
      // this.getTasks();
      this.getPulseTotalNumTasks();
      this.getPulseNumTodoTasks();
      this.getPulseNumInProgressTasks();
      this.getPulseNumDoneTasks();
    });
    }


  /***
   * get total tasks number of the group
   */
  getPulseTotalNumTasks () {
    return new Promise((resolve, reject) => {
      this.groupService.getPulseTotalNumTasks(this.group._id)
        .subscribe((res) => {
          this.totalTasks = (res['numTasks']);
          resolve();
        }, (err) => {
          reject();
        });
    });
  }

  getPulseNumTodoTasks () {
    return new Promise((resolve, reject) => {
      this.groupService.getPulseNumTodoTasks(this.group._id)
        .subscribe((res) => {
          this.todoTasks = (res['numTasks']);
          this.todoPercent = Math.round(this.todoTasks / this.totalTasks * 100);
          resolve();
        }, (err) => {
          reject();
        });
    });
  }

  getPulseNumInProgressTasks () {
    return new Promise((resolve, reject) => {
      this.groupService.getPulseNumInProgressTasks(this.group._id)
        .subscribe((res) => {
          this.inProgressTasks = (res['numTasks']);
          this.inProgressPercent = Math.round(this.inProgressTasks / this.totalTasks * 100);
          resolve();
        }, (err) => {
          reject();
        });
    });
  }

  getPulseNumDoneTasks () {
    return new Promise((resolve, reject) => {
      this.groupService.getPulseNumDoneTasks(this.group._id)
        .subscribe((res) => {
          this.doneTasks = (res['numTasks']);
          this.donePercent = Math.round(this.doneTasks / this.totalTasks * 100);
          resolve();
        }, (err) => {
          reject();
        });
    });
  }

}
