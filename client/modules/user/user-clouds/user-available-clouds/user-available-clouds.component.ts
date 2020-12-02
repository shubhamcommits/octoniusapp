import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-user-available-clouds',
  templateUrl: './user-available-clouds.component.html',
  styleUrls: ['./user-available-clouds.component.scss']
})
export class UserAvailableCloudsComponent implements OnInit {

  constructor(
    private utilityService: UtilityService,
  ) { }

  // Google User Output Event Emitter
  @Output('googleUser') googleUser = new EventEmitter();

  ngOnInit() {
  }

  emitGoogleUser(googleUser: any) {
    this.googleUser.emit(googleUser)
  }

  slackAuth() {
    // Slack authentication permission.
    this.utilityService.getConfirmDialogAlert("Do you allow?", "Octonius for Slack is requesting permission to use your Octonius account.", "Allow")
      .then((result) => {
        if (result.value) {
          window.location.href ="https://slack.com/oauth/v2/authorize?client_id=2561616476.1145669381443&scope=channels:history,channels:join,channels:read,chat:write,chat:write.public,commands,emoji:read,groups:write,im:write,incoming-webhook,team:read,users:read,users:read.email,users:write&user_scope=channels:history,groups:history";
        }
      });
  }
}
