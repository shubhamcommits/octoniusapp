import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {PostService} from "../../../../shared/services/post.service";
import {Subject} from "rxjs/Subject";
import {takeUntil} from "rxjs/operators";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import * as moment from 'moment';

@Component({
  selector: 'date-picker-modal',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent implements OnInit {

  @Input('model_date') model_date;
  @Output('picked_date') picked_date = new EventEmitter();

  modalRef;

  constructor(private modalService: NgbModal) { }

  ngOnInit() {
    if (!this.model_date) {
      console.log('make new date');
      const dateObj = moment();
      this.model_date = {year: dateObj.year(), month: dateObj.month(), day: dateObj.date()};
    }
  }

  openDatePicker(dateContent) {
    this.modalRef = this.modalService.open(dateContent, {centered: true});
  }

  onDateSelected() {
    //  send back the date to the component that opened the datepicker
    this.picked_date.emit(this.model_date);
  }
}
