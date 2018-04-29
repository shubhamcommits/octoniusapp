import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../shared/models/user.model';
import { AdminService } from '../../shared/services/admin.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { WorkspaceService } from '../../shared/services/workspace.service';
import { Workspace } from '../../shared/models/workspace.model';
import { JSONP_ERR_WRONG_RESPONSE_TYPE } from '@angular/common/http/src/jsonp';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  user: User;
  workspace: Workspace;

  options = ['member', 'admin'];
  optionSelected: any = '';


  domains = '';
  data = {
    domains: '',
    workspace_id: ''
  };

  invitionData = {
    role: '',
    email: '',
    workspace_id: ''
  };

  message;
  constructor(private _userService: UserService,
    private _adminService: AdminService, private _authService: AuthService,
    private _workspaceService: WorkspaceService,
    private _router: Router, private _flashMessagesService: FlashMessagesService) { }

  ngOnInit() {
    this._userService.getUser()
      .subscribe((res) => {
        this.user = res.user;
        this.invitionData.workspace_id = this.user._workspace;
        this._workspaceService.getWorkspace(this.user)
          .subscribe((response) => {
            this.workspace = response.workspace;
            console.log('workspace:', this.workspace);
            this.data.domains = this.workspace.allowed_domains.toString();
          }, (error) => {
            if (error.status === 401) {
              this._flashMessagesService.show(error.error.message, { cssClass: 'alert-danger', timeout: 5000 });
              setTimeout(() => {
                localStorage.removeItem('token');
                this._router.navigate(['']);
              }, 5000);

            } else if (error.status) {
              this._flashMessagesService.show(error.error.message, { cssClass: 'alert-danger', timeout: 5000 });
            }
          });
      }, (err) => {
        if (err.status === 401) {
          this._flashMessagesService.show(err.error.message, { cssClass: 'alert-danger', timeout: 5000 });
          setTimeout(() => {
            localStorage.removeItem('token');
            this._router.navigate(['']);
          }, 5000);
        }
      });
  }

  onDoaminsSave() {
    this.data.workspace_id = this.user._workspace;

    this._adminService.allowDomains(this.data)
      .subscribe((res) => {
        this._flashMessagesService.show(res.message, { cssClass: 'alert-success', timeout: 5000 });
      }, (err) => {
        if (err.status === 401) {
          this._flashMessagesService.show(err.error.message, { cssClass: 'alert-danger', timeout: 5000 });
          setTimeout(() => {
            localStorage.removeItem('token');
            this._router.navigate(['']);
          }, 5000);

        } else if (err.status) {
          this._flashMessagesService.show(err.error.message, { cssClass: 'alert-danger', timeout: 5000 });
        }
      });
  }

  onInviteNewUserViaEmail() {
    this._adminService.inviteNewUserViewEmail(this.invitionData)
      .subscribe((res) => {
        this._flashMessagesService.show(res.message, { cssClass: 'alert-success', timeout: 5000 });
      }
        , (err) => {
          if (err.status === 401) {
            this._flashMessagesService.show(err.error.message, { cssClass: 'alert-danger', timeout: 5000 });
            setTimeout(() => {
              localStorage.removeItem('token');
              this._router.navigate(['']);
            }, 5000);

          } else if (err.status) {
            this._flashMessagesService.show(err.error.message, { cssClass: 'alert-danger', timeout: 5000 });
          }

        });
  }
  onChange($event, role) {
    this.invitionData.role = role;
  }
}
