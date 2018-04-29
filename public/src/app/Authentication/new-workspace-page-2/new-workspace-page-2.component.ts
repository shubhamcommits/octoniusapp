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

  newWorkspaceForm: FormGroup;
  workspace: Workspace;

  constructor(private _auth: AuthService, private _router: Router) { }

  ngOnInit() {


    this.workspace = {
      company_name: this._auth.getWorkspace().company_name,
      workspace_name: this._auth.getWorkspace().workspace_name,
      owner_password: '',
      owner_email: '',
      owner_first_name: '',
      owner_last_name: '',
      allowed_domains: [],
      invited_users: []
    };

    console.log(this.workspace);


    this.newWorkspaceForm = new FormGroup({
      'ownerFirstName': new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty]),
      'ownerLastName': new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty]),
      'ownerPassword': new FormControl(null, [Validators.required, Validators.minLength(8), InputValidators.fieldCannotBeEmpty]),
      'ownerPasswordRepeat': new FormControl(null, [Validators.required,
      InputValidators.fieldCannotBeEmpty]),
      'ownerEmail': new FormControl(null, [Validators.email]),
    });
  }
  onNewWorkspaceFormSubmit() {

    this._auth.createNewWorkspace(this.workspace)
      .subscribe((res) => {
        this._auth.setToken(res.token);
        this._router.navigate(['/dashboard/overview']);
      }, (err) => {

        console.log('err', err);
        if (err.status) {
          this.newWorkspaceForm.setErrors({
            message: err.error.message
          });
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
