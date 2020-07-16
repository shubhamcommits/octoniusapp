import { Component, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { GoogleCloudService } from '../user-available-clouds/google-cloud/services/google-cloud.service';
import { AuthService } from 'src/shared/services/auth-service/auth.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

// Google API Variables
declare var gapi: any;
declare var google: any;
// Google API Variables


@Component({
  selector: 'app-user-connected-clouds',
  templateUrl: './user-connected-clouds.component.html',
  styleUrls: ['./user-connected-clouds.component.scss']
})
export class UserConnectedCloudsComponent implements OnInit {

  constructor(
      private ngxService: NgxUiLoaderService,
      private authService: AuthService,
      private googleService: GoogleCloudService) {

    this.loadGoogleDrive();
  }

  googleAuthSucessful: any;
  googleDriveUsed = 0;
  googleUser: any;

  isLoading$ = new BehaviorSubject(false);

  ngOnInit() {
      this.ngxService.start(); // start foreground loading with 'default' id

      // Stop the foreground loading after 5s
      setTimeout(() => {
        this.ngxService.stop(); // stop foreground loading with 'default' id
      }, 500);

      this.googleService.refreshGoogleToken().then(() => {
        // refresh the token and initialism the google user-data if google-cloud is already stored
        if (localStorage.getItem('google-cloud') != null) {
          this.googleAuthSucessful = true;
          this.googleUser = JSON.parse(localStorage.getItem('google-cloud'));
          this.googleDriveUsed = Math.round(
              (this.googleUser.user_data.storageQuota.usage / this.googleUser.user_data.storageQuota.limit) * 100
            );

          // we have set a time-interval of 30mins so as to refresh the access_token in the group
          setInterval(() => {
            this.googleService.refreshGoogleToken();
            this.googleAuthSucessful = true;
            this.googleUser = JSON.parse(localStorage.getItem('google-cloud'));
            this.googleDriveUsed = Math.round(
                (this.googleUser.user_data.storageQuota.usage / this.googleUser.user_data.storageQuota.limit) * 100
              );
          }, 1800000);
        } else {
          this.googleAuthSucessful = false;
          this.isLoading$.next(false);
        }
      }).catch(() => {
        console.log('You haven\'t connected your google cloud yet');
      });
  }

  loadGoogleDrive() {
    gapi.load('auth', { callback: console.log('Google Drive loaded') });
  }

  disconnectGoogle() {
    this.googleService.disconnectGoogleCloud()
    .subscribe((res) => {
      console.log('Google Disconnected', res);
      this.googleAuthSucessful = false;
      this.googleUser = new Object();
      this.googleDriveUsed = 0;
    }, (err) => {
      console.log('Error while disconnecting google', err);
    });
  }
}
