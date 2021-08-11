import { Component, OnInit, Injector } from '@angular/core';
import { SubSink } from 'subsink';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-admin-members',
  templateUrl: './admin-members.component.html',
  styleUrls: ['./admin-members.component.scss']
})
export class AdminMembersComponent implements OnInit {

  constructor(
    public utilityService: UtilityService,
    private injector: Injector,
  ) { }

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink();

  // MEMBERS LIST
  public members: any = [];

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  // PLACEHOLDER INPUT FOR SEARCH BAR
  public searchBarPlaceholder = $localize`:@@adminMembers.searchUser:Search user...`;

  // WORKSPACE DATA
  public workspaceData: any;

  async ngOnInit() {

    // Setting Home State
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'admin'
    })

    // Subscribe to the change in workspace data from the socket server
    this.subSink.add(this.utilityService.currentWorkplaceData.subscribe((res) => {
      if (JSON.stringify(res) !== JSON.stringify({})) {
        this.workspaceData = res;
        this.members = this.workspaceData.members.sort((x, y) => {
          return (x.active === y.active) ? 0 : x.active ? -1 : 1;
        });
      }
    }));

    // Fetch the current workspace details
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    // Initialize the members
    this.members = await this.workspaceData.members;

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subSink.unsubscribe();
  }

}
