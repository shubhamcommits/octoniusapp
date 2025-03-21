import { Component, EventEmitter, Injector, OnInit, Output } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { IntegrationsService } from 'src/shared/services/integrations-service/integrations.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-connect-google-cloud',
  templateUrl: './connect-google-cloud.component.html',
  styleUrls: ['./connect-google-cloud.component.scss']
})
export class ConnectGoogleCloudComponent implements OnInit {

  // Google User Output Emitter
  @Output('googleUser') googleUser = new EventEmitter();

  googleUserDetails;

  workspaceData: any;

  // Public Functions
  private publicFunctions = new PublicFunctions(this.injector)

  // Subsink
  private subSink = new SubSink();

  constructor(
    private integrationsService: IntegrationsService,
    private utilityService: UtilityService,
    private injector: Injector
  ) { }

  async ngOnInit(): Promise<void> {

    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.googleUserDetails = await this.integrationsService.getCurrentGoogleUser();
  }

  ngOnDestroy() {
    this.subSink.unsubscribe()
  }

  /**
   * This function is responsible for connecting the google acount to the main octonius server
   */
  async signInToGoogle() {

    // Open up the SignIn Window in order to authorize the google user
    let googleSignInResult: any = await this.integrationsService.authorizeGoogleSignIn(this.workspaceData?.integrations);

    if (googleSignInResult != null) {
      // Call the handle google signin function
      let googleUserDetails = await this.integrationsService.handleGoogleSignIn(googleSignInResult)

      // Emit Google User details to parent components
      this.googleUser.emit(googleUserDetails)
    }
  }

  googleUserExists() {
    return this.utilityService.objectExists(this.googleUserDetails);
  }
}
