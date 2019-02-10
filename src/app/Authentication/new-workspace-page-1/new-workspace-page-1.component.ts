import { AuthService } from './../../shared/services/auth.service';
import { Component, OnInit, enableProdMode } from '@angular/core';
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
  alert = {
    message: '',
    class: ''
  };
  processing = false;

  workspace = {
    company_name: '',
    workspace_name: '',
    owner_password: '',
    owner_email: '',
    owner_first_name: '',
    owner_last_name: '',
  };


  constructor(private _authService: AuthService, private _router: Router) { }

  ngOnInit() {
    this.createNewWorkspaceForm();
  }

  createNewWorkspaceForm() {
    this.newWorkspaceForm = new FormGroup({
      'companyName': new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty]),
      'workspaceName': new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty]),
    });
  }
  enableForm() {
    this.newWorkspaceForm.enable();
  }
  disablleForm() {
    this.newWorkspaceForm.disable();
  }
  onFormSubmit() {
    this.processing = true;
    this.disablleForm();
    this._authService.checkWorkspaceName(this.workspace)
      .subscribe((res) => {
        this.alert.class = 'alert alert-success';
        this.alert.message = res.message;
        setTimeout(() => {
          this.processing = false;
          this._router.navigate(['/create-new-Workspace-page2']);
        }, 2000);
      }, (error) => {
        this.processing = false;
        this.enableForm();
        this.alert.class = 'alert alert-danger';
        if (error.status) {
          this.alert.message = error.error.message;
        } else {
          this.alert.message = 'Error! either sever is down or no internet connection!';
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
