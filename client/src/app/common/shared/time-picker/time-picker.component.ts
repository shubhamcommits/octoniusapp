import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss']
})
export class TimePickerComponent implements OnInit {

  constructor() { }

  // Time Modal
  @Input('time') timeModal = { hour: 13, minute: 30 };

  @Input() canEdit = true;

  // Output time event emitter
  @Output('time') time = new EventEmitter();

  // Meridian variable
  meridian = true;

  // Show Picker State
  showPicker = false;

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
