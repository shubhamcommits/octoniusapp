import { Component, OnInit, Inject, Injector } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-holiday-rejection-dialog',
  templateUrl: './holiday-rejection-dialog.component.html',
  styleUrls: ['./holiday-rejection-dialog.component.scss']
})
export class HolidayRejectionDialogComponent implements OnInit {

  rejectionDescription = '';

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);
  constructor(
      private injector: Injector,
      @Inject(MAT_DIALOG_DATA) public data: any,
      private mdDialogRef: MatDialogRef<HolidayRejectionDialogComponent>
    ) {}

  async ngOnInit() {
    
  }

  closeDialog() {
    this.mdDialogRef.close();
  }

  confirmHoliday() {
    this.mdDialogRef.close(this.rejectionDescription);
  }
}
