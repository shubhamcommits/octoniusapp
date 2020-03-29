import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss']
})
export class TimePickerComponent implements OnInit {

  constructor() { }

  time = { hour: 13, minute: 30 };

  meridian = true;

  showPicker: boolean = false;

  ngOnInit() {
  }
}
