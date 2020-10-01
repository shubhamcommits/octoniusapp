import { Component, OnInit, Input, Output, EventEmitter, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-task-status',
  templateUrl: './task-status.component.html',
  styleUrls: ['./task-status.component.scss']
})
export class TaskStatusComponent implements OnInit {

  constructor(
    private injector: Injector
  ) { }

  // Post Variable as the input object
  @Input('post') post: any;

  // Move Task Output Emitter
  @Output('status') status = new EventEmitter();

  // Public Functions
  publicFunctions = new PublicFunctions(this.injector)

  ngOnInit() {
  }

  /**
   * This function is used to change the status of a task post
   * @param status 
   */
  changeStatus(status: string){

    // Change the task status
    this.publicFunctions.changeTaskStatus(this.post._id, status)

    // Emit the status to other parent components
    this.status.emit(status)
  }

  changeTaskStatus(postId: string){

  }

}
