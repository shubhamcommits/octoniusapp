import { Component, OnInit, Input, ChangeDetectionStrategy, Injector } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { PublicFunctions } from 'modules/public.functions';
import { environment } from 'src/environments/environment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { WorkplaceGoogleFieldsMapperDialogComponent } from './workplace-google-fields-mapper-dialog/workplace-google-fields-mapper-dialog.component';

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
    this.utilityService.updateIsLoadingSpinnerSource(true);

    if (!this.googleTokenClient) {
      await this.gisLoaded();
    }

    this.googleTokenClient.callback = async (resp) => {

      if (resp.error !== undefined) {
        throw (resp);
      }

      const googleUser: any = await this.getGoogleLoggedInUser();
      const schemas: any = await this.getUserSchema(googleUser.customerId);

      this.utilityService.updateIsLoadingSpinnerSource(false);

      if (!!schemas) {
        this.openGoogleFieldsMapDialog(googleUser, schemas.schemas);
      } else {
        this.utilityService.infoNotification($localize`:@@workplaceGoogleSyncComponent.noSchemas:There are no Schemas in your Google profile to synchronize with Octonius properties.`)
      }
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
  async getGoogleLoggedInUser() {
    const request = {
      'userKey': this.userData?.email,
      'projection': 'FULL'
    };

    const response = await gapi.client.directory.users.get(request);
    return response.result;
  }

  async getUserSchema(customerId: string) {
    const request = {
      'customerId': customerId
    };
    const response = await gapi.client.directory.schemas.list(request);
    return response.result;
  }

  openGoogleFieldsMapDialog(userGoogleData: any, googleSchemas: any) {
    const data = {
      googleSchemas: googleSchemas,
      isGlobal: true,
      userGoogleData: userGoogleData
    }

    const dialogRef = this.dialog.open(WorkplaceGoogleFieldsMapperDialogComponent, {
      width: '75%',
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
}
