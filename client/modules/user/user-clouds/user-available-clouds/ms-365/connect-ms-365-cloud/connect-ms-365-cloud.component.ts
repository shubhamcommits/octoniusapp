import { Component, EventEmitter, Inject, Injector, LOCALE_ID, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { IntegrationsService } from 'src/shared/services/integrations-service/integrations.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-connect-ms-365-cloud',
  templateUrl: './connect-ms-365-cloud.component.html',
  styleUrls: ['./connect-ms-365-cloud.component.scss']
})
export class ConnectMS365CloudComponent implements OnInit {

  // MS365 User Output Emitter
  @Output('ms365User') ms365User = new EventEmitter();

  ms365UserDetails;

  ms365Code = this.activatedRoute.snapshot.queryParamMap.get("code");
  // ms365ClientInfo = this.activatedRoute.snapshot.queryParamMap.get("client_info");
  // ms365SessionState = this.activatedRoute.snapshot.queryParamMap.get("session_state");

  // Public Functions
  private publicFunctions = new PublicFunctions(this.injector);

  // Subsink
  private subSink = new SubSink();

  constructor(
    @Inject(LOCALE_ID) public locale: string,
    private integrationsService: IntegrationsService,
    private utilityService: UtilityService,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private injector: Injector,
    // private router: Router
  ) { }

  async ngOnInit(): Promise<void> {

    this.utilityService.updateIsLoadingSpinnerSource(true);

    this.ms365UserDetails = await this.integrationsService.getCurrentMS365User();
    const connectingMS365 = this.storageService.existData('connectingMS365') ? this.storageService.getLocalData('connectingMS365') : false;
console.log(this.ms365Code);
console.log(this.ms365UserDetails);
console.log(connectingMS365);
    if (!!this.ms365Code && !this.utilityService.objectExists(this.ms365UserDetails) && connectingMS365) {
      // Call the handle ms365 signin function
      this.ms365UserDetails = await this.integrationsService.handleMS365SignIn(this.ms365Code/*, this.ms365ClientInfo, this.ms365SessionState*/);

      // Emit MS365 User details to parent components
      this.ms365User.emit(this.ms365UserDetails);
    } else {
      this.utilityService.updateIsLoadingSpinnerSource(false);
    }
  }

  ngOnDestroy() {
    this.subSink.unsubscribe();
  }

  /**
   * This function is responsible for connecting the ms365 acount to the main octonius server
   */
  async signInToMS365() {
    this.utilityService.getConfirmDialogAlert($localize`:@@connectMS365Cloud.doYouAllow:Do you allow?`, $localize`:@@connectMS365Cloud.octoniusFoMS365RequestingPermission:Octonius for MS365 is requesting permission to use your Octonius account.`, $localize`:@@connectMS365Cloud.allow:Allow`)
      .then(async (result) => {
        if (result.value) {
          this.utilityService.updateIsLoadingSpinnerSource(true);

          this.storageService.setLocalData('connectingMS365', JSON.stringify(true));

          // Open up the SignIn Window in order to authorize the ms365 user
          let ms365SignInUrl: any = await this.integrationsService.authorizeMS365SignIn();

          if (ms365SignInUrl && !this.ms365Code) {
            window.location.href = ms365SignInUrl;
          } else {
            console.log("error: no url returned")
          }
        }
      });
  }

  /**
   * Check if ms365User exist
   */
  ms365UserExist() {
    return this.utilityService.objectExists(this.ms365UserDetails);
  }
}
