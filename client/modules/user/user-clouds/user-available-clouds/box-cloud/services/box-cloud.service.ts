import { HttpClient, HttpBackend } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})

export class BoxCloudService {

  // Integrations Base API Url
  INTEGRATIONS_API_URL = environment.INTEGRATIONS_BASE_API_URL;

  // Http Backend
  _httpBackend: HttpClient

  /**
  * Both of the variables listed down below are used to share the data through this common service among different components in the app
  * @constant boxUserDataSource
  * @constant currentBoxUserData
  */
  private boxUserDataSource = new BehaviorSubject<any>({});
  currentBoxUserData = this.boxUserDataSource.asObservable();

  constructor(
    private _http: HttpClient,
    private _handler: HttpBackend
  ) {

    // Dummy Http client to skip the tokenization of the requests by default
    this._httpBackend = new HttpClient(this._handler)
  }

  /**
   * This function is responsible for fetching the access token from user's profile
   */
  getRefreshTokenFromUserData() {
    return this._http.get(this.INTEGRATIONS_API_URL + '/box/token').toPromise();
  }

  /**
   * This function is responsible for saving the access token to the user's profile
   * @param token
   */
  saveRefreshTokenToUser(token: any) {
    return this._http.post(this.INTEGRATIONS_API_URL + '/box/token', {
      token: token
    }).toPromise();
  }

  authorizeBoxSignIn(workspaceId: string, redirect_uri: string) {
    return this._http.get(this.INTEGRATIONS_API_URL + `/box/auth/${workspaceId}`, {
      params: {
        redirect_uri: redirect_uri
      }
    }).toPromise();
  }

  getBoxUserDetails(accessToken: string, workspaceId: string) {
    return this._http.get(this.INTEGRATIONS_API_URL + `/box/boxUser`, {
      params: {
        accessToken: accessToken,
        workspaceId: workspaceId
      }
    }).toPromise();
    /*
    return this._httpBackend.get(`https://api.box.com/2.0/users/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }).toPromise();
    */
  }

  /**
   * This function fetches the access token from the box server
   * @param refreshToken
   */
  refreshAccessToken(refreshToken: string, integrations: any) {
    return this._httpBackend.post('https://api.box.com/oauth2/token', {
        client_id: integrations.box_client_id,
        client_secret: integrations.box_client_secret_key,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }, {
        headers: {
          //'Authorization': `Bearer ${refreshToken}`,
          'Content-Type': 'application/json'
        }
      }).toPromise()
  }

  /**
   * This function is responsible for fetching the box drive token(authorization code) from the access_token
   * @param authResult
   */
  getBoxDriveTokenFromAuthResult(boxCode: any, integrations: any) {

    return this._httpBackend.post('https://api.box.com/oauth2/token', {
        grant_type: 'authorization_code',
        code: boxCode,
        client_id: integrations.box_client_id,
        client_secret: integrations.box_client_secret_key
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).toPromise();
  }

  /**
   * This function is responsible for disconnecting the box cloud
   */
  disconnectBoxCloud(accessToken: string, integrations: any) {
    return this._http.post(this.INTEGRATIONS_API_URL + '/box/revokeToken', {
      accessToken: accessToken,
      box_client_id: integrations.box_client_id,
      box_client_secret_key: integrations.box_client_secret_key
    }).toPromise();
  }

  getBoxFiles(searchTerm: string, accessToken: string, integrations: any) {
    return this._httpBackend.get(`https://api.box.com/2.0/search?query=${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).toPromise();
  }

  /**
   * Used to emit the next value of observable so that where this is subscribed, will get the updated value
   * @param boxUserData
   */
  public updateBoxUserDataService(boxUserData: any){
    this.boxUserDataSource.next(boxUserData);
  }
}
