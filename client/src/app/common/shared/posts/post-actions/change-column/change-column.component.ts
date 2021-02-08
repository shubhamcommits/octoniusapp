import { Component, OnChanges, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-change-column',
  templateUrl: './change-column.component.html',
  styleUrls: ['./change-column.component.scss']
})
export class ChangeColumnComponent implements OnChanges {

  constructor() { }

  // Post Input Variable
  @Input('post') post: any;

  // Columns Input Variable
  @Input('columns') columns: any;

  // Move Task Output Emitter
  @Output('moveTask') moveTask = new EventEmitter();

  selectedColumn: any;

  ngOnChanges() {
    const columnInex = this.columns.findIndex(column => column._id == (this.post?.task?._column._id || this.post?.task?._column));
    this.selectedColumn = this.columns[columnInex];
  }

  /**
   * This function replicates the functioanlity of CDK Drag and Drop Event
   * @param post
   * @param oldColumn
   * @param newColumn
   * Hence emits an message to the parent when the task is moved from one column to another via dropdown
   */
  sendMoveTaskMessage(post: any, oldColumn: any, newColumn: any){

    this.selectedColumn = newColumn;

    // updating the task column status before emitting the message
    post.task._column = newColumn;

    // Emit the new task column state
    this.moveTask.emit({
      post, oldColumn, newColumn
    });

  }

}
