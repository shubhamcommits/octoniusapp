import { Component, OnInit, Injector } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
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

  // WORKSPACE DATA
  workspaceData: any;

  // SUBSINK
  private subSink = new SubSink();

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

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

    // Setting Home State
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'admin'
    })

  }
}

