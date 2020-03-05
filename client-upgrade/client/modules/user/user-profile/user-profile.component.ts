import { Component, OnInit, Injector } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'src/app/dashboard/public.functions';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  constructor(
    private utilityService: UtilityService,
    private injector: Injector
  ) { }

  // User Data Variable
  userData: Object;
  
  // Public functions class member
  publicFunctions = new PublicFunctions(this.injector);

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
  }

  ngAfterViewChecked(): void {

    // Stop the Foreground Loader
    this.utilityService.stopForegroundLoader();
  }
  

}
