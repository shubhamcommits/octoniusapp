import { Component, EventEmitter, Inject, Injector, LOCALE_ID, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { environment } from 'src/environments/environment';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';
import { BoxCloudService } from '../services/box-cloud.service';

@Component({
  selector: 'app-connect-box-cloud',
  templateUrl: './connect-box-cloud.component.html',
  styleUrls: ['./connect-box-cloud.component.scss']
})
export class ConnectBoxCloudComponent implements OnInit {

  // Box User Output Emitter
  @Output('boxUser') boxUser = new EventEmitter();

  boxAuthSuccessful: any;

  workspaceData: any;

  boxCode = this.activatedRoute.snapshot.queryParamMap.get("code");

  // Public Functions
  private publicFunctions = new PublicFunctions(this.injector);

  // Subsink
  private subSink = new SubSink();

  constructor(
    @Inject(LOCALE_ID) public locale: string,
    private boxService: BoxCloudService,
    private storageService: StorageService,
    private utilityService: UtilityService,
    private activatedRoute: ActivatedRoute,
    private injector: Injector,
    private router: Router
  ) { }

  async ngOnInit(): Promise<void> {

    this.utilityService.updateIsLoadingSpinnerSource(true);

    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    // Subscribe to box authentication state
    this.subSink.add(this.boxService.boxAuthSuccessful.subscribe(auth => this.boxAuthSuccessful = auth));

    if (this.boxCode && !this.boxUserExist()) {
      // Call the handle box signin function
      let boxUserDetails = await this.publicFunctions.handleBoxSignIn(this.boxCode);

      // Emit Box User details to parent components
      this.boxUser.emit(boxUserDetails);
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
    let boxSignInUrl: any = await this.publicFunctions.authorizeBoxSignIn(this.workspaceData?._id, redirect_uri);

    if (boxSignInUrl) {
      window.location.href = boxSignInUrl;
    } else {
      console.log("error: no url returned")
    }
  }

  /**
   * Check if googleUser exist in the storage service or not
   */
  boxUserExist() {
    return (this.storageService.existData('boxUser') === null) ? false : true
  }
}
