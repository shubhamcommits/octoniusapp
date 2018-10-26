import { Component, OnInit, ViewChild } from '@angular/core';
import { Workspace } from '../../../shared/models/workspace.model';
import { WorkspaceService } from '../../../shared/services/workspace.service';
import { Router } from '@angular/router';
import { AdminService } from '../../../shared/services/admin.service';
import { ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader'; 
import swal from 'sweetalert';
@Component({
  selector: 'app-admin-members',
  templateUrl: './admin-members.component.html',
  styleUrls: ['./admin-members.component.scss']
})
export class AdminMembersComponent implements OnInit {
  workspace: Workspace;
  user_data;
  profileImage;

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
    private adminService: AdminService, private modalService: NgbModal, private ngxService: NgxUiLoaderService) { }

  ngOnInit() {
    this.ngxService.start(); // start foreground loading with 'default' id
 
    // Stop the foreground loading after 5s
    setTimeout(() => {
      this.ngxService.stop(); // stop foreground loading with 'default' id
    }, 500);
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
      //  console.log(this.workspace);
        this.profileImage = res.workspace['profile_pic'];
        this.profileImage = `http://localhost:3000/uploads/${this.profileImage}`;
      //  console.log('loadworkspace res: ', res);


      }, (err) => {

        this.alert.class = 'alert alert-danger';
       // console.log('err: ', err);

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


  updateUserRole(role, user_id, first_name, last_name) {
   // console.log('Role: ', role, 'user_id', user_id);
    const data = {
      user_id: user_id,
      role: role
    };

    swal({
      title: "Are you sure?",
      text: "You want to make "+first_name+" "+last_name+" as - "+role,
      icon: "info",
      dangerMode: true,
      buttons: ["No, cancel it!", "Yes, sure!"],
      
      })
      .then(willupdate => {
      if (willupdate) {
        this.adminService.updateUserRole(data)
        .subscribe((res) => {
        //  console.log('update respose: ', res);
  
          setTimeout(() => {
            this.modalReference.close();
          }, 3000);
  
  
          this.loadWorkspace();
  
        }, (err) => {
        //  console.log('update respose err: ', err);
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
       
        swal("Done!", first_name+"'s role has been updated to - "+role+"!", "success");
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
  console.log('Data', data);
  swal({
    title: "Are you sure?",
    text: "You want to remove "+first_name+" "+last_name+" from the workspace?",
    icon: "warning",
    dangerMode: true,
    buttons: ["Cancel", "Yes, please!"],
  })
  .then(willDelete => {
    if (willDelete) {
      this.adminService.removeUser(data.workspace_id, data.user_id)
      .subscribe((res) =>{
       console.log('Group Member is Removed!', res);
        this.loadWorkspace();
      });
      swal("Removed!", first_name+" "+last_name+", has been removed!", "success");
    }
  });
}

  openVerticallyCentered(content) {

    this.modalReference = this.modalService.open(content, { centered: true });
  }
}
