import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/shared/services/auth-service/auth.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { Subject } from 'rxjs/internal/Subject';
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

  // EMAIL DATA
  label: string = "Email";
  placeholder: string = "";

  ngOnInit() {
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
        this.utilityService.warningNotification($localize`:@@forgotPwd.insufficientData:Insufficient data, kindly fill up the form correctly!`);
      }
      else{
        this.utilityService.asyncNotification($localize`:@@forgotPwd.pleaseWaitProcessing:Please wait while we are processing your request`,
        new Promise((resolve, reject) => {

          // Preparing the email data
          let mailData: Object = {
            email: email.trim(),
            workspace_name: workspace.trim()
          };

          // Adding the service function to the SubSink(), so that we can unsubscribe the observable when the component gets destroyed
          this.subSink.add(this.authService.sendResetPasswordMail(mailData)
            .subscribe(async (res) => {
              this.user = {
                email: null,
                workspace: null
              };
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@forgotPwd.forgotPwdEmailSent:Forgot Password email sent successfully!`));
            }, (err) => {
              console.log('Error occured while sending the email', err);
              reject(this.utilityService.rejectAsyncPromise($localize`:@@forgotPwd.errorSendingEmail:Error occured while sending the email, please try again!`));
            }));
        }))
      }
    } catch(err){
      console.log('There\'s some unexpected error occurred, please try again later!', err);
      this.utilityService.errorNotification('There\'s some unexpected error occurred, please try again later!');
    }
  }

  /**
   * This function gets the Valid Email from the @module <app-email-input></app-email-input>
   * @param $event
   */
  getValidEmail($event: string){
    this.user.email = $event;
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
    this.utilityService.clearAllNotifications();
  }


}
