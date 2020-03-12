import { Component, OnInit, Injector } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SubSink } from 'subsink';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-user-header',
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.scss']
})
export class UserHeaderComponent implements OnInit {

  constructor(
    private router: ActivatedRoute,
    private _router: Router,
    private injector: Injector,
    public utilityService: UtilityService
  ) { }

  // CURRENT USER DATA
  public userData: any;

  // BASE URL OF THE APPLICATION
  BASE_URL = environment.UTILITIES_BASE_URL;

  // Is current user variable
  public isCurrentUser: any = false;

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink();

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  async ngOnInit() {

    // Reuse this route as userId as the queryParam will change
    // this.publicFunctions.reuseRoute(this._router)

    // Get current loggedIn user data
    this.userData = await this.publicFunctions.getCurrentUser();

    // Check if the profile view is private or is it for the other user
    this.isCurrentUser = this.checkIsCurrentUser(this.userData);

    // If this not the current user
    if(!this.isCurrentUser){
      
      // Fetch the userData from the server
      this.userData = await this.publicFunctions.getOtherUser(this.router.snapshot.queryParams['userId']);

      // Update the other user data over the shared service
      this.utilityService.updateOtherUserData(this.userData);
    }
          
  }

  /**
   * This functions unsubscribes all the observables subscription to avoid memory leak
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  /**
   * This function checks if this is currently loggedIn user
   * @param userData 
   */
  checkIsCurrentUser(userData: any) {
    // If this is current loggedIn user
    if (this.router.snapshot.queryParams['userId'] == userData._id)
      return true
    else
      return false
  }

  /**
    * This function opens up the task content in a new modal, and takes #content in the ng-template inside HTML layout
    * @param content 
    */
   async openUserDetails(content) {
    this.utilityService.openModal(content, {
      size: 'xl',
      centered: true
    });
  }

}
