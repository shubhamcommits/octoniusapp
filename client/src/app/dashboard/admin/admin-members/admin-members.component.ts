import { Component, OnInit, ViewChild } from '@angular/core';
import { Workspace } from '../../../shared/models/workspace.model';
import { WorkspaceService } from '../../../shared/services/workspace.service';
import { Router } from '@angular/router';
import { AdminService } from '../../../shared/services/admin.service';
import { ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Subject, BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-admin-members',
  templateUrl: './admin-members.component.html',
  styleUrls: ['./admin-members.component.scss']
})
export class AdminMembersComponent implements OnInit {
  workspace: Workspace;
  user_data;
  profileImage;
  BASE_URL = environment.BASE_URL;

  modalReference: any;
  @ViewChild('content', { static: false }) private content;

  // alert variable
  staticAlertClosed = false;
  private _message = new Subject<string>();
  alert = {
    class: '',
    message: ''
  };

  isLoading$ = new BehaviorSubject(false);

  constructor(private _workspaceService: WorkspaceService, private _router: Router, private alertConfig: NgbAlertConfig,
    private adminService: AdminService, private modalService: NgbModal, private ngxService: NgxUiLoaderService) { }

  ngOnInit() {
    this.ngxService.start(); // start foreground loading with 'default' id

    this.user_data = JSON.parse(localStorage.getItem('user'));
    this.loadWorkspace()
    .then(()=>{
      this.ngxService.stop();
    })
    .catch((err)=>{
      console.log('Error while fetching the loading the workpace', err);
    })
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
    this.isLoading$.next(true);
    return new Promise((resolve, reject)=>{
      this._workspaceService.getWorkspace(this.user_data.workspace)
      .subscribe((res) => {
        this.workspace = res.workspace;
      //  console.log(this.workspace);
        this.profileImage = res.workspace['profile_pic'];
        this.profileImage = `http://localhost:3000/uploads/${this.profileImage}`;
        this.isLoading$.next(false);
      //  console.log('loadworkspace res: ', res);
        resolve();
      }, (err) => {
        reject(err);
      });
    })

  }


  updateUserRole(role, user_id, first_name, last_name) {
   // console.log('Role: ', role, 'user_id', user_id);
    const data = {
      user_id: user_id,
      role: role
    };

    Swal.fire({
      title: "Are you sure?",
      text: "You want to make "+first_name+" "+last_name+" as - "+role,
      type: "info",
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Sure!'

      })
      .then(willupdate => {
      if (willupdate) {
        this.adminService.updateUserRole(data)
        .subscribe((res) => {
        //  console.log('update respose: ', res);

          // setTimeout(() => {
          //   this.modalReference.close();
          // }, 3000);


          this.loadWorkspace();

        }, (err) => {
        //  console.log('update respose err: ', err);

        });

        Swal.fire("Done!", first_name+"'s role has been updated to - "+role+"!", "success");
      }
      });
  }

  deleteWorkspaceUser(user_id) {
    this.modalReference.close();
    this.openVerticallyCentered(this.content);

    setTimeout(() => {
      this.modalReference.close();

    }, 2000);
}

removeUserfromWorkspace(user_id, first_name, last_name){
  const data = {
    'user_id':user_id,
    'workspace_id':this.user_data.workspace._id

  };

  Swal.fire({
    title: "Are you sure?",
    text: "You want to remove "+first_name+" "+last_name+" from the workspace?",
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, please!'
  })
  .then(willDelete => {
    if (willDelete.value) {
      this.adminService.removeUser(data.workspace_id, data.user_id)
      .subscribe((res) => {
       console.log('Group Member is Removed!', res);
        this.loadWorkspace();
      });
      Swal.fire("Removed!", first_name+" "+last_name+", has been removed!", "success");
    }
  });
}

  openVerticallyCentered(content) {

    this.modalReference = this.modalService.open(content, { centered: true });
  }
}
