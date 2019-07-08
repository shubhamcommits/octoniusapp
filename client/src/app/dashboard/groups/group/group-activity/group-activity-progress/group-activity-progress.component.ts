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

  pendingToDoTaskCount = 0;
  pendingInProgressTaskCount = 0;
  completedTaskCount = 0;

  completedTasks: any = [];
  pendingTasks: any = [];

  allColumns: any = [];
  taskCount = [];
  columnPercent = [];
  totalTasks;

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
    await this.getTasks();
    this.initColumns();
    this.getAllColumns();
    this.groupService.taskStatusChanged
    .subscribe(() => {
      this.getTasks();
    });
    }

  getTasks() {
    this.isLoading$.next(true);
    this.groupService.getPulseTotalNumTasks(this.group._id)
    // this.groupService.getGroupTasks(this.group._id)
    .subscribe((res) => {
      this.pendingTasks = res['posts'];
      this.totalTasks = res['numTasks'];
      for(var i=0; i<this.allColumns.length; i++){
        this.taskCount[this.allColumns[i]['title']] = 0;
      }
      for(var i=0; i<this.pendingTasks.length; i++){
        this.taskCount[this.pendingTasks[i]['task']['status']]++;
      }
      for(var i=0; i<this.allColumns.length; i++){
        //console.log(this.taskCount[this.allColumns[i]['title']]);
        // this.totalTasks+=this.taskCount[this.allColumns[i]['title']];
         this.updateColumnNumber(this.allColumns[i]['title'],this.taskCount[this.allColumns[i]['title']]);
      }
      this.getAllColumns();

      for(var i=0; i<this.allColumns.length; i++){
        this.columnPercent[this.allColumns[i]['title']] = Math.round(this.taskCount[this.allColumns[i]['title']]/this.totalTasks*100);
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
     if(res != null){
      this.allColumns = res.columns;
     }
    });
  }

  updateColumnNumber(columnName, numberOfTasks){
    this.columnService.editColumnNumber(this.group._id, columnName, numberOfTasks).subscribe((res) => {
      //console.log('column number updated');
    });
  }

}
