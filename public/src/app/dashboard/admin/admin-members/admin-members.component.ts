import { Component, OnInit, ViewChild } from '@angular/core';
import { Workspace } from '../../../shared/models/workspace.model';
import { WorkspaceService } from '../../../shared/services/workspace.service';
import { Router } from '@angular/router';
import { AdminService } from '../../../shared/services/admin.service';
import { ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-admin-members',
  templateUrl: './admin-members.component.html',
  styleUrls: ['./admin-members.component.scss']
})
export class AdminMembersComponent implements OnInit {
  workspace: Workspace;
  user_data;

  modalReference: any;
  @ViewChild('content') private content;

  // alert variable
  staticAlertClosed = false;
  private _message = new Subject<string>();
  alert = {
    class: '',
    message: ''
  };

  constructor(private _workspaceService: WorkspaceService, private _router: Router, private alertConfig: NgbAlertConfig,
    private adminService: AdminService, private modalService: NgbModal) { }

  ngOnInit() {
    this.user_data = JSON.parse(localStorage.getItem('user'));
    this.loadWorkspace();
    this.alertMessageSettings();
  }


  alertMessageSettings() {
    setTimeout(() => this.staticAlertClosed = true, 20000);
    this.alertConfig.dismissible = false;
    this._message.subscribe((message) => this.alert.message = message);
    this._message.pipe(
      debounceTime(3000)
    ).subscribe(() => this.alert.message = null);

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


  updateUserRole(role, user_id) {
    console.log('Role: ', role, 'user_id', user_id);
    const data = {
      user_id: user_id,
      role: role
    };
    this.adminService.updateUserRole(data)
      .subscribe((res) => {
        console.log('update respose: ', res);
        this.alert.class = 'success';
        this._message.next(res['message']);
        this.openVerticallyCentered(this.content);

        setTimeout(() => {
          this.modalReference.close();
        }, 3000);


        this.loadWorkspace();

      }, (err) => {
        console.log('update respose err: ', err);
        this.alert.class = 'danger';

        if (err.status) {
          this._message.next(err.error.message);
          this.openVerticallyCentered(this.content);

          setTimeout(() => {
            this.modalReference.close();
          }, 3000);
        } else {
          this._message.next('Error! either server is down or no internet connection');
          this.openVerticallyCentered(this.content);
          setTimeout(() => {
            this.modalReference.close();
          }, 3000);
        }
      });
  }
  deleteWorkspaceUser(user_id) {
    this.modalReference.close();
    this.openVerticallyCentered(this.content);

    setTimeout(() => {
      this.modalReference.close();

    }, 2000);

  /*   console.log('Role: ', role, 'user_id', user_id);
    const data = {
      user_id: user_id,
      role: role
    };
    this.adminService.updateUserRole(data)
      .subscribe((res) => {
        console.log('update respose: ', res);
        this.alert.class = 'success';
        this._message.next(res['message']);
        this.openVerticallyCentered(this.content);

        setTimeout(() => {
          this.modalReference.close();
        }, 3000);


        this.loadWorkspace();

      }, (err) => {
        console.log('update respose err: ', err);
        this.alert.class = 'danger';

        if (err.status) {
          this._message.next(err.error.message);
          this.openVerticallyCentered(this.content);

          setTimeout(() => {
            this.modalReference.close();
          }, 3000);
        } else {
          this._message.next('Error! either server is down or no internet connection');
          this.openVerticallyCentered(this.content);
          setTimeout(() => {
            this.modalReference.close();
          }, 3000);
        }
      });
 */  }

  openVerticallyCentered(content) {

    this.modalReference = this.modalService.open(content, { centered: true });
  }
}
