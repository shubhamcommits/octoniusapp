import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-north-star',
  templateUrl: './north-star.component.html',
  styleUrls: ['./north-star.component.scss'],
  providers:[CurrencyPipe]
})
export class NorthStarComponent implements OnInit {

  @Input() isNorthStar = false;
  @Input() northStar;

  @Output() transformIntoNorthStarEmitter = new EventEmitter();
  @Output() saveInitialNorthStarEmitter = new EventEmitter();
  @Output() addProgressNorthStarEmitter = new EventEmitter();

  types = ['Currency $', 'Currency €', 'Percent', 'Number'];
  status_types = ['NOT STARTED', 'ON TRACK', 'IN DANGER', 'ACHIEVED'];
  updatingInitialValues = false;
  updateProgress = false;

  initialValue = 0;

  newValue = {
    date: Date.now(),
    value: 0,
    status: 'NOT STARTED'
  }

  status_class = '';

  constructor(private currencyPipe : CurrencyPipe) { }

  ngOnInit() {
   if (this.northStar.target_value === 0) {
     this.updatingInitialValues = true;
   }
   if (this.northStar.values[this.northStar.values.length - 1]) {
    this.initialValue = this.northStar.values[this.northStar.values.length - 1].value;
    this.setStatusClass(this.northStar.values[this.northStar.values.length - 1].status);
   } else {
    this.initialValue = 0;
    this.setStatusClass('NOT STARTED');
   }
  }

  transformToNorthStart() {
    this.transformIntoNorthStarEmitter.emit();
  }

  changeType(type) {
  }

  changeStatus(status) {
    const newStatus = status.value;
    this.setStatusClass(status.value);
    this.northStar.status = newStatus;
  }

  openUpdateProgress() {
    this.updateProgress = !this.updateProgress;
    this.newValue = {
      date: Date.now(),
      value: this.northStar.values[this.northStar.values.length - 1].value,
      status: this.northStar.values[this.northStar.values.length - 1].status
    };
  }

  setStatusClass(status) {
    if (status === 'NOT STARTED') {
      this.status_class = 'not_started';
    } else if (status === 'ON TRACK') {
      this.status_class = 'on_track';
    } else if (status === 'IN DANGER') {
      this.status_class = 'in_danger';
    } else if (status === 'ACHIEVED') {
      this.status_class = 'achieved';
    }
  }

  saveInitial() {
    this.updatingInitialValues = false;
    this.northStar.values[0] = {
      date: this.northStar.values[0].date,
      value: this.initialValue,
      status: 'NOT STARTED'
    }
    this.saveInitialNorthStarEmitter.emit(this.northStar);
  }

  addUpdateProgress() {
    this.updateProgress = false;
    this.northStar.values.push(this.newValue);
    this.addProgressNorthStarEmitter.emit(this.northStar);
  }
}
