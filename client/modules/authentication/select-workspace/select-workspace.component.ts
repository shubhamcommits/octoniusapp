import { Component, OnInit, OnDestroy, Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/shared/services/auth-service/auth.service';
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

  publicFunctions = new PublicFunctions(this._Injector);

  // ADD ALL SUBSCRIPTIONS HERE TO DESTROY THEM ALL TOGETHER
  private subSink = new SubSink();

  constructor(
    private utilityService: UtilityService,
    private authenticationService: AuthService,
    private storageService: StorageService,
    public router: Router,
    private _Injector: Injector
    ) { }

  async ngOnInit() {
    this.accountData = await this.publicFunctions.getAccountDetailsFromStorage();
    if (!this.accountData || JSON.stringify(this.accountData) == JSON.stringify({})) {
      this.router.navigate(['']);
    }
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
      this.utilityService.asyncNotification('Please wait while we sign you in...',
        this.selectWorkspaceServiceFunction(this.accountData._id, workspaceId));
    } catch (err) {
      console.log('There\'s some unexpected error occurred, please try again later!', err);
      this.utilityService.errorNotification('There\'s some unexpected error occurred, please try again later!');
    }
  }

  /**
   * This implements the service function for @function selectWorkspace(userData)
   * @param userData
   */
  selectWorkspaceServiceFunction(accountId: string, workspaceId: string) {
    return new Promise((resolve, reject) => {
      this.subSink.add(this.authenticationService.selectWorkspace(accountId, workspaceId)
        .subscribe((res) => {
          this.clearUserData();
          this.storeUserData(res);

          this.router.navigate(['dashboard', 'myspace', 'inbox'])
            .then(() => {
              resolve(this.utilityService.resolveAsyncPromise(`Hi ${res['user']['first_name']}, welcome back to your workplace!`));
            })
            .catch((err) => {
              this.storageService.clear();
              reject(this.utilityService.rejectAsyncPromise('Oops some error occured while signing you in, please try again!'))
            })
        }, (err) => {
          reject(this.utilityService.rejectAsyncPromise('Oops some error occured while signing you in, please try again!'))
        }))
    })
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
