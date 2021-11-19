import { Component, EventEmitter, Injector, OnInit, Output } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { SubSink } from 'subsink';
import { GoogleCloudService } from '../services/google-cloud.service';

@Component({
  selector: 'app-connect-google-cloud',
  templateUrl: './connect-google-cloud.component.html',
  styleUrls: ['./connect-google-cloud.component.scss']
})
export class ConnectGoogleCloudComponent implements OnInit {

  // Google User Output Emitter
  @Output('googleUser') googleUser = new EventEmitter();

  googleAuthSuccessful: any;

  workspaceData: any;

  // Public Functions
  private publicFunctions = new PublicFunctions(this.injector)

  // Subsink
  private subSink = new SubSink();

  constructor(
    private googleService: GoogleCloudService,
    private injector: Injector
  ) { }

  async ngOnInit(): Promise<void> {

    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    // Subscribe to google authentication state
    this.subSink.add(this.googleService.googleAuthSuccessful.subscribe(auth => this.googleAuthSuccessful = auth))
  }

  /**
   * This function is responsible for connecting the google acount to the main octonius server
   */
  async signInToGoogle() {

    // Open up the SignIn Window in order to authorize the google user
    let googleSignInResult: any = await this.publicFunctions.authorizeGoogleSignIn(this.workspaceData?.integrations);

    if (googleSignInResult != null) {
      // Call the handle google signin function
      let googleUserDetails = await this.publicFunctions.handleGoogleSignIn(googleSignInResult)

      // Emit Google User details to parent components
      this.googleUser.emit(googleUserDetails)
    }
  }

  ngOnDestroy() {
    this.subSink.unsubscribe()
  }

}
