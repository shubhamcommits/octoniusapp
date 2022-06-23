import { Component, OnInit, Injector, Inject, Input, OnDestroy, AfterContentChecked } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';
import { WorkplaceLdapFieldsMapperDialogComponent } from 'modules/admin/admin-general/workplace-integrations/workplace-ldap-fields-mapper-dialog/workplace-ldap-fields-mapper-dialog.component';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit, AfterContentChecked, OnDestroy {

  // User Data Variable
  userData: any;

  // Workspace Data Variable
  workspaceData: any;

  // Public functions class member
  publicFunctions = new PublicFunctions(this.injector);

  // Is current user component
  isCurrentUser: boolean = false;

  isLoading$;

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink();

  constructor(
    private injector: Injector,
    public dialog: MatDialog,
    private utilityService: UtilityService,
    private workspaceService: WorkspaceService
  ) { }

  async ngOnInit() {

    // Setting Home State
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'user-account'
    });

    this.userData = await this.publicFunctions.getCurrentUser();
    this.isCurrentUser = true;

    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
  }

  ngAfterContentChecked() {
    this.subSink.add(this.utilityService.isLoadingSpinner.subscribe((res) => {
      this.isLoading$ = res;
    }));
  }

  ngOnDestroy() {
    this.subSink.unsubscribe();
  }

  onUpdateUserEmitter(updatedUserData) {
    this.userData = updatedUserData;
  }

  async getUserInformation() {
    this.utilityService.updateIsLoadingSpinnerSource(true);

    const accountData = await this.publicFunctions.getCurrentAccount();
    this.workspaceService.ldapUserInfoProperties(this.workspaceData._id, accountData?.email, false).then(res => {
      if (this.utilityService.objectExists(res['userLdapData'])) {
        this.openLDAPFieldsMapDialog(res['userLdapData']);
      } else {
        this.utilityService.errorNotification($localize`:@@userProfile.userNoExists:Your user doesn't exists in LDAP!`);
      }
      //setTimeout(() => {
      this.utilityService.updateIsLoadingSpinnerSource(false);
      //}, 10000);
    }).catch(error => {
      this.utilityService.updateIsLoadingSpinnerSource(false);
    });
  }

  openLDAPFieldsMapDialog(userLdapData: any) {
    const data = {
      ldapPropertiesNames: Object.keys(userLdapData),
      isGlobal: false,
      userLdapData: userLdapData
    }
    const dialogRef = this.dialog.open(WorkplaceLdapFieldsMapperDialogComponent, {
      width: '65%',
      height: '85%',
      disableClose: true,
      hasBackdrop: true,
      data: data
    });

    const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe(async (data) => {
      this.userData = await this.publicFunctions.getCurrentUser();
    });

    dialogRef.afterClosed().subscribe(async result => {
      closeEventSubs.unsubscribe();
    });
  }
}
