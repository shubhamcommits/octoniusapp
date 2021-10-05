import { Component, OnInit, Output, EventEmitter  } from '@angular/core';

@Component({
  selector: 'app-create-table',
  templateUrl: 'create-table.component.html',
  styleUrls: ['create-table.component.scss']
})
export class CreateTableComponent implements OnInit {

  @Output() dataToSubmit = new EventEmitter<any>();


  rowCount:any;

  columnCount:any;
  constructor() { }

  ngOnInit(): void {
  }

  submitData(){
    this.dataToSubmit.emit({
      rowCount:this.rowCount,
      columnCount:this.columnCount
    })
  }

  onClose(){
    this.dataToSubmit.emit(null)
  }

}
