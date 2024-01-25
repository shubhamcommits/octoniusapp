import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-time-input',
  templateUrl: './time-input.component.html',
  styleUrls: ['./time-input.component.scss']
})
export class TimeInputComponent implements OnInit {

  @Input() value = '';
  @Input() canEdit = true;
  
  // Output time event emitter
  @Output() timeEvent = new EventEmitter();

  @ViewChild('inputElement') inputElement: ElementRef;

  // SEPARATOR_CHARACTER = ':';

  constructor() { }

  ngOnInit() {
  }

  updateTime() {
    const splitValues = this.splitTime();
    let hours = (!!splitValues && !!splitValues.hours) ? splitValues.hours : '';
    let minutes = (!!splitValues && !!splitValues.minutes) ? splitValues.minutes : '';

    // Format and update the input field
    this.value = `${hours || '00'}:${minutes || '00'}`;
  }

  onBlurEvent() {
    const splitValues = this.splitTime();
    let hours = (!!splitValues && !!splitValues.hours) ? splitValues.hours : '';
    let minutes = (!!splitValues && !!splitValues.minutes) ? splitValues.minutes : '';;

    let hoursIntValue = parseInt(hours) || 0;
    let minutesIntValue = parseInt(minutes) || 0;
    if (!!minutes && minutesIntValue > 59) {
      minutes = this.padZero(minutesIntValue - 60);
      hours = this.padZero(hoursIntValue + 1);
    }
    // Format and update the input field
    this.value = `${hours || '00'}:${minutes || '00'}`;

    this.emitTime(this.value);
  }

  padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  private splitTime() {
    // Remove non-numeric characters
    let cleanedInput = this.value.replace(/\D/g, '');
    let cleanedInputInt = parseInt(cleanedInput);
    
    if (isNaN(cleanedInputInt)) {
      cleanedInputInt = 0;
    }

    cleanedInput = cleanedInputInt.toString();
    // Extract hours and minutes
    let hours = '';
    let minutes = '';
    switch (cleanedInput.length) {
      case 1:
        hours = '00';
        minutes = '0' + cleanedInput;
        break;
      case 3:
        hours = '0' + cleanedInput.slice(0, 1);
        minutes = cleanedInput.slice(1);
        break;
      default:
        hours = cleanedInput.slice(0, cleanedInput.length - 2);
        const index = (!!hours) ? hours.indexOf('00'): -1;
        if (!!hours && index >= 0) {
          hours = hours.slice(index, index + 3);
        }
        minutes = cleanedInput.slice(cleanedInput.length - 2);
        break;
    }

    return {
      hours: hours,
      minutes: minutes
    };
  }

  /**
   * This function is binded to the event change of @constant model
   * @param timeObject
   */
  emitTime(timeObject?: any){

    // Emit the time to the other components
    this.timeEvent.emit((timeObject) ? timeObject : this.value);
  }
}
