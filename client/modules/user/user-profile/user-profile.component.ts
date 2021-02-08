import { Component, OnInit, Injector, Inject, Input } from '@angular/core';
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
      state: 'user-account'
    });

    const userId = this.router.snapshot.queryParams['userId'];
    if (userId) {
      await this.publicFunctions.getOtherUser(userId).then((res) => {
        if(JSON.stringify(res) != JSON.stringify({})){
          this.userData = res;
        }

        // Instantiate the current user value
        this.isCurrentUser = (userId == this.userData['_id']);
      });
    } else {
      this.userData = await this.publicFunctions.getCurrentUser();
      this.isCurrentUser = true;
    }
  }
  onUpdateUserEmitter(updatedUserData){
    this.userData = updatedUserData;
  }

}
