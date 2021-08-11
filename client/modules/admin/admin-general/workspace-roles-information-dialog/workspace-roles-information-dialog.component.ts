import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-workspace-roles-information-dialog',
  templateUrl: './workspace-roles-information-dialog.component.html',
  styleUrls: ['./workspace-roles-information-dialog.component.scss']
})
export class WorkspaceRolesInformationDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
}
