import { Component, Injector, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { AuthService } from 'src/shared/services/auth-service/auth.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-auth-sign-up',
  templateUrl: './auth-sign-up.component.html',
  styleUrls: ['./auth-sign-up.component.scss']
})
export class AuthSignUpComponent implements OnInit, OnDestroy {

  // Defining User Object, which accepts the following properties
  account: { email: string, password: string, repeatPassword: string, first_name: string, last_name: string } = {
    email: null,
    password: null,
    repeatPassword: null,
    first_name: null,
    last_name: null
  };

  publicFunctions = new PublicFunctions(this._Injector);

  // ADD ALL SUBSCRIPTIONS HERE TO DESTROY THEM ALL TOGETHER
  private subSink = new SubSink();

  constructor(
    private authenticationService: AuthService,
    private utilityService: UtilityService,
    private storageService: StorageService,
    public router: Router,
    private route: ActivatedRoute,
    private _Injector: Injector
  ) { }

  async ngOnInit() {
    this.clearAccountData();
    this.publicFunctions.sendUpdatesToGroupData({});
    this.publicFunctions.sendUpdatesToRouterState({});
    this.publicFunctions.sendUpdatesToUserData({});
    this.publicFunctions.sendUpdatesToWorkspaceData({});

    const email = this.route.snapshot.queryParamMap.get("email")
    if (email) {
      this.account.email = email;
    }
  }

  /**
   * This function unsubscribes the observables
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
    this.utilityService.clearAllNotifications();
  }

  /**
   * This method is binded to keyup event of email input field
   * @param $event
   */
  validateEmail() {
    this.utilityService.validateEmail(
      this.account.email
    )
      ? this.utilityService.successNotification("Correct Email Format!")
      : this.utilityService.warningNotification(
        "Follow the standard format, e.g. - user@example.com",
        "Wrong Format!"
      );
  }

  /**
   * This function is responsible for signing up a user in to the workspace
   * @param workspace
   * @param email
   * @param password
   * @param firstName
   * @param lastName
   * Makes a HTTP Post request to verify and return with a token which we can store on client side
   */
  async signUp() {
    try {
      if (this.account.email == null || this.account.email == ''
          || this.account.password == null || this.account.password == ''
          || this.account.first_name == null || this.account.first_name == ''
          || this.account.last_name == null || this.account.last_name == '') {
        this.utilityService.warningNotification('Insufficient data, kindly fill up all the fields correctly!');
      } else {
        // Preparing the user data
        let userData: any = {
          email: this.account.email.trim(),
          password: this.account.password.trim(),
          first_name: this.account.first_name.trim(),
          last_name: this.account.last_name.trim()
        }

        this.utilityService.asyncNotification('Please wait while we are setting up your new account...',
          this.signUpServiceFunction(userData));
      }
    } catch (err) {
      console.log('There\'s some unexpected error occurred, please try again later!', err);
      this.utilityService.errorNotification('There\'s some unexpected error occurred, please try again later!');
    }
  }

  /**
   * This implements the service function for @function signUp(userData)
   * @param userData
   */
  signUpServiceFunction(userData: Object) {
    return new Promise((resolve, reject) => {
      this.subSink.add(this.authenticationService.signUp(userData)
        .subscribe((res) => {
          this.clearAccountData();
          this.storeAccountData(res);
          this.router.navigate(['authentication', 'select-workspace'])
            .then(() => {
              this.utilityService.successNotification(`Hi ${res['account']['first_name']}!`);
              resolve(this.utilityService.resolveAsyncPromise(`Hi ${res['account']['first_name']}!`));
            })
            .catch((err) => {
              console.error('Error occured while signing in the user', err);
              this.utilityService.errorNotification('Oops some error occured while signing you up, please try again!');
              this.storageService.clear();
              reject(this.utilityService.rejectAsyncPromise('Oops some error occured while signing you up, please try again!'))
            });

        }, (err) => {
          console.error('Error occured while signing in the user', err);
          reject(this.utilityService.rejectAsyncPromise('Oops some error occured while signing you in, please try again!'))
        }));
    });
  }

  /**
   * This function clear the user Object
   */
  clearAccountData() {
    this.publicFunctions.sendUpdatesToAccountData({});
    this.account.email = null;
    this.account.password = null;
    this.account.repeatPassword = null;
  }

  /**
   * This function stores the user related data and token for future reference in the browser
   * @param res
   */
  storeAccountData(res: Object) {
    this.publicFunctions.sendUpdatesToAccountData(res['account']);
  }

}
