import { Component, OnInit, Injector } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { ActivatedRoute } from '@angular/router';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-group-header',
  templateUrl: './group-header.component.html',
  styleUrls: ['./group-header.component.scss']
})
export class GroupHeaderComponent implements OnInit {

  constructor(
    private injector: Injector,
    private router: ActivatedRoute
  ) { }

  // baseUrl for uploads
  baseUrl = environment.UTILITIES_GROUPS_UPLOADS

  // Groups Data
  groupData: any;

  // Fetch groupId from router snapshot
  groupId = this.router.snapshot.params['id'];

  // PUBLIC FUNCTIONS
  private publicFunctions = new PublicFunctions(this.injector);

  async ngOnInit() {

    // Fetch the group data from HTTP Request
    this.groupData = await this.publicFunctions.getGroupDetails(this.groupId)

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
