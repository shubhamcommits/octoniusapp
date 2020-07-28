import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

export interface DialogData {
  field: string;
}

interface Field {
  title: string;
  name: string;
  values: string[];
}

@Component({
  selector: 'app-add-column-property-dialog',
  templateUrl: './add-column-property-dialog.component.html',
  styleUrls: ['./add-column-property-dialog.component.scss']
})
export class AddColumnPropertyDialogComponent implements OnInit {

  fields: Field[] = [];

  constructor(
    public dialogRef: MatDialogRef<AddColumnPropertyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {}

    ngOnInit() {
      this.fields = [
        {name: 'status', title: 'Status', values: ['to do', 'in progress', 'done']}
      ];
    }

    onNoClick(): void {
      this.dialogRef.close();
    }
}
