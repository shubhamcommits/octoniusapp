import { Component, OnInit } from '@angular/core';
import { User } from '../../shared/models/user.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { InputValidators } from '../../common/validators/input.validator';
import { AuthService } from '../../shared/services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import { GroupService } from '../../shared/services/group.service';

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

  alert = {
    message: '',
    class: ''
  };
  processing = false;

  signupForm: FormGroup;
  constructor(private _auth: AuthService,
              private _router: Router,
              private _activateRoute: ActivatedRoute,
              private groupService: GroupService) { }

  ngOnInit() {
    this.createSignupForm();
    this._activateRoute.queryParams.subscribe(queryParams => this.user.workspace_name = queryParams.workplace)
  }

  createSignupForm() {
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
    this.processing = true;
    this.disableSignUpForm();

    this._auth.chechUserAvailability(this.user)
      .subscribe((res) => {

        this._auth.signUp(this.user)
          .subscribe((signup_response) => {
            this.alert.class = 'alert alert-success';
            this.alert.message = signup_response.message;

          //  console.log('res', signup_response);

            setTimeout(() => {
              this.processing = false;
              // this._auth.setToken(signup_response.token);
              this._auth.storeUserData(signup_response.token, signup_response.user);
              this._router.navigate(['/dashboard/overview']);

              // Get smart groups and their rules
              this.groupService.getAllSmartGroupRules(signup_response.user.workspace._id)
              .subscribe(
                ({ groups }) => {
                  groups.map(group => {
                    // Potentially add the new user to the current smart group
                    const data: object = {
                      workspaceId: group._workspace,
                      currentSettings: {
                        emailDomains: group.conditions.email_domains,
                        jobPositions: group.conditions.job_positions,
                        skills: group.conditions.skills
                      }
                    };
                    this.groupService.updateSmartGroupMembers(group._id, data)
                      .subscribe(
                        res => // console.log('Added to smart group successfully!'),
                        error => {
                          console.error('Could not auto add member to smart group!');
                          console.error(error);
                        }
                      );
                  });
                },
                error => {
                  console.error('Could not get all smart groups!');
                  console.error(error);
                }
              );
            }, 3000);

          }, (signup_err) => {
            this.processing = false;
            this.enableSignUpForm();
            this.alert.class = 'alert alert-danger';

            if (signup_err.status) {
              this.alert.message = signup_err.error.message;
            } else {
              this.alert.message = 'Error! either server is down or no internent connection';
            }
          });
      }, (err) => {
        this.enableSignUpForm();
        this.processing = false;
        this.alert.class = 'alert alert-danger';

        if (err.status) {
          this.alert.message = err.error.message;
        } else {
          this.alert.message = 'Error! either server is down or no internet connection';
        }
      });

  }


  enableSignUpForm() {
    this.signupForm.enable();
  }

  disableSignUpForm() {
    this.signupForm.disable();
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
