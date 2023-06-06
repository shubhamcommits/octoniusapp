import { Component, OnInit, Input, ChangeDetectionStrategy, Injector, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { WorkplaceIntegrationsDialogComponent } from './workplace-integrations-dialog/workplace-integrations-dialog.component';
import { WorkplaceLdapFieldsMapperDialogComponent } from './workplace-ldap-fields-mapper-dialog/workplace-ldap-fields-mapper-dialog.component';
import { IntegrationsService } from 'src/shared/services/integrations-service/integrations.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { environment } from 'src/environments/environment';

// Google API Variable
declare const gapi: any;

@Component({
  selector: 'app-workplace-integrations',
  templateUrl: './workplace-integrations.component.html',
  styleUrls: ['./workplace-integrations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkplaceIntegrationsComponent implements OnInit {

  // Workspace Data Object
  @Input('workspaceData') workspaceData: any = {};

  // Router State Object - can have either 'billing' or 'general'
  @Input('routerState') routerState: string = '';

  @Output() workspaceUpdatedEvent = new EventEmitter();

  editWorkspaceName = false;

  ////////////////
  googleTokenClient;
  ////////////////

  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private workspaceService: WorkspaceService,
    private integrationsService: IntegrationsService,
    private storageService: StorageService,
    private utilityService: UtilityService,
    public dialog: MatDialog,
    private injector: Injector
    ) { }

  ngOnInit() {
  }

  openWorkplaceIntegrationsDialog() {
    const data = {
    }
    const dialogRef = this.dialog.open(WorkplaceIntegrationsDialogComponent, {
      width: '60%',
      height: '85%',
      disableClose: true,
      hasBackdrop: true,
      data: data
    });

    const datesSavedEventSubs = dialogRef.componentInstance.closeEvent.subscribe(async (data) => {
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    });

    dialogRef.afterClosed().subscribe(async result => {
      datesSavedEventSubs.unsubscribe();
    });
  }

  async getLDAPUserInformation() {
    this.utilityService.updateIsLoadingSpinnerSource(true);

    const accountData = await this.publicFunctions.getCurrentAccount();
    this.workspaceService.ldapUserInfoProperties(this.workspaceData._id, accountData?.email, true).then(res => {
      this.openLDAPFieldsMapDialog(res['ldapPropertiesNames']);
      //setTimeout(() => {
      this.utilityService.updateIsLoadingSpinnerSource(false);
      //}, 10000);
    }).catch(error => {
      this.utilityService.updateIsLoadingSpinnerSource(false);
    });
  }

  openLDAPFieldsMapDialog(ldapPropertiesNames: any) {
    const data = {
      ldapPropertiesNames: ldapPropertiesNames,
      isGlobal: true
    }
    const dialogRef = this.dialog.open(WorkplaceLdapFieldsMapperDialogComponent, {
      width: '65%',
      height: '85%',
      disableClose: true,
      hasBackdrop: true,
      data: data
    });

    const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe(async (data) => {
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    });

    dialogRef.afterClosed().subscribe(async result => {
      closeEventSubs.unsubscribe();
    });
  }

  async getGoogleUserInformation() {
    await this.gapiLoaded();
    await this.gisLoaded();
    this.handleAuthClick();
//     this.utilityService.updateIsLoadingSpinnerSource(true);
//     const accountData = await this.publicFunctions.getCurrentAccount();

//     const access_token = await this.signInToGoogle();
//     // Fetch the access token from the storage
//     this.integrationsService.googleUserInfoProperties(accountData?.email, access_token).then(res => {
// console.log(res);
//       this.integrationsService.googleDirectoryInfoProperties(res['customerId'], access_token).then(res2 => {
// console.log(res2);
//         // this.openLDAPFieldsMapDialog(res['googlePropertiesNames']);
//         this.utilityService.updateIsLoadingSpinnerSource(false);
//       }).catch(error => {
//         this.utilityService.updateIsLoadingSpinnerSource(false);
//       });
//     }).catch(error => {
//       this.utilityService.updateIsLoadingSpinnerSource(false);
//     });
  }

//   async signInToGoogle() {
//     // Open up the SignIn Window in order to authorize the google user
//     let googleSignInResult: any = await this.integrationsService.authorizeGoogleSignIn(this.workspaceData?.integrations?.google_client_id);
// console.log({googleSignInResult});
//     // Call the handle google signin function
//     let tokenResults: any = await this.integrationsService.getGoogleDriveTokenFromAuthResult(googleSignInResult.code, googleSignInResult.access_token, this.workspaceData?.integrations)
// console.log({tokenResults});
//     // Set the access_token
//     return tokenResults.access_token
//   }

  /////////////////

  /**
   * Callback after api.js is loaded.
   */
  gapiLoaded() {
    gapi.load('client', this.initializeGapiClient.bind(this));
  }

  /**
   * Callback after the API client is loaded. Loads the
   * discovery doc to initialize the API.
   */
  async initializeGapiClient() {
    const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/admin/directory_v1/rest';

    await gapi.client.init({
      apiKey: this.workspaceData?.integrations?.google_client_id,
      discoveryDocs: [DISCOVERY_DOC],
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
  handleAuthClick() {
    this.googleTokenClient.callback = async (resp) => {
      if (resp.error !== undefined) {
        throw (resp);
      }
      document.getElementById('signout_button').style.visibility = 'visible';
      document.getElementById('authorize_button').innerText = 'Refresh';
      await this.listUsers();
    };

    if (gapi.client.getToken() === null) {
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
    } catch (err) {
      // document.getElementById('content').innerText = err.message;
      return;
    }

    const users = response.result.users;
    if (!users || users.length == 0) {
      // document.getElementById('content').innerText = 'No users found.';
      return;
    }

    console.log(users);
    // // Flatten to string to display
    // const output = users.reduce(
    //     (str, user) => `${str}${user.primaryEmail} (${user.name.fullName})\n`,
    //     'Users:\n');
    // document.getElementById('content').innerText = output;
  }
}
