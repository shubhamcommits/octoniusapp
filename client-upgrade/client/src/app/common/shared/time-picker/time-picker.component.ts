import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss']
})
export class TimePickerComponent implements OnInit {

  constructor() { }

  // Time Modal
  timeModal = { hour: 13, minute: 30 };

  // Meridian variable
  meridian = true;

  // Output time event emitter
  @Output('time') time = new EventEmitter();

  ngOnInit() {
  }

  /**
   * This function is binded to the event change of @constant model
   * @param timeObject 
   */
  emitTime(timeObject: any){

    // Emit the time to the other components
    this.time.emit(timeObject)
  }
}
