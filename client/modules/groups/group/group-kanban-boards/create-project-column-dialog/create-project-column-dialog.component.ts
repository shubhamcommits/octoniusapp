import { Component, EventEmitter, Inject, OnChanges, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import moment from 'moment';
import { ColumnService } from 'src/shared/services/column-service/column.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-create-project-column-dialog',
  templateUrl: './create-project-column-dialog.component.html',
  styleUrls: ['./create-project-column-dialog.component.scss']
})
export class CreateProjectColumnDialogComponent implements OnChanges {

  @Output() closeEvent = new EventEmitter();

  column: any;
  startDate: any;
  dueDate: any;

  constructor(
    public utilityService: UtilityService,
    private columnService: ColumnService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdDialogRef: MatDialogRef<CreateProjectColumnDialogComponent>
  ) {
    this.column = this.data.column;
  }

  ngOnChanges(): void {
    this.column.projectType = this.column?.projectType || true;
    this.startDate = this.column?.start_date;
    this.dueDate = this.column?.due_date;
  }

  changeColumnProjectType(selected) {
    this.utilityService.asyncNotification('Please wait we are creating a project from your column...', new Promise((resolve, reject) => {
      this.columnService.changeColumnProjectType(this.column._id, selected.checked)
        .then((res) => {
          this.column.project_type = selected.checked;
          resolve(this.utilityService.resolveAsyncPromise('Column type changed!'));
        })
        .catch((err) => {
          this.column.project_type = selected.checked;
          reject(this.utilityService.rejectAsyncPromise('Unable to change the column type at the moment, please try again!'))
        })
    }));
  }

  cancel() {
    // Close the modal
    this.mdDialogRef.close();
  }

  saveColumnProjectDates() {
    if (this.startDate && this.dueDate) {
      this.utilityService.asyncNotification('Please wait we are saving your project dates...', new Promise((resolve, reject) => {
        this.columnService.saveColumnProjectDates(this.column?._id, this.startDate, this.dueDate)
          .then((res) => {
            this.column.start_date = moment(this.startDate).hours(12).format('YYYY-MM-DD');
            this.column.due_date = moment(this.dueDate).hours(12).format('YYYY-MM-DD');

            // Close the modal
            this.closeEvent.emit(this.column);
            this.mdDialogRef.close();

            resolve(this.utilityService.resolveAsyncPromise('Project Saved!'));
          })
          .catch((err) => {
            reject(this.utilityService.rejectAsyncPromise('Unable to save the project at the moment, please try again!'))
          })
      }));
    } else {
      this.utilityService.infoNotification('Start and Due Dates must be selected!');
    }
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
        this.column.start_date = null;
      }
    }

    if (property == 'due_date') {
      if (dateObject) {
        this.dueDate = dateObject.toDate();
      } else {
        this.dueDate = null;
        this.column.due_date = null;
      }
    }
  }
}
