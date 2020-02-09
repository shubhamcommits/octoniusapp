import { Component, OnInit, Injector } from '@angular/core';
import { SubSink } from 'subsink';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-members',
  templateUrl: './admin-members.component.html',
  styleUrls: ['./admin-members.component.scss']
})
export class AdminMembersComponent implements OnInit {

  constructor(
    private utilityService: UtilityService,
    private injector: Injector
  ) { }

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink();

  // MEMBERS LIST
  public members: any = [];

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  // BASE URL OF THE APPLICATION
  public baseUrl = environment.BASE_URL;

  // PLACEHOLDER INPUT FOR SEARCH BAR
  public searchBarPlaceholder = "Whom you are looking for?";

  // WORKSPACE DATA
  public workspaceData: any;

  async ngOnInit() {
    this.utilityService.startForegroundLoader();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    this.members = await this.publicFunctions.getWorkspaceMembers(this.workspaceData._id);
    return this.utilityService.stopForegroundLoader();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subSink.unsubscribe();
  }

}
