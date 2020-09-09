import { Component, Input, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import { GoogleCloudService } from '../user-available-clouds/google-cloud/services/google-cloud.service';

@Component({
  selector: 'app-user-connected-clouds',
  templateUrl: './user-connected-clouds.component.html',
  styleUrls: ['./user-connected-clouds.component.scss']
})
export class UserConnectedCloudsComponent implements OnInit {

  @Input('googleUser')googleUser: any;

  constructor(
    private googleService: GoogleCloudService
  ) { }

  ngOnInit() {
<<<<<<< HEAD

    console.log(this.googleUser)
    // this.googleService.refreshGoogleToken().then(() => {
    //   // refresh the token and initialism the google user-data if google-cloud is already stored
    //   if (localStorage.getItem('google-cloud') != null) {
    //     this.changeGoogleAuth(true);
    //     this.googleUser = JSON.parse(localStorage.getItem('google-cloud'));
    //     this.googleDriveUsed = Math.round(
    //         (this.googleUser.user_data.storageQuota.usage / this.googleUser.user_data.storageQuota.limit) * 100
    //       );
=======
>>>>>>> 9735d628... intermediate push for google drive

    //     // we have set a time-interval of 30mins so as to refresh the access_token in the group
    //     setInterval(() => {
    //       this.googleService.refreshGoogleToken();
    //       this.changeGoogleAuth(true);
    //       this.googleUser = JSON.parse(localStorage.getItem('google-cloud'));
    //       this.googleDriveUsed = Math.round(
    //           (this.googleUser.user_data.storageQuota.usage / this.googleUser.user_data.storageQuota.limit) * 100
    //         );
    //     }, 1800000);
    //   } else {
    //     this.changeGoogleAuth(false);
    //     this.isLoading$.next(false);
    //   }
    // }).catch(() => {
    //   console.log('You haven\'t connected your google cloud yet');
    // });

    // Subscribe to google authentication state
  }

  // changeGoogleAuth(auth: boolean) {
  //   this.googleService.changeGoogleAuth(auth);
  // }

  // loadGoogleDrive() {
  //   gapi.load('auth', { callback: console.log('Google Drive loaded') });
  // }

  // disconnectGoogle() {
  //   this.googleService.disconnectGoogleCloud()
  //   .subscribe((res) => {
  //     console.log('Google Disconnected', res);
  //     this.changeGoogleAuth(false);
  //     this.googleUser = new Object();
  //     this.googleDriveUsed = 0;
  //   }, (err) => {
  //     console.log('Error while disconnecting google', err);
  //   });
  // }
}
