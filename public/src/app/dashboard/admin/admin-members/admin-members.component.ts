import { Component, OnInit } from '@angular/core';
import { Workspace } from '../../../shared/models/workspace.model';
import { WorkspaceService } from '../../../shared/services/workspace.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-members',
  templateUrl: './admin-members.component.html',
  styleUrls: ['./admin-members.component.scss']
})
export class AdminMembersComponent implements OnInit {
  workspace: Workspace;
  user_data;
  alert = {
    class: '',
    message: ''
  };

  constructor(private _workspaceService: WorkspaceService, private _router: Router) { }

  ngOnInit() {
    this.user_data = JSON.parse(localStorage.getItem('user'));
    this.loadWorkspace();
  }

  loadWorkspace() {
    this._workspaceService.getWorkspace(this.user_data.workspace)
      .subscribe((res) => {
        this.workspace = res.workspace;
      }, (err) => {

        this.alert.class = 'alert alert-danger';
        if (err.status === 401) {
          this.alert.message = err.error.message;
          setTimeout(() => {
            localStorage.clear();
            this._router.navigate(['']);
          }, 2000);

        } else if (err.status) {
          this.alert.message = err.error.message;
        } else {
          this.alert.message = 'Error! either server is down or no internet connection';
        }
      });

  }
}
