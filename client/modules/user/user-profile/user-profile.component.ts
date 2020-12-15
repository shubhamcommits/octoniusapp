import { Component, OnInit, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  constructor(
    private injector: Injector,
    private router: ActivatedRoute
  ) { }

  // User Data Variable
  userData: Object;

  // Public functions class member
  publicFunctions = new PublicFunctions(this.injector);

  // Is current user component
  isCurrentUser: boolean = false;

  async ngOnInit() {

    // Setting Home State
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'admin'
    });

    const userId = this.router.snapshot.queryParams['userId'];

    await this.publicFunctions.getOtherUser(userId).then((res) => {
      if(JSON.stringify(res) != JSON.stringify({})){
        this.userData = res;
      }
    });

    // Instantiate the current user value
    await this.checkIsCurrentUser(userId);
  }

  /**
   * This function checks if this is currently loggedIn user
   * @param userData
   */
  async checkIsCurrentUser(userId: string) {

    // Get current loggedIn user data
    const userData = await this.publicFunctions.getCurrentUser();

    // If this is current loggedIn user
    if (userId == userData._id) {
      this.isCurrentUser = true;
    } else {
      this.isCurrentUser = false;
    }
  }
}
