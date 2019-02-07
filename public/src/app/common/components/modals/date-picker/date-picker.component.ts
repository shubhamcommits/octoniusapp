import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
export class DatePickerComponent implements OnInit, OnDestroy {

  model_date;
  isItMyWorkplace = false;

  // to unsubscribe the observables
  ngUnsubscribe = new Subject();

  modalRef;

  @ViewChild('dateContent') dateContent;

  constructor(private postService: PostService, private modalService: NgbModal) { }

  ngOnInit() {
    // subscribe to clicks to open the datepicker modal
    this.postService.openDatePicker
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((values: any) => {
        // when someone clicked, we display the modal
        this.openDatePickerModal(values.options);
        // set the date as the date the user picked before (when we are editing a post)
        // if we are not editing a post, we use today
        this.model_date = values.model_date || {year: (new Date()).getFullYear(), month: (new Date()).getMonth() + 1, day: (new Date()).getDate()};
        this.isItMyWorkplace = values.isItMyWorkplace || false;
      });
  }

  openDatePickerModal(options?) {
    this.modalRef = this.modalService.open(this.dateContent, options);
  }

  onDateSelected() {
    //  send back the date to the component that opened the datepicker
    this.postService.datePicked.next(this.model_date);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
