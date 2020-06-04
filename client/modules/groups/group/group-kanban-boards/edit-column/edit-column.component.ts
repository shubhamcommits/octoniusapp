import { Component, OnInit, Input, Output, EventEmitter  } from '@angular/core';

@Component({
  selector: 'app-edit-column',
  templateUrl: './edit-column.component.html',
  styleUrls: ['./edit-column.component.scss']
})
export class EditColumnComponent implements OnInit {

  constructor() { }

  // Column as the Input object
  @Input('column') column: any

  // New Column Variable
  newColumnName: any;

  // Output Created Column
  @Output('column') columnName = new EventEmitter();


  ngOnInit() {
  }

  /**
   * This function emits the column to the parent components
   */
  saveColumnName(){

    // Emit the Value
    this.columnName.emit(this.newColumnName)
  }

}
