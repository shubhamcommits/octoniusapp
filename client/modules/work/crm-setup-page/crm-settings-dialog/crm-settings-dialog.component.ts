import { Component, OnInit, Inject, Output, EventEmitter, Injector } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
// import { CRMSettingsDialogUserComponent } from './crm-settings-dialog-user/crm-settings-dialog-user.component';
import { UserService } from 'src/shared/services/user-service/user.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';

@Component({
  selector: 'app-crm-settings-dialog',
  templateUrl: './crm-settings-dialog.component.html',
  styleUrl: './crm-settings-dialog.component.scss'
})
export class CRMSettingsDialogComponent implements OnInit {

  @Output() customFieldsEvent = new EventEmitter();

  displayedColumns: string[] = ['name', 'role', 'crm_role'];
  dataSource = [];

  constructor(
    public utilityService: UtilityService,
    private userService: UserService,
    private workService: WorkspaceService,
    private injector: Injector,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog
  ) { }

  publicFunctions = new PublicFunctions(this.injector);

  async ngOnInit() {
    const workspace: any = await this.publicFunctions.getCurrentWorkspace();
    await this.workService.getWorkspaceUsers(workspace?._id).then((res) => {
      this.dataSource = res['users'].map(user => ({
        ...user,
        isAdmin: this.isManagerUser(user)
      }));      
    });

  }

  isManagerUser(userData) {    
    return userData.role == 'manager' || userData.role == 'admin' || userData.role == 'owner';
  }

  onCloseDialog() {
    this.customFieldsEvent.emit();
  }

  setCRMUser(userId: string, checked: boolean) {
    this.userService.updateUserCRMRole(userId, checked).then((res) => {
      
    });
  }

  // openCRMUserDialog(userId?: string) {
  //   const dialogRef = this.dialog.open(CRMSettingsDialogUserComponent, {
  //     disableClose: true,
  //     hasBackdrop: true,
  //     width: "50%",
  //     data: {
  //       userId: userId,
  //     },
  //   });
  // }
}
