import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  BASE_API_URL = environment.USER_BASE_API_URL;

  constructor(private _http: HttpClient) { }

  /* | ======================================= USER DETAILS ========================================== | */

  /**
   * This function fetches the details of the currently loggedIn user
   */
  getUser(): Observable<any> {
    return this._http.get(this.BASE_API_URL + `/`)
  }

  /**
   * This function fetches the details of user based on the @userId
   * @param userId
   */
  getOtherUser(userId: string): Observable<any> {
    return this._http.get(this.BASE_API_URL + `/${userId}`);
  }

  /* | ======================================= USER DETAILS ========================================== | */

  /**
   * This function updates the details of currently loggedIn user
   * @param userData
   */
  updateUser(userData: Object) {
    return this._http.put(this.BASE_API_URL + `/`, userData)
      .toPromise();
  }

  /**
   * This function fetches all the users in the DB
   */
  getAllUsers(): Observable<any> {
    return this._http.get(this.BASE_API_URL + '/user/all')
  }

  makeUserPortalManager(userId: string, makePortalManager: boolean) {
    return this._http.put(this.BASE_API_URL + `/${userId}/make-portal-manager`, { makePortalManager: makePortalManager }).toPromise();
  }

  removeUser(userId: string) {
    return this._http.delete(this.BASE_API_URL + `/${userId}`).toPromise();
  }
}
