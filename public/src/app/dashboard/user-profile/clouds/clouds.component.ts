import { Component, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader'; 
import { environment } from '../../../../environments/environment';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import swal from 'sweetalert';
import { AuthService } from '../../../shared/services/auth.service';

//Google API Variables
declare var gapi: any;
declare var google: any;
//Google API Variables

@Component({
  selector: 'app-clouds',
  templateUrl: './clouds.component.html',
  styleUrls: ['./clouds.component.scss']
})
export class CloudsComponent implements OnInit {

   // !--SCOPE FOR G-DRIVE-! //
   scope = [
     'https://www.googleapis.com/auth/drive'//insert scope here
   ].join(' ');
 
   oauthToken?: any;
   // !--SCOPE FOR G-DRIVE--! //

  GoogleAuth: any;

  googleAuthSucessful: any;
  googleDriveUsed = 0;

  auth: any;

  googleUser: any;

  isLoading$ = new BehaviorSubject(false);

  constructor(private ngxService: NgxUiLoaderService, private authService: AuthService) { 
    this.loadGoogleDrive();
  }

  //!---This is a demo or testing implementation of signing in using google authentication, this is not relate to google drive---!//
  public auth2: any;

   //We need to call this google Init function in ngAfterViewInit() as the clickhandler is associated, so we must wait for the view to get initialized//
  public googleInit() {
    gapi.load('auth2', () => {
      this.auth2 = gapi.auth2.init({
        client_id: environment.clientId,
        //discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        //cookiepolicy: 'single_host_origin',
        scope: 'profile email'
       /* scope : [
          'https://www.googleapis.com/auth/drive', 'profile', 'email'//insert scope here
        ].join(' ')*/
      });
      this.attachSignin(document.getElementById('googleBtn'));
    });
  }

  //this searches for `googleBtn` element and fire's the event, to sign the user in, we need to somehow store the data in out frontend
  //create one element with id = `googleBtn` for a successful response
  public attachSignin(element) {
    this.auth2.attachClickHandler(element, {},
      (googleUser) => {

        let profile = googleUser.getBasicProfile();
        var google_auth = {
          'token': googleUser.getAuthResponse().id_token,
          'ID': profile.getId(),
          'Name': profile.getName(),
          'Email': profile.getEmail()
        }
        console.log('Token || ' + googleUser.getAuthResponse().id_token);
        console.log('ID: ' + profile.getId());
        console.log('Name: ' + profile.getName());
        console.log('Image URL: ' + profile.getImageUrl());
        console.log('Email: ' + profile.getEmail());

      }, (error) => {
        console.log('Error',JSON.stringify(error, undefined, 2));
      });
  }
  //!---This is a demo or testing implementation of signing in using google authentication, this is not relate to google drive---!//

  ngOnInit() {
    this.ngxService.start(); // start foreground loading with 'default' id
 
    // Stop the foreground loading after 5s
    setTimeout(() => {
      this.ngxService.stop(); // stop foreground loading with 'default' id
    }, 500);


    if(localStorage.getItem('google-cloud') != null){
      this.refreshGoogleToken();
      this.googleAuthSucessful = true;
      this.googleUser = JSON.parse(localStorage.getItem('google-cloud'));
      this.googleDriveUsed = Math.round((this.googleUser.user_data.storageQuota.usage/this.googleUser.user_data.storageQuota.limit)*100);
    }
    else{
      this.googleAuthSucessful = false;
      this.isLoading$.next(false);
    }
  }

  ngAfterViewInit() {
    //Uncomment the below to test the authentication with google, and check your console.

    /*
      this.googleInit();
    */
    
  }

  disconnectGoogle(){
    //gapi.auth2.getAuthInstance().signOut();
    this.googleAuthSucessful = false;

    sessionStorage.clear();

    localStorage.removeItem('google-cloud');
    localStorage.removeItem('google-cloud-token');
    this.googleUser = new Object();
    this.googleDriveUsed = 0;
  }

   loadGoogleDrive() {
    gapi.load('auth', { 'callback': console.log('Google Drive loaded') });
  }

   onAuthApiLoad() {
    gapi.auth.authorize(
      {
        'client_id': environment.clientId,
        'scope': this.scope,
        'immediate': false,
        'access_type': 'offline',
        'approval_prompt':'force',
        'response_type': 'token code',
        'grant_type': 'authorization_code'
      },
      this.handleAuthResult).then( ()=>{
        this.isLoading$.next(true);
        setTimeout(() => {
          this.googleAuthSucessful = true;
          this.googleUser = JSON.parse(localStorage.getItem('google-cloud'));
          this.googleDriveUsed = Math.round((this.googleUser.user_data.storageQuota.usage/this.googleUser.user_data.storageQuota.limit)*100);
          this.isLoading$.next(false);
          swal("Great!", "You have connected Google cloud", "success");
          console.log('Google Data', this.googleUser);
          console.log('Google Drive Usage', this.googleDriveUsed);
          
        }, 3000);
      }, (err)=>{
        console.log('Error', err);
        this.isLoading$.next(false);
      });
  }

   handleAuthResult(authResult) {
    return new Promise((resolve, reject)=>{
      console.log('Auth Results', authResult);
      if (authResult && !authResult.error) {
        if (authResult.access_token) {
          const getRefreshToken = new XMLHttpRequest();
          const fd = new FormData();
          fd.append('code', authResult.code);
          fd.append('client_id', environment.clientId);
          fd.append('client_secret', environment.clientSecret);
          fd.append('grant_type', 'authorization_code');
          fd.append('redirect_uri', 'http://localhost:4200');
          getRefreshToken.open('POST', 'https://www.googleapis.com/oauth2/v4/token', true);
          getRefreshToken.setRequestHeader('Authorization', 'Bearer ' + authResult.access_token);
      
          getRefreshToken.onload = () => {
            if (getRefreshToken.status === 200) {
              console.log(JSON.parse(getRefreshToken.responseText));
              const google_cloud_token = {
                'google_token_data': JSON.parse(getRefreshToken.responseText)
              };
              localStorage.setItem('google-cloud-token', JSON.stringify(google_cloud_token));
              
          const getUserAPI = new XMLHttpRequest();
  
          getUserAPI.open('GET', 'https://www.googleapis.com/drive/v3/about?fields=user,storageQuota', true);
          getUserAPI.setRequestHeader('Authorization', 'Bearer ' + JSON.parse(getRefreshToken.responseText).access_token);
      
          getUserAPI.onload = () => {
            if (getUserAPI.status === 200) {
              console.log(JSON.parse(getUserAPI.responseText));
              const google_cloud = {
                'user_data': JSON.parse(getUserAPI.responseText),
                'refresh_token': JSON.parse(getRefreshToken.responseText).refresh_token
              };
              localStorage.setItem('google-cloud', JSON.stringify(google_cloud));
            }
          };
          getUserAPI.send();
            }
          };
          getRefreshToken.send(fd);
          resolve();
  
          /* !---This is how we fetch the files from drives---!
          const getDriveFiles = new XMLHttpRequest();
  
          getDriveFiles.open('GET', 'https://www.googleapis.com/drive/v3/files', true);
          getDriveFiles.setRequestHeader('Authorization', 'Bearer ' + authResult.access_token);
  
          getDriveFiles.onload = () => {
            if (getDriveFiles.status === 200) {
              console.log(JSON.parse(getDriveFiles.responseText));
            }
          };
          getDriveFiles.send();
  
          !---This is how we fetch the files from drives---!*/
      }
    }
    else{
      reject();
    }
    })
   

}
// !--GOOGLE PICKER IMPLEMENTATION--! //

   refreshGoogleToken(){
  const getRefreshToken = new XMLHttpRequest();
          const fd = new FormData();
          fd.append('client_id', environment.clientId);
          fd.append('client_secret', environment.clientSecret);
          fd.append('grant_type', 'refresh_token');
          fd.append('refresh_token', JSON.parse(localStorage.getItem('google-cloud')).refresh_token);
          getRefreshToken.open('POST', 'https://www.googleapis.com/oauth2/v4/token', true);
          getRefreshToken.setRequestHeader('Authorization', 'Bearer ' + JSON.parse(localStorage.getItem('google-cloud-token')).google_token_data.access_token);
      
          getRefreshToken.onload = () => {
            if (getRefreshToken.status === 200) {
              console.log(JSON.parse(getRefreshToken.responseText));
              const google_cloud_token = {
                'google_token_data': JSON.parse(getRefreshToken.responseText)
              };
              localStorage.setItem('google-cloud-token', JSON.stringify(google_cloud_token));
              
          const getUserAPI = new XMLHttpRequest();
  
          getUserAPI.open('GET', 'https://www.googleapis.com/drive/v3/about?fields=user,storageQuota', true);
          getUserAPI.setRequestHeader('Authorization', 'Bearer ' + JSON.parse(getRefreshToken.responseText).access_token);
      
          getUserAPI.onload = () => {
            if (getUserAPI.status === 200) {
              console.log(JSON.parse(getUserAPI.responseText));
              const google_cloud = {
                'user_data': JSON.parse(getUserAPI.responseText),
                'refresh_token': JSON.parse(localStorage.getItem('google-cloud')).refresh_token
              };
              localStorage.setItem('google-cloud', JSON.stringify(google_cloud));
            }
          };
          getUserAPI.send();
            }
          };
          getRefreshToken.send(fd);
}

}
