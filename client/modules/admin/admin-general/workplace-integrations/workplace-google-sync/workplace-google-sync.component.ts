import { Component, OnInit, Input, ChangeDetectionStrategy, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { environment } from 'src/environments/environment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

// Google API Variable
declare var gapi: any;

@Component({
  selector: 'app-workplace-google-sync',
  templateUrl: './workplace-google-sync.component.html',
  styleUrls: ['./workplace-google-sync.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkplaceGoogleSyncComponent implements OnInit {

  @Input() workspaceData: any = {};
  @Input() userData: any = {};

  googleTokenClient;

  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private utilityService: UtilityService,
    public dialog: MatDialog,
    private injector: Injector
    ) {
    this.gapiLoaded();
    // this.gisLoaded();

    // this.gapiInit();
  }

  ngOnInit() {

    if (!this.utilityService.objectExists(this.userData)) {
      this.userData = this.publicFunctions.getCurrentUser();
    }
  }

  async getGoogleUserInformation() {
    if (!this.googleTokenClient) {
      await this.gisLoaded();
    }

    this.googleTokenClient.callback = async (resp) => {
      if (resp.error !== undefined) {
        throw (resp);
      }

      const user = await this.getLoggedInUser();
console.log(user);
      const schemas = await this.getUserSchema(user.customerId);
console.log(schemas);
    };

    if (!gapi.client || gapi.client.getToken() === null) {
      // Prompt the user to select a Google Account and ask for consent to share their data
      // when establishing a new session.
      this.googleTokenClient.requestAccessToken({prompt: 'consent'});
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      this.googleTokenClient.requestAccessToken({prompt: ''});
    }
  }

  /**
   * Callback after api.js is loaded.
   */
  gapiLoaded() {
    gapi.load('client:auth2', this.initializeGapiClient.bind(this));
  }

  /**
   * Callback after the API client is loaded. Loads the
   * discovery doc to initialize the API.
   */
  async initializeGapiClient() {
    const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/admin/directory_v1/rest';

    await gapi.client.init({
      apiKey: this.workspaceData?.integrations?.google_api_id,
      clientId: this.workspaceData?.integrations?.google_client_id,
      discoveryDocs: [DISCOVERY_DOC],
      scope: environment.GOOGLE_SCOPE
    });
  }

  /**
   * Callback after Google Identity Services are loaded.
   */
  gisLoaded() {
    // @ts-ignore
    this.googleTokenClient = google.accounts.oauth2.initTokenClient({
      client_id: this.workspaceData?.integrations?.google_client_id,
      scope: environment.GOOGLE_SCOPE,
      callback: '', // defined later
    });
  }

  /**
   * Print the first 10 users in the domain.
   */
  async getLoggedInUser() {
    const request = {
      // 'customer': 'my_customer',
      // 'maxResults': 1,
      'userKey': this.userData?.email
    };

    const response = await gapi.client.directory.users.get(request);
    return response.result;
//     if (!user) {
// console.log('NO USERS!!!');
//       return;
//     }

// console.log(user);
//     return user;
  }

  async getUserSchema(customerId: string) {
    const request = {
      // 'customer': 'my_customer',
      // 'maxResults': 1,
      'customerId': customerId
    };
    const response = await gapi.client.directory.schemas.list(request);
    return response.result;
  }
////////////////////////
//   async gapiInit() {
//     gapi.load('client:auth2', this.initClient.bind(this));
//   }

//   initClient() {
//     const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/admin/directory_v1/rest';
//     gapi.client.init({
//       // Client ID and API key from the Developer Console                  
//       apiKey: this.workspaceData?.integrations?.google_api_id, //'AIzaSyBUmo2t-Xi7rKN-EK-d2M8_ovLuQtIz5KI',
//       clientId: this.workspaceData?.integrations?.google_client_id,
//       discoveryDocs: [DISCOVERY_DOC],
//       scope: environment.GOOGLE_SCOPE
//     }).then(() => {
//       try {
//         console.log('loaded client');
//         gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus.bind(this));
//         this.signIn();
//       } catch (e) {
//         console.log(e);
//       }
//     });
//   }

//   listUsers2() { 
//     if (!gapi.auth2.getAuthInstance().isSignedIn.get()) { 
//       this.signIn();
//       return;
//     }

//     //gapi method formats: gapi.client.api.collection.method
//     gapi.client.directory.users.list({
//         'customer': 'my_customer',
//         'maxResults': 10,
//         'orderBy': 'email',
//       }).then((response: any) => {
//         const users = response.result.users;         
//         if (users) {
// console.log(users);
//         } else {
// console.log('no users');
//         }
//       });
//   }

//   async updateSigninStatus(isLoggedIn:boolean){
//     if(isLoggedIn){
//       //* you can disable the sign-in button(if any) because the user has //already logged in.
//       //* you can access your api library from here because the user has //logged in 
//       console.log('logged in');
//       await this.listUsers2();
//     }
//     else{
//       //you can disable the sign-out button here because the user already //clicked sign-out
//     }
//   }

//   private async signIn() {
//     if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
//       return;
//     }

//     gapi.auth2.getAuthInstance().signIn()
//       .then(() => {
//         console.log('signed in');
//       });
//   }
}
