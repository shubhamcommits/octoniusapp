import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { UserService } from 'src/shared/services/user-service/user.service';
import { GoogleCloudService } from './google-cloud/services/google-cloud.service';
import { BoxCloudService } from './box-cloud/services/box-cloud.service';
import { IntegrationsService } from 'src/shared/services/integrations-service/integrations.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-user-available-clouds',
  templateUrl: './user-available-clouds.component.html',
  styleUrls: ['./user-available-clouds.component.scss']
})
export class UserAvailableCloudsComponent implements OnInit {

  // Google User Output Event Emitter
  @Input() userData:any;

  @Output('googleUser') googleUser = new EventEmitter();
  @Output('boxUser') boxUser = new EventEmitter();
  @Output('ms365User') ms365User = new EventEmitter();

  workspaceData: any;

  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private integrationsService: IntegrationsService,
    private storageService: StorageService,
    private userService: UserService,
    private utilityService: UtilityService,
    private injector: Injector
  ) { }

  async ngOnInit() {
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    if (!this.workspaceData?.integrations?.is_google_connected && this.storageService.existData('googleUser')) {
      localStorage.removeItem('googleUser');
      sessionStorage.clear();
      this.integrationsService.sendUpdatesToGoogleUserData({});
    }

    if (!this.workspaceData?.integrations?.is_slack_connected && this.userData?.integrations?.is_slack_connected) {
      this.userService.disconnectSlack(this.userData._id)
        .subscribe((res) => {
          this.userData.integrations.is_slack_connected = false;
          this.userService.updateUser(this.userData);
          this.publicFunctions.sendUpdatesToUserData(this.userData);
          this.userService.slackDisconnected().emit(true);
        }),
        ((err) => {
          console.log('Error occurred, while authenticating for Slack', err);
        });
    }

    if (!this.workspaceData?.integrations?.is_box_connected && this.storageService.existData('boxUser')) {
      localStorage.removeItem('boxUser');
      sessionStorage.clear();
      this.integrationsService.sendUpdatesToBoxUserData({});
    }

    this.utilityService.updateIsLoadingSpinnerSource(false);
  }

  emitGoogleUser(googleUser: any) {
    this.googleUser.emit(googleUser)
  }

  emitBoxUser(boxUser: any) {
    this.boxUser.emit(boxUser)
  }

  emitMS365User(ms365User: any) {
    this.ms365User.emit(ms365User)
  }
}
