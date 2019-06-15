import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { InputValidators } from '../../common/validators/input.validator';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../shared/models/user.model';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {SnotifyService} from "ng-snotify";

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {

  // forms
  signinForm: FormGroup;
  resetPwdForm: FormGroup;
  user = {
    email: '',
    password: '',
    workspace_name: ''
  };

  alert = {
    message: '',
    class: ''
  };

  modalRef;

  processing = false;

  constructor(
    private _auth: AuthService,
    private _router: Router,
    private modalService: NgbModal,
    private snotifyService: SnotifyService
  ) { }

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

  initializeResetPwdForm() {
    // this form gets activated when we forgot our password and wish to retrieve a new one through mail
    this.resetPwdForm = new FormGroup({
      emailReset: new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty, Validators.email]),
      workspaceReset: new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty])
    });
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
       // console.log('Inside signin: ', res.user);

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

  open(modal) {
    this.initializeResetPwdForm();
    // open the modal that contains the form
    this.modalRef = this.modalService.open(modal, {centered: true});
  }

  sendMail() {
    // this is to avoid sending multiple emails.
    this.processing = true;
    // if all the fields in the form are valid
    if (this.resetPwdForm.valid) {

      const data = {
        email: this.resetPwdForm.value.emailReset.trim(),
        workspace: this.resetPwdForm.value.workspaceReset.trim()
      };

      // send server request to send an email with link
      this._auth.sendResetPasswordMail(data)
        .subscribe((res) => {
          this.modalRef.close();
          this.snotifyService.success('Successfully sent email');
          this.processing = false;
        }, (err) => {
          this.processing = false;
          // if it was an authorization error
          if (err.status === 401) {
            this.snotifyService.error(err.error.message, 'Error');
            // other server errors
          } else {
            this.snotifyService.error('A server error occurred, please try again later', 'Error');
            this.modalRef.close();
          }
        });
    }
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

  get _emailReset() {
    return this.resetPwdForm.get('emailReset');
  }

  get _workspaceReset() {
    return this.resetPwdForm.get('workspaceReset');
  }
}
