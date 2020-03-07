import { Component, OnInit, Injector } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { UserHeaderComponent } from '../user-header/user-header.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  constructor(
    private utilityService: UtilityService,
    private injector: Injector,
    private router: ActivatedRoute,
    private _route: Router
  ) { }

  // User Data Variable
  userData: Object;
  
  // Public functions class member
  publicFunctions = new PublicFunctions(this.injector);

  // Create user header component class
  userHeaderComponent = new UserHeaderComponent(this.router, this._route, this.injector, this.utilityService);

  // Is current user component
  isCurrentUser: boolean = this.userHeaderComponent.isCurrentUser;

  async ngOnInit() {

    // Subscribe to the change in userData
    this.utilityService.currentUserData.subscribe((res) => {
      if(res != {}){
        this.userData = res;
      }
    })

    // Start the Foreground Loader
    this.utilityService.startForegroundLoader();
    
    // Intialise the userData variable
    this.userData = await this.publicFunctions.getCurrentUser();

    // Instantiate the current user value
    this.isCurrentUser = this.userHeaderComponent.checkIsCurrentUser(this.userData);

    // Initialise the other userData
    if(!this.isCurrentUser)
      this.utilityService.otherUserData.subscribe((res) => {
        console.log(res);
        if(res != {}){
          this.userData = res;
        }
      })
  }

  ngAfterViewChecked(): void {

    // Stop the Foreground Loader
    this.utilityService.stopForegroundLoader();
  }
  

}
