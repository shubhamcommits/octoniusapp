import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import * as moment from "moment";
import {BehaviorSubject} from "rxjs/Rx";
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

  pendingToDoTaskCount = 0;
  pendingInProgressTaskCount = 0;
  completedTaskCount = 0;

  todoPercent = 0;
  inprogressPercent = 0;
  completedPercent = 0;
  completedTasks: any = [];
  pendingTasks: any = [];

  allColumns;
  taskCount = [];
  columnPercent = [];

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
    await this.getTasks();

    this.groupService.taskStatusChanged
      .subscribe(() => {
        this.getTasks();
      });
    this.getTasks();
    this.initColumns();
    this.getAllColumns();
    }

  getTasks() {
    this.isLoading$.next(true);
    this.groupService.getGroupTasks(this.group._id)
    .subscribe((res) => {
      this.pendingTasks = res['posts'];
      for(var i=0; i<this.allColumns.length; i++){
        this.taskCount[this.allColumns[i]['title']] = 0;
      }
      for(var i=0; i<this.pendingTasks.length; i++){
        this.taskCount[this.pendingTasks[i]['task']['status']]++;
      }
      for(var i=0; i<this.allColumns.length; i++){
        console.log(this.taskCount[this.allColumns[i]['title']]);
         this.updateColumnNumber(this.allColumns[i]['title'],this.taskCount[this.allColumns[i]['title']]);
      }
      this.getAllColumns();

      for(var i=0; i<this.allColumns.length; i++){
        this.columnPercent[this.allColumns[i]['title']] = Math.round(this.taskCount[this.allColumns[i]['title']]/this.pendingTasks.length*100);
      }

      this.isLoading$.next(false);
    },
    (err) => {
      console.log('Error Fetching the Pending Tasks Posts', err);
      this.isLoading$.next(false);
    });
  }

  initColumns(){
    this.columnService.initColumns(this.group._id).subscribe(() => {
      this.getAllColumns();
    });   
  }

  getAllColumns(){
    this.columnService.getAllColumns(this.group._id).subscribe((res: Column) => {
      this.allColumns = res.columns;
    }); 
  }

  updateColumnNumber(columnName, numberOfTasks){
    this.columnService.editColumnNumber(this.group._id, columnName, numberOfTasks).subscribe((res) => {
      console.log('column number updated');
    });
  }

}
