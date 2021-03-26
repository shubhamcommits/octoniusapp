import { Component, Injector, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UserService } from 'src/shared/services/user-service/user.service';

@Component({
  selector: 'app-team-account-details',
  templateUrl: './team-account-details.component.html',
  styleUrls: ['./team-account-details.component.scss']
})
export class TeamAccountDetailsComponent implements OnInit {
  
  // check bit for teams connection
  isTeamConnected:boolean;
  userData: any;

  public publicFunctions = new PublicFunctions(this.injector);
  constructor(
    public userService: UserService,
    private injector: Injector,
  ) { }

  async ngOnInit() {
    this.userData = await this.publicFunctions.getCurrentUser();
    this.isTeamConnected = this.userData?.integrations?.is_teams_connected || false
  }

  /**
    * This function is responsible to disconnect teams and then redirect back the flow to teams authenticaiton end
  */
  async disconnectTeamsAccount(){
    this.userService.disconnectTeams(this.userData._id)
      .subscribe((res) => {
        if (!res.connect) {
          this.userData.integrations.is_teams_connected = false;
          this.userService.updateUser(this.userData);
          this.publicFunctions.sendUpdatesToUserData(this.userData);
          this.isTeamConnected = false;
        }
      }),
      ((err) => {
        console.log('Error occured, while disconnecting for Teams', err);
      });
  }

}
