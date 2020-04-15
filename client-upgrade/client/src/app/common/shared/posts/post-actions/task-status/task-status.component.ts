import { Component, OnInit, Input, Output, EventEmitter, Injector } from '@angular/core';

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

  ngOnInit() {
  }

  /**
   * This function is used to change the status of a task post
   * @param status 
   */
  changeStatus(status: string){

    // Emit the status to other parent components
    this.status.emit(status)
  }

  changeTaskStatus(postId: string){

  }

}
