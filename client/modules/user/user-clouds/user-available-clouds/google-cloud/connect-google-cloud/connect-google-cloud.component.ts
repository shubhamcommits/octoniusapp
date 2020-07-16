import { Component, OnInit, Injector } from '@angular/core';
import { environment } from 'src/environments/environment';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { GoogleCloudService } from '../services/google-cloud.service';

// Google API Variable
declare const gapi: any;

@Component({
  selector: 'app-connect-google-cloud',
  templateUrl: './connect-google-cloud.component.html',
  styleUrls: ['./connect-google-cloud.component.scss']
})
export class ConnectGoogleCloudComponent implements OnInit {

  googleAuthSuccessful: any;

  constructor(private googleService: GoogleCloudService) { }

  ngOnInit(): void {
    this.googleService.refreshGoogleToken().then(() => {
        // refresh the token and initialism the google user-data if google-cloud is already stored
        if (localStorage.getItem('google-cloud') != null) {
          this.googleAuthSuccessful = true;
          // we have set a time-interval of 30mins so as to refresh the access_token in the group
          setInterval(() => {
            this.googleService.refreshGoogleToken();
            this.googleAuthSuccessful = true;
          }, 1800000);
        } else {
          this.googleAuthSuccessful = false;
        }
    }).catch(() => {
      console.log('You haven\'t connected your google cloud yet');
    });
  }

  /**
   * This function is responsible to handling the auth results and providing the details, it performs the following functions
   * 1. As soon as auth completes, it gives us an access_token
   * 2. Use access_token to get a refresh_token
   * 3. Store the refresh_token to server
   * 4. Use refresh_token to get the access_token all the times
   * @param authResult
   */
  handleAuthResult( authResult: any ) {
    return new Promise((resolve, reject) => {
      console.log('Auth Results', authResult);
      if (authResult && !authResult.error) {
        if (authResult.access_token) {
          const getRefreshToken = new XMLHttpRequest();

          const fd = new FormData();
          fd.append('code', authResult.code);
          fd.append('client_id', environment.clientId);
          fd.append('client_secret', environment.clientSecret);
          fd.append('grant_type', 'authorization_code');
          fd.append('redirect_uri', environment.google_redirect_url);

          getRefreshToken.open('POST', 'https://www.googleapis.com/oauth2/v4/token', true);
          getRefreshToken.setRequestHeader('Authorization', 'Bearer ' + authResult.access_token);

          getRefreshToken.onload = () => {
            if (getRefreshToken.status === 200) {
              console.log(JSON.parse(getRefreshToken.responseText));
              const googleCloudToken = {
                'google_token_data': JSON.parse(getRefreshToken.responseText)
              };
              localStorage.setItem('google-cloud-token', JSON.stringify(googleCloudToken));

              const saveToken = new XMLHttpRequest();
              const storageService = new StorageService();
              saveToken.open('POST', environment.USER_BASE_API_URL + '/integrations/gdrive/token', true);
              saveToken.setRequestHeader('Authorization', 'Bearer ' + storageService.getLocalData('authToken')['token']);

              const tokenData = new FormData();
              tokenData.append('token', JSON.parse(getRefreshToken.responseText).refresh_token);

              saveToken.onload = () => {
                if (saveToken.status === 200) {
                  console.log(JSON.parse(saveToken.responseText));
                }
              };

              saveToken.send(tokenData);

              const getUserAPI = new XMLHttpRequest();

              getUserAPI.open('GET', 'https://www.googleapis.com/drive/v3/about?fields=user,storageQuota', true);
              getUserAPI.setRequestHeader('Authorization', 'Bearer ' + JSON.parse(getRefreshToken.responseText).access_token);

              getUserAPI.onload = () => {
                if (getUserAPI.status === 200) {
                  console.log(JSON.parse(getUserAPI.responseText));
                  const googleCloud = {
                    'user_data': JSON.parse(getUserAPI.responseText),
                    'refresh_token': JSON.parse(getRefreshToken.responseText).refresh_token
                  };
                  localStorage.setItem('google-cloud', JSON.stringify(googleCloud));
                }
              };
              getUserAPI.send();
            }
          };
          getRefreshToken.send(fd);
          resolve();
        }
      } else {
        reject();
      }
    });
  }

  async onAuthApiLoad() {
      await gapi.auth.authorize({
        'client_id': environment.clientId,
        'scope': environment.scope,
        'immediate': false,
        'access_type': 'offline',
        'approval_prompt': 'force',
        'response_type': 'token code',
        'grant_type': 'authorization_code'
      }, this.handleAuthResult)
      .then((res: any) => {
        console.log(res);
        // TODO we need to change this in order to reload the specific components when google is connected.
      });
  }

}
