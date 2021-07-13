import { Component, OnInit, Injector } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { environment } from 'src/environments/environment';
import { PublicFunctions } from 'modules/public.functions';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-work-navbar',
  templateUrl: './work-navbar.component.html',
  styleUrls: ['./work-navbar.component.scss']
})
export class WorkNavbarComponent implements OnInit {

  constructor(
    private utilityService: UtilityService,
    private injector: Injector
  ) { }

  // USER DATA
  userData: any;

  // BASE URL OF THE APPLICATION
  baseUrl = environment.UTILITIES_WORKSPACES_UPLOADS;

  // WORKSPACE DATA
  workspaceData: any;

  // SUBSINK
  private subSink = new SubSink();

  // PUBLIC FUNCTIONS
  private publicFunctions = new PublicFunctions(this.injector);

  async ngOnInit() {

    // Subscribe to the change in workspace data from the socket server
    this.subSink.add(this.utilityService.currentWorkplaceData.subscribe((res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {
        this.workspaceData = res;
      }
    }));

    // FETCH THE USER DETAILS EITHER FROM SHARED SERVICE, STORED LOCAL DATA OR FROM SERVER USING PUBLIC FUNCTIONS
    this.userData = await this.publicFunctions.getCurrentUser();

    // INITIALISE THE WORKSPACE DATA FROM SHARED SERVICE, STORED LOCAL DATA OR FROM SERVER USING PUBLIC FUNCTIONS
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
  }

  canSeeDashboard() {
    return (this.userData && (this.userData.role === 'owner' || this.userData.role === 'admin' || this.userData.role === 'manager'));
  }

}
