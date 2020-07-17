import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { StorageService } from 'src/shared/services/storage-service/storage.service';

// Google APIs varibale
declare var gapi: any;

@Injectable({
  providedIn: 'root'
})

export class GoogleCloudService {

  pickerApiLoaded = false;
  googleToken: any;
  BASE_API_URL = environment.USER_BASE_API_URL;

  constructor(private _http: HttpClient) {
    this.loadGoogleDrivePicker();
   }

  onPickerApiLoad() {
    this.pickerApiLoaded = true;
    //console.log('Picker Loaded');
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
            //console.log('Added to Google Calendar', JSON.parse(addToCalendar.responseText));
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
           // console.log('Calendar Events', JSON.parse(getCalendarEvents.responseText));
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


  refreshGoogleToken() {
    return new Promise((resolve, reject) => {
      const fetchToken = new XMLHttpRequest();
      const storageService = new StorageService();
      fetchToken.open('GET', environment.USER_BASE_API_URL + '/integrations/gdrive/token', true);
      fetchToken.setRequestHeader('Authorization', 'Bearer ' + storageService.getLocalData('authToken')['token']);

      fetchToken.onload = () => {
        if (fetchToken.status === 200) {
          this.googleToken = JSON.parse(fetchToken.responseText).gDriveToken;
          if (this.googleToken != null) {

            const getRefreshToken = new XMLHttpRequest();

            const fd = new FormData();
            fd.append('client_id', environment.clientId);
            fd.append('client_secret', environment.clientSecret);
            fd.append('grant_type', 'refresh_token');
            fd.append('refresh_token', this.googleToken);

            getRefreshToken.open('POST', 'https://www.googleapis.com/oauth2/v4/token', true);
            getRefreshToken.setRequestHeader('Authorization', 'Bearer ' + this.googleToken);

            getRefreshToken.onload = () => {
              if (getRefreshToken.status === 200) {
                const googleCloudToken = {
                  'google_token_data': JSON.parse(getRefreshToken.responseText)
                };
                localStorage.setItem('google-cloud-token', JSON.stringify(googleCloudToken));

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
                    resolve();
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
          } else {
            console.log('You are not authenticated in order to add task to google calendar');
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


