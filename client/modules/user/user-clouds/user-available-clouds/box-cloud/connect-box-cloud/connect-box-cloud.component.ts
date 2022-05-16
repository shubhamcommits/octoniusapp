import { Component, EventEmitter, Inject, Injector, LOCALE_ID, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { environment } from 'src/environments/environment';
import { IntegrationsService } from 'src/shared/services/integrations-service/integrations.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-connect-box-cloud',
  templateUrl: './connect-box-cloud.component.html',
  styleUrls: ['./connect-box-cloud.component.scss']
})
export class ConnectBoxCloudComponent implements OnInit {

  // Box User Output Emitter
  @Output('boxUser') boxUser = new EventEmitter();

  boxUserDetails;

  workspaceData: any;

  boxCode = this.activatedRoute.snapshot.queryParamMap.get("code");

  // Public Functions
  private publicFunctions = new PublicFunctions(this.injector);

  // Subsink
  private subSink = new SubSink();

  constructor(
    @Inject(LOCALE_ID) public locale: string,
    private integrationsService: IntegrationsService,
    private utilityService: UtilityService,
    private activatedRoute: ActivatedRoute,
    private injector: Injector,
    private router: Router
  ) { }

  async ngOnInit(): Promise<void> {

    this.utilityService.updateIsLoadingSpinnerSource(true);

    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.boxUserDetails = await this.integrationsService.getCurrentBoxUser();

    if (this.boxCode && !this.boxUserDetails) {
      // Call the handle box signin function
      this.boxUserDetails = await this.integrationsService.handleBoxSignIn(this.boxCode);

      // Emit Box User details to parent components
      this.boxUser.emit(this.boxUserDetails);
    } else {
      this.utilityService.updateIsLoadingSpinnerSource(false);
    }
  }

  ngOnDestroy() {
    this.subSink.unsubscribe();
  }

  /**
   * This function is responsible for connecting the box acount to the main octonius server
   */
  async signInToBox() {
    this.utilityService.updateIsLoadingSpinnerSource(true);

    let redirect_uri = environment.clientUrl;
    if (environment.production) {
      redirect_uri += '/' + this.locale;
    }

    redirect_uri += this.router.url;

    // Open up the SignIn Window in order to authorize the box user
    let boxSignInUrl: any = await this.integrationsService.authorizeBoxSignIn(this.workspaceData?._id, redirect_uri);

    if (boxSignInUrl) {
      window.location.href = boxSignInUrl;
    } else {
      console.log("error: no url returned")
    }
  }

  /**
   * Check if boxUser exist
   */
  boxUserExist() {
    return this.utilityService.objectExists(this.boxUserDetails);
  }
}
