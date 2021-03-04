import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/shared/services/auth-service/auth.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  // Defining User Object, which accepts the following properties
  user: { password: string, repeatPassword: string } = {
    password: null,
    repeatPassword: null
  };

  // Reset Password Id
  resetPwdId = this._activatedRoute.snapshot.paramMap.get('resetPwdId');

  constructor(
    private utilityService: UtilityService,
    private authenticationService: AuthService,
    public router: Router,
    private _activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
  }

  matchUserPassword() {
    (this.user.password == this.user.repeatPassword)
      ? this.utilityService.successNotification('Password matches successfully!')
      : this.utilityService.warningNotification("Password doesn\'t match!");
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
          this.router.navigate(['home'])
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

}
