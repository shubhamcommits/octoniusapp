import { HttpClient, HttpBackend } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})

export class GoogleCloudService {

  // User Base API Url
  BASE_API_URL = environment.USER_BASE_API_URL

  // Http Backend
  _httpBackend: HttpClient

  // Google Auth Behaviour Subject
  public googleAuthSuccessfulBehavior = new BehaviorSubject(false)

  // Google Auth Observable
  googleAuthSuccessful = this.googleAuthSuccessfulBehavior.asObservable()

  constructor(
    private _http: HttpClient,
    private _handler: HttpBackend
  ) {

    // Dummy Http client to skip the tokenization of the requests by default
    this._httpBackend = new HttpClient(this._handler)
  }

  addToGoogleCalendar(googleCalendarData: any) {
    return new Promise((resolve, reject) => {
      if (localStorage.getItem('google-cloud-token') != null) {

        const addToCalendar = new XMLHttpRequest()

        addToCalendar.open('POST', 'https://www.googleapis.com/calendar/v3/calendars/primary/events?sendNotifications=true&sendUpdates=all', true)
        addToCalendar.setRequestHeader('Authorization', 'Bearer ' + JSON.parse(localStorage.getItem('google-cloud-token')).google_token_data.access_token)
        addToCalendar.setRequestHeader('Content-Type', 'application/jsoncharset=UTF-8')

        addToCalendar.onload = () => {
          if (addToCalendar.status === 200) {
            resolve({})
          }
          else {
            console.log('Error while adding to google calendar', JSON.parse(addToCalendar.responseText))
            reject()
          }
        }
        addToCalendar.send(JSON.stringify(googleCalendarData))
      } else {
        console.log('You are not authenticated in order to add to google calendar')
        reject()
      }
    })

  }

  getGoogleCalendarEvents() {
    return new Promise((resolve, reject) => {
      if (localStorage.getItem('google-cloud-token') != null) {
        const getCalendarEvents = new XMLHttpRequest()

        getCalendarEvents.open('GET', 'https://www.googleapis.com/calendar/v3/calendars/primary/events', true)
        getCalendarEvents.setRequestHeader('Authorization', 'Bearer ' + JSON.parse(localStorage.getItem('google-cloud-token')).google_token_data.access_token)

        getCalendarEvents.onload = () => {
          if (getCalendarEvents.status === 200) {
            resolve({})
          }
          else {
            console.log('Error while fetching google-calendar events', JSON.parse(getCalendarEvents.responseText))
            reject()
          }
        }
        getCalendarEvents.send()
      }

      else {
        console.log('You are not authenticated in order to add task to google calendar')
        reject()
      }
    })
  }

  /**
   * This function is responsible for fetching the access token from user's profile
   */
  getRefreshTokenFromUserData() {
    return this._http.get(this.BASE_API_URL + '/integrations/gdrive/token')
      .toPromise()
  }

  /**
   * This function is responsible for saving the access token to the user's profile
   * @param token
   */
  saveRefreshTokenToUser(token: any) {
    return this._http.post(this.BASE_API_URL + '/integrations/gdrive/token', {
      token: token
    })
      .toPromise()
  }

  /**
   * This function fetches the access token from the google server
   * @param refreshToken
   */
  getAccessToken(refreshToken: string, integrations: any) {
    return this._httpBackend.post('https://www.googleapis.com/oauth2/v4/token', {
      client_id: integrations.google_client_id,
      client_secret: integrations.google_client_secret_key,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    }, {
      headers: {
        'Authorization': `Bearer ${refreshToken}`
      }
    })
      .toPromise()
  }

  /**
   * This function is responsible for fetching the google drive token(authorization code) from the access_token
   * @param authResult
   */
  getGoogleDriveTokenFromAuthResult(code: any, access_token: any, integrations: any) {
    return this._httpBackend.post('https://www.googleapis.com/oauth2/v4/token', {
      code: code,
      client_id: integrations.google_client_id,
      client_secret: integrations.google_client_secret_key,
      grant_type: 'authorization_code',
      redirect_uri: environment.GOOGLE_REDIRECT_URL
    }, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    })
      .toPromise()
  }

  /**
   * This function is responsible for fetching the google user details from the google server
   * @param accessToken
   */
  getGoogleUserDetails(accessToken: string) {
    return this._httpBackend.get('https://www.googleapis.com/drive/v3/about?fields=user,storageQuota', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
      .toPromise()
  }

  /**
   * This function is responsible for search across the various files present in the connected google drive
   * @param searchTerm
   * @param accessToken
   */
  getGoogleFiles(searchTerm: string, accessToken: string) {
    return this._httpBackend.get(`https://www.googleapis.com/drive/v2/files?q=fullText contains "${searchTerm}"&maxResults=10&access_token=${accessToken}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
      .toPromise()
  }

  /**
   * This function is responsible for disconnecting the google cloud
   */
  disconnectGoogleCloud(accessToken: string) {

    // Revoke the token
    this._httpBackend.post(`https://accounts.google.com/o/oauth2/revoke?token=${accessToken}`, {}).toPromise()

    // Set the token to null
    return this._http.post(this.BASE_API_URL + '/integrations/gdrive/token', {
      token: null
    }).toPromise()
  }

}


