import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Workspace } from '../models/workspace.model';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

declare var gapi: any;

@Injectable()
export class AuthService {

  BASE_API_URL = environment.BASE_API_URL;

  constructor(private _http: HttpClient) {
    //this.initCalendarClient();
   }

   //separate entitity for loading google calendar
   initCalendarClient() {
    gapi.load('client', () => {
      console.log('loaded client')

      // It's OK to expose these credentials, they are client safe.
      gapi.client.init({
        apiKey: environment.apiKey,
        clientId: environment.clientId,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: 'https://www.googleapis.com/auth/calendar'
      })

      gapi.client.load('calendar', 'v3', () => console.log('loaded calendar'));
      //gapi.client.load('picker', () => console.log('loaded picker'));

    });
  }

  getResetPwdDetails(id) {
    return this._http.get(this.BASE_API_URL + `/auth/resetPasswordDetails/${id}`);
  }

  signIn(user) {
    return this._http.post<any>(this.BASE_API_URL + '/auth/signin', user);
  }

  signUp(user) {
    return this._http.post<any>(this.BASE_API_URL + '/auth/signup', user);
  }

  signout() {
    return this._http.get<any>(this.BASE_API_URL + '/auth/signout');
  }

  createNewWorkspace(newWorksapce) {
    return this._http.post<any>(this.BASE_API_URL + '/auth/createNewWorkspace', newWorksapce);
  }

  checkSubscriptionValidity(userId) {
    return this._http.get<any>(this.BASE_API_URL + `/auth/checkSubscriptionValidity/${userId}`);
  }

  checkWorkspaceName(workspace) {
    localStorage.setItem('newWorkspace', JSON.stringify(workspace));
    return this._http.post<any>(this.BASE_API_URL + '/auth/checkWorkspaceName', workspace);
  }
  chechUserAvailability(user) {
    return this._http.post<any>(this.BASE_API_URL + '/auth/checkUserAvailability', user);
  }

  isLoggedIn() {
    return !!localStorage.getItem('token');
  }

  setToken(token) {
    localStorage.setItem('token', token);
  }
  getToken() {
    return localStorage.getItem('token');
  }

  resetPassword(data) {
    return this._http.put(this.BASE_API_URL + `/auth/resetPassword`, data);
  }

  sendResetPasswordMail(data) {
    return this._http.post(this.BASE_API_URL + '/auth/sendResetPasswordMail', data);
  }

  storeUserData(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  async login() {
    const googleAuth = gapi.auth2.getAuthInstance();
    const googleUser = await googleAuth.signIn();

    const token = googleUser.getAuthResponse().id_token;

    console.log(googleUser);


    // Alternative approach, use the Firebase login with scopes and make RESTful API calls
    // const provider = new auth.GoogleAuthProvider()
    // provider.addScope('https://www.googleapis.com/auth/calendar');
    // this.afAuth.auth.signInWithPopup(provider)

  }

}
