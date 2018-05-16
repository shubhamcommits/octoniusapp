import { Workspace } from './../../shared/models/workspace.model';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { InputValidators } from '../../common/validators/input.validator';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-workspace-page-2',
  templateUrl: './new-workspace-page-2.component.html',
  styleUrls: ['./new-workspace-page-2.component.scss']
})
export class NewWorkspacePage2Component implements OnInit {
  constructor(private _authService: AuthService, private _router: Router) { }


  newWorkspaceForm: FormGroup;

  workspace = {
    company_name: JSON.parse(localStorage.getItem('newWorkspace')).company_name,
    workspace_name: JSON.parse(localStorage.getItem('newWorkspace')).workspace_name,
    owner_password: '',
    owner_email: '',
    owner_first_name: '',
    owner_last_name: '',
  };

  processing = false;
  alert = {
    class: '',
    message: ''
  };

  ngOnInit() {
    this.createNewWorkspaceForm();
    console.log('new form ngOnInit', this.workspace);
  }

  createNewWorkspaceForm() {
    this.newWorkspaceForm = new FormGroup({
      'ownerFirstName': new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty]),
      'ownerLastName': new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty]),
      'ownerPassword': new FormControl(null, [Validators.required, Validators.minLength(8), InputValidators.fieldCannotBeEmpty]),
      'ownerPasswordRepeat': new FormControl(null, [Validators.required,
      InputValidators.fieldCannotBeEmpty]),
      'ownerEmail': new FormControl(null, [Validators.email]),
    });
  }

  enableNewWorkspaceForm() {
    this.newWorkspaceForm.enable();
  }
  disableNewWorkspaceForm() {
    this.newWorkspaceForm.disable();
  }
  onNewWorkspaceFormSubmit() {
    this.processing = true;
    this.newWorkspaceForm.disable();

    this._authService.createNewWorkspace(this.workspace)
      .subscribe((res) => {
        localStorage.clear();
        // this._authService.setToken(res.token);
        this._authService.storeUserData(res.token, res.user);

        this.alert.class = 'alert alert-success';
        this.alert.message = res.message;

        setTimeout(() => {
          this.processing = false;
          this._router.navigate(['/dashboard/overview']);
        }, 2000);
      }, (err) => {
        this.alert.class = 'alert alert-danger';
        this.processing = false;
        this.newWorkspaceForm.enable();

        if (err.status) {
          this.alert.message = err.error.message;
        } else {
          this.alert.message = 'Error! either server is down or no internet connection';
        }
      });
  }



  get _ownerFirstName() {
    return this.newWorkspaceForm.get('ownerFirstName');
  }

  get _ownerLastName() {
    return this.newWorkspaceForm.get('ownerLastName');
  }

  get _ownerPassword() {
    return this.newWorkspaceForm.get('ownerPassword');
  }
  get _ownerPasswordRepeat() {
    return this.newWorkspaceForm.get('ownerPasswordRepeat');
  }

  get _ownerEmail() {
    return this.newWorkspaceForm.get('ownerEmail');
  }



}
