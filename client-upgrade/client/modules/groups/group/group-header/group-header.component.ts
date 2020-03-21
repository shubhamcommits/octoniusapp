import { Component, OnInit, Injector } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { ActivatedRoute } from '@angular/router';

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
  baseUrl = environment.UTILITIES_BASE_URL

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

}
