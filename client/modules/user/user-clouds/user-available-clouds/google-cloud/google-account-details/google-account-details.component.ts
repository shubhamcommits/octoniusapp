import { Component, Injector, Input, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { GoogleCloudService } from '../services/google-cloud.service';

@Component({
  selector: 'app-google-account-details',
  templateUrl: './google-account-details.component.html',
  styleUrls: ['./google-account-details.component.scss']
})
export class GoogleAccountDetailsComponent implements OnInit {

  @Input('googleUser') googleUser: any;

  googleDriveUsed = 0;

  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private utilityService: UtilityService,
    private googleCloudService: GoogleCloudService,
    private injector: Injector
  ) { }

  ngOnInit() {
    if (this.googleUser && JSON.stringify(this.googleUser) != JSON.stringify("{}")
        && this.googleUser?.storageQuota && this.googleUser?.storageQuota?.limit) {
      this.googleDriveUsed = Math.round(
        (this.googleUser?.storageQuota?.usage / this.googleUser?.storageQuota?.limit) * 100
      );
    }
  }

  disconnectGoogleAccount() {
    this.googleCloudService.disconnectGoogleCloud(this.googleUser['refreshToken'])
      .then(() => {
        localStorage.removeItem('googleUser');
        sessionStorage.clear();
        this.googleUser = undefined;
        this.publicFunctions.sendUpdatesToGoogleUserData({});
        this.utilityService.updateIsLoadingSpinnerSource(false);
      });
  }

  googleUserExists() {
    return this.utilityService.objectExists(this.googleUser);
  }
}
