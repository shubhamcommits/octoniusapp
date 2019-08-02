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

  user_data;
  alert = {
    class: '',
    message: ''
  };

  constructor(private _userService: UserService, private _router: Router,
    private _workspaceService: WorkspaceService,
    private ngxService: NgxUiLoaderService,) { }

  ngOnInit() {
    this.ngxService.start(); 
    this.user_data = JSON.parse(localStorage.getItem('user'));

    // this.loadUser()
    // .then(()=>{
    //    this.loadWorkspace()
    //   .then(()=>{
    //      this.loadWorkspace();
    //   })
    //   .catch((err)=>{
    //     console.log('Error while loading the workspace', err);
    //   })
    // })
    // .catch((err)=>{
    //   console.log('Error while loading the user', err);
    // })
    this.loadUser();

  }


  loadUser() {
    return new Promise((resolve, reject)=>{
      this._userService.getUser() 
      .subscribe((res) => {
        this.user = res.user;
        this.workspaceImageUrl=environment.BASE_URL + '/uploads/'+ res['user']['profile_pic'];
        console.log(this.workspaceImageUrl);
        resolve();
      }, (err) => {
        reject(err);
      });
    })

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

}
