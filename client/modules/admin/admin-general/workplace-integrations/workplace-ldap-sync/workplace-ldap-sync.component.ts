import { Component, OnInit, Input, ChangeDetectionStrategy, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { WorkplaceLdapFieldsMapperDialogComponent } from './workplace-ldap-fields-mapper-dialog/workplace-ldap-fields-mapper-dialog.component';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';

// Google API Variable
declare var gapi: any;

@Component({
  selector: 'app-workplace-ldap-sync',
  templateUrl: './workplace-ldap-sync.component.html',
  styleUrls: ['./workplace-ldap-sync.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkplaceLDAPSyncComponent implements OnInit {

  @Input() workspaceData: any = {};

  googleTokenClient;

  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private workspaceService: WorkspaceService,
    private utilityService: UtilityService,
    public dialog: MatDialog,
    private injector: Injector
    ) { }

  ngOnInit() {
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
}
