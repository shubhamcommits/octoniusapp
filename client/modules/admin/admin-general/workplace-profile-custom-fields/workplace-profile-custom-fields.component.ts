import { Component, OnInit, Input, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { AdminService } from 'src/shared/services/admin-service/admin.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { ProfileCustomFieldsDialogComponent } from './profile-custom-fields-dialog/profile-custom-fields-dialog.component';

@Component({
  selector: 'app-workplace-profile-custom-fields',
  templateUrl: './workplace-profile-custom-fields.component.html',
  styleUrls: ['./workplace-profile-custom-fields.component.scss']
})
export class WorkplaceProfileCustomFieldsComponent implements OnInit {

  @Input('workspaceData') workspaceData: any;
  @Input('userData') userData: any;

  isValidEmail = false;

  // Public functions class member
  publicFunctions = new PublicFunctions(this.injector);
  
  constructor(
    public dialog: MatDialog,
    private injector: Injector,
  ) { }

  ngOnInit() {
  }

  openProfileCustomFieldsDialog() {
    const dialogRef = this.dialog.open(ProfileCustomFieldsDialogComponent, {
      width: '100%',
      height: '100%',
      disableClose: true,
      data: { workspaceData: this.workspaceData }
    });
    const sub = dialogRef.componentInstance.customFieldsEvent.subscribe((data) => {
      this.workspaceData.profile_custom_fields = data;
      this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData);
    });
    dialogRef.afterClosed().subscribe(result => {
      sub.unsubscribe();
    });
  }
}
