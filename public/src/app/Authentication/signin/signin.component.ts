import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { InputValidators } from '../../common/validators/input.validator';
import { THROW_IF_NOT_FOUND } from '@angular/core/src/di/injector';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
  signinForm: FormGroup;
  user = {
    email: '',
    password: '',
    workspace_name: ''
  };

  constructor(private _auth: AuthService, private _router: Router) { }

  ngOnInit() {

    this.signinForm = new FormGroup({
      'userEmail': new FormControl(null, [Validators.email, InputValidators.fieldCannotBeEmpty]),
      'userPassword': new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty]),
      'userWorkspaceName': new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty])
    });
  }


  OnSigninFormSubmit() {

    this._auth.signIn(this.user)
      .subscribe((res) => {
        localStorage.setItem('token', res.token);
        this._router.navigate(['/dashboard/overview']);
      }, (err) => {

        if (err.status) {
          this.signinForm.setErrors({
            message: err.error.message
          });
        }

      });

  }

  get _workspaceName() {
    return this.signinForm.get('userWorkspaceName');
  }

  get _userEmail() {
    return this.signinForm.get('userEmail');
  }

  get _userPassword() {
    return this.signinForm.get('userPassword');
  }

}
