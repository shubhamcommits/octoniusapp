import {Component, HostListener, OnInit} from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { WorkspaceService } from '../../../shared/services/workspace.service';
import * as moment from 'moment';
import swal from "sweetalert";



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

  subscription = null;

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

  cancelSubscription() {
    swal({
      title: "Are you sure?",
      text: `You want to cancel your subscription? You will be able to continue to use the workspace until the end of the current billing cycle. After that, you and the other members will be denied access to the workspace`,
      icon: "warning",
      dangerMode: true,
      buttons: ["Cancel", "Yes, I am sure"],
    }).then(() => {
      this._workspaceService.cancelSubscription()
        .subscribe(res => {
          this.workspace_information = res['workspace'];
          swal("Cancellation complete!", "If you would like to resume your subscription," +
            " you can do so up until the end of the current billing cycle", "success")
        });
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

  isWorkspaceOwner() {
    return this.workspace_information._owner == this.user_data.user_id;
  }

  async getWorkSpaceDetails() {
    return new Promise((resolve, reject)=>{
      this._workspaceService.getWorkspace(this.user_data.workspace)
      .subscribe((res)=>{
        console.log('Workspace Information', res);
        this.workspace_information = res['workspace'];
        this.members_count = res['workspace']['members'].length;
        this.guests_count = res['workspace']['invited_users'].length;
        for(let i = 0; i < this.members_count; i ++){
          if(res['workspace']['members'][i].role == 'admin'){
            this.admins_count ++;
          }
        }

        // if our subscription is still valid
        if (!!res['workspace'].billing && res['workspace'].billing.current_period_end > moment().unix()) {
          this._workspaceService.getSubscription()
            .subscribe((res2) => {
              this.subscription = res2['subscription'];
            });
        } else {
          this.subscription = null;
          resolve();
        }
      },(err)=>{
        console.log('Error found while getting the workspace information', err);
        reject(err);
      })
    })
  }

  resumeSubscription() {
    this._workspaceService.resumeSubscription()
      .subscribe((res) => {
        this.workspace_information.billing.scheduled_cancellation = false;
        swal("Good Job!", "You successfully resumed your subscription!", "success")
      });
  }



}
