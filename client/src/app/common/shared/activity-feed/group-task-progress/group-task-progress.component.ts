import { Component, OnInit, Injector, Input } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-group-task-progress',
  templateUrl: './group-task-progress.component.html',
  styleUrls: ['./group-task-progress.component.scss']
})
export class GroupTaskProgressComponent implements OnInit {

  constructor(
    private _Injector: Injector
  ) { }

  // Group ID as the input parameter
  @Input('groupId') groupId: any;

  // My workplace variable check
  @Input('myWorkplace') myWorkplace = false;

  // Total tasks count
  totalTasksCount: any = 0;

  // To do tasks count
  todoTasksCount: any = 0;

  // In progress tasks count
  inprogressTasksCount: any = 0;

  // Done tasks count
  doneTasksCount: any = 0;

  // Undone tasks count
  undoneTasksCount: any = 0;

  percentageTodo: number;

  percentageInProgress: number;

  percentageDone: number;

  // Public functions object
  publicFunctions = new PublicFunctions(this._Injector)

  ngOnInit(){
    new Promise((resolve, reject)=>{
      this.fetchData().then(()=>{
        resolve({});
      }).catch((err)=>{
        reject();
      })
    })

  }

  async fetchData(){
    // Total Tasks
    this.totalTasksCount = await this.publicFunctions.getTasksThisWeekCount(this.groupId)

    // To Do Tasks
    this.todoTasksCount = await this.publicFunctions.getTasksThisWeekCount(this.groupId, 'to do')

    // In Progress Tasks
    this.inprogressTasksCount = await this.publicFunctions.getTasksThisWeekCount(this.groupId, 'in progress')

    // Done Tasks
    this.doneTasksCount = this.totalTasksCount - (this.todoTasksCount +  this.inprogressTasksCount)

    // Get Undone Tasks
    this.undoneTasksCount = await this.publicFunctions.getUndoneTasksThisWeek(this.groupId)

    this.percentageTodo = this.todoTasksCount/this.totalTasksCount * 100;
    this.percentageInProgress = this.inprogressTasksCount/this.totalTasksCount * 100;
    this.percentageDone = this.doneTasksCount/this.totalTasksCount * 100;
  }


}
