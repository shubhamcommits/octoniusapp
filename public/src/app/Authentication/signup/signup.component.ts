import { Component, OnInit } from '@angular/core';
import { User } from '../../shared/models/user.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { InputValidators } from '../../common/validators/input.validator';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  user = {
    workspace_name: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  };

  signupForm: FormGroup;
  constructor(private _auth: AuthService, private _router: Router) { }

  ngOnInit() {



    this.signupForm = new FormGroup({
      'workspaceName': new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty]),
      'userEmail': new FormControl(null, [Validators.email, InputValidators.fieldCannotBeEmpty]),
      'userPassword': new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty]),
      'userPasswordRepeat': new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty]),
      'userFirstName': new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty]),
      'userLastName': new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty])
    });
  }

  onSignupFormSubmit() {
    this._auth.searchUserAvailability(this.user)
      .subscribe((res) => {
        this._auth.signUp(this.user)
          .subscribe((signup_response) => {

            this._auth.setToken(signup_response.token);
            this._router.navigate(['/dashboard/overview']);

          }, (signup_err) => {
            if (signup_err.status) {
              this.signupForm.setErrors({
                message: signup_err.error.message
              });
            }
          });
      }, (err) => {
        console.log(err);
        if (err.status) {
          this.signupForm.setErrors({
            message: err.error.message
          });
        }
      });

  }


  get _workspaceName() {
    return this.signupForm.get('workspaceName');
  }

  get _userEmail() {
    return this.signupForm.get('userEmail');
  }

  get _userPassword() {
    return this.signupForm.get('userPassword');
  }

  get _userPasswordRepeat() {
    return this.signupForm.get('userPasswordRepeat');
  }

  get _userFirstName() {
    return this.signupForm.get('userFirstName');
  }

  get _userLastName() {
    return this.signupForm.get('userLastName');
  }

}
