import { Component, Injector, Input, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
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
    private utilityService: UtilityService,
    private injector: Injector,
    private boxCloudService: BoxCloudService
  ) { }

  ngOnInit() {
  }

  async disconnectBoxAccount() {
    this.utilityService.updateIsLoadingSpinnerSource(true);

    const workspaceData: any = await this.publicFunctions.getCurrentWorkspace();
    this.boxCloudService.disconnectBoxCloud(this.boxUser['accessToken'], workspaceData?.integrations)
      .then((res) => {
        localStorage.removeItem('boxUser');
        sessionStorage.clear();
        this.boxUser = undefined;
        this.boxCloudService.boxAuthSuccessfulBehavior.next(false);
        this.utilityService.updateIsLoadingSpinnerSource(false);
      });
  }

}
