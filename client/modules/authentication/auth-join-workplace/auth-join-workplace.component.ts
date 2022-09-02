import { Component, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SlowBuffer } from 'buffer';
import { PublicFunctions } from 'modules/public.functions';
import { ThemeService } from 'ng2-charts';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/shared/services/auth-service/auth.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-join-workplace',
  templateUrl: './auth-join-workplace.component.html',
  styleUrls: ['./auth-join-workplace.component.scss']
})
export class AuthJoinWorkplaceComponent implements OnInit {

  allowedWorkspaces = [];
  selectedWorkplaceId = '';

  // Defining User Object, which accepts the following properties
  workplaceData: { name: string, access_code: string } = {
    name: null,
    access_code: null
  };

  accountData;
  validWorkspace = false;

  baseUrl = environment.UTILITIES_WORKSPACES_UPLOADS;

  publicFunctions = new PublicFunctions(this._Injector);

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

    await this.authenticationService.getAllowedWorkspacesByDomain(this.accountData.email).then(res => {
      this.allowedWorkspaces = res['workspaces'];
    });
  }

  selectWorkspace(workspaceData: any) {
    try {
      if (workspaceData._id == this.selectedWorkplaceId) {
        this.workplaceData.name = null;
        this.selectedWorkplaceId = '';
      } else {
        this.workplaceData.name = workspaceData.workspace_name;
        this.selectedWorkplaceId = workspaceData._id;
      }
    } catch (err) {
      console.log('There\'s some unexpected error occurred, please try again later!', err);
      this.utilityService.errorNotification($localize`:@@authJoinWorkplace.unexpectedError:There\'s some unexpected error occurred, please try again later!`);
      this.selectedWorkplaceId = '';
    }
  }

  checkWorkspaceAvailability() {
    if (this.workplaceData.name == null || this.workplaceData.name == '') {
      this.utilityService.warningNotification($localize`:@@authJoinWorkplace.nameCannotBeEmpty:Workplace name can\'t be empty!`);
      this.validWorkspace = false;
    } else {
      this.authenticationService.checkWorkspaceName({
          workspace_name: this.workplaceData.name
        })
        .then(() => {
          this.validWorkspace = false;
          this.utilityService.errorNotification($localize`:@@authJoinWorkplace.namedoesntExist:This workplace name does not exist!`);
        })
        .catch(() => {
          this.validWorkspace = true;
          this.utilityService.successNotification($localize`:@@authJoinWorkplace.nameIsCorrect:This workplace name is correct!`);
        });
    }
  }

  /**
   * This function is responsible for creating a new workplace
   *
   * @param name
   * @param company_name
   */
  joinWorkplace() {
    try {
      if (!this.validWorkspace || this.workplaceData.access_code == null || this.workplaceData.access_code == '') {
        this.utilityService.warningNotification($localize`:@@authJoinWorkplace.insufficientData:Insufficient or incorrect data, kindly fill up all the fields correctly!`);
      } else {
        // PREPARING THE WORKPLACE DATA
        let workplaceData: Object = {
          workspace_name: this.workplaceData.name.trim(),
          access_code: this.workplaceData.access_code.trim()
        }
        this.utilityService.asyncNotification($localize`:@@authJoinWorkplace.pleaseWaitSettingUp:Please wait while we are setting up your new workplace and account...`,
          this.joinWorkplaceServiceFunction(workplaceData))
      }
    } catch (err) {
      console.log('There\'s some unexpected error occurred, please try again later!', err);
      this.utilityService.errorNotification($localize`:@@authJoinWorkplace.unexpectedError:There\'s some unexpected error occurred, please try again later!`);
    }
  }

  /**
   * This implements the service function for @function createNewWorkplace(workplaceData)
   * @param workspaceData
   */
  joinWorkplaceServiceFunction(workspaceData: any) {
    return new Promise((resolve, reject) => {
      this.authenticationService.joinWorkspace(workspaceData, this.accountData)
        .then((res) => {
          this.clearUserData();
          this.storeData(res);
          this.router.navigate(['dashboard', 'myspace', 'inbox'])
            .then(() => {
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@authJoinWorkplace.welcomeToWorkplace:Hi ${res['user']['first_name']}, welcome to your new workplace!`))
            })
            .catch((err) => {
              this.storageService.clear();
              reject(this.utilityService.rejectAsyncPromise($localize`:@@authJoinWorkplace.oopsErrorOccuredSettingUp:Oops some error occurred while setting you up, please try again!`))
            })

        }, (err) => {
          this.storageService.clear();
          reject(this.utilityService.rejectAsyncPromise(err.message));
        })
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
  storeData(res: Object) {
    this.publicFunctions.sendUpdatesToUserData(res['user']);
    this.publicFunctions.sendUpdatesToWorkspaceData(res['workspace']);
    this.storageService.setLocalData('authToken', JSON.stringify(res['token']));
  }
}
