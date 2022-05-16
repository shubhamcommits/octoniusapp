import { Component, OnInit, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { IntegrationsService } from 'src/shared/services/integrations-service/integrations.service';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-user-clouds',
  templateUrl: './user-clouds.component.html',
  styleUrls: ['./user-clouds.component.scss']
})
export class UserCloudsComponent implements OnInit {

  slackAuthSuccessful: boolean = false

  // Subsink
  private subSink = new SubSink()

  // User Data Variable
  userData: any;

  // Google User
  googleUser: any;

  // Box User
  boxUser: any;

  // Public functions class member
  publicFunctions = new PublicFunctions(this.injector)

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$;

  constructor(
    private integrationsService: IntegrationsService,
    public injector: Injector,
    public userService: UserService,
    public utilityService: UtilityService
  ) { }

  async ngOnInit() {

    // Setting Home State
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'user-account'
    })

    this.subSink.add(this.utilityService.isLoadingSpinner.subscribe((res) => {
      this.isLoading$ = res;
    }));

    this.utilityService.updateIsLoadingSpinnerSource(true);

    this.userData = await this.publicFunctions.getCurrentUser();

    this.boxUser = await this.integrationsService.getCurrentBoxUser();

    this.googleUser = await this.integrationsService.getCurrentGoogleUser();

    this.slackAuthSuccessful = (this.userData && this.userData.integrations && this.userData.integrations.is_slack_connected) ? true : false;

    this.userService.slackConnected().subscribe(event => {
      this.slackAuthSuccessful = true;
    });
console.log(this.slackAuthSuccessful);
console.log(this.googleUser);
console.log(this.boxUser);
    this.utilityService.updateIsLoadingSpinnerSource(false);
  }

  ngOnDestroy(){
    this.subSink.unsubscribe()
  }

  /**
   * This function receives the event change from <app-user-available-clouds></app-user-available-clouds>
   * @param googleUser
   */
  initiliazeGoogleUser(googleUser: any){
    this.googleUser = googleUser
  }

  /**
   * This function receives the event change from <app-user-available-clouds></app-user-available-clouds>
   * @param boxUser
   */
  initiliazeBoxUser(boxUser: any){
    this.boxUser = boxUser
  }

  /**
   * Check if element exist
   */
  objectDataExists(objectData: Object) {
    return this.utilityService.objectExists(objectData);
  }
}
