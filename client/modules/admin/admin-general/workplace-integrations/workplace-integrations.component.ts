import { Component, OnInit, Input, ChangeDetectionStrategy, Injector, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { WorkplaceIntegrationsDialogComponent } from './workplace-integrations-dialog/workplace-integrations-dialog.component';
import { WorkplaceLdapFieldsMapperDialogComponent } from './workplace-ldap-fields-mapper-dialog/workplace-ldap-fields-mapper-dialog.component';
import { IntegrationsService } from 'src/shared/services/integrations-service/integrations.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';

@Component({
  selector: 'app-workplace-integrations',
  templateUrl: './workplace-integrations.component.html',
  styleUrls: ['./workplace-integrations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkplaceIntegrationsComponent implements OnInit {

  // Workspace Data Object
  @Input('workspaceData') workspaceData: any = {};

  // Router State Object - can have either 'billing' or 'general'
  @Input('routerState') routerState: string = '';

  @Output() workspaceUpdatedEvent = new EventEmitter();

  editWorkspaceName = false;

  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private workspaceService: WorkspaceService,
    private integrationsService: IntegrationsService,
    private storageService: StorageService,
    private utilityService: UtilityService,
    public dialog: MatDialog,
    private injector: Injector
    ) { }

  ngOnInit() {
  }

  openWorkplaceIntegrationsDialog() {
    const data = {
    }
    const dialogRef = this.dialog.open(WorkplaceIntegrationsDialogComponent, {
      width: '60%',
      height: '85%',
      disableClose: true,
      hasBackdrop: true,
      data: data
    });

    const datesSavedEventSubs = dialogRef.componentInstance.closeEvent.subscribe(async (data) => {
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    });

    dialogRef.afterClosed().subscribe(async result => {
      datesSavedEventSubs.unsubscribe();
    });
  }

  async getLDAPUserInformation() {
    this.utilityService.updateIsLoadingSpinnerSource(true);

    const accountData = await this.publicFunctions.getCurrentAccount();
    this.workspaceService.ldapUserInfoProperties(this.workspaceData._id, accountData?.email, true).then(res => {
      this.openLDAPFieldsMapDialog(res['ldapPropertiesNames']);
      //setTimeout(() => {
      this.utilityService.updateIsLoadingSpinnerSource(false);
      //}, 10000);
    }).catch(error => {
      this.utilityService.updateIsLoadingSpinnerSource(false);
    });
  }

  openLDAPFieldsMapDialog(ldapPropertiesNames: any) {
    const data = {
      ldapPropertiesNames: ldapPropertiesNames,
      isGlobal: true
    }
    const dialogRef = this.dialog.open(WorkplaceLdapFieldsMapperDialogComponent, {
      width: '65%',
      height: '85%',
      disableClose: true,
      hasBackdrop: true,
      data: data
    });

    const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe(async (data) => {
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    });

    dialogRef.afterClosed().subscribe(async result => {
      closeEventSubs.unsubscribe();
    });
  }

  async getGoogleUserInformation() {
    this.utilityService.updateIsLoadingSpinnerSource(true);
    const accountData = await this.publicFunctions.getCurrentAccount();
    const userData = await this.publicFunctions.getCurrentUser();
    let googleUser: any = this.storageService.getLocalData('googleUser');
    if (!this.utilityService.objectExists(googleUser)) {
      googleUser = await this.signInToGoogle();
    }
console.log(googleUser);
    if (this.utilityService.objectExists(googleUser)) {
console.log("9");
      // Fetch the access token from the storage
      let accessToken = googleUser['accessToken']
console.log("10");
      this.integrationsService.googleUserInfoProperties(accountData?.email, accessToken).then(res => {
console.log("11");
        // this.openLDAPFieldsMapDialog(res['googlePropertiesNames']);
        this.utilityService.updateIsLoadingSpinnerSource(false);
      }).catch(error => {
        this.utilityService.updateIsLoadingSpinnerSource(false);
      });
    } 
  }

  async signInToGoogle() {

    // Open up the SignIn Window in order to authorize the google user
    let googleSignInResult: any = await this.integrationsService.authorizeGoogleSignIn(this.workspaceData?.integrations);

    if (googleSignInResult != null) {
      // Call the handle google signin function
      return await this.integrationsService.handleGoogleSignIn(googleSignInResult)
    }
  }
}
