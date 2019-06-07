import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../shared/services/auth.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {InputValidators} from "../../common/validators/input.validator";
import {isEqualPassword} from "../../common/validators/equal-passwords.validator";
import {SnotifyService} from "ng-snotify";
import {fadeIn, rotateIn} from "./reset-password.component.animations";

@Component({
  selector: 'reset-password',
  templateUrl: './reset-pwd.component.html',
  styleUrls: ['./reset-password.component.scss'],
  animations: [
    rotateIn,
    fadeIn
  ]
})
export class ResetPwdComponent implements OnInit {

  user;
  resetPwdId;

  loaded = false;
  processing = false;

  // animation states
  state = 'mid';
  logo_state = 'invisible';


  // Form variables
  resetPasswordForm: FormGroup;
  get _newPassword1() { return this.resetPasswordForm.get('newPassword1'); }
  get _newPassword2() { return this.resetPasswordForm.get('newPassword2'); }


  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private snotifyService: SnotifyService) { }

  ngOnInit() {
    this.initializeForm();
    this.route.params.subscribe((params) => {
      // this is the ID of the reset password document which we use first to show user's picture and name
      // and when the form is valid and complete we use it to change our password on the backend.
      this.getUserDetails(params.id);
    });
  }

  // after the first animation ended we trigger the new animation states
  changeState() {
    this.state = 'end';
    this.logo_state = 'visible';
  }

  getUserDetails(id) {
    this.authService.getResetPwdDetails(id)
      .subscribe((res: any) => {
        this.user = res.resetPwdDoc.user;
        console.log('USER', this.user);
        this.resetPwdId = res.resetPwdDoc._id;
        this.loaded = true;
      }, (err) => {
        this.loaded = true;
      });
  }

  initializeForm() {
    this.resetPasswordForm = new FormGroup({
      newPassword1: new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty, Validators.pattern('^.*(?=.{4,10})(?=.*\\d)(?=.*[a-zA-Z]).*$')]),
      newPassword2: new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty, isEqualPassword])
    });
  }

  submitNewPassword() {
    if (this.resetPasswordForm.value.newPassword1 === this.resetPasswordForm.value.newPassword2) {
      // to avoid multiple requests
      this.processing = true;

      const data = {
        password: this.resetPasswordForm.value.newPassword1,
        resetPwdId: this.resetPwdId
      };

      // server request
      this.authService.resetPassword(data)
        .subscribe((res) => {
          this.snotifyService.success('Successfully changed password');
          // navigate to home page where user can log in with new password
          this.router.navigateByUrl('/signin');
        });
    }
  }
}
