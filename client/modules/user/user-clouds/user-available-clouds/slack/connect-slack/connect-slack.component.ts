import { Component, EventEmitter, Injector, OnInit, Output, SimpleChanges } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-connect-slack',
  templateUrl: './connect-slack.component.html',
  styleUrls: ['./connect-slack.component.scss']
})
export class ConnectSlackComponent implements OnInit {

  slackAuthSuccessful: Boolean;
  userData: any;

  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    public userService: UserService,
    private injector: Injector
  ) { }

  async ngOnInit() {
    this.userData = await this.publicFunctions.getCurrentUser();
    this.slackAuthSuccessful = (this.userData && this.userData.integrations && this.userData.integrations.is_slack_connected) ? true : false
  }

  /**
   * This function is responsible for connecting the slack acount to the main octonius server
   */
  async slackAuth() {
    this.utilityService.getConfirmDialogAlert("Do you allow?", "Octonius for Slack is requesting permission to use your Octonius account.", "Allow")
      .then((result) => {
        if (result.value) {
          localStorage.setItem("slackAuth", "connected");
          window.location.href = environment.slack_redirect_url;
        }
      });
  }
}
