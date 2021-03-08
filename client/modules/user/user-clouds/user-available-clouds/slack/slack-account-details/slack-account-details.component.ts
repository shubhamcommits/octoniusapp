import { Component, Injector, Input, OnInit, SimpleChange } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UserService } from 'src/shared/services/user-service/user.service';

@Component({
  selector: 'app-slack-account-details',
  templateUrl: './slack-account-details.component.html',
  styleUrls: ['./slack-account-details.component.scss']
})
export class SlackAccountDetailsComponent implements OnInit {

  @Input() slackAuthSuccessful:boolean;
  userData: any;

  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public userService: UserService,
    private injector: Injector,
  ) { }

  async ngOnInit() {
    this.userData = await this.publicFunctions.getCurrentUser();
  }

  async ngOnChanges(changes: SimpleChange) {
    for (const propName in changes) {
      const change = changes[propName];
      const to = change.currentValue;
      if (propName === 'slackAuthSuccessful') {
        this.slackAuthSuccessful=to;
      }
    }
  }

  disconnectSlackAccount() {
    this.userService.disconnectSlack(this.userData._id)
      .subscribe((res) => {
        if (!res.connect) {
          this.userData.integrations.is_slack_connected = false;
          this.userService.updateUser(this.userData);
          this.publicFunctions.sendUpdatesToUserData(this.userData);
          this.slackAuthSuccessful = false;
          this.userService.slackDisconnected().emit(true);
        }
      }),
      ((err) => {
        console.log('Error occured, while authenticating for Slack', err);
      });
  }

}
