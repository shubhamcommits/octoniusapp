import { Component, OnInit, Injector } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { environment } from 'src/environments/environment';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss']
})
export class AdminHeaderComponent implements OnInit {

  constructor(
    private utilityService: UtilityService,
    private injector: Injector) {
  }

  // USER DATA
  userData: any;

  // BASE URL OF THE APPLICATION
  baseUrl = environment.BASE_URL;

  // WORKSPACE DATA
  workspaceData: any;

  // SUBSINK
  private subSink = new SubSink();

  // PUBLIC FUNCTIONS
  private publicFunctions = new PublicFunctions(this.injector);

  async ngOnInit() {

    // Subscribe to the change in workspace data from the socket server
    this.subSink.add(this.utilityService.currentWorkplaceData.subscribe((res) => {
      if (res != {}) {
        this.workspaceData = res;
      }
    }));

    // FETCH THE USER DETAILS EITHER FROM SHARED SERVICE, STORED LOCAL DATA OR FROM SERVER USING PUBLIC FUNCTIONS
    this.userData = await this.publicFunctions.getCurrentUser();

    // INITIALISE THE WORKSPACE DATA FROM SHARED SERVICE, STORED LOCAL DATA OR FROM SERVER USING PUBLIC FUNCTIONS
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

  }

  /**
    * This function opens up the task content in a new modal, and takes #content in the ng-template inside HTML layout
    * @param content 
    */
  async openWorkspaceDetails(content) {
    this.utilityService.openModal(content, {
      size: 'xl',
      centered: true
    });
  }

}

