import { Component, EventEmitter, Injector, OnInit, Output } from '@angular/core';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { environment } from 'src/environments/environment';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { SubSink } from 'subsink';
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

  // Public Functions
  private publicFunctions = new PublicFunctions(this.injector)

  // Subsink 
  private subSink = new SubSink()

  // Google User Output Emitter
  @Output('googleUser') googleUser = new EventEmitter()

  constructor(
    private googleService: GoogleCloudService,
    private injector: Injector
  ) { }

  ngOnInit(): void {

    // Subscribe to google authentication state
    this.subSink.add(this.googleService.googleAuthSuccessful.subscribe(auth => this.googleAuthSuccessful = auth))
  }

  async signInToGoogle() {

    // Open up the SignIn Window in order to authorize the google user
    let googleSignInResult: any = await this.authorizeGoogleSignIn()

    // StorageService Instance
    let storageService = this.injector.get(StorageService)

    if (googleSignInResult != null) {

      // Check for default state
      if (googleSignInResult && !googleSignInResult.error && googleSignInResult.access_token) {

        // Fetch the Google Drive Token Object
        let googleDriveToken: any = await this.getGDriveTokenFromAuthResult(googleSignInResult)

        // Retrive the access_token and save it to our server
        let userDetails: any = await this.saveAccessTokenToUser(googleDriveToken.access_token)

        // Update the user details with updated token
        await this.publicFunctions.sendUpdatesToUserData(userDetails.user)

        // Fetch the google user details
        let googleUserDetails = await this.getGoogleUserDetails(googleDriveToken.access_token)

        // Serialise object in order to store google data locally
        let googleStorageDetails = {
          'userData': googleUserDetails,
          'refreshToken': googleDriveToken.access_token
        }

        // Store the Google User Locally
        storageService.setLocalData('googleUser', JSON.stringify(googleStorageDetails))

        // Emit Google User details to parent components
        this.googleUser.emit(googleUserDetails)

        // Change the observable state
        this.googleService.googleAuthSuccessfulBehavior.next(true)

      }
    }

  }

  async authorizeGoogleSignIn() {
    return new Promise(async (resolve) => {
      await gapi.auth.authorize({
        'client_id': environment.clientId,
        'scope': environment.scope,
        // 'immediate': false,
        // 'access_type': 'offline',
        // 'approval_prompt': 'force',
        'response_type': 'token code',
        'grant_type': 'authorization_code'
      })
        .then((res: any) => resolve(res))
        .catch(() => resolve(null))
    })
  }

  async getRefreshTokenFromUser() {
    return new Promise(async (resolve) => {
      await this.googleService.getAccessTokenFromUserData()
        .then((res) => resolve(res['gDriveToken']))
    })
  }

  async saveAccessTokenToUser(token: string) {
    return new Promise(async (resolve) => {
      await this.googleService.saveAccessTokenToUser(token)
        .then((res) => resolve(res))
    })
  }

  async getGDriveFromUser(refreshToken: string) {
    return new Promise(async (resolve) => {
      await this.googleService.getGDriveTokenFromUser(refreshToken)
        .then((res) => resolve(res))
    })
  }

  async getGDriveTokenFromAuthResult(authResult: any) {
    return new Promise(async (resolve) => {
      await this.googleService.getGDriveTokenFromAuthResult(authResult)
        .then((res) => resolve(res))
    })
  }

  async getGoogleUserDetails(accessToken: string){
    return new Promise(async (resolve) => {
      await this.googleService.getGoogleUserDetails(accessToken)
        .then((res) => resolve(res))
    })
  }

  ngOnDestroy(){
    this.subSink.unsubscribe()
  }

}
