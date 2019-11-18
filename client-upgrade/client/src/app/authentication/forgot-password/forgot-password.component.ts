import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/shared/services/auth-service/auth.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { Subject } from 'rxjs/internal/Subject';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
import { SubSink } from 'subsink';

@Component({
  selector: 'forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private utilityService: UtilityService
  ) { }

  // User details for sending the email
  user: { email: string, workspace: string } = {
    email: null,
    workspace: null
  }

  // This observable is mapped with email field to recieve updates on change value
  emailChanged: Subject<Event> = new Subject<Event>();
  
  // Unsubscribe the Observables using SubSink()
  private subSink = new SubSink();

  ngOnInit() {
  }
  
  /**
   * This method is binded to keyup event of email input field
   * @param $event 
   */
  emailChange($event: Event) {
    this.emailChanged.next($event);
  }

  /**
   * This function is responsible for sending the forgot password email to the user
   * @param email 
   * @param workspace 
   * Makes a HTTP Post request to send the email
   */
  async sendMail(email: string, workspace: string) {
    try{
      if(email == null || workspace == null || email == '' || workspace == ''){
        this.utilityService.warningNotification('Insufficient data, kindly fill up the form correctly!');
      }
      else{
        this.utilityService.asyncNotification('Please wait while we are processing your request', 
        new Promise((resolve, reject) => {

          // Preparing the email data
          let mailData: Object = {
            email: email.trim(),
            workspace: workspace.trim()
          };

          // Adding the service function to the SubSink(), so that we can unsubscribe the observable when the component gets destroyed
          this.subSink.add(this.authService.sendResetPasswordMail(mailData)
            .subscribe(async (res) => {
              this.user = {
                email: null,
                workspace: null
              };
              resolve(this.utilityService.resolveAsyncPromise('Forgot Password email sent successfully!'));
            }, (err) => {
              console.log('Error occured while sending the email', err);
              reject(this.utilityService.rejectAsyncPromise('Error occured while sending the email, please try again!'));
            }));
        }))
      }
    } catch(err){
      console.log('There\'s some unexpected error occurred, please try again later!', err);
      this.utilityService.errorNotification('There\'s some unexpected error occurred, please try again later!');
    }
  }

  /**
   * This function handles of sending the notification to the user about the email validation
   * Uses Debounce time and subscribe to the emailChanged Observable
   */
  ngAfterViewInit(): void {
    // Adding the service function to the subsink(), so that we can unsubscribe the observable when the component gets destroyed
    this.subSink.add(this.emailChanged
    .pipe(debounceTime(500), distinctUntilChanged())
    .subscribe(model => {
      this.utilityService.clearAllNotifications();
      let validatedEmailState = this.utilityService.validateEmail(this.user.email)
      ? this.utilityService.successNotification('Correct Email Format!')
      : this.utilityService.warningNotification('Kindly follow the standard format which uses user@domain nomenclature, e.g - username@example.com', 'Wrong format!')
    }))
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
    this.utilityService.clearAllNotifications();
  }
  

}
