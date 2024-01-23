import { Component, EventEmitter, Inject, OnChanges, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-time-tracker-dates-filter-dialog',
  templateUrl: './time-tracker-dates-filter-dialog.component.html',
  styleUrls: ['./time-tracker-dates-filter-dialog.component.scss']
})
export class TimeTrackerDatesFilterDialogComponent implements OnChanges {

  @Output() closeEvent = new EventEmitter();

  startDate: any;
  endDate: any;

  constructor(
    public utilityService: UtilityService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdDialogRef: MatDialogRef<TimeTrackerDatesFilterDialogComponent>
  ) {
    if (!!this.data) {
      if (!!this.data.startDate) {
        this.startDate = this.data.startDate;
      }

      if (!!this.data.endDate) {
        this.endDate = this.data.endDate;
      }
    }
  }

  ngOnChanges(): void {
  }

  closeDialog() {
    // Close the modal
    this.mdDialogRef.close();
  }

  /**
   * This function is responsible for receiving the date from @module <app-date-picker></app-date-picker>
   * @param dateObject
   */
  getDate(dateObject: any, property: string) {
    if (property == 'start_date') {
      if (dateObject) {
        this.startDate = dateObject.toDate();
      } else {
        this.startDate = null;
      }
    }

    if (property == 'end_date') {
      if (dateObject) {
        this.endDate = dateObject.toDate();
      } else {
        this.endDate = null;
      }
    }
// console.log(dateObject);
// console.log(dateObject.toDate());
    this.closeEvent.emit({
      startDate: this.startDate,
      endDate: this.endDate
    });
  }
}
