import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { AuthService } from 'src/shared/services/auth-service/auth.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { Router } from '@angular/router';
import { SubSink } from 'subsink';

@Component({
  selector: 'auth-sign-in',
  templateUrl: './auth-sign-in.component.html',
  styleUrls: ['./auth-sign-in.component.scss']
})
export class AuthSignInComponent implements OnInit {

  constructor(
    private utilityService: UtilityService,
    public router: Router,
    private authenticationService: AuthService,
    private storageService: StorageService
  ) { }

  // Defining User Object, which accepts the following properties for sign in module
  user: { workspace: String, email: String, password: String } = {
    workspace: null,
    email: null,
    password: null
  }

  // This observable is mapped with email field to recieve updates on change value
  emailChanged: Subject<Event> = new Subject<Event>();

  // Unsubscribe the Data
  private subSink = new SubSink();

  ngOnInit() {

  }

  /**
   * This function is responsible for signing a user in to the workspace
   * @param workspace 
   * @param email 
   * @param password 
   * Makes a HTTP Post request to verify and return with a token which we can store on client side
   */
  async signIn(workspace: string, email: string, password: string) {
    try {
      if (workspace == null || email == null || password == null || workspace == '' || email == '' || password == '') {
        this.utilityService.warningNotification('Insufficient data, kindly fill up all the fields correctly!');
      } else {
        this.utilityService.asyncNotification('Please wait while we sign you in...',
          new Promise((resolve, reject) => {

            // Preparing the user data
            let userData: Object = {
              workspace_name: workspace.trim(),
              email: email.trim(),
              password: password.trim()
            }

            // Adding the service function to the SubSink(), so that we can unsubscribe the observable when the component gets destroyed
            this.subSink.add(this.authenticationService.signIn(userData)
              .subscribe((res) => {
                this.user = {
                  workspace: null,
                  email: null,
                  password: null
                }
                this.router.navigate(['dashboard','myspace', 'inbox'])
                  .then(() => {
                    this.storageService.setLocalData('userData', JSON.stringify(res['user']));
                    this.storageService.setLocalData('authToken', JSON.stringify(res['token']));
                    localStorage.setItem('token', res['token']);
                    localStorage.setItem('user', JSON.stringify(res['user']));
                    resolve(this.utilityService.resolveAsyncPromise(`Hi ${res['user']['first_name']}, welcome back to your workplace!`));
                  })
                  .catch((err) => {
                    console.error('Error occured while signing in the user', err);
                    reject(this.utilityService.rejectAsyncPromise('Oops some error occured while signing you in, please try again!'))
                  })

              }, (err) => {
                console.error('Error occured while signing in the user', err);
                reject(this.utilityService.rejectAsyncPromise('Oops some error occured while signing you in, please try again!'))
              }))
          }))
      }
    } catch (err) {
      console.log('There\'s some unexpected error occurred, please try again later!', err);
      this.utilityService.errorNotification('There\'s some unexpected error occurred, please try again later!');
    }

  }


  /**
   * This method is binded to keyup event of email input field
   * @param $event 
   */
  emailChange($event: Event) {
    this.emailChanged.next($event);
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
   * This function handles of sending the notification to the user about the email validation
   * Uses Debounce time and subscribe to the emailChanged Observable
   */
  ngAfterViewInit(): void {
    // Adding the service function to the SubSink(), so that we can unsubscribe the observable when the component gets destroyed
    this.subSink.add(this.emailChanged
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(model => {
        this.utilityService.clearAllNotifications();
        let validatedEmailState = this.utilityService.validateEmail(this.user.email)
          ? this.utilityService.successNotification('Correct Email Format!')
          : this.utilityService.warningNotification('Kindly follow the standard format which uses user@domain nomenclature, e.g - username@example.com', 'Wrong format!')
      }));
  }

  /**
   * This function unsubscribes the observables
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

}
