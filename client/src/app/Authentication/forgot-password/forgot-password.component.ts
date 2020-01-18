import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { UtilityService } from '../../shared/services/utility-service/utility.service';
import { ReplaySubject } from 'rxjs/internal/ReplaySubject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs/internal/Subject';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';


@Component({
  selector: 'app-forgot-password',
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
  
  // Unsubscribe the Data
  private unSubscribe$: ReplaySubject<boolean> = new ReplaySubject(1);

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
        new Promise((resolve, reject)=>{
          let data = {
            email: email.trim(),
            workspace: workspace.trim()
          }    
            this.authService.sendResetPasswordMail(data)
            .pipe(takeUntil(this.unSubscribe$))
            .subscribe(async (res)=>{
              this.user = {
                email: null,
                workspace: null
              }
              resolve(this.utilityService.resolveAsyncPromise('Forgot Password email sent successfully!'));
            }, (err)=>{
              console.log('Error occured while sending the email', err);
              reject(this.utilityService.rejectAsyncPromise('Error occured while sending the email, please try again!'));
            })
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
    this.emailChanged
    .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.unSubscribe$))
    .subscribe(model => {
      this.utilityService.clearAllNotifications();
      let validatedEmailState = this.utilityService
      .validateEmail(this.user.email)
      ? this.utilityService.successNotification('Correct Email Format!')
      : this.utilityService.warningNotification('Kindly follow the standard format which uses user@domain nomenclature, e.g - username@example.com', 'Wrong format!')
    });
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next(true);
    this.unSubscribe$.complete();
    this.unSubscribe$.unsubscribe();
    this.emailChanged.unsubscribe();
    this.utilityService.clearAllNotifications();
  }
  

}
