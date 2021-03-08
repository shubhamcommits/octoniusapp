import { Component, OnInit, Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';
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
    public userService: UserService,
    private router: ActivatedRoute,
    private _router: Router,
    public utilityService: UtilityService,
    private storageService: StorageService
  ) { }

  // Google Authentication Variable Check
  googleAuthSuccessful = false
  slackAuthSuccessful:boolean = false

  // Subsink
  private subSink = new SubSink()

  // User Data Variable
  userData: any

  // Public functions class member
  publicFunctions = new PublicFunctions(this.injector)

  // Google User
  googleUser: any

  async ngOnInit() {

    // Setting Home State
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'user-account'
    })

    this.userData = await this.publicFunctions.getCurrentUser();

    this.slackAuthSuccessful = (this.userData && this.userData.integrations && this.userData.integrations.is_slack_connected) ? true : false;

    // Subsribe to the google authsucessful behaviour subject and set the local googleauth value
    this.subSink.add(this.googleService.googleAuthSuccessfulBehavior.subscribe(auth => this.googleAuthSuccessful = auth))

    // Intialise the userData variable
    this.userData = await this.publicFunctions.getCurrentUser()

    // Check if google user exist locally or not
    this.googleUserExist() == true ? this.googleService.googleAuthSuccessfulBehavior.next(true): this.googleService.googleAuthSuccessfulBehavior.next(false)

    // If googleauth was sucessful then set the googleuser data
    if(this.googleAuthSuccessful == true){
      this.googleUser = this.storageService.getLocalData('googleUser')['userData']
    }

    this.userService.slackConnected().subscribe(event => {
      this.slackAuthSuccessful = true;
    });

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

  ngOnDestroy(){
    this.subSink.unsubscribe()
  }

}
