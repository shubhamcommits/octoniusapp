import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
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

  constructor(
    private googleService: GoogleCloudService) { }

  ngOnInit(): void {
    this.googleService.googleAuthSuccessful.subscribe(auth => this.googleAuthSuccessful = auth);
  }

  async onAuthApiLoad() {
      await gapi.auth.authorize({
        'client_id': environment.clientId,
        'scope': environment.scope,
        // 'immediate': false,
        // 'access_type': 'offline',
        // 'approval_prompt': 'force',
        'response_type': 'token code',
        'grant_type': 'authorization_code'
      }, (authResult: any) => {
        console.log(authResult)
        if (authResult && !authResult.error && authResult.access_token) {
          return this.googleService.refreshGoogleToken(authResult);
        } else {
          return new Promise((resolve, reject) => {reject()});
        }
      });
  }

}
