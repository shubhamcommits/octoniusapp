import { Component, OnInit, Input, ChangeDetectionStrategy} from "@angular/core";
import { debounceTime } from "rxjs/internal/operators/debounceTime";
import { distinctUntilChanged } from "rxjs/internal/operators/distinctUntilChanged";
import { UtilityService } from "src/shared/services/utility-service/utility.service";
import { AuthService } from "src/shared/services/auth-service/auth.service";
import { StorageService } from "src/shared/services/storage-service/storage.service";
import { Router, ActivatedRoute } from "@angular/router";
import { SubSink } from "subsink";
import { Subject } from 'rxjs/internal/Subject';
import { environment } from 'src/environments/environment';


@Component({
  selector: "app-auth-user-details",
  templateUrl: "./auth-user-details.component.html",
  styleUrls: ["./auth-user-details.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthUserDetailsComponent implements OnInit {
  constructor(
    private utilityService: UtilityService,
    public router: Router,
    private authenticationService: AuthService,
    private storageService: StorageService,
    private _ActivatedRoute: ActivatedRoute
  ) { }

  // ROUTER NAME STATE OF THE COMPONENT - 'new-workplace', 'sign-up', 'sign-in', or 'home'
  @Input("routerState") routerState: string;

  // NEXT SET OF WORKPLACE FORM
  newWorkplaceNextState = false;

  // CHECK VALID WORKSPACE
  validWorkspace = false;

  // Check Password matches
  matchPasswordState = false;

  // Defining User Object, which accepts the following properties
  user: { company: string, workspace: String; email: string; password: string, repeatPassword: string, firstName: string, lastName: string } = {
    company: null,
    workspace: null,
    email: null,
    password: null,
    repeatPassword: null,
    firstName: null,
    lastName: null
  };

  // This subject is mapped with email field to recieve updates on change value
  emailState: Subject<Event> = new Subject<Event>();

  // This subject is mapped with repeatPassword field to recieve updates on change value
  matchPassword: Subject<Event> = new Subject<Event>();

  // This subject is mapped with the workpace field to recieve updates on change value
  validateWorkplace: Subject<string> = new Subject<string>();

  // ADD ALL SUBSCRIPTIONS HERE TO DESTROY THEM ALL TOGETHER
  private subSink = new SubSink();

  // Finding the group_name
  group_name = this._ActivatedRoute.snapshot.queryParamMap.get('group');

  // Finding the type
  type = this._ActivatedRoute.snapshot.queryParamMap.get('type');

  // Workspace
  workspace_name = this._ActivatedRoute.snapshot.queryParamMap.get('workspace');

  // Email
  email = this._ActivatedRoute.snapshot.queryParamMap.get('email');

  // Reset Password Id
  resetPwdId = this._ActivatedRoute.snapshot.paramMap.get('resetPwdId');

  password;

  @Input() userWorkspaces = [];

  baseUrl = environment.UTILITIES_WORKSPACES_UPLOADS;

 ngOnInit() {
    if (this.workspace_name)
      this.user.workspace = this.workspace_name
    if (this.email)
      this.user.email = this.email
  }

  /**
   * This function unsubscribes the observables
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
    this.utilityService.clearAllNotifications();
  }

  /**
   * 1.(i)  This function handles of sending the notification to the user about the email validation
   * 1.(ii) Uses Debounce time and subscribe to the emailState Subject
   * 2.(i)  This function handles of sending the notification to the user about the matching password
   * 2.(ii) Uses Debounce time and subscribe to the matchPassword Subject
   * 3.(i)  This function handles of sending the notification to the user about the validWorkspace name
   * 3.(ii) Uses Debounce time and subscribe to the validWorkspace Subject
   */
  ngAfterViewInit(): void {

    // VALIDATE WORKPLACE SUBJECT CHANGE
    this.subSink.add(this.validateWorkplace
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((workplace) => {
        this.utilityService.clearAllNotifications();
        this.utilityService.asyncNotification('Please wait, let us check if the name is available or not... ',
          new Promise((resolve, reject) => {
            this.authenticationService.checkWorkspaceName({
              workspace_name: workplace
            })
              .then(() => {
                this.validWorkspace = true;
                resolve(this.utilityService.resolveAsyncPromise('This workplace name is available.'))
              })
              .catch(() => {
                this.validWorkspace = false;
                reject(this.utilityService.rejectAsyncPromise('This workplace name is taken, kindly come up with another one!'))
              })
          }))
      }))

    // VALIDATE EMAIL SUBJECT CHANGE
    this.subSink.add(
      this.emailState
        .pipe(debounceTime(750), distinctUntilChanged())
        .subscribe(async model => {
          this.utilityService.clearAllNotifications();

          let checkDuplicatedEmail = false;
          if (this.routerState != 'sign-in') {
            await this.authenticationService.getUserByEmail(this.user.email).then(res => {
              if (res['user']) {
                checkDuplicatedEmail = true;
              }
            });
          }

          if (checkDuplicatedEmail) {
            this.utilityService.warningNotification(
              "There is already a user by this email",
              "Wrong email!"
            );
          } else {
            let validatedEmailState = this.utilityService.validateEmail(
              this.user.email
            )
              ? this.utilityService.successNotification("Correct Email Format!")
              : this.utilityService.warningNotification(
                "Follow the standard format, e.g. - user@example.com",
                "Wrong Format!"
              );
          }
        })
    );

    // VALIDATE MATCH PASSWORD SUBJECT CHANGE
    this.subSink.add(this.matchPassword.pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((matchStatus) => {
        this.utilityService.clearAllNotifications();
        let matchPass = (JSON.stringify(this.user.password) === JSON.stringify(this.user.repeatPassword))
          ? this.utilityService.successNotification('Password matches successfully!')
          : this.utilityService.warningNotification("Password doesn\'t match!");

        // Match Password state
        this.matchPasswordState = (JSON.stringify(this.user.password) === JSON.stringify(this.user.repeatPassword))
      }))
  }

  /*=====================================================================================================================================================================================================*/

  /** ============================
   *  -- SIGN IN METHODS STARTS --
   *  ============================
   */

  /*=====================================================================================================================================================================================================*/


  executeSignIn() {
    if (this.routerState == 'sign-in') {
      this.signIn(this.user.email, this.user.password);
    }
  }

  /**
   * This function is responsible for signing a user in to the workspace
   * @param email
   * @param password
   * Makes a HTTP Post request to verify and return with a token which we can store on client side
   */
  async signIn(email: string, password: string) {
    try {
      if (email == null || password == null || email == '' || password == '') {
        this.utilityService.warningNotification('Insufficient data, kindly fill up all the fields correctly!');
      } else {
        this.authenticationService.getNumberUsersByEmailAndPassword(email.trim(), password.trim()).then(res => {
          const numUsers = res['numUsers'] || 0;
          if (numUsers > 1) {
            this.email = email;
            this.storageService.setLocalData('password', JSON.stringify({ 'password': password }));
              this.router.navigate(['/authentication', 'select-workspace'], { queryParams: { email: email } });
          } else {
            // Preparing the user data
            let userData: Object = {
              email: email.trim(),
              password: password.trim(),
              workspace_name: res['workspace_name']
            }
            this.utilityService.asyncNotification('Please wait while we sign you in...',
              this.signInServiceFunction(userData));
          }
        });
      }
    } catch (err) {
      console.log('There\'s some unexpected error occurred, please try again later!', err);
      this.utilityService.errorNotification('There\'s some unexpected error occurred, please try again later!');
    }
  }

  selectWorkspace(workspace_name) {
    try {
      this.password = this.storageService.getLocalData('password').password;

      if (this.email == null || this.password == null || this.email == '' || this.password == '') {
        this.utilityService.warningNotification('Insufficient data, kindly fill up all the fields correctly!');
      } else {

        this.storageService.removeLocalData('password');

        // Preparing the user data
        let userData: Object = {
          email: this.email,
          password: this.password,
          workspace_name: workspace_name
        }
        this.utilityService.asyncNotification('Please wait while we sign you in...',
          this.signInServiceFunction(userData));
      }
    } catch (err) {
      console.log('There\'s some unexpected error occurred, please try again later!', err);
      this.utilityService.errorNotification('There\'s some unexpected error occurred, please try again later!');
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
          this.clearUserData();
          this.storeUserData(res);

          this.router.navigate(['dashboard', 'myspace', 'inbox'])
            .then(() => {
              this.utilityService.successNotification(`Hi ${res['user']['first_name']}, welcome back to your workplace!`);
              resolve(this.utilityService.resolveAsyncPromise(`Hi ${res['user']['first_name']}, welcome back to your workplace!`));
            })
            .catch((err) => {
              console.error('Error occured while signing in the user', err);
              this.utilityService.errorNotification('Oops some error occured while signing you in, please try again!');
              this.storageService.clear();
              reject(this.utilityService.rejectAsyncPromise('Oops some error occured while signing you in, please try again!'))
            })
        }, (err) => {
          console.error('Error occured while signing in the user', err);
          reject(this.utilityService.rejectAsyncPromise('Oops some error occured while signing you in, please try again!'))
        }))
    })
  }
  /*=====================================================================================================================================================================================================*/

  /** ==========================
   *  -- SIGN IN METHODS ENDS--
   *  ==========================
   */
  /*=====================================================================================================================================================================================================*/


  /*=====================================================================================================================================================================================================*/

  /** =============================
   *  -- SIGN UP METHODS STARTS --
   *  =============================
   */

  /*=====================================================================================================================================================================================================*/

  /**
   * This function is responsible for signing up a user in to the workspace
   * @param workspace
   * @param email
   * @param password
   * @param firstName
   * @param lastName
   * Makes a HTTP Post request to verify and return with a token which we can store on client side
   */
  async signUp(workspace: string, email: string, password: string, firstName: string, lastName: string) {
    try {
      if (workspace == null || email == null || password == null || firstName == null || lastName == null || workspace == '' || email == '' || password == '' || firstName == '' || lastName == '') {
        this.utilityService.warningNotification('Insufficient data, kindly fill up all the fields correctly!');
      } else {
        // Preparing the user data
        let userData: any = {
          workspace_name: workspace.trim(),
          email: email.trim(),
          password: password.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim()
        }

        if (this.group_name && this.type) {
          userData.group_name = this.group_name;
          userData.type = this.type
        }

        this.utilityService.asyncNotification('Please wait while we are setting up your new account...',
          this.signUpServiceFunction(userData))
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
          this.clearUserData();
          this.storeUserData(res);
          this.router.navigate(['dashboard', 'myspace', 'inbox'])
            .then(() => {
              this.utilityService.successNotification(`Hi ${res['user']['first_name']}, welcome to your workplace!`);
              resolve(this.utilityService.resolveAsyncPromise(`Hi ${res['user']['first_name']}, welcome to your workplace!`));
            })
            .catch((err) => {
              console.error('Error occured while signing in the user', err);
              this.utilityService.errorNotification('Oops some error occured while signing you up, please try again!');
              this.storageService.clear();
              reject(this.utilityService.rejectAsyncPromise('Oops some error occured while signing you up, please try again!'))
            })

        }, (err) => {
          console.error('Error occured while signing in the user', err);
          reject(this.utilityService.rejectAsyncPromise('Oops some error occured while signing you in, please try again!'))
        }))
    })
  }

  /*=====================================================================================================================================================================================================*/

  /** ===========================
   *  -- SIGN UP METHODS ENDS --
   *  ===========================
   */

  /*=====================================================================================================================================================================================================*/


  /*=====================================================================================================================================================================================================*/

  /** =========================================
   *  -- CREATE NEW WORKPLACE METHODS STARTS --
   *  =========================================
   */

  /*=====================================================================================================================================================================================================*/

  /**
   * This function checks if the the company and workspace names are in the valid states
   * @param company
   * @param workspace
   */
  continueToCreateWorkspace(company: string, workspace: string) {
    if (workspace == null || company == null || workspace == '' || company == '') {
      this.utilityService.warningNotification('Company or Workplace name can\'t be empty!');
      this.validWorkspace = false;
    } else if (!this.validWorkspace) {
      this.utilityService.warningNotification('You can\'t proceed with this workplace name, try choosing a different one!');
    } else {
      this.newWorkplaceNextState = true;
    }
  }

  /**
   * This function is responsible for creating a new workplace and signing up the owner in to the workspace
   * @param workplace
   * @param company
   * @param email
   * @param password
   * @param firstName
   * @param lastName
   * Makes a HTTP Post request to verify and return with a token which we can store on client side
   */
  async createNewWorkplace(workplace: string, company: string, email: string, password: string, firstName: string, lastName: string) {
    try {
      if (workplace == null || company == null || email == null || password == null || firstName == null || lastName == null || workplace == '' || company == '' || email == '' || password == '' || firstName == '' || lastName == '') {
        this.utilityService.warningNotification('Insufficient data, kindly fill up all the fields correctly!');
      } else {
        // PREPARING THE WORKPLACE DATA
        let workplaceData: Object = {
          workspace_name: workplace.trim(),
          company_name: company.trim(),
          owner_email: email.trim(),
          owner_first_name: firstName.trim(),
          owner_last_name: lastName.trim()
        }
        this.utilityService.asyncNotification('Please wait while we are setting up your new workplace and account...',
          this.newWorkplaceServiceFunction(workplaceData))
      }
    } catch (err) {
      console.log('There\'s some unexpected error occurred, please try again later!', err);
      this.utilityService.errorNotification('There\'s some unexpected error occurred, please try again later!');
    }
  }

  /**
   * This implements the service function for @function createNewWorkplace(workplaceData)
   * @param workspaceData
   */
  newWorkplaceServiceFunction(workspaceData: Object) {
    return new Promise((resolve, reject) => {
      /*
      this.authenticationService.createNewWorkspace(workspaceData)
        .then((res) => {
          this.clearUserData();
          this.storeUserData(res);
          this.router.navigate(['dashboard', 'myspace', 'inbox'])
            .then(() => {
              this.utilityService.successNotification(`Hi ${res['user']['first_name']}, welcome to your new workplace!`);
              resolve(this.utilityService.resolveAsyncPromise(`Hi ${res['user']['first_name']}, welcome to your new workplace!`))
            })
            .catch(() => {
              this.utilityService.errorNotification('Oops some error occured while setting you up, please try again!');
              reject(this.utilityService.rejectAsyncPromise('Oops some error occured while setting you up, please try again!'))
            })

        }, (err) => {
          console.error('Error occured while creating new workplace', err);
          this.utilityService.errorNotification('Oops some error occured while setting you up, please try again!');
          this.storageService.clear();
          reject(this.utilityService.rejectAsyncPromise('Oops some error occured while setting you up, please try again!'))
        })
      */
    })
  }

  /**
   * This function is responsible for reseting the password
   * @param resetPasswordId
   * @param password
   */
  resetPassword(resetPasswordId: string, password: string, repeatPassword: string) {
    try {

      if (password == repeatPassword) {

        // Reset password object
        const resetPassObject = {
          resetPwdId: resetPasswordId,
          password: password
        }

        // Call the service function
        this.utilityService.asyncNotification('Please wait while we are resetting your password...',
          this.resetPasswordServiceFunction(resetPassObject))
      } else{
        this.utilityService.warningNotification("Password doesn\'t match!");
      }

    } catch (err) {
      console.log('There\'s some unexpected error occurred, please try again later!', err);
      this.utilityService.errorNotification('There\'s some unexpected error occurred, please try again later!');
    }
  }

  /**
   * This service function calls the reset password API
   * @param resetPasswordObject
   */
  resetPasswordServiceFunction(resetPasswordObject: any) {
    return new Promise((resolve, reject) => {
      this.authenticationService.resetPassword(resetPasswordObject)
        .then((res) => {
          this.router.navigate(['authentication', 'sign-in'])
            .then(() => {
              this.utilityService.successNotification(`Your password has been reset successfully!`);
              resolve(this.utilityService.resolveAsyncPromise(`Your password has been reset successfully!`))
            })
            .catch(() => {
              this.utilityService.errorNotification('Oops some error occured while setting you up, please try again!');
              reject(this.utilityService.rejectAsyncPromise('Oops some error occured while setting you up, please try again!'))
            })
        })
    })
  }

  /*=====================================================================================================================================================================================================*/

  /** ========================================
   *  -- CREATE NEW WORKPLACE METHODS ENDS --
   *  ========================================
   */

  /*=====================================================================================================================================================================================================*/


  /*=====================================================================================================================================================================================================*/

  /** =====================================
   *  -- HELPER FUNCTION METHODS STARTS --
   *  =====================================
   */

  /*=====================================================================================================================================================================================================*/

  /**
   * This method is binded to keyup event of workspace input field
   * @param company
   * @param workspace
   */
  checkWorkspaceAvailability(company: string, workspace: string) {
    this.validateWorkplace.next(workspace);
  }


  /**
   * This method is binded to keyup event of email input field
   * @param $event
   */
  validateEmail($event: Event) {
    this.emailState.next($event);
  }

  /**
   * This method is binded to keyup event of repeat password input field
   * @param $event
   */
  matchUserPassword($event: Event) {
    this.matchPassword.next($event);
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

  /**
   * This function clear the user Object
   */
  clearUserData() {
    this.user.company = null;
    this.user.workspace = null;
    this.user.email = null;
    this.user.password = null;
    this.user.firstName = null;
    this.user.lastName = null;
    this.user.repeatPassword = null;
  }

  /**
   * This function stores the user related data and token for future reference in the browser
   * @param res
   */
  storeUserData(res: Object) {
    this.storageService.setLocalData('userData', JSON.stringify(res['user']));
    this.storageService.setLocalData('authToken', JSON.stringify(res['token']));
  }

  /*=====================================================================================================================================================================================================*/

  /** ===================================
   *  -- HELPER FUNCTION METHODS ENDS --
   *  ===================================
   */

  /*=====================================================================================================================================================================================================*/
}
