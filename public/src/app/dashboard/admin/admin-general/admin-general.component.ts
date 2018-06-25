import { Component, OnInit } from '@angular/core';
import { Workspace } from '../../../shared/models/workspace.model';
import { WorkspaceService } from '../../../shared/services/workspace.service';
import { Router } from '@angular/router';
import { AdminService } from '../../../shared/services/admin.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
@Component({
  selector: 'app-admin-general',
  templateUrl: './admin-general.component.html',
  styleUrls: ['./admin-general.component.scss']
})
export class AdminGeneralComponent implements OnInit {
  workspace: Workspace;
  user_data;

  staticAlertClosed = false;
  private _message = new Subject<string>();

  alert = {
    class: '',
    message: ''
  };


  domainData = {
    domains: '',
    workspace_id: ''
  };

  invitationData = {
    email: '',
    workspace_id: ''
  };
  constructor(private _workspaceService: WorkspaceService,
    private _adminService: AdminService, private _router: Router) { }

  ngOnInit() {

    this.user_data = JSON.parse(localStorage.getItem('user'));
    this.loadWorkspace();

    setTimeout(() => this.staticAlertClosed = true, 20000);

    this._message.subscribe((message) => this.alert.message = message);
    this._message.pipe(
      debounceTime(3000)
    ).subscribe(() => this.alert.message = null);

  }

  loadWorkspace() {
    this._workspaceService.getWorkspace(this.user_data.workspace)
      .subscribe((res) => {
        this.workspace = res.workspace;
        // console.log('response: ', res);
        this.domainData.domains = this.workspace.allowed_domains.toString();
        // console.log('domains: ', this.domainData.domains);

      }, (err) => {
        this.alert.class = 'alert alert-danger';
        if (err.status === 401) {
          this.alert.message = err.error.message;
          setTimeout(() => {
            localStorage.clear();
            this._router.navigate(['']);
          }, 3000);
        } else if (err.status) {
          this.alert.message = err.error.message;
        } else {
          this.alert.message = 'Error! either server is down or no internet connection';
        }
      });
  }



  onDoaminsSave() {
    this.domainData.workspace_id = this.user_data.workspace._id;
    // console.log('this.domainData', this.domainData);
    // console.log('user_data', this.user_data);

    this._adminService.allowDomains(this.domainData)
      .subscribe((res) => {
        this.alert.class = 'success';
        this._message.next(res.message);
      }, (err) => {
        this.alert.class = 'danger';
        if (err.status === 401) {
          this._message.next(err.error.message);
          setTimeout(() => {
            localStorage.clear();
            this._router.navigate(['']);
          }, 3000);

        } else if (err.status) {
          this._message.next(err.error.message);
        } else {
          this._message.next('Erorr! either server is down or no internet connection');

        }
      });
  }

  onInviteNewUserViaEmail() {
    console.log('insdie invitaito');
    this.invitationData.workspace_id = this.user_data.workspace._id;
    this._adminService.inviteNewUserViewEmail(this.invitationData)
      .subscribe((res) => {
        this.alert.class = 'success';
        this._message.next(res.message);
      }
        , (err) => {
          this.alert.class = 'danger';
          if (err.status === 401) {
            this._message.next(err.error.message);
            setTimeout(() => {
              localStorage.clear();
              this._router.navigate(['']);
            }, 3000);
          } else if (err.status) {
            this._message.next(err.error.message);
          } else {
            this._message.next('Error! either server is down or no internet connection');
          }

        });
  }

}
