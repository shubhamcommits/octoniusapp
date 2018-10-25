import { Component, OnInit } from '@angular/core';
import { Workspace } from '../../../shared/models/workspace.model';
import { WorkspaceService } from '../../../shared/services/workspace.service';
import { Router } from '@angular/router';
import { AdminService } from '../../../shared/services/admin.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NgxUiLoaderService } from 'ngx-ui-loader'; 
import swal from 'sweetalert';

@Component({
  selector: 'app-admin-general',
  templateUrl: './admin-general.component.html',
  styleUrls: ['./admin-general.component.scss']
})
export class AdminGeneralComponent implements OnInit {
  workspace: Workspace;
  user_data;
  allowed_domains = new Array();

  staticAlertClosed = false;
  private _message = new Subject<string>();

  alert = {
    class: '',
    message: ''
  };

  domainName = '';
  removeThisDomain = '';


  domainData = {
    domains: '',
    workspace_id: ''
  };

  invitationData = {
    email: '',
    workspace_id: '',
    user_id:''
  };
  constructor(private _workspaceService: WorkspaceService,
    private _adminService: AdminService, private _router: Router, private ngxService: NgxUiLoaderService) { }

  ngOnInit() {

    this.ngxService.start(); // start foreground loading with 'default' id
 
    // Stop the foreground loading after 5s
    setTimeout(() => {
      this.ngxService.stop(); // stop foreground loading with 'default' id
    }, 500);

    

    this.user_data = JSON.parse(localStorage.getItem('user'));
    this.loadWorkspace();

    setTimeout(() => this.staticAlertClosed = true, 20000);

    this._message.subscribe((message) => this.alert.message = message);
    this._message.pipe(
      debounceTime(3000)
    ).subscribe(() => this.alert.message = null);
    this.loadAllowedDomains();

  }

  loadAllowedDomains() {
    this._adminService.allowedDomains(this.user_data.workspace._id)
    .subscribe((res) => {
   //   console.log('Allowed Domains', res);
    }, (err) => {
   //   console.log('Error in Allowed Domains', err);
    })
  }

  loadWorkspace() {
    this._workspaceService.getWorkspace(this.user_data.workspace)
      .subscribe((res) => {
        this.workspace = res.workspace;
      //  console.log('response: ', res);
        this.allowed_domains = res['workspace'].allowed_domains;
       // console.log('Allowed domains', this.allowed_domains);
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



  onDomainsSave() {
    this.domainData.workspace_id = this.user_data.workspace._id;
     console.log('this.domainData', this.domainName);
     const domainName = {
       'domain': this.domainName.toString()
     };
    // console.log('user_data', this.user_data);
    if(this.domainName != ''){
      this._adminService.allowDomain(this.user_data.workspace._id, domainName )
      .subscribe((res) => {
        console.log("Domain Added", res)
        //this.alert.class = 'success';
        //this._message.next(res.message);
        swal({
          title: "Good Job!",
          text: "Domain data updated, successfully!",
          icon: "success"
        })
        .then(willreload => {
          if (willreload) {
            this.ngOnInit();
            this.domainName = '';
          }
        });
      }, (err) => {
        console.log('Error in Saving Domain', err);
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
    else
    {
     swal("Error!", "Please enter a valid email-address!", "error");
    }
   

   
  }

  OnRemoveDomain(index, allowDomain){
    const domainName = {
      'domain': allowDomain.toString()
    };
    const domainId = document.getElementById('domainName' + index);
    console.log('Domain Element', domainName);
    this._adminService.removeDomain(this.user_data.workspace._id, domainName)
    .subscribe((res) => {
      console.log('Domain has been removed', res);
    }, (err) => {
      console.log('Error while removing the domain', err);
    })
  }

  onInviteNewUserViaEmail() {

     if(this.invitationData.email != '')
     {

      this.invitationData.workspace_id = this.user_data.workspace._id;
    this.invitationData.user_id= this.user_data.user_id;
  //  console.log(this.invitationData);
    this._adminService.inviteNewUserViewEmail(this.invitationData)
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
          swal("Error!", "There was some problem, please try again!", "error");
        } else {
          this._message.next('Error! either server is down or no internet connection');

        }
      });

      swal({
        title: "Good Job!",
        text: "You have invited the member successfully!",
        icon: "success",
      })
      .then(willreload => {
        if (willreload) {
          this.invitationData.email = '';
         this.ngOnInit();
        }
      });
     }

     
     else
     {
      swal("Error!", "Please enter a valid email-address!", "error");
     }
    
  }

}
