import {Component, HostListener, OnInit} from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { WorkspaceService } from '../../../shared/services/workspace.service';


@Component({
  selector: 'app-admin-billing',
  templateUrl: './admin-billing.component.html',
  styleUrls: ['./admin-billing.component.scss']
})
export class AdminBillingComponent implements OnInit {

  user_data;
  workspace_information: any = new Object();
  members_count = 0;
  admins_count = 0;
  guests_count = 0;
  groups_count = 0;

  handler: any;
  amount = 1000; // equals 10 dollars

  constructor(private ngxService: NgxUiLoaderService, private _workspaceService: WorkspaceService) {
    this.user_data = JSON.parse(localStorage.getItem('user'));
  }

  async ngOnInit() {
    this.ngxService.start(); // start foreground loading with 'default' id

    // Stop the foreground loading after 5s
    setTimeout(() => {
      this.ngxService.stop(); // stop foreground loading with 'default' id
    }, 500);
    await this.getWorkSpaceDetails();

    this.handler = StripeCheckout.configure({
      key: 'pk_test_rgLsr0HrrbMcqQr5G7Wz1zFK',
      image: 'https://ixxidesign.azureedge.net/media/1676572/Mickey-Mouse-3.jpg?mode=max&width=562&height=613',
      locale: 'auto',
      token: token => {
        this._workspaceService.createSubscription(token, this.amount)
          .subscribe( res => {
            console.log('RES', res);
          })
      }
    });
  }

  handlePayment() {
    this.handler.open({
      name: 'Octonius workspace',
      description: 'Start a monthly subscription',
      amount: this.amount
    });
  }

  // when user redirects or presses the back button
  @HostListener('window: popstate')
    onPopstate() {
    this.handler.close();
    }

  async getWorkSpaceDetails() {
    return new Promise((resolve, reject)=>{
      this._workspaceService.getWorkspace(this.user_data.workspace)
      .subscribe((res)=>{
        console.log('Workspace Information', res);
        this.workspace_information = res['workspace'];
        this.members_count = res['workspace']['members'].length;
        this.guests_count = res['workspace']['invited_users'].length;
        for(var i = 0; i < this.members_count; i ++){
          if(res['workspace']['members'][i].role == 'admin'){
            this.admins_count ++;
          }
        }
        resolve();
      },(err)=>{
        console.log('Error found while getting the workspace information', err);
        reject(err);
      })
    })


  }

}
