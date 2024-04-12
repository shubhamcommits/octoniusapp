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

  userData;

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

//http://localhost:4200/dashboard/user/clouds?code=0.AVsAGZmvVuAkSUCkDXtrUK5dPKN05Kn_WcpNgSupNbdGVsz5AOc.AgABBAIAAADnfolhJpSnRYB1SVj-Hgd8AgDs_wUA9P9PKCotuBE6hvsoIh8xAEWFqtqXOXyP6Bg4mzPFf2LsIqd_9F74CzagWIlVSiPHzQtQXQkrfQ0ECt-_Qb_YYVvCZIc__h9aPr2nAThWO7HYNJlAXna8MxzwT6iqXEyC_Gu9odCS6EJjKRoXFnP3PlESw-rBPe1zixJXvhCPPNCfEZZAJDdnpK67U9KZ7D7UtOo8WDfEp269wCPoAtMVThIg2e4nrtcdoLRfjeXGQN_JQYR_RFigNb2q86QroCOI_faoM-_-jOYJULYK5DxlY9CYPZdc6Jvakl0xASbfZyrKJxGotZY0jgApm8RMRY8H3AbCnO6747cDz21oiF1sxyClxKZ4fYkh7xtYyYqwbEK6jZV0LJybScVvQXchkxmpnKyanEHCkOVbC-Zv5LzOFwyZw99P8wvhGk-AWoDSZdlAjXsevt7H2gCUu0T7cQYmYl_yAkLJ2Wz1P_YFLpxVybFZDTlheWeUAzj8wuRK2hn4eX3DPpsQ7WAxwXGBzyS0es9BMhRBQW0aTKm5sf_VfszQ_gk6Q6bhABmtqgOmAfbDvBsJ2nyaj3UibC0ccQqWRkmjlnO15A0MVEeaxMR1oWd2SiUXrrTbsKCZrW1_kmqXuvE1aqS9clnG83N5b154JfSKIpzZ9uzz5szZA-32cF_TchoFyE7n1nqkApWDQrmH2bpwN88OXgGkL3RBf4on_0iCCWfvIxhLWzWSRWc2XhCJCgrdUuEapdoH5y_fscZM2L2v622p1o3CL9MYee1ez4aa9tGWF6TA3N1wY2QB75cQlpiRBfQjDk8rR0nsD8y5EFWDLm5IfZE71Q2x3OIkbTchQFdKtTSx7-FIOAhCRS5R2v_slpOGoFrmHKosgMSx_cj3f16cYSc8D4fKeHo9hqwifIbkDG7LYV3Dik5rdTxT1Dn98TrL02Ou8p0IcdYtQ4Tqg0x28DDUl20PexltBVupIgOXHF6hGbVMfErdpOJrUe-4bmR5Nyo2U8RWJP3eCOEBiHYEq23uQTUML71Zt3VeQy488oWJ6ya4AbT2PiYYQIeKCB3MBmQ2yMqltO2goTyQXEDGYRYYIygkHsJVFRXNKwZ6qXT6QRtxO0yYI4L6caT81fD0_n4lMpnpzHMEARcuzzvhwhQGn5jauSRWGK0hOmHzUmiFDctTbJWrm3h_nH5nYVQY3W0Wx3TaHSuVLyH7KbHVIciO2w4FZgtdIKY0kq1n719eMMVQ8wyRKoRv47sNrxlZ6ZOMYaz0Y45vko3PT-w5G1FW7WkcM5I8A1VEZx-NRZi1XjQsHT0jvEjI5v7XBLYW0xz-I5DXebq80LEITvMwebTmIx5jNXDhmr2bbTocV1e-qAhc&client_info=eyJ1aWQiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMmE4Ny03OGUxZmEzNjRhZjMiLCJ1dGlkIjoiOTE4ODA0MGQtNmM2Ny00YzViLWIxMTItMzZhMzA0YjY2ZGFkIn0&session_state=fe106a05-fc81-43f0-8849-78fe82af7428

  async ngOnInit(): Promise<void> {

    this.utilityService.updateIsLoadingSpinnerSource(true);

    this.ms365UserDetails = await this.integrationsService.getCurrentMS365User();
    const connectingMS365 = this.storageService.existData('connectingMS365') ? this.storageService.getLocalData('connectingMS365') : false;
    this.userData = await this.publicFunctions.getCurrentUser();
console.log(this.userData);
console.log(this.ms365Code);
console.log(this.ms365UserDetails);
console.log(connectingMS365);
    if (!!this.ms365Code && !this.utilityService.objectExists(this.ms365UserDetails) && connectingMS365) {
      // Call the handle ms365 signin function
      this.ms365UserDetails = await this.integrationsService.handleMS365SignIn(this.userData, this.ms365Code/*, this.ms365ClientInfo, this.ms365SessionState*/);

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

          if (ms365SignInUrl && !this.userData?.integrations?.ms_365?.user_account_id && !this.userData?.integrations?.ms_365?.token) {
            window.location.href = ms365SignInUrl;
          } else if (!!this.userData?.integrations?.ms_365?.user_account_id && !!this.userData?.integrations?.ms_365?.token) {

            this.ms365UserDetails = await this.integrationsService.handleMS365SignIn(this.userData, this.ms365Code/*, this.ms365ClientInfo, this.ms365SessionState*/);
console.log(this.userData);
console.log(this.ms365Code);
console.log(this.ms365UserDetails);
            // Emit MS365 User details to parent components
            this.ms365User.emit(this.ms365UserDetails);
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
