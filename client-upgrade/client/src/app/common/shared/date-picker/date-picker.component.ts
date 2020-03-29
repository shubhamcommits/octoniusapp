import { Component, OnInit, Output, EventEmitter} from '@angular/core';
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

  // Output date event emitter
  @Output('date') date = new EventEmitter();

  ngOnInit() {
  }

  /**
   * This function is binded to the event change of @constant model
   * @param dateObject 
   */
  emitDate(dateObject: any){

    // Emit the date to the other components
    this.date.emit(dateObject)
  }

}
