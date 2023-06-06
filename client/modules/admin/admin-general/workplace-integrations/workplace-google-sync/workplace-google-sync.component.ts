import { Component, OnInit, Input, ChangeDetectionStrategy, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { environment } from 'src/environments/environment';

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

  googleTokenClient;

  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public dialog: MatDialog,
    private injector: Injector
    ) {
    // this.gapiLoaded();
    // this.gisLoaded();

    this.gapiInit();
  }

  ngOnInit() {
  }

  async getGoogleUserInformation() {
    this.handleAuthClick();
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
      apiKey: 'AIzaSyBUmo2t-Xi7rKN-EK-d2M8_ovLuQtIz5KI',
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
   *  Sign in the user upon button click.
   */
  async handleAuthClick() {
    if (!this.googleTokenClient) {
      await this.gisLoaded();
    }

    this.googleTokenClient.callback = async (resp) => {
      if (resp.error !== undefined) {
        throw (resp);
      }

      await this.listUsers();
    };
console.log({ gapi });
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
   * Print the first 10 users in the domain.
   */
  async listUsers() {
    let response;
    try {
      const request = {
        'customer': 'my_customer',
        'maxResults': 10,
        'orderBy': 'email',
      };

      response = await gapi.client.directory.users.list(request);
console.log({ response });
    } catch (err) {
console.log(err);
      return;
    }

    const users = response.result.users;
    if (!users || users.length == 0) {
console.log('NO USERS!!!');
      return;
    }

console.log(users);
  }
//////////////////////
  async gapiInit() {
    gapi.load('client:auth2', this.initClient.bind(this));
  }

  initClient() {
    const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/admin/directory_v1/rest';
    gapi.client.init({
      // Client ID and API key from the Developer Console                  
      apiKey: 'AIzaSyBUmo2t-Xi7rKN-EK-d2M8_ovLuQtIz5KI',
      clientId: this.workspaceData?.integrations?.google_client_id,
      discoveryDocs: [DISCOVERY_DOC],
      scope: environment.GOOGLE_SCOPE
    }).then(() => {
      try {
        console.log('loaded client');
        gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus.bind(this));
        this.signIn();
      } catch (e) {
        console.log(e);
      }
    });
  }

  listUsers2() { 
    if (!gapi.auth2.getAuthInstance().isSignedIn.get()) { 
      this.signIn();
      return;
    }

    //gapi method formats: gapi.client.api.collection.method
    gapi.client.directory.users.list({
        'customer': 'my_customer',
        'maxResults': 10,
        'orderBy': 'email',
      }).then((response: any) => {
        const users = response.result.users;         
        if (users) {
console.log(users);
        } else {
console.log('no users');
        }
      });
  }

  async updateSigninStatus(isLoggedIn:boolean){
    if(isLoggedIn){
      //* you can disable the sign-in button(if any) because the user has //already logged in.
      //* you can access your api library from here because the user has //logged in 
      console.log('logged in');
      await this.listUsers2();
    }
    else{
      //you can disable the sign-out button here because the user already //clicked sign-out
    }
  }

  private async signIn() {
    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
      return;
    }

    gapi.auth2.getAuthInstance().signIn()
      .then(() => {
        console.log('signed in');
      });
  }
}
