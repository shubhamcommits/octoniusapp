import { HttpClient, HttpBackend } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { BehaviorSubject } from 'rxjs';

// Google APIs varibale
declare var gapi: any;

@Injectable({
  providedIn: 'root'
})

export class GoogleCloudService {

  public googleAuthSuccessfulBehavior = new BehaviorSubject(false);
  googleAuthSuccessful = this.googleAuthSuccessfulBehavior.asObservable();

  pickerApiLoaded = false;
  googleToken: any;
  BASE_API_URL = environment.USER_BASE_API_URL;

  _httpBackend: HttpClient

  constructor(
    private _http: HttpClient,
    private _handler: HttpBackend
  ) {
    this.loadGoogleDrivePicker();
    this._httpBackend = new HttpClient(_handler)
  }

  changeGoogleAuth(auth: boolean) {
    this.googleAuthSuccessfulBehavior.next(auth);
  }

  onPickerApiLoad() {
    this.pickerApiLoaded = true;
  }

  loadGoogleDrivePicker() {
    gapi.load('picker', { 'callback': this.onPickerApiLoad.bind(this) });
  }

  addToGoogleCalendar(googleCalendarData: any) {
    return new Promise((resolve, reject) => {
      if (localStorage.getItem('google-cloud-token') != null) {

        const addToCalendar = new XMLHttpRequest();

        addToCalendar.open('POST', 'https://www.googleapis.com/calendar/v3/calendars/primary/events?sendNotifications=true&sendUpdates=all', true);
        addToCalendar.setRequestHeader('Authorization', 'Bearer ' + JSON.parse(localStorage.getItem('google-cloud-token')).google_token_data.access_token);
        addToCalendar.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

        addToCalendar.onload = () => {
          if (addToCalendar.status === 200) {
            resolve();
          }
          else {
            console.log('Error while adding to google calendar', JSON.parse(addToCalendar.responseText));
            reject();
          }
        };
        addToCalendar.send(JSON.stringify(googleCalendarData));
      } else {
        console.log('You are not authenticated in order to add to google calendar');
        reject();
      }
    })

  }

  getGoogleCalendarEvents() {
    return new Promise((resolve, reject) => {
      if (localStorage.getItem('google-cloud-token') != null) {
        const getCalendarEvents = new XMLHttpRequest();

        getCalendarEvents.open('GET', 'https://www.googleapis.com/calendar/v3/calendars/primary/events', true);
        getCalendarEvents.setRequestHeader('Authorization', 'Bearer ' + JSON.parse(localStorage.getItem('google-cloud-token')).google_token_data.access_token);

        getCalendarEvents.onload = () => {
          if (getCalendarEvents.status === 200) {
            resolve();
          }
          else {
            console.log('Error while fetching google-calendar events', JSON.parse(getCalendarEvents.responseText));
            reject();
          }
        };
        getCalendarEvents.send();
      }

      else {
        console.log('You are not authenticated in order to add task to google calendar');
        reject();
      }
    })
  }

  getAccessTokenFromUserData(){
    return this._http.get(this.BASE_API_URL + '/integrations/gdrive/token')
    .toPromise()
  }

  saveAccessTokenToUser(token: any){
    return this._http.post(this.BASE_API_URL + '/integrations/gdrive/token', {
      token: token
    })
    .toPromise()
  }

  getGDriveTokenFromUser(refreshToken: string){
    return this._httpBackend.post('https://www.googleapis.com/oauth2/v4/token', {
      client_id: environment.clientId,
      client_secret: environment.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    }, {
      headers: {
        'Authorization': `Bearer ${refreshToken}`
      }
    })
    .toPromise()
  }

  getGDriveTokenFromAuthResult(authResult: any){
    return this._httpBackend.post('https://www.googleapis.com/oauth2/v4/token', {
      code: authResult.code,
      client_id: environment.clientId,
      client_secret: environment.clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: environment.google_redirect_url
    }, {
      headers: {
        'Authorization': `Bearer ${authResult.access_token}`
      }
    })
    .toPromise()
  }

  getGoogleUserDetails(accessToken: string){
    return this._httpBackend.get('https://www.googleapis.com/drive/v3/about?fields=user,storageQuota', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    .toPromise()
  }

  getGoogleFiles(searchTerm: string, accessToken: string){
    // if(localStorage.getItem('google-cloud-token') != null) {
    //   const getDriveFiles: any = new XMLHttpRequest();

    //   getDriveFiles.open('GET', 'https://www.googleapis.com/drive/v2/files?q=fullText contains '+'"'+searchTerm+'"'+'&maxResults=10&access_token='+JSON.parse(localStorage.getItem('google-cloud-token')).google_token_data.access_token, true);
    //   getDriveFiles.setRequestHeader('Authorization', 'Bearer ' + JSON.parse(localStorage.getItem('google-cloud-token')).google_token_data.access_token);

    //   getDriveFiles.onload = () => {
    //     if (getDriveFiles.status === 200) {
    //       for(var i = 0; i < JSON.parse(getDriveFiles.responseText).items.length; i++ ){
    //         if( JSON.parse(getDriveFiles.responseText).items.length>0){
    //           hashValues.push({
    //             //the id has been put manually, it is in no relation to the g-drive files, if you have any better solution to propose, then do make the changes
    //             // it is accepting only ObjectId type data
    //             // g-drive is giving a different ID type, please suggest the solution
    //             id: '5b9649d1f5acc923a497d1da',
    //             value: '<a style="color:inherit;" target="_blank" href="'+JSON.parse(getDriveFiles.responseText).items[i].embedLink + '"' + '>'+ JSON.parse(getDriveFiles.responseText).items[i].title + '</a>'
    //           });
    //         }
    //       }
    //     }
    //   };
    //   getDriveFiles.send();
    // }
    return this._httpBackend.get('https://www.googleapis.com/drive/v2/files?q=fullText contains ' + '"' + searchTerm + '"' + '&maxResults=10&access_token=' + accessToken, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
      .toPromise()
  }


  refreshGoogleToken(authResult?: any) {
    return new Promise((resolve, reject) => {
      const fetchToken = new XMLHttpRequest();
      const storageService = new StorageService();
      fetchToken.open('GET', this.BASE_API_URL + '/integrations/gdrive/token', true);
      const storageToken = storageService.getLocalData('authToken')['token'];
      fetchToken.setRequestHeader('Authorization', 'Bearer ' + storageToken);

      fetchToken.onload = () => {
        if (fetchToken.status === 200) {
          this.googleToken = JSON.parse(fetchToken.responseText).gDriveToken;
          if (this.googleToken && this.googleToken !== 'undefined' && this.googleToken !== 'null') {
            const getRefreshToken = new XMLHttpRequest();
            getRefreshToken.open('POST', 'https://www.googleapis.com/oauth2/v4/token', true);
            getRefreshToken.setRequestHeader('Authorization', 'Bearer ' + this.googleToken);

            const fd = new FormData();
            fd.append('client_id', environment.clientId);
            fd.append('client_secret', environment.clientSecret);
            fd.append('grant_type', 'refresh_token');
            fd.append('refresh_token', this.googleToken);

            getRefreshToken.onload = () => {
              if (getRefreshToken.status === 200) {
                const googleCloudToken = {
                  'google_token_data': JSON.parse(getRefreshToken.responseText)
                };
                localStorage.setItem('google-cloud-token', JSON.stringify(googleCloudToken));

                const saveToken = new XMLHttpRequest();
                saveToken.open('POST', environment.USER_BASE_API_URL + '/integrations/gdrive/token', true);
                saveToken.setRequestHeader('Authorization', 'Bearer ' + storageToken);

                const tokenData = new FormData();
                tokenData.append('token', JSON.parse(getRefreshToken.responseText).access_token);

                saveToken.onload = () => {
                  if (saveToken.status === 200) {
                    // Save the current user with the token in localstorage
                    storageService.setLocalData('userData', JSON.stringify(JSON.parse(saveToken.responseText).user));
                  }
                };
                saveToken.send(tokenData);

                const getUserAPI = new XMLHttpRequest();
                getUserAPI.open('GET', 'https://www.googleapis.com/drive/v3/about?fields=user,storageQuota', true);
                getUserAPI.setRequestHeader('Authorization', 'Bearer ' + JSON.parse(getRefreshToken.responseText).access_token);

                getUserAPI.onload = () => {
                  if (getUserAPI.status === 200) {
                    const googleCloud = {
                      'user_data': JSON.parse(getUserAPI.responseText),
                      'refresh_token': this.googleToken
                    };
                    localStorage.setItem('google-cloud', JSON.stringify(googleCloud));
                  } else {
                    console.log('Error - User and Drive data is not received');
                    reject();
                  }
                };
                getUserAPI.send();
              } else {
                console.log('Error - New Google Access token is not received');
                reject();
              }
            };

            getRefreshToken.send(fd);
            resolve();
          } else if (authResult) {
            const getToken = new XMLHttpRequest();
            const storageService = new StorageService();
            const fd = new FormData();
            fd.append('code', authResult.code);
            fd.append('client_id', environment.clientId);
            fd.append('client_secret', environment.clientSecret);
            fd.append('grant_type', 'authorization_code');
            fd.append('redirect_uri', environment.google_redirect_url);
            getToken.open('POST', 'https://www.googleapis.com/oauth2/v4/token', true);
            getToken.setRequestHeader('Authorization', 'Bearer ' + authResult.access_token);

            getToken.onload = () => {
              if (getToken.status === 200) {
                const googleCloudToken = {
                  'google_token_data': JSON.parse(getToken.responseText)
                };
                localStorage.setItem('google-cloud-token', JSON.stringify(googleCloudToken));

                const saveToken = new XMLHttpRequest();
                saveToken.open('POST', environment.USER_BASE_API_URL + '/integrations/gdrive/token', true);
                saveToken.setRequestHeader('Authorization', 'Bearer ' + storageToken);

                const tokenData = new FormData();
                tokenData.append('token', JSON.parse(getToken.responseText).access_token);

                saveToken.onload = () => {
                  if (saveToken.status === 200) {
                    console.log(JSON.parse(saveToken.responseText));
                    // Save the current user with the token in localstorage
                    storageService.setLocalData('userData', JSON.stringify(JSON.parse(saveToken.responseText).user));
                  } else {
                    this.changeGoogleAuth(false);
                    reject();
                  }
                };

                saveToken.send(tokenData);

                const getUserAPI = new XMLHttpRequest();

                getUserAPI.open('GET', 'https://www.googleapis.com/drive/v3/about?fields=user,storageQuota', true);
                getUserAPI.setRequestHeader('Authorization', 'Bearer ' + JSON.parse(getToken.responseText).access_token);

                getUserAPI.onload = () => {
                  if (getUserAPI.status === 200) {
                    const googleCloud = {
                      'user_data': JSON.parse(getUserAPI.responseText),
                      'refresh_token': JSON.parse(getToken.responseText).access_token
                    };
                    localStorage.setItem('google-cloud', JSON.stringify(googleCloud));
                  }
                };
                getUserAPI.send();
              }
            };

            getToken.send(fd);
            this.changeGoogleAuth(true);
            resolve();
          } else {
            console.log('You are not authenticated in order to sync with google');
            this.changeGoogleAuth(false);
            reject();
          }
        }
      };

      fetchToken.send();
    });
  }

  disconnectGoogleCloud() {
    sessionStorage.clear();

    localStorage.removeItem('google-cloud');
    localStorage.removeItem('google-cloud-token');

    const formdata = new FormData();
    formdata.append('token', null);

    return this._http.post(this.BASE_API_URL + '/integrations/gdrive/token', formdata);
  }


}


