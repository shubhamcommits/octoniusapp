import { Component, OnInit, Injector, AfterContentChecked } from '@angular/core';
import { Location } from '@angular/common'
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { environment } from 'src/environments/environment';
import { PublicFunctions } from 'modules/public.functions';
import { SubSink } from 'subsink';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { LoungeService } from 'src/shared/services/lounge-service/lounge.service';

@Component({
  selector: 'app-work-navbar',
  templateUrl: './work-navbar.component.html',
  styleUrls: ['./work-navbar.component.scss']
})
export class WorkNavbarComponent implements OnInit, AfterContentChecked {

  constructor(
    private utilityService: UtilityService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private injector: Injector,
    private location: Location,
    private loungeService: LoungeService
  ) { }

  // USER DATA
  userData: any;

  // BASE URL OF THE APPLICATION
  baseUrl = environment.UTILITIES_WORKSPACES_UPLOADS;

  // WORKSPACE DATA
  workspaceData: any;

  routerState: any = 'work';

  isWorkNavbar$ = new BehaviorSubject(false);
  isLoungeNavbar$ = new BehaviorSubject(false);

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

  ngAfterContentChecked() {
    this.subSink.add(this.utilityService.routerStateData.subscribe((res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {
        this.routerState = res['state'];
        if (this.routerState == 'work') {
          this.nextWorkNavbar();
        }
        else if (this.routerState == 'lounge') {
          this.nextLoungeNavbar();
        }
      }
    }));
  }

  nextWorkNavbar() {
    this.isLoungeNavbar$.next(false);
    this.isWorkNavbar$.next(true);
  }

  nextLoungeNavbar() {
    this.isWorkNavbar$.next(false);
    this.isLoungeNavbar$.next(true);
  }

  canSeeDashboard() {
    return (this.userData &&
        (this.userData.role == 'owner' || this.userData.role == 'admin' || this.userData.role == 'manager' ||
          (this.workspaceData && this.workspaceData.allow_decentralized_roles)));
  }

  async goBackLounge() {
    this.location.back();

    /* TODO - try to make a proper back action for lounges/stories
    const parentId = this.activatedRoute.snapshot.queryParamMap.get('parent');
    let parent: any;
    if (parentId) {
      await this.loungeService.getLounge(parentId).then(res => {
        parent = res['lounge'];
      });
    }

    if (parent) {
      this.router.navigate(
        ['/dashboard', 'work', 'lounge', 'details'],
        { queryParams: {
          lounge: parentId,
          parent: (parent?._parent?._id || parent?._parent)
        }}
      );
    } else {
      this.router.navigate(['/dashboard', 'work', 'lounge']);
    }
    */
  }
}
