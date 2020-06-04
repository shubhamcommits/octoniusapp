import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-change-column',
  templateUrl: './change-column.component.html',
  styleUrls: ['./change-column.component.scss']
})
export class ChangeColumnComponent implements OnInit {

  constructor() { }

  // Post Input Variable
  @Input('post') post: any;

  // Columns Input Variable
  @Input('columns') columns: any;

  // Move Task Output Emitter
  @Output('moveTask') moveTask = new EventEmitter();

  ngOnInit() {
  }

  /**
   * This function replicates the functioanlity of CDK Drag and Drop Event
   * @param post 
   * @param oldColumn 
   * @param newColumn 
   * Hence emits an message to the parent when the task is moved from one column to another via dropdown
   */
  sendMoveTaskMessage(post: any, oldColumn: any, newColumn: any){

    // updating the task column status before emitting the message
    post.task._column.title = newColumn;

    // Emit the new task column state
    this.moveTask.emit({
      post, oldColumn, newColumn
    });
    
  }

}
