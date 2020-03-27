import { Component, OnInit, Injector } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { SubSink } from 'subsink';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-group-activity',
  templateUrl: './group-activity.component.html',
  styleUrls: ['./group-activity.component.scss']
})
export class GroupActivityComponent implements OnInit {

  constructor(
    private router: ActivatedRoute,
    private injector: Injector) { }

  // Fetch groupId from router snapshot
  groupId = this.router.snapshot['_urlSegment']['segments'][2]['path'];

  // Current Group Data
  groupData: any;

  // Current User Data
  userData: any;

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  // Subsink Object
  subSink = new SubSink();

  async ngOnInit() {

    // Utility Service Instance
    let utilityService = this.injector.get(UtilityService)

    // Fetch current group from the service
    this.subSink.add(utilityService.currentGroupData.subscribe((res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {

        // Assign the GroupData
        this.groupData = res;
      }
    }))

    // Fetch current user details
    this.userData = await this.publicFunctions.getCurrentUser();

  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object){
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

  /**
   * Unsubscribe all the observables to avoid memory leaks
   */
  ngOnDestroy(){
    this.subSink.unsubscribe()
  }

}
