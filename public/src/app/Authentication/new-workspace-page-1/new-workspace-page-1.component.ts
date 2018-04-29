import { AuthService } from './../../shared/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { InputValidators } from '../../common/validators/input.validator';
import { HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Workspace } from '../../shared/models/workspace.model';

@Component({
  selector: 'app-new-workspace-page-1',
  templateUrl: './new-workspace-page-1.component.html',
  styleUrls: ['./new-workspace-page-1.component.scss']
})
export class NewWorkspacePage1Component implements OnInit {
  newWorkspaceForm: FormGroup;
  workspace: Workspace;


  constructor(private _authService: AuthService, private _router: Router) { }

  ngOnInit() {

    this.workspace = {
      company_name: '',
      workspace_name: '',
      owner_password: '',
      owner_email: '',
      owner_first_name: '',
      owner_last_name: '',
      invited_users: [],
      allowed_domains: []
    };

    this.newWorkspaceForm = new FormGroup({
      'companyName': new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty]),
      'workspaceName': new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty]),
    });

  }


  onFormSubmit() {

    this._authService.checkWorkspaceNameAvailbility(this.workspace)
      .subscribe((res) => {
        console.log('response : ', res);
        if (res) {
          this._router.navigate(['/create-new-Workspace-page2']);
        }




      }, (error) => {

        if (error.status) {
          this.newWorkspaceForm.setErrors({
            message: error.error.message
          });
        }

      });
  }

  get _companyName() {
    return this.newWorkspaceForm.get('companyName');
  }

  get _workspaceName() {
    return this.newWorkspaceForm.get('workspaceName');
  }

}
