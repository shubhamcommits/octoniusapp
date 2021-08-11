import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import moment from 'moment/moment';

@Component({
  selector: 'app-user-availability-day-dialog',
  templateUrl: './user-availability-day-dialog.component.html',
  styleUrls: ['./user-availability-day-dialog.component.scss']
})
export class UserAvailabilityDayDialogComponent implements OnInit {

  @Output() datesSavedEvent = new EventEmitter();

  userId: string;
  selectedDays: any = []

  selectedReason = '';
  outOfOfficeReason = ['Holidays', 'Sick', 'Personal day'];

  constructor(
    private utilityService: UtilityService,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdDialogRef: MatDialogRef<UserAvailabilityDayDialogComponent>
  ) { }

  ngOnInit(): void {
    this.selectedDays = this.data.selectedDays;
    this.userId = this.data.userId;
  }

  onSelectedReasonChange(event: Event, reason: string) {
    this.selectedReason = reason;

  }

  async confirmDays() {
    await this.utilityService.asyncNotification($localize`:@@userAvailabilityDAyDialog.pleaseWaitSavingDays:Please wait we are saving your days...`, new Promise((resolve, reject) => {
      const days = this.selectedDays.map(day => {
        return {
          date: day.date ? moment(day.date).format("YYYY-MM-DD"):null,
          type: (this.selectedReason == 'personal day') ? 'personal' : this.selectedReason,
          approved: true // TODO - this needs to be dynamic and aproved by manager
        }
      });

      this.userService.saveOutOfTheOfficeDays(this.userId, days, 'add').then((res) => {
          this.datesSavedEvent.emit(days);

          this.closeDialog();

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@userAvailabilityDAyDialog.daysSaved:Days saved!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@userAvailabilityDAyDialog.unableToSaveDates:Unable to save the dates, please try again!`));
        });
    }));
  }

  closeDialog() {
    // Close the modal
    this.mdDialogRef.close();
  }

}
