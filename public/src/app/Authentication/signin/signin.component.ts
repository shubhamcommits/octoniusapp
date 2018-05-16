import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { InputValidators } from '../../common/validators/input.validator';
import { THROW_IF_NOT_FOUND } from '@angular/core/src/di/injector';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../shared/models/user.model';

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

  alert = {
    message: '',
    class: ''
  };


  processing = false;

  constructor(private _auth: AuthService, private _router: Router) { }

  ngOnInit() {
    this.createSignInForm();
  }

  createSignInForm() {
    this.signinForm = new FormGroup({
      'userEmail': new FormControl(null, [Validators.email, InputValidators.fieldCannotBeEmpty]),
      'userPassword': new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty]),
      'userWorkspaceName': new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty])
    });
  }


  enableSignInForm() {
    this.signinForm.enable();
  }

  disableSignInForm() {
    this.signinForm.disable();
  }

  OnSigninFormSubmit() {
    this.disableSignInForm();
    this.processing = true;

    this._auth.signIn(this.user)
      .subscribe((res) => {
        // this._auth.setToken(res.token);
        this.alert.class = 'alert alert-success';
        this.alert.message = res.message;
        this._auth.storeUserData(res.token, res.user);
        console.log('Inside signin: ', res.user);

        setTimeout(() => {
          this._router.navigate(['/dashboard/overview']);
        }, 2000);


      }, (err) => {
        this.alert.class = 'alert alert-danger';
        this.processing = false;
        this.enableSignInForm();
        if (err.status) {
          this.alert.message = err.error.message;
        } else {
          this.alert.message = 'Error! either server is down or you internet is not working';
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
