import { Component, OnInit, OnDestroy, Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/shared/services/auth-service/auth.service';
import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'select-workspace',
  templateUrl: './select-workspace.component.html',
  styleUrls: ['./select-workspace.component.scss']
})
export class SelectWorkspaceComponent implements OnInit, OnDestroy {

  baseUrl = environment.UTILITIES_WORKSPACES_UPLOADS;

  accountData;
  queryParms:any;

  canCreateNewWorkplaces = false;

  publicFunctions = new PublicFunctions(this._Injector);

  // ADD ALL SUBSCRIPTIONS HERE TO DESTROY THEM ALL TOGETHER
  private subSink = new SubSink();

  constructor(
    private utilityService: UtilityService,
    private managementPortalService: ManagementPortalService,
    private authService: AuthService,
    private storageService: StorageService,
    public router: Router,
    private socketService: SocketService,
    public activeRouter :ActivatedRoute,
    private _Injector: Injector
    ) { }

  async ngOnInit() {
    this.accountData = await this.publicFunctions.getAccountDetailsFromStorage();
    if (!this.accountData || JSON.stringify(this.accountData) == JSON.stringify({})) {
      this.router.navigate(['']);
    }

    await this.authService.isNewWorkplacesAvailable().then(res => {
      if (res['status']) {
        this.canCreateNewWorkplaces = res['status'];
      }
    });

    // Getting the query params teams_permission_url if exist
    this.activeRouter.queryParams.subscribe(params => {
      if (params['teams_permission_url']) {
        this.queryParms = params;
    }});
  }

  /**
   * This function unsubscribes the observables
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
    this.utilityService.clearAllNotifications();
  }

  selectWorkspace(workspaceId: string) {
    try {
      this.utilityService.asyncNotification($localize`:@@selectWorkspace.pleaseWaitSignYouIn:Please wait while we sign you in...`,
        this.selectWorkspaceServiceFunction(this.accountData._id, workspaceId));
    } catch (err) {
      console.log('There\'s some unexpected error occurred, please try again later!', err);
      this.utilityService.errorNotification($localize`:@@selectWorkspace.unexpectedError:There\'s some unexpected error occurred, please try again later!`);
    }
  }

  /**
   * This implements the service function for @function selectWorkspace(userData)
   * @param userData
   */
  selectWorkspaceServiceFunction(accountId: string, workspaceId: string) {
    return new Promise(async (resolve, reject) => {



        this.subSink.add(this.authService.selectWorkspace(accountId, workspaceId)
          .subscribe(async (res) => {
            this.clearUserData();
            await this.storeUserData(res);

            const workspaceData = await this.publicFunctions.getCurrentWorkspace()

            let workspaceBlocked = false;
            await this.managementPortalService.getBillingStatus(workspaceId, workspaceData['management_private_api_key']).then(res => {
              if (res['blocked'] ) {
                workspaceBlocked = res['blocked'];
              }
            });

            if (workspaceBlocked) {
              this.utilityService.errorNotification($localize`:@@selectWorkspace.workspaceIsNotAvailable:Your workspace is not available, please contact your administrator!`);
              this.authService.signout().subscribe((res) => {
                this.storageService.clear();
                this.publicFunctions.sendUpdatesToGroupData({});
                this.publicFunctions.sendUpdatesToRouterState({});
                this.publicFunctions.sendUpdatesToUserData({});
                this.publicFunctions.sendUpdatesToWorkspaceData({});
                this.socketService.disconnectSocket();
                this.router.navigate(['/home']);
              });
            } else {
              //if query parms exist redirect to teams permission page else normal flow
              // note:- Code is for teams auth popup not for octonius app and only work in that case.
              setTimeout(() => {
                if ( this.queryParms ) {
                  resolve(this.utilityService.resolveAsyncPromise($localize`:@@selectWorkspace.hi:Hi ${res['user']['first_name']}, welcome back to your workplace!`));
                  window.location.href = this.queryParms.teams_permission_url;
                } else {
                  this.socketService.serverInit();
                  this.router.navigate(['dashboard', 'myspace', 'inbox'])
                  .then(() => {
                    resolve(this.utilityService.resolveAsyncPromise($localize`:@@selectWorkspace.hi:Hi ${res['user']['first_name']}, welcome back to your workplace!`));
                  })
                  .catch((err) => {
                    this.storageService.clear();
                    reject(this.utilityService.rejectAsyncPromise($localize`:@@selectWorkspace.oopsErrorSigningIn:Oops some error occurred while signing you in, please try again!`))
                  })
                }
              }, 500);
            }
          }, (err) => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@selectWorkspace.oopsErrorSigningIn:Oops some error occurred while signing you in, please try again!`))
          }));
      });
  }

  /**
   * This function clear the user Object
   */
  clearUserData() {
    this.publicFunctions.sendUpdatesToUserData({});
  }

  /**
   * This function stores the user related data and token for future reference in the browser
   * @param res
   */
  storeUserData(res: Object) {
    this.publicFunctions.sendUpdatesToUserData(res['user']);
    this.storageService.setLocalData('authToken', JSON.stringify(res['token']));
  }
}
