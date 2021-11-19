import { Component, Injector, Input, OnInit, SimpleChanges } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-connect-slack',
  templateUrl: './connect-slack.component.html',
  styleUrls: ['./connect-slack.component.scss']
})
export class ConnectSlackComponent implements OnInit {

  @Input() userData:any;

  slackAuthSuccessful: Boolean;

  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    public userService: UserService,
    private injector: Injector,
    private router: ActivatedRoute
  ) { }

  async ngOnInit() {

    this.userService.slackDisconnected().subscribe(event => {
      setTimeout(() => {
        this.userData = this.publicFunctions.getCurrentUser();
      }, 200);
      this.slackAuthSuccessful = (this.userData && this.userData.integrations && this.userData.integrations.is_slack_connected) ? true : false
    });

    if (!this.userData) {
      this.userData = await this.publicFunctions.getCurrentUser();
    }
    this.slackAuthSuccessful = (this.userData && this.userData.integrations && this.userData.integrations.is_slack_connected) ? true : false

   if(!this.slackAuthSuccessful){
      this.router.queryParams.subscribe(params => {
        if (params['code']) {
          try {
            this.utilityService.asyncNotification($localize`:@@connectSlack.pleaseWaitAuthenticatinSlack:Please wait, while we are authenticating the slack...`, new Promise((resolve, reject) => {
              this.userService.slackAuth(params['code'], this.userData)
              .subscribe((res) => {
                  // Resolve the promise
                  setTimeout(() => {
                    this.updateUserData(res);
                  }, 1000);

                  resolve(this.utilityService.resolveAsyncPromise($localize`:@@connectSlack.authenticatedSuccessfully:Authenticated Successfully!`))

                }),
                ((err) => {
                  console.log('Error occurred, while authenticating for Slack', err);
                  reject(this.utilityService.rejectAsyncPromise($localize`:@@connectSlack.oppsErrorWhileAuthenticatinoSlack:Oops, an error occurred while authenticating for Slack, please try again!`))
                });
            }));
          }
          catch (err) {
            console.log('There\'s some unexpected error occurred, please try again!', err);
            this.utilityService.errorNotification($localize`:@@connectSlack.unexpectedErrorOccured:There\'s some unexpected error occurred, please try again!`);
          }
        }
      });
    }
  }


/**
   * This function is responsible to update user slack connection status.
   */
  async updateUserData(newUserData){
    await this.userService.updateUser(newUserData);
    await this.publicFunctions.sendUpdatesToUserData(this.userData);
    this.slackAuthSuccessful = true;
    this.userService.slackConnected().emit(true);

  }

  async ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      const change = changes[propName];
      const to = change.currentValue;
      if (propName === 'userData') {
        this.userData = to;
        this.slackAuthSuccessful = (this.userData && this.userData.integrations && this.userData.integrations.is_slack_connected) ? true : false
      }
    }
  }

  /**
   * This function is responsible for connecting the slack acount to the main octonius server
   */
  async slackAuth() {
    this.utilityService.getConfirmDialogAlert($localize`:@@connectSlack.doYouAllow:Do you allow?`, $localize`:@@connectSlack.octoniusForSlackRequestingPermission:Octonius for Slack is requesting permission to use your Octonius account.`, $localize`:@@connectSlack.allow:Allow`)
      .then((result) => {
        if (result.value) {
          localStorage.setItem("slackAuth", "connected");
          window.location.href = environment.slack_redirect_url;
        }
      });
  }
}
