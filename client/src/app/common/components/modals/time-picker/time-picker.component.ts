import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {PostService} from "../../../../shared/services/post.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import  moment from 'moment';

@Component({
  selector: 'time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss']
})
export class TimePickerComponent implements OnInit, OnDestroy {

  @Input('model_time') model_time;
  @Output('picked_time') picked_time = new EventEmitter();

  // modal reference
  timeModalRef;

  ngUnsubscribe = new Subject();
  selected = false;


  constructor(private postService: PostService, private modalService: NgbModal) { }

  ngOnInit() {
    if (!this.model_time) {
      const dateObj = moment();
      this.model_time = {hour: dateObj.hour(), minute: dateObj.minute()};
    }
  }

  onTimeSelected() {
    this.selected = true;
    this.picked_time.emit(this.model_time);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }


}
