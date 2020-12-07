import { Component, OnInit, Injector, AfterContentChecked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { environment } from 'src/environments/environment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-common-navbar',
  templateUrl: './common-navbar.component.html',
  styleUrls: ['./common-navbar.component.scss']
})
export class CommonNavbarComponent implements OnInit, AfterContentChecked {

  // BASE URL OF THE APPLICATION
  baseUrl = environment.UTILITIES_WORKSPACES_UPLOADS;

  // SUBSINK
  private subSink = new SubSink();

  // My user nav variable check
  isUserNav: boolean = this.isUserNavigation();

  // User Data
  userData: any;

  // WORKSPACE DATA
  workspaceData: any;

  constructor(
    private injector: Injector,
    private router: ActivatedRoute,
    private utilityService: UtilityService
  ) { }

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector)

  async ngOnInit() {

    // Fetch the current user
    this.userData = await this.publicFunctions.getCurrentUser();

    // Subscribe to the change in workspace data from the socket server
    this.subSink.add(this.utilityService.currentWorkplaceData.subscribe((res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {
        this.workspaceData = res;
      }
    }));
  }

  ngAfterContentChecked() {
    // My user nav variable check
    this.isUserNav = this.isUserNavigation();
  }

  isUserNavigation() {
    return this.router.snapshot.queryParamMap.has('userId') ? true : false;
  }

  /**
    * This function opens up the task content in a new modal, and takes #content in the ng-template inside HTML layout
    * @param content
    */
   async openDetails(content) {
    this.utilityService.openModal(content, {
      size: 'xl',
      centered: true
    });
  }
}
