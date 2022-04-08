import { Component, OnInit, Input, ChangeDetectionStrategy, Injector, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { WorkplaceIntegrationsDialogComponent } from './workplace-integrations-dialog/workplace-integrations-dialog.component';
import { WorkplaceLdapFieldsMapperDialogComponent } from './workplace-ldap-fields-mapper-dialog/workplace-ldap-fields-mapper-dialog.component';

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

  async getUserInformation() {
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
      width: '50%',
      disableClose: true,
      hasBackdrop: true,
      data: data
    });

    const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe(async (data) => {

    });

    dialogRef.afterClosed().subscribe(async result => {
      closeEventSubs.unsubscribe();
    });
  }
}
