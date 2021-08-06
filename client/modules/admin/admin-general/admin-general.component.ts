import { Component, OnInit, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { AuthService } from 'src/shared/services/auth-service/auth.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';

@Component({
  selector: 'app-admin-general',
  templateUrl: './admin-general.component.html',
  styleUrls: ['./admin-general.component.scss']
})
export class AdminGeneralComponent implements OnInit {

  constructor(
    private workspaceService: WorkspaceService,
    private utilityService: UtilityService,
    private storageService: StorageService,
    private authService: AuthService,
    private router: Router,
    private injector: Injector
  ) { }

  workspaceData: Object;

  userData: Object;

  publicFunctions = new PublicFunctions(this.injector);

  async ngOnInit() {

    // Setting Home State
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'admin'
    })

    //this.utilityService.startForegroundLoader();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    this.userData = await this.publicFunctions.getCurrentUser();
  }

  ngAfterViewChecked(): void {
  }

  removeWorkspace(workspaceId) {
    this.utilityService.getConfirmDialogAlert($localize`:@@adminGeneral.areYouSure:Are you sure?`, $localize`:@@adminGeneral.workspaceCompletelyRemoved:By doing this, the workspace be completely removed!`)
      .then((res) => {
        if (res.value) {
          this.utilityService.asyncNotification($localize`:@@adminGeneral.pleaseWaitDeletingWorkspace:Please wait we are deleting the workspace...`, new Promise((resolve, reject) => {
            // Remove the step
            this.workspaceService.removeWorkspace(workspaceId)
              .then((res) => {
                this.authService.signout();

                this.storageService.clear();
                this.publicFunctions.sendUpdatesToRouterState({});
                this.publicFunctions.sendUpdatesToUserData({});
                this.router.navigate(['/home']);

                resolve(this.utilityService.resolveAsyncPromise($localize`:@@adminGeneral.workspaceDeleted:Workspace deleted!`));
              }).catch((err) => {
                reject(this.utilityService.rejectAsyncPromise($localize`:@@adminGeneral.unableDeleteWorkspace:Unable to delete the workspace, please try again!`));
              });
          }));
        }
      });
  }

  onWorkspaceUpdated(workspace: any) {
    this.workspaceData = workspace;
    this.publicFunctions.sendUpdatesToWorkspaceData(workspace);
  }

}
