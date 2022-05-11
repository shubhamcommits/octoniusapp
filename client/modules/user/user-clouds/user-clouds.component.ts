import { Component, OnInit, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';
import { BoxCloudService } from './user-available-clouds/box-cloud/services/box-cloud.service';
import { GoogleCloudService } from './user-available-clouds/google-cloud/services/google-cloud.service';

@Component({
  selector: 'app-user-clouds',
  templateUrl: './user-clouds.component.html',
  styleUrls: ['./user-clouds.component.scss']
})
export class UserCloudsComponent implements OnInit {

  constructor(
    public injector: Injector,
    private googleService: GoogleCloudService,
    private boxService: BoxCloudService,
    public userService: UserService,
    public utilityService: UtilityService,
    private storageService: StorageService
  ) { }

  // Google Authentication Variable Check
  googleAuthSuccessful = false
  boxAuthSuccessful = false
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

    this.slackAuthSuccessful = (this.userData && this.userData.integrations && this.userData.integrations.is_slack_connected) ? true : false;

    // Subsribe to the google authsucessful behaviour subject and set the local googleauth value
    this.subSink.add(this.googleService.googleAuthSuccessfulBehavior.subscribe(auth => this.googleAuthSuccessful = auth));

    // Subsribe to the box authsucessful behaviour subject and set the local boxauth value
    this.subSink.add(this.boxService.boxAuthSuccessfulBehavior.subscribe(auth => this.boxAuthSuccessful = auth));

    // Check if google user exist locally or not
    this.googleUserExist() == true ? this.googleService.googleAuthSuccessfulBehavior.next(true) : this.googleService.googleAuthSuccessfulBehavior.next(false)

    // Check if box user exist locally or not
    this.boxUserExist() == true ? this.boxService.boxAuthSuccessfulBehavior.next(true) : this.boxService.boxAuthSuccessfulBehavior.next(false)

    // If googleauth was sucessful then set the googleuser data
    if(this.googleAuthSuccessful == true) {
      this.googleUser = this.storageService.getLocalData('googleUser')['userData'];
    }

    // If googleauth was sucessful then set the googleuser data
    if(this.boxAuthSuccessful == true) {
      this.boxUser = this.storageService.getLocalData('boxUser');
    }

    this.userService.slackConnected().subscribe(event => {
      this.slackAuthSuccessful = true;
    });

    this.utilityService.updateIsLoadingSpinnerSource(false);
  }

  /**
   * This function receives the event change from <app-user-available-clouds></app-user-available-clouds>
   * @param googleUser
   */
  initiliazeGoogleUser(googleUser: any){
    this.googleUser = googleUser
  }

  /**
   * Check if googleUser exist in the storage service or not
   */
  googleUserExist() {
    return (this.storageService.existData('googleUser') === null) ? false : true
  }

  /**
   * This function receives the event change from <app-user-available-clouds></app-user-available-clouds>
   * @param boxUser
   */
  initiliazeBoxUser(boxUser: any){
    this.boxUser = boxUser
  }

  /**
   * Check if googleUser exist in the storage service or not
   */
  boxUserExist() {
    return (this.storageService.existData('boxUser') === null) ? false : true
  }

  ngOnDestroy(){
    this.subSink.unsubscribe()
  }

}
