import { Component, Input, OnInit } from '@angular/core';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { GoogleCloudService } from '../services/google-cloud.service';

@Component({
  selector: 'app-google-account-details',
  templateUrl: './google-account-details.component.html',
  styleUrls: ['./google-account-details.component.scss']
})
export class GoogleAccountDetailsComponent implements OnInit {

  constructor(
    private storageService: StorageService,
    private googleCloudService: GoogleCloudService
  ) { }

  @Input('googleUser') googleUser: any = this.getUserDataFromStorage() || {}

  googleDriveUsed = 0;

  ngOnInit() {
    if (JSON.stringify(this.googleUser) != JSON.stringify("{}"))
      this.googleDriveUsed = Math.round(
        (this.googleUser.storageQuota.usage / this.googleUser.storageQuota.limit) * 100
      )
  }

  getUserDataFromStorage() {
    return (this.storageService.existData('googleUser') === null) ? {} : this.storageService.getLocalData('googleUser')['userData']
  }

  disconnectGoogleAccount() {
    this.googleCloudService.disconnectGoogleCloud(this.storageService.getLocalData('googleUser')['refreshToken'])
      .then(() => {
        localStorage.removeItem('googleUser')
        sessionStorage.clear()
        this.googleUser = undefined
        this.googleCloudService.googleAuthSuccessfulBehavior.next(false)
      })
  }

}
