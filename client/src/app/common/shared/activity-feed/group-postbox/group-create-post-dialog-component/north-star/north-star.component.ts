import { Component, OnInit, Input, EventEmitter, Output, ChangeDetectionStrategy, Injector } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-north-star',
  templateUrl: './north-star.component.html',
  styleUrls: ['./north-star.component.scss'],
  providers:[CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NorthStarComponent implements OnInit {

  @Input() isNorthStar = false;
  @Input() northStar;

  @Output() saveInitialNorthStarEmitter = new EventEmitter();
  @Output() addProgressNorthStarEmitter = new EventEmitter();

  types = ['Currency $', 'Currency €', 'Percent', 'Number'];
  status_types = ['NOT STARTED', 'ON TRACK', 'IN DANGER', 'ACHIEVED'];
  updatingInitialValues = false;
  updateProgress = false;

  currentUser;

  initialValue = 0;

  newValue = {
    date: Date.now(),
    value: 0,
    status: 'NOT STARTED',
    _user: ''
  }

  status_class = '';

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector)

  constructor(
    private currencyPipe : CurrencyPipe,
    private injector: Injector) { }

  async ngOnInit() {

    await this.publicFunctions.getCurrentUser().then(user => this.currentUser = user);

    if (this.isNorthStar) {
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
      status: this.northStar.values[this.northStar.values.length - 1].status,
      _user: this.currentUser._id
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
      status: 'NOT STARTED',
      _user: this.currentUser._id
    }
    this.saveInitialNorthStarEmitter.emit(this.northStar);
  }

  addUpdateProgress() {
    this.updateProgress = false;
    this.northStar.values.push(this.newValue);
    this.addProgressNorthStarEmitter.emit(this.northStar);
  }
}
