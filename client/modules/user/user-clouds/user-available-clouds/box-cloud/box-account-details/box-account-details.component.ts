import { Component, Injector, Input, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { IntegrationsService } from 'src/shared/services/integrations-service/integrations.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { BoxCloudService } from '../services/box-cloud.service';

@Component({
  selector: 'app-box-account-details',
  templateUrl: './box-account-details.component.html',
  styleUrls: ['./box-account-details.component.scss']
})
export class BoxAccountDetailsComponent implements OnInit {

  @Input('boxUser') boxUser: any;

  boxDriveUsed = 0;

  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private integrationsService: IntegrationsService,
    private utilityService: UtilityService,
    private boxCloudService: BoxCloudService,
    private injector: Injector
  ) { }

  ngOnInit() {
    if (this.boxUser && this.boxUser?.user && this.boxUser?.user) {
      this.boxDriveUsed = Math.round(
        (this.boxUser?.user?.space_used / this.boxUser?.user?.space_amount) * 100
      );
    }
  }

  async disconnectBoxAccount() {
    this.utilityService.updateIsLoadingSpinnerSource(true);

    const workspaceData: any = await this.publicFunctions.getCurrentWorkspace();
    this.boxCloudService.disconnectBoxCloud(this.boxUser['accessToken'], workspaceData?.integrations)
      .then((res) => {
        localStorage.removeItem('boxUser');
        sessionStorage.clear();
        this.boxUser = undefined;
        this.integrationsService.sendUpdatesToBoxUserData({});
        this.utilityService.updateIsLoadingSpinnerSource(false);
      });
  }

  boxUserExists() {
    return this.utilityService.objectExists(this.boxUser);
  }
}
