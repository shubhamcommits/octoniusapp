import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { IntegrationsService } from 'src/shared/services/integrations-service/integrations.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { MS365CloudService } from '../services/ms-365-cloud.service';

@Component({
  selector: 'app-ms-365-account-details',
  templateUrl: './ms-365-account-details.component.html',
  styleUrls: ['./ms-365-account-details.component.scss']
})
export class MS365AccountDetailsComponent implements OnInit {

  // @Input('ms365User') ms365User: any;

  @Output() ms365Disconnected = new EventEmitter();
  
  // ms365DriveUsed = 0;

  userData;

  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private integrationsService: IntegrationsService,
    private utilityService: UtilityService,
    private ms365CloudService: MS365CloudService,
    private injector: Injector
  ) { }

  async ngOnInit() {
    this.userData = await this.publicFunctions.getCurrentUser();
    // if (this.ms365User && this.ms365User?.user && this.ms365User?.user) {
    //   this.ms365DriveUsed = Math.round(
    //     (this.ms365User?.user?.space_used / this.ms365User?.user?.space_amount) * 100
    //   );
    // }
  }

  async disconnectMS365Account() {
    this.utilityService.updateIsLoadingSpinnerSource(true);

    this.ms365CloudService.disconnectMS365Cloud()
      .then((res) => {
        localStorage.removeItem('ms365User');
        sessionStorage.clear();
        this.integrationsService.sendUpdatesToMS365UserData({});
        this.publicFunctions.sendUpdatesToUserData(res['user']);
        this.utilityService.updateIsLoadingSpinnerSource(false);
        this.ms365Disconnected.emit();
      });
  }

  subscribeToEmail($event) {
    this.utilityService.updateIsLoadingSpinnerSource(true);
    if (this.userData.integrations.ms_365.enabled_mail_subscription) {
      this.ms365CloudService.subscribeToMS365Email().then(res => {
        this.publicFunctions.sendUpdatesToUserData(res['user']);
        this.utilityService.updateIsLoadingSpinnerSource(false);
      }).catch(err => {
        this.utilityService.errorNotification(err.error.error);
        this.userData.integrations.ms_365.enabled_mail_subscription = false;
        this.utilityService.updateIsLoadingSpinnerSource(false);
      });
    } else {
      this.ms365CloudService.removeEmailSubscription().then(res => {
        this.publicFunctions.sendUpdatesToUserData(res['user']);
        this.utilityService.updateIsLoadingSpinnerSource(false);
      }).catch(err => {
        this.utilityService.errorNotification(err.error.error);
        this.userData.integrations.ms_365.enabled_mail_subscription = true;
        this.utilityService.updateIsLoadingSpinnerSource(false);
      });
    }
  }

  // ms365UserExists() {
  //   return this.utilityService.objectExists(this.ms365User);
  // }
}
