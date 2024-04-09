import { HttpClient, HttpBackend } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})

export class MS365CloudService {

  // Integrations Base API Url
  INTEGRATIONS_API_URL = environment.INTEGRATIONS_BASE_API_URL;

  // Http Backend
  _httpBackend: HttpClient

  /**
  * Both of the variables listed down below are used to share the data through this common service among different components in the app
  * @constant ms365UserDataSource
  * @constant currentMS365UserData
  */
  private ms365UserDataSource = new BehaviorSubject<any>({});
  currentMS365UserData = this.ms365UserDataSource.asObservable();

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
    return this._http.get(this.INTEGRATIONS_API_URL + '/ms365/token').toPromise();
  }

  authorizeMS365SignIn(workspaceId: string, redirect_uri?: string) {
    return this._http.get(this.INTEGRATIONS_API_URL + `/ms365/auth/${workspaceId}`, {
      params: {
        redirect_uri: redirect_uri
      }
    }).toPromise();
  }

  /**
   * This function is responsible for fetching the ms365 drive token(authorization code) from the access_token
   * @param authResult
   */
  getMS365DriveTokenFromAuthResult(ms365Code: string/*, ms365ClientInfo: string, ms365SessionState: string, workspaceId: string*/) {
    return this._http.post(this.INTEGRATIONS_API_URL + '/ms365/token', {
      ms365Code: ms365Code,
      // ms365ClientInfo: ms365ClientInfo,
      // ms365SessionState: ms365SessionState,
      // workspaceId: workspaceId
    }).toPromise();
  }

  /**
   * This function is responsible for fetching the ms365 drive token(authorization code) from the access_token
   * @param authResult
   */
  subscribeToMS365Email() {
    return this._http.post(this.INTEGRATIONS_API_URL + '/ms365/subscribe-to-mail', {}).toPromise();
  }

  removeEmailSubscription() {
    return this._http.post(this.INTEGRATIONS_API_URL + '/ms365/remove-mail-subscription', {}).toPromise();
  }

  /**
   * This function is responsible for disconnecting the ms365 cloud
   */
  disconnectMS365Cloud() {
    return this._http.post(this.INTEGRATIONS_API_URL + '/ms365/revokeToken', {}).toPromise();
  }

  getMS365Files(searchTerm: string) {
    return this._http.get(`${this.INTEGRATIONS_API_URL}/ms365/search?query=${searchTerm}`, {}).toPromise();
  }

  /**
   * Used to emit the next value of observable so that where this is subscribed, will get the updated value
   * @param ms365UserData
   */
  public updateMS365UserDataService(ms365UserData: any){
    this.ms365UserDataSource.next(ms365UserData);
  }
}
