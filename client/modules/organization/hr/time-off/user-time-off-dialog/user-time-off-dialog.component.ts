import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-user-time-off-dialog',
  templateUrl: './user-time-off-dialog.component.html',
  styleUrls: ['./user-time-off-dialog.component.scss']
})
export class UserTimeOffDialogComponent implements OnInit {

  userId;

  constructor(
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdDialogRef: MatDialogRef<UserTimeOffDialogComponent>
  ) {
    this.userId = this.data.userId;
  }

  async ngOnInit() {
  }

  closeDialog() {
    // Close the modal
    this.mdDialogRef.close();
  }
}
