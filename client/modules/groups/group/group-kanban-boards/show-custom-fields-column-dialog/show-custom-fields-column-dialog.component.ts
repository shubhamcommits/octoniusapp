import { Component, EventEmitter, Inject, OnChanges, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ColumnService } from 'src/shared/services/column-service/column.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-show-custom-fields-column-dialog',
  templateUrl: './show-custom-fields-column-dialog.component.html',
  styleUrls: ['./show-custom-fields-column-dialog.component.scss']
})
export class ShowCustomFieldsColumnDialogComponent implements OnInit {

  @Output() customFieldsUpdatedEvent = new EventEmitter();

  column: any;
  customFields = [];

  constructor(
    public utilityService: UtilityService,
    private columnService: ColumnService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdDialogRef: MatDialogRef<ShowCustomFieldsColumnDialogComponent>
  ) {
    this.column = this.data.column;
    this.customFields = this.data.customFields;
  }

  ngOnInit(): void {
    this.customFields.forEach(cf => {
      if (this.column && this.column.custom_fields_to_show_kanban
          && this.column.custom_fields_to_show_kanban.findIndex(field => field == cf.name) >= 0) {
        cf.showInColumn = true;
      } else {
        cf.showInColumn = false;
      }
    });
  }

  showCFInColumn(cf: any) {
    this.utilityService.asyncNotification($localize`:@@showCustomFieldsColumnDialog.pleaseWaitWeUpdateColumn:Please wait we are updating the column...`, new Promise((resolve, reject) => {
      this.columnService.displayCustomFieldInColumn(this.column._id, !cf.showInColumn, cf.name)
        .then((res) => {
          this.column.custom_fields_to_show_kanban = res.column.custom_fields_to_show_kanban;
          this.customFieldsUpdatedEvent.emit(this.column);

          resolve(this.utilityService.resolveAsyncPromise($localize`:@@showCustomFieldsColumnDialog.columnpdated:Column updated!`));
        })
        .catch((err) => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@showCustomFieldsColumnDialog.unableToUpdateColumn:Unable to update the column at the moment, please try again!`))
        });
    }));
  }

  closeDialog() {
    // Close the modal
    this.mdDialogRef.close();
  }
}
