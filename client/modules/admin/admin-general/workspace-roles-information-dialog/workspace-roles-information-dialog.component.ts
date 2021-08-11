import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';

@Component({
  selector: 'app-workspace-roles-information-dialog',
  templateUrl: './workspace-roles-information-dialog.component.html',
  styleUrls: ['./workspace-roles-information-dialog.component.scss']
})
export class WorkspaceRolesInformationDialogComponent {

  customFields = [];

  showNewCustomField = false;
  newCustomFieldTitle = '';

  workspaceData;

  @Output() customFieldsEvent = new EventEmitter();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
}
