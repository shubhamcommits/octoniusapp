import { Component, OnInit, Injector, AfterContentChecked, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import { SubSink } from 'subsink';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { LoungeService } from 'src/shared/services/lounge-service/lounge.service';

@Component({
  selector: 'app-work-navbar',
  templateUrl: './work-navbar.component.html',
  styleUrls: ['./work-navbar.component.scss']
})
export class WorkNavbarComponent implements OnInit, AfterContentChecked, OnDestroy {

  // USER DATA
  userData: any;
  isUserManager: boolean = true;
  isCRMManger: boolean = true;

  isOrganizationModuleAvailable: boolean = false;
  isLoungeModuleAvailable: boolean = false;

  // WORKSPACE DATA
  workspaceData: any;

  routerState: any = 'work';

  isWorkNavbar$ = new BehaviorSubject(false);
  isLoungeNavbar$ = new BehaviorSubject(false);
  isPeopleDirectoryNavbar$ = new BehaviorSubject(false);

  editTitle: boolean = false;
  loungeData: any;
  storyData: any;
  storyOriginalName = '';

  // SUBSINK
  private subSink = new SubSink();

  // PUBLIC FUNCTIONS
  private publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private router: Router,
    private injector: Injector,
    private changeDetection: ChangeDetectorRef,
    private utilityService: UtilityService,
    private loungeService: LoungeService
  ) { }

  async ngOnInit() {

    // Subscribe to the change in workspace data from the socket server
    this.subSink.add(this.utilityService.currentWorkplaceData.subscribe((res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {
        this.workspaceData = res;
      }
    }));

    this.isOrganizationModuleAvailable = await this.publicFunctions.isOrganizationModuleAvailable();
    this.isLoungeModuleAvailable = await this.publicFunctions.isLoungeModuleAvailable();

    // FETCH THE USER DETAILS EITHER FROM SHARED SERVICE, STORED LOCAL DATA OR FROM SERVER USING PUBLIC FUNCTIONS
    this.userData = await this.publicFunctions.getCurrentUser();    

    this.isUserManager = this.isManagerUser();
    this.isCRMManger = this.isCRMUser();

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
        else if (this.routerState == 'people-directory' || this.routerState == 'people-directory-chart'
            || this.routerState == 'hive-hr' || this.routerState == 'hive-hr-setup'
            || this.routerState == 'hive-hr-timeoff' || this.routerState == 'hive-hr-employees') {
          this.nextPeopleDirectoryNavbar();
        }
      }
    }));

    // Subscribe to the change in lounge data from the socket server
    this.subSink.add(this.utilityService.loungeData.subscribe((res) => {
      this.loungeData = res;
    }));

    // Subscribe to the change in story data from the socket server
    this.subSink.add(this.utilityService.storyData.subscribe((res) => {
      this.storyData = res;
      this.storyOriginalName = this.storyData?.name;
    }));
  }

  /**
   * This function unsubscribes the data from the observables
   */
  ngOnDestroy(): void {
      this.subSink.unsubscribe();
  }

  nextWorkNavbar() {
    this.isLoungeNavbar$.next(false);
    this.isPeopleDirectoryNavbar$.next(false);
    this.isWorkNavbar$.next(true);

    this.changeDetection.detectChanges();
  }

  nextLoungeNavbar() {
    this.isWorkNavbar$.next(false);
    this.isPeopleDirectoryNavbar$.next(false);
    this.isLoungeNavbar$.next(true);

    this.changeDetection.detectChanges();
  }

  nextPeopleDirectoryNavbar() {
    this.isWorkNavbar$.next(false);
    this.isLoungeNavbar$.next(false);
    this.isPeopleDirectoryNavbar$.next(true);

    this.changeDetection.detectChanges();
  }

  canSeeDashboard() {
    return (this.existsElement(this.userData) &&
        (this.userData.role == 'owner' || this.userData.role == 'admin' || this.userData.role == 'manager' ||
          (this.workspaceData && this.workspaceData.allow_decentralized_roles)));
  }

  canSeeLounge() {

  }

  async goBackLounge() {
    if (this.existsElement(this.storyData) && this.storyData._lounge) {
      const loungeId = this.storyData._lounge._id;
      this.publicFunctions.sendUpdatesToLoungeData({});
      this.publicFunctions.sendUpdatesToStoryData({});
      this.router.navigate(
        ['/dashboard', 'work', 'lounge', 'details'],
        {
          queryParams: {
            lounge: loungeId
          }
        }
      );
    } else if (this.existsElement(this.loungeData)) {
      const type = this.loungeData.type;
      const loungeId = (this.loungeData._parent) ? (this.loungeData._parent._id || this.loungeData._parent) : null;
      this.publicFunctions.sendUpdatesToLoungeData({});
      this.publicFunctions.sendUpdatesToStoryData({});
      if (type == 'lounge' && loungeId) {
        this.router.navigate(
          ['/dashboard', 'work', 'lounge', 'details'],
          {
            queryParams: {
              lounge: loungeId
            }
          }
        );
      } else {
        this.router.navigate(['/dashboard', 'work', 'lounge']);
      }
    }
  }

  /**
   * This function is responsible for handling the changeTitle functionlaity
   * @param event
   */
   async changeTitle(event: any) {

    // KeyCode = 13 - User hits enter
    if (event.keyCode == 13) {

      // Set the edit title to false
      this.editTitle = false

      if (this.existsElement(this.storyData)) {
        // Call the HTTP PUT request to change the data on server
        await this.loungeService.editStory(this.storyData?._id, {
          name: event.target.value
        });
      } else if (this.existsElement(this.loungeData)) {
        // Call the HTTP PUT request to change the data on server
        await this.loungeService.editLounge(this.loungeData?._id, {
          name: event.target.value
        });
      }
    }
    // KeyCode = 27 - User Hits Escape
    else if (event.keyCode == 27) {
      // Set the original_name back to previous state
      this.storyData.name = this.storyOriginalName
      // Only Set the edit title to false
      this.editTitle = false
    }

  }

  isManagerUser() {
    return this.userData.role == 'manager' || this.userData.role == 'admin' || this.userData.role == 'owner';
  }

  isCRMUser() {    
    return this.userData.role == 'owner' || this.userData?.crm_role == true;
  }

  existsElement(element: any) {
    return (element) && (JSON.stringify(element) != JSON.stringify({}));
  }
}
