import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PostService} from "../../../../shared/services/post.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs/Subject";

@Component({
  selector: 'time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss']
})
export class TimePickerComponent implements OnInit, OnDestroy {

  @ViewChild('timeContent') timeContent;

  // modal reference
  timeModalRef;

  ngUnsubscribe = new Subject();

  model_time;

  constructor(private postService: PostService, private modalService: NgbModal) { }

  ngOnInit() {
    this.postService.openTimePicker
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((values: any) => {
        //  when someone clicked we display the modal
        this.model_time = values.model_time;
        this.openTimePickerModal(values.options);

        //  set the time as the time the user picked before (when we are are editing the post)
        //  if we are not editing, we use the standard 13:30
        this.model_time = values.model_time || {hour: 13, minute: 30};
      });
  }

  openTimePickerModal(options) {
    this.timeModalRef = this.modalService.open(this.timeContent, options);
  }

  onTimeSelected() {
    this.postService.timePicked.next(this.model_time);
    this.timeModalRef.close();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
