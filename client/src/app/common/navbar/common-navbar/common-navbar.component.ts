import { Component, OnInit, Injector ,Input} from '@angular/core';
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
export class CommonNavbarComponent implements OnInit {

  // BASE URL OF THE APPLICATION
  baseUrl = environment.UTILITIES_WORKSPACES_UPLOADS;
  userBaseUrl = environment.UTILITIES_USERS_UPLOADS;
  @Input() routerFromEvent: any;
  activeState:string;
  // SUBSINK
  private subSink = new SubSink();

  isCurrentUser: boolean = false;

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
    // Get current loggedIn user data
    const currentUserData = await this.publicFunctions.getCurrentUser();

    const userId = this.router.snapshot.queryParamMap.get('userId');
    if (userId) {
      // Fetch the current user
      await this.publicFunctions.getOtherUser(this.router.snapshot.queryParamMap.get('userId')).then(async res => {
        this.userData = res;

        this.isCurrentUser = await this.checkIsCurrentUser(currentUserData._id);
      });
    } else {
      // Fetch the current user
      await this.publicFunctions.getCurrentUser().then(user => this.userData = user);
      this.isCurrentUser = true;
    }

    // Subscribe to the change in workspace data from the socket server
    this.subSink.add(this.utilityService.currentWorkplaceData.subscribe((res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {
        this.workspaceData = res;
      }
    }));

    const segments = this.routerFromEvent._urlSegment.children.primary.segments;
    this.activeState = segments[segments.length-1].path;
    
    this.utilityService.handleActiveStateTopNavBar().subscribe(event => {
      this.activeState = event;
    });
  }

  async changeState(state:string){
    this.activeState = state;
  }

  /**
   * This function checks if this is currently loggedIn user
   */
  async checkIsCurrentUser(currentUserId) {
    return (this.userData._id == currentUserId) ? true : false;
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
