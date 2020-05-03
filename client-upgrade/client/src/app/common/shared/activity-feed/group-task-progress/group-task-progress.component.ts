import { Component, OnInit, Injector, Input } from '@angular/core';
import { PublicFunctions } from 'src/app/dashboard/public.functions';

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

  // Public functions object
  publicFunctions = new PublicFunctions(this._Injector)

  async ngOnInit() {

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

  }


}
