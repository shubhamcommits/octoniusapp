import { Component, OnInit, OnDestroy, Injector, AfterViewInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { UserService } from 'src/shared/services/user-service/user.service';
import { SubSink } from 'subsink';
import { AuthService } from 'src/shared/services/auth-service/auth.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { PublicClientApplication } from '@azure/msal-browser';
import { environment } from 'src/environments/environment';

declare const gapi: any;

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss']
})
export class WelcomePageComponent implements OnInit, AfterViewInit, OnDestroy {

  // Defining User Object, which accepts the following properties
  account: { email: string, password: string, repeatPassword: string } = {
    email: null,
    password: null,
    repeatPassword: null
  };

  queryParms:any;

  // Active Directory variables
  ssoAvailable: boolean = false;
  activeDirectoryAvailable: boolean = false;
  googleAvailable: boolean = false;

  possibleIntegrations: any;

  public auth2: any;

  publicFunctions = new PublicFunctions(this._Injector);

  // ADD ALL SUBSCRIPTIONS HERE TO DESTROY THEM ALL TOGETHER
  private subSink = new SubSink();

  constructor(
    private authenticationService: AuthService,
    private utilityService: UtilityService,
    public userService: UserService,
    private storageService: StorageService,
    public router: Router,
    public activeRouter :ActivatedRoute,
    private _Injector: Injector,
    private msalService: MsalService
  ) {
    this.initView();
  }

  async ngOnInit() {
    await this.initView();
  }

  async ngAfterViewInit() {
    await this.initSSO();
    this.googleInit();
  }

  /**
   * This function unsubscribes the observables
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
    this.utilityService.clearAllNotifications();
  }

  async initView() {
    this.clearAccountData();

    this.publicFunctions.sendUpdatesToGroupData({});
    this.publicFunctions.sendUpdatesToRouterState({});
    this.publicFunctions.sendUpdatesToUserData({});
    this.publicFunctions.sendUpdatesToWorkspaceData({});

    // Getting the query params teams_permission_url if exist
    this.activeRouter.queryParams.subscribe(params => {
      if (params['teams_permission_url']) {
        this.queryParms = params;
    }});

    await this.initSSO();
  }

  async initSSO() {
    this.possibleIntegrations = await this.publicFunctions.getPossibleIntegrations();

    this.activeDirectoryAvailable = this.possibleIntegrations && this.possibleIntegrations?.is_azure_ad_connected && this.possibleIntegrations?.azure_ad_clientId && this.possibleIntegrations?.azure_ad_authority_cloud_url;
    this.googleAvailable = this.possibleIntegrations && this.possibleIntegrations?.is_google_connected && this.possibleIntegrations?.google_client_id;
    this.ssoAvailable = this.activeDirectoryAvailable || this.googleAvailable;

    if (this.activeDirectoryAvailable) {
      const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;
      this.msalService.instance = new PublicClientApplication({
        auth: {
          clientId: this.possibleIntegrations?.azure_ad_clientId,
          authority: this.possibleIntegrations?.azure_ad_authority_cloud_url,
          redirectUri: environment.clientUrl
        },
        cache: {
          cacheLocation: 'localStorage',
          storeAuthStateInCookie: isIE, // Set to true for Internet Explorer 11
        }
      });
    }
  }

  googleInit() {
    if( this.possibleIntegrations) {
      gapi.load('auth2', () => {
        this.auth2 = gapi.auth2.init({
          'client_id': this.possibleIntegrations.google_client_id,
          'scope': environment.GOOGLE_LOGIN_SCOPE,
          'immediate': false,
          'access_type': 'offline',
          'response_type': 'token code'
        });
      });
    }
  }

  /**
   * This method is binded to keyup event of email input field
   * @param $event
   */
  validateEmail() {
    this.utilityService.validateEmail(
      this.account.email
    )
      ? this.utilityService.successNotification($localize`:@@welcomePage.correctEmailFormat:Correct Email Format!`)
      : this.utilityService.warningNotification(
        $localize`:@@welcomePage.followTheStandard:Follow the standard format, e.g. - user@example.com`,
        $localize`:@@welcomePage.wrongFormat:Wrong Format!`
      );
  }

  /**
   * This function is responsible for signing a user in to the workspace
   * @param email
   * @param password
   * Makes a HTTP Post request to verify and return with a token which we can store on client side
   */
  async signIn() {
    try {
      if (this.account.email == null || this.account.password == null || this.account.email == '' || this.account.password == '') {
        this.utilityService.warningNotification($localize`:@@welcomePage.insufficientData:Insufficient data, kindly fill up all the fields correctly!`);
      } else {
        let userData: any = {
          email: this.account.email.trim(),
          password: this.account.password.trim()
        }
        this.utilityService.asyncNotification($localize`:@@welcomePage.pleaseWaitWhileWeSighYouIn:Please wait while we sign you in...`,
          this.signInServiceFunction(userData));
      }
    } catch (err) {
      console.log('There\'s some unexpected error occurred, please try again later!', err);
      this.utilityService.errorNotification($localize`:@@welcomePage.unexpectedError:There\'s some unexpected error occurred, please try again later!`);
    }
  }

  /**
   * This implements the service function for @function signIn(userData)
   * @param userData
   */
  signInServiceFunction(userData: Object) {
    return new Promise((resolve, reject) => {
      this.subSink.add(this.authenticationService.signIn(userData)
        .subscribe((res) => {
          // If query params exsit then add the teams permission page url to parms of next redirect url.
          // note:- Code is for teams auth popup not for octonius app and only work in that case.
          if ( this.queryParms ) {
            this.clearAccountData();
            this.storeAccountData(res);
            this.router.navigate(['authentication', 'select-workspace'],{ queryParams: { teams_permission_url : this.queryParms.teams_permission_url }})
            .then(() => {
              this.utilityService.successNotification($localize`:@@welcomePage.hi:Hi ` + res['account']['first_name'] + ', ' + $localize`:@@welcomePage.welcomeBack:welcome back!`);
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@welcomePage.hi:Hi ` + res['account']['first_name'] + ', ' + $localize`:@@welcomePage.welcomeBack:welcome back!`));
            })
            .catch((err) => {
              console.error('Error occurred while signing in the user', err);
              this.utilityService.errorNotification($localize`:@@welcomePage.oopsErrorSigningIn:Oops some error occurred while signing you in, please try again!`);
              this.storageService.clear();
              reject(this.utilityService.rejectAsyncPromise($localize`:@@welcomePage.oopsErrorSigningIn:Oops some error occurred while signing you in, please try again!`))
            })
            // else normal flow
          } else {

            this.clearAccountData();
            this.storeAccountData(res);
            this.router.navigate(['authentication', 'select-workspace'])
              .then(() => {
                this.utilityService.successNotification($localize`:@@welcomePage.hi:Hi ` + res['account']['first_name'] + ', ' + $localize`:@@welcomePage.welcomeBack:welcome back!`);
                resolve(this.utilityService.resolveAsyncPromise($localize`:@@welcomePage.hi:Hi ` + res['account']['first_name'] + ', ' + $localize`:@@welcomePage.welcomeBack:welcome back!`));
              })
              .catch((err) => {
                console.error('Error occurred while signing in the user', err);
                this.utilityService.errorNotification($localize`:@@welcomePage.oopsErrorSigningIn:Oops some error occurred while signing you in, please try again!`);
                this.storageService.clear();
                reject(this.utilityService.rejectAsyncPromise($localize`:@@welcomePage.oopsErrorSigningIn:Oops some error occurred while signing you in, please try again!`))
              })
          }
        }, (err) => {
          console.error('Error occurred while signing in the user', err);
          reject(this.utilityService.rejectAsyncPromise($localize`:@@welcomePage.oopsErrorSigningIn:Oops some error occurred while signing you in, please try again!`))
        }));
    });
  }

  /**
   * This function clear the account Object
   */
  clearAccountData() {
    this.publicFunctions.sendUpdatesToAccountData({});
    this.publicFunctions.sendUpdatesToUserData({});

    this.account.email = null;
    this.account.password = null;
    this.account.repeatPassword = null;
  }

  /**
   * This function stores the account related data and token for future reference in the browser
   * @param res
   */
  storeAccountData(res: Object) {
    this.publicFunctions.sendUpdatesToAccountData(res['account']);
  }

  /**
    * This function opens up the task content in a new modal, and takes #content in the ng-template inside HTML layout
    * @param content
    */
  async openForgotPassword(content) {
    this.utilityService.openModal(content, {
      size: 'lg',
      centered: true
    });
  }

  // AD methods
  signInAD() {
    this.utilityService.asyncNotification($localize`:@@welcomePage.pleaseWaitWhileWeSighYouIn:Please wait while we sign you in...`,
      new Promise((resolve, reject) => {
        this.msalService.loginPopup()
          .subscribe({
            next: async (result) => {
              //console.log(result);
              //console.log(this.msalService.instance.getAllAccounts());
              const accountAD = result.account;

              // build the user first_name and last_name
              const nameAD = accountAD.name.split(' ');
              let lastName = '';
              for (let i = 1; i < nameAD.length; i++) {
                lastName += nameAD[i];
              }

              let userData: any = {
                email: accountAD.username,
                first_name: nameAD[0],
                last_name: lastName,
                ssoType: 'AD'
              }

              await this.authenticationService.authenticateSSOUser(userData).then(res => {
                const newAccount = res['newAccount'];
                const accountData = res['account'];

                if (newAccount || (!accountData || !accountData._workspaces || accountData._workspaces.length == 0)) {
                  this.clearAccountData();
                  this.storeAccountData(res);
                  this.router.navigate(['authentication', 'join-workplace'])
                    .then(() => {
                      resolve(this.utilityService.successNotification($localize`:@@welcomePage.hiAD:Hi ${res['account']['first_name']}!`));
                    })
                    .catch((err) => {
                      console.error('Error occurred while signing in the user', err);
                      reject(this.utilityService.errorNotification($localize`:@@welcomePage.oopsErrorSigningUp:Oops some error occurred while signing you up, please try again!`));
                      this.storageService.clear();
                    });
                } else {
                  this.clearAccountData();
                  this.storeAccountData(res);
                  this.router.navigate(['authentication', 'select-workspace'])
                    .then(() => {
                      resolve(this.utilityService.successNotification($localize`:@@welcomePage.hiAD:Hi ${res['account']['first_name']}!`));
                    })
                    .catch((err) => {
                      console.error('Error occurred while signing in the user', err);
                      reject(this.utilityService.errorNotification($localize`:@@welcomePage.oopsErrorSigningUp:Oops some error occurred while signing you up, please try again!`));
                      this.storageService.clear();
                    });
                }
              });
            },
            error: (error) => {
              console.log({error});
              reject(this.utilityService.errorNotification($localize`:@@welcomePage.oopsErrorSigningUp:Oops some error occurred while signing you up, please try again!`));
            }
          });
      }));
  }

  signInGoogle() {
    this.utilityService.asyncNotification($localize`:@@welcomePage.pleaseWaitWhileWeSighYouIn:Please wait while we sign you in...`,
      new Promise((resolve, reject) => {
        var auth2 = gapi.auth2.getAuthInstance();
        // Sign the user in, and then retrieve their ID.

        auth2.signIn().then(() => {
          let accountGoogle = auth2.currentUser.get().getBasicProfile();

          let userData: any = {
            email: accountGoogle.getEmail(),
            first_name: accountGoogle.getGivenName(),
            last_name: accountGoogle.getFamilyName(),
            ssoType: 'GOOGLE'
          }

          this.authenticationService.authenticateSSOUser(userData).then(res => {
            const newAccount = res['newAccount'];
            const accountData = res['account'];

            if (newAccount || (!accountData || !accountData._workspaces || accountData._workspaces.length == 0)) {
              this.clearAccountData();
              this.storeAccountData(res);
              this.router.navigate(['authentication', 'join-workplace'])
                .then(() => {
                  resolve(this.utilityService.successNotification($localize`:@@welcomePage.hiGoogle:Hi ${res['account']['first_name']}!`));
                })
                .catch((err) => {
                  console.error('Error occurred while signing in the user', err);
                  this.utilityService.errorNotification($localize`:@@welcomePage.oopsErrorSigningUp:Oops some error occurred while signing you up, please try again!`);
                  this.storageService.clear();
                });
            } else {
              this.clearAccountData();
              this.storeAccountData(res);
              this.router.navigate(['authentication', 'select-workspace'])
                .then(() => {
                  resolve(this.utilityService.successNotification($localize`:@@welcomePage.hiGoogle:Hi ${res['account']['first_name']}!`));
                })
                .catch((err) => {
                  console.error('Error occurred while signing in the user', err);
                  reject(this.utilityService.errorNotification($localize`:@@welcomePage.oopsErrorSigningUp:Oops some error occurred while signing you up, please try again!`));
                  this.storageService.clear();
                });
            }
          });
        });
      }));
  }
}
