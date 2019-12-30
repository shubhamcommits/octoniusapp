import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../shared/services/user.service';
import { User } from '../../../shared/models/user.model';
import { WorkspaceService } from '../../../shared/services/workspace.service';
import { environment } from '../../../../environments/environment';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-overview-page-header',
  templateUrl: './overview-page-header.component.html',
  styleUrls: ['./overview-page-header.component.scss']
})
export class OverviewPageHeaderComponent implements OnInit {

  user: User;
  workspaceImageUrl;
  userProfileImage;
  currentAuthenticatedUser;

  user_data;
  alert = {
    class: '',
    message: ''
  };

  constructor(private _userService: UserService, private _router: Router,
              private _workspaceService: WorkspaceService,
              private ngxService: NgxUiLoaderService) {
  }

  async ngOnInit() {
    this.ngxService.start();
    setTimeout(() => {
      this.ngxService.stop();
    }, 500);

    this.user_data = JSON.parse(localStorage.getItem('user'));

    this.currentAuthenticatedUser = await this.getCurrentAuthenticatedUser();

    (<any>window).Intercom('boot', {
      app_id: "wlumqtu3",
      name: this.currentAuthenticatedUser.first_name + ' ' + this.currentAuthenticatedUser.last_name,
      email: this.currentAuthenticatedUser.email,
      user_id: this.user_data.user_id,
      workspace: this.user_data.workspace.workspace_name,
      role: this.currentAuthenticatedUser.role,
      phone: this.currentAuthenticatedUser.integrations.mobile_number,
      company: {
        name: this.currentAuthenticatedUser.company_name,
        id: this.currentAuthenticatedUser._workspace
      }
    });

  }

  loadWorkspace() {
    return new Promise((resolve, reject)=>{
      this._workspaceService.getWorkspace(this.user_data.workspace)
      .subscribe((res) => {
        if (res['workspace']['workspace_avatar'] == '') {
          this.workspaceImageUrl = '/assets/images/organization.png';
        } else {
          this.workspaceImageUrl = environment.BASE_URL + `/uploads/${res['workspace']['workspace_avatar']}`;
        }
        resolve();
      }, (err) => {
        reject(err);
      });
    })
  }

  getCurrentAuthenticatedUser() {
    return new Promise((resolve, reject) => {
      this._userService.getUser()
        .subscribe((res) => {
          this.user = res.user;
          this.workspaceImageUrl = environment.BASE_URL + '/uploads/' + res['user']['profile_pic'];
          resolve(res['user']);
        }, (err) => {
          console.log('Error while fetching the user', err);
          reject(err);
        })
    })
  }

}
