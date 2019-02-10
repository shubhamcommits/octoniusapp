import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../shared/services/user.service';
import { User } from '../../../shared/models/user.model';
import { WorkspaceService } from '../../../shared/services/workspace.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-overview-page-header',
  templateUrl: './overview-page-header.component.html',
  styleUrls: ['./overview-page-header.component.scss']
})
export class OverviewPageHeaderComponent implements OnInit {

  user: User;
  workspaceImageUrl;

  user_data;
  alert = {
    class: '',
    message: ''
  };

  constructor(private _userService: UserService, private _router: Router,
    private _workspaceService: WorkspaceService) { }

  ngOnInit() {
    this.user_data = JSON.parse(localStorage.getItem('user'));

    this.loadUser();
    this.loadWorkspace();

  }


  loadUser() {
    this._userService.getUser()
      .subscribe((res) => {
        this.user = res.user;
      }, (err) => {
        this.alert.class = 'alert alert-danger';
        if (err.status === 401) {
          localStorage.clear();
          this._router.navigate(['']);
        } else if (err.status) {

        } else {
        }

      });
  }


  loadWorkspace() {
    this._workspaceService.getWorkspace(this.user_data.workspace)
      .subscribe((res) => {
        if (res['workspace']['workspace_avatar'] == '') {
          this.workspaceImageUrl = '/assets/images/organization.png';
        } else {
          this.workspaceImageUrl = environment.BASE_URL + `/uploads/${res['workspace']['workspace_avatar']}`;
        }

      }, (err) => {

        this.alert.class = 'alert alert-danger';
       // console.log('err: ', err);

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
