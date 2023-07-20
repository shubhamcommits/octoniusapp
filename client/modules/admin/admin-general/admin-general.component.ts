import { Component, OnInit, Injector, AfterContentChecked, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { AuthService } from 'src/shared/services/auth-service/auth.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { SubSink } from 'subsink';
import { WorkspaceRolesInformationDialogComponent } from './workspace-roles-information-dialog/workspace-roles-information-dialog.component';
import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';

@Component({
  selector: 'app-admin-general',
  templateUrl: './admin-general.component.html',
  styleUrls: ['./admin-general.component.scss']
})
export class AdminGeneralComponent implements OnInit, AfterContentChecked, OnDestroy {

  workspaceData: Object;

  userData: Object;

  allowDecentralizedRoles = false;

  isIndividualSubscription = false;

  publicFunctions = new PublicFunctions(this.injector);

  isLoading$;

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink();

  constructor(
    private workspaceService: WorkspaceService,
    public utilityService: UtilityService,
    private storageService: StorageService,
    private authService: AuthService,
    private managementPortalService: ManagementPortalService,
    private router: Router,
    private injector: Injector,
    public dialog: MatDialog
  ) { }

  async ngOnInit() {

    // Setting Home State
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'admin'
    })

    //this.utilityService.startForegroundLoader();
    this.userData = await this.publicFunctions.getCurrentUser();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    this.allowDecentralizedRoles = this.workspaceData['allow_decentralized_roles'];

    this.isIndividualSubscription = await this.managementPortalService.checkIsIndividualSubscription();
  }

  ngAfterContentChecked() {
    this.subSink.add(this.utilityService.isLoadingSpinner.subscribe((res) => {
      this.isLoading$ = res;
    }));
  }

  ngOnDestroy() {
    this.subSink.unsubscribe();
  }

  removeWorkspace() {
    this.authService.signout();

    this.storageService.clear();
    this.publicFunctions.sendUpdatesToRouterState({});
    this.publicFunctions.sendUpdatesToUserData({});
    this.router.navigate(['/home']);
  }

  onWorkspaceUpdated(workspace: any) {
    this.workspaceData = workspace;
    this.publicFunctions.sendUpdatesToWorkspaceData(workspace);
  }

  saveSettings(selected) {
    // Save the settings
    this.utilityService.asyncNotification($localize`:@@adminGeneral.pleaseWaitsavingSettings:Please wait, we are saving the new setting...`,
    new Promise((resolve, reject)=>{
        this.workspaceService.saveSettings(this.workspaceData['_id'], {allow_decentralized_roles: selected.checked})
          .then(()=> {
            this.workspaceData['allow_decentralized_roles'] = selected.checked;
            this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData);
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@adminGeneral.settingsSaved:Settings saved!`));
          })
          .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@adminGeneral.unableToSaveGroupSettings:Unable to save the settings, please try again!`)));
    }));
  }

  openDialog() {
    this.dialog.open(WorkspaceRolesInformationDialogComponent, {
      disableClose: false,
      hasBackdrop: true
    });
  }
}
