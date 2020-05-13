import { Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent implements OnInit {

  constructor() { }

  // Date Model Variable
  model: NgbDateStruct;

  @Input('dueDate') dueDate: Date;

  // Output date event emitter
  @Output('date') date = new EventEmitter();

  selectedDate: Date;

  ngOnInit() {
    if (this.dueDate){
      this.selectedDate = this.dueDate;
    }
    else{
      this.selectedDate = new Date();
    }
  }

  /**
   * This function is binded to the event change of @constant model
   * @param dateObject 
   */
  emitDate(dateObject: any){

    // Emit the date to the other components
    this.selectedDate = new Date(dateObject.year, dateObject.month - 1, dateObject.day)
    this.date.emit(dateObject)
  }

}
