import { Injectable, Injector } from '@angular/core';
import { GoogleCloudService } from 'modules/user/user-clouds/user-available-clouds/google-cloud/services/google-cloud.service';
import { environment } from 'src/environments/environment';
import { SubSink } from 'subsink';
import { StorageService } from '../storage-service/storage.service';
import { UtilityService } from '../utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import { BoxCloudService } from 'modules/user/user-clouds/user-available-clouds/box-cloud/services/box-cloud.service';

// Google API Variable
declare const gapi: any;
declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class IntegrationsService {

    private subSink = new SubSink();

    // Public Functions
    private publicFunctions = new PublicFunctions(this.injector)

    constructor(
        private injector: Injector
    ) { }

    /**
     * This function unsubscribes the data from the observables
     */
    ngOnDestroy(): void {
        this.subSink.unsubscribe();
    }


    /**
     * GOOGLE DRIVE INTEGRATION STARTS
     */

    /**
     * This function opens up the window to signin to google and connect the account
     */
     async authorizeGoogleSignIn(integrations: any) {
      return new Promise(async (resolve) => {
          await gapi.auth.authorize({
              'client_id': integrations.google_client_id,
              'scope': environment.GOOGLE_SCOPE,
              'immediate': false,
              'access_type': 'offline',
              'approval_prompt': 'force',
              'response_type': 'token code',
              'grant_type': 'authorization_code'
            })
              .then((res: any) => resolve(res))
              .catch(() => resolve(null))
      })
  }

  /**
   * This function handles the google signin result and connect the account to octonius server
   * @param googleSignInResult
   */
  async handleGoogleSignIn(googleSignInResult?: any) {

      // StorageService Instance
      let storageService = this.injector.get(StorageService)

      // Access token variable
      let access_token: any = null

      // Refresh token variable
      let refresh_token: any = null;

      const workspaceData: any = await this.publicFunctions.getCurrentWorkspace();

      // If its a default refresh in the background
      if (!googleSignInResult) {

          // Fetch the refresh token
          refresh_token = (storageService.existData('googleUser')) ? storageService.getLocalData('googleUser')['refreshToken'] : await this.getRefreshGoogleTokenFromUser()

          // Token Results
          let tokenResults: any = {
              access_token: ''
          }

          // Assign the access_token from the refresh token
          if (refresh_token != null && refresh_token != undefined)
              tokenResults = await this.getGoogleAccessToken(refresh_token, workspaceData?.integrations)

          // Set the access_token
          access_token = tokenResults.access_token

      }

      // Check for default state
      if (googleSignInResult && !googleSignInResult.error && googleSignInResult.access_token) {

          // Fetch the Google Drive Token Object
          let tokenResults: any = await this.getGoogleDriveTokenFromAuthResult(googleSignInResult.code, googleSignInResult.access_token, workspaceData?.integrations)

          // Set the access_token
          access_token = tokenResults.access_token

          // Set the refresh token
          refresh_token = tokenResults.refresh_token
      }

      if (access_token != null && refresh_token != null) {

          // Retrieve the refresh_token and save it to our server
          let userDetails: any = await this.saveRefreshGoogleTokenToUser(refresh_token)

          // Update the user details with updated token
          await this.publicFunctions.sendUpdatesToUserData(userDetails.user)

          // Fetch the google user details
          let googleUserDetails = await this.getGoogleUserDetails(access_token)

          // Store the google user locally and serialise object in order to store google data locally
          storageService.setLocalData('googleUser', JSON.stringify({
              'userData': googleUserDetails,
              'refreshToken': refresh_token,
              'accessToken': access_token
          }))

          // Change the observable state
          this.sendUpdatesToGoogleUserData({});

          // Return google user details
          return googleUserDetails
      }

      // Return google user details
      return {}
  }

  /**
   * This functions calls the refresh token service function
   */
  async getRefreshGoogleTokenFromUser() {
      let googleService = this.injector.get(GoogleCloudService)
      return new Promise(async (resolve) => {
          await googleService.getRefreshTokenFromUserData()
              .then((res) => resolve(res['gDriveToken']))
      })
  }

  /**
   * This function saves the refresh token to user's profile
   * @param token
   */
  async saveRefreshGoogleTokenToUser(token: string) {
      let googleService = this.injector.get(GoogleCloudService)
      return new Promise(async (resolve) => {
          await googleService.saveRefreshTokenToUser(token)
              .then((res) => resolve(res))
      })
  }

  /**
   * This function fetches the access token stored in the user's profile
   * @param refreshToken
   */
  async getGoogleAccessToken(refreshToken: string, integrations: any) {
      let googleService = this.injector.get(GoogleCloudService)
      return new Promise(async (resolve) => {
          await googleService.getAccessToken(refreshToken, integrations)
              .then((res) => resolve(res))
      })
  }

  /**
   * This function is responsible for fetching the authorization code from google auth results
   * @param code
   * @param access_token
   */
  async getGoogleDriveTokenFromAuthResult(code: string, access_token: string, integrations: any) {
      let googleService = this.injector.get(GoogleCloudService)
      return new Promise(async (resolve) => {
          await googleService.getGoogleDriveTokenFromAuthResult(code, access_token, integrations)
              .then((res) => resolve(res))
      })
  }

  /**
   * This function is responsible for fetching the google user details
   * @param accessToken
   */
  async getGoogleUserDetails(accessToken: string) {
      let googleService = this.injector.get(GoogleCloudService)
      return new Promise(async (resolve) => {
          await googleService.getGoogleUserDetails(accessToken)
              .then((res) => resolve(res))
      })
  }

    /**
     * This function is responsible for fetching the google drive files from connected google drive
     * @param searchTerm
     * @param accessToken
     */
    searchGoogleFiles(searchTerm: string, accessToken: string) {
        return new Promise((resolve) => {
            let googleService = this.injector.get(GoogleCloudService)
            googleService.getGoogleFiles(searchTerm, accessToken)
                .then((res) => resolve(res['items']))
                .catch(() => resolve([]))
        })
    }

    public async getCurrentGoogleUser() {
      let userData: any = await this.getGoogleUserDetailsFromService();
console.log("1111: ", userData);
      if (JSON.stringify(userData) == JSON.stringify({})) {
        userData = await this.getGoogleUserDetailsFromStorage();
      }
console.log("2222: ", userData);
      if (JSON.stringify(userData) == JSON.stringify({})) {
        userData = await this.getGoogleUserDetailsFromHTTP().catch(err => {
          userData = {};
        });
      }
console.log("3333: ", userData);
      this.sendUpdatesToGoogleUserData(userData);
console.log("4444: ", userData);
      return userData || {};
    }

    async getGoogleUserDetailsFromService() {
        return new Promise((resolve) => {
            const googleCloudService = this.injector.get(GoogleCloudService);
            this.subSink.add(googleCloudService.currentGoogleUserData.subscribe((res) => {
                resolve(res)
            }));
        });
    }

    async getGoogleUserDetailsFromStorage() {
        const storageService = this.injector.get(StorageService);
console.log(storageService.existData('googleUser'));
console.log(storageService.getLocalData('googleUser'));
        return (storageService.existData('googleUser') === null) ? {} : storageService.getLocalData('googleUser');
    }

    async getGoogleUserDetailsFromHTTP() {

        return new Promise(async (resolve, reject) => {
          const googleCloudService = this.injector.get(GoogleCloudService);
            const userData = await this.publicFunctions.getCurrentUser();
            if (userData && userData?.integrations
                && userData?.integrations?.gdrive && userData?.integrations?.gdrive?.token) {
              googleCloudService.getGoogleUserDetails(userData?.integrations?.gdrive?.token)
                .then((res) => resolve(res['user']))
                .catch(err => resolve({}));
            }
        });
    }

    async sendUpdatesToGoogleUserData(googleUserData: Object) {
        const storageService = this.injector.get(StorageService);
        const googleCloudService = this.injector.get(GoogleCloudService);
        googleCloudService.updateGoogleUserDataService(googleUserData);
        storageService.setLocalData('googleUser', JSON.stringify(googleUserData))
    }

    /**
     * GOOGLE DRIVE INTEGRATION ENDS
     */


    /**
     * BOX INTEGRATION STARTS
     */

    /**
     * This function opens up the window to signin to google and connect the account
     */
    async authorizeBoxSignIn(workspaceId: string, redirect_uri: string) {
        return new Promise(async (resolve) => {
            let boxService = this.injector.get(BoxCloudService);
            await boxService.authorizeBoxSignIn(workspaceId, redirect_uri)
                .then((res: any) => resolve(res.authorize_url))
                .catch(() => resolve(null));
        });
    }

    /**
     * This function handles the box signin result and connect the account to octonius server
     * @param boxSignInResult
     */
    async handleBoxSignIn(boxCode?: string) {

        // StorageService Instance
        let storageService = this.injector.get(StorageService);

        // Box Service Instance
        let boxService = this.injector.get(BoxCloudService);

        let utilityService = this.injector.get(UtilityService);

        // Access token variable
        let access_token: any = null;

        // Refresh token variable
        let refresh_token: any = null;

        const workspaceData: any = await this.publicFunctions.getCurrentWorkspace();

        let boxUser = storageService.getLocalData('boxUser');
        // If its a default refresh in the background
        if (!boxCode || (boxUser || JSON.stringify(boxUser) != JSON.stringify({}))) {

            // Fetch the refresh token
            refresh_token = (boxUser) ? boxUser['refreshToken'] : await this.getRefreshBoxTokenFromUser();

            // Token Results
            let tokenResults: any = {
                access_token: ''
            }

            // Assign the access_token from the refresh token
            if (refresh_token != null && refresh_token != undefined) {
                tokenResults = await this.getBoxAccessToken(refresh_token, workspaceData?.integrations)
            }

            // Set the access_token
            access_token = tokenResults.access_token
        }

        // Check for default state
        if (boxCode && (!boxUser || JSON.stringify(boxUser) == JSON.stringify({}))) {

            // Fetch the Google Drive Token Object
            let tokenResults: any = await this.getBoxDriveTokenFromAuthResult(boxCode, workspaceData?.integrations);

            // Set the access_token
            access_token = tokenResults.access_token;

            // Set the refresh token
            refresh_token = tokenResults.refresh_token;

            //boxTokenUser = tokenResults.user;
        }

        if (access_token != null && refresh_token != null/* && boxTokenUser != null*/) {

            // Retrieve the refresh_token and save it to our server
            let userDetails: any = await this.saveRefreshBoxTokenToUser(refresh_token);

            // Update the user details with updated token
            await this.publicFunctions.sendUpdatesToUserData(userDetails.user);

            const user: any = await boxService.getBoxUserDetails(access_token);

            boxUser = {
              'user': user,
              'refreshToken': refresh_token,
              'accessToken': access_token
            };

            // Store the box user locally and serialise object in order to store box data locally
            storageService.setLocalData('boxUser', JSON.stringify(boxUser));

            // Change the observable state
            this.sendUpdatesToBoxUserData(boxUser);

            utilityService.updateIsLoadingSpinnerSource(false);

            // Return box user details
            return boxUser;
        }

        utilityService.updateIsLoadingSpinnerSource(false);

        // Return box user details
        return {}
    }

    /**
     * This functions calls the refresh token service function
     */
    async getRefreshBoxTokenFromUser() {
        let boxCloudService = this.injector.get(BoxCloudService)
        return new Promise(async (resolve) => {
            await boxCloudService.getRefreshTokenFromUserData()
                .then((res) => resolve(res['boxToken']))
        });
    }

    /**
     * This function saves the refresh token to user's profile
     * @param token
     */
    async saveRefreshBoxTokenToUser(token: string) {
        let boxCloudService = this.injector.get(BoxCloudService)
        return new Promise(async (resolve) => {
            await boxCloudService.saveRefreshTokenToUser(token)
                .then((res) => resolve(res))
        })
    }

    /**
     * This function fetches the access token stored in the user's profile
     * @param refreshToken
     */
    async getBoxAccessToken(refreshToken: string, integrations: any) {
        let boxCloudService = this.injector.get(BoxCloudService)
        return new Promise(async (resolve) => {
            await boxCloudService.getAccessToken(refreshToken, integrations)
                .then((res) => resolve(res))
        })
    }

    /**
     * This function is responsible for fetching the authorization code from google auth results
     * @param code
     * @param access_token
     */
    async getBoxDriveTokenFromAuthResult(boxCode: string, integrations: any) {
      let boxService = this.injector.get(BoxCloudService)
      return new Promise(async (resolve) => {
          await boxService.getBoxDriveTokenFromAuthResult(boxCode, integrations)
              .then((res) => {
                resolve(res)
              })
      });
    }

    /**
     * This function is responsible for fetching the box drive files from connected box drive
     * @param searchTerm
     * @param accessToken
     * @returns
     */
    searchBoxFiles(searchTerm: string, accessToken: string, integrations: any) {
      return new Promise((resolve) => {
          let boxService = this.injector.get(BoxCloudService);
          boxService.getBoxFiles(searchTerm, accessToken, integrations)
              .then((res) => {
                resolve(res['entries']);
              })
              .catch(() => resolve([]))
      });
    }

    public async getCurrentBoxUser() {
      let userData: any = await this.getBoxUserDetailsFromService();

      if (JSON.stringify(userData) == JSON.stringify({})) {
        userData = await this.getBoxUserDetailsFromStorage();
      }

      if (JSON.stringify(userData) == JSON.stringify({})) {
        userData = await this.getBoxUserDetailsFromHTTP().catch(err => {
          userData = {};
        });
      }

      this.sendUpdatesToBoxUserData(userData);

      return userData || {};
    }

    async getBoxUserDetailsFromService() {
        return new Promise((resolve) => {
            const boxCloudService = this.injector.get(BoxCloudService);
            this.subSink.add(boxCloudService.currentBoxUserData.subscribe((res) => {
                resolve(res)
            }));
        });
    }

    async getBoxUserDetailsFromStorage() {
        const storageService = this.injector.get(StorageService);
        return (storageService.existData('boxUser') === null) ? {} : storageService.getLocalData('boxUser');
    }

    async getBoxUserDetailsFromHTTP() {

        return new Promise(async (resolve, reject) => {
            const boxCloudService = this.injector.get(BoxCloudService);
            const userData = await this.publicFunctions.getCurrentUser();
            if (userData && userData?.integrations
                && userData?.integrations?.box && userData?.integrations?.box?.token) {
              boxCloudService.getBoxUserDetails(userData?.integrations?.box?.token)
                .then((res) => resolve(res['user']))
                .catch(err => {
                  return resolve({})
                });
            }
        });
    }

    async sendUpdatesToBoxUserData(boxUserData: Object) {
        const storageService = this.injector.get(StorageService);
        const boxCloudService = this.injector.get(BoxCloudService);
        boxCloudService.updateBoxUserDataService(boxUserData);
        storageService.setLocalData('boxUser', JSON.stringify(boxUserData))
    }

    /**
     * BOX INTEGRATION ENDS
     */
}
