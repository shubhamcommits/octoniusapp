import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {WorkspaceService} from '../../../shared/services/workspace.service';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-admin-page-header',
  templateUrl: './admin-page-header.component.html',
  styleUrls: ['./admin-page-header.component.scss']
})

export class AdminPageHeaderComponent implements OnInit {

  workspaceImageUrl = '';
  profilePic = '';
  user_data;

  alert = {
    class: '',
    message: ''
  };

  constructor(private _workspaceService: WorkspaceService, private _router: Router) {
  }


  ngOnInit() {
    this.user_data = JSON.parse(localStorage.getItem('user'));
    this.loadWorkspace();

  }

  loadWorkspace() {
    this._workspaceService.getWorkspace(this.user_data.workspace)
      .subscribe((res) => {
        if (res['workspace']['workspace_avatar'] == null) {
          this.workspaceImageUrl = '/assets/images/organization.png';
        } else {
          this.workspaceImageUrl = environment.BASE_URL + `/uploads/${res['workspace']['workspace_avatar']}`;
        }
      }, (err) => {
        this.alert.class = 'alert alert-danger';
        if (err.status === 401) {
          this.alert.message = err.error.message;
          setTimeout(() => {
            localStorage.clear();
            this._router.navigate(['']);
          }, 2000);
        }
      });
  }

}
