import { Component, OnInit, Injector } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { ActivatedRoute } from '@angular/router';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-group-navbar',
  templateUrl: './group-navbar.component.html',
  styleUrls: ['./group-navbar.component.scss']
})
export class GroupNavbarComponent implements OnInit {


  constructor(
    private injector: Injector,
    private router: ActivatedRoute
  ) { }

  // baseUrl for uploads
  baseUrl = environment.UTILITIES_GROUPS_UPLOADS

  // baseUrl for users
  userBaseUrl = environment.UTILITIES_USERS_UPLOADS;

  // Groups Data
  groupData: any;

  // User Data
  userData: any;

  // Fetch groupId from router snapshot
  groupId = this.router.snapshot.queryParamMap.get('group');

  // My Workplace variable check
  myWorkplace: boolean = this.router.snapshot.queryParamMap.get('group') ? true : false

  // PUBLIC FUNCTIONS
  private publicFunctions = new PublicFunctions(this.injector);

  async ngOnInit() {

    // Fetch the group data from HTTP Request
    this.groupData = await this.publicFunctions.getGroupDetails(this.groupId)

    // Fetch the current user
    this.userData = await this.publicFunctions.getCurrentUser();

    if (this.groupData) {
      // Send the updates of the groupdata through shared service
      this.publicFunctions.sendUpdatesToGroupData(this.groupData)
    }

    console.log('Group Data', this.groupData)


  }

  /**
    * This function opens up the task content in a new modal, and takes #content in the ng-template inside HTML layout
    * @param content 
    */
  async openDetails(content) {

    // Utility Service
    let utilityService = this.injector.get(UtilityService)

    // Open Modal
    utilityService.openModal(content, {
      size: 'xl',
      centered: true
    });
  }

}
