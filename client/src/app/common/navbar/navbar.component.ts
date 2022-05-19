import { Component, OnInit, Injector, Input, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy, OnDestroy, LOCALE_ID, Inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { retry } from 'rxjs/internal/operators/retry';
import { SubSink } from 'subsink';
import { NavigationEnd, Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { MatDialog } from '@angular/material/dialog';
import { SearchHeaderComponent } from 'modules/search/search-header/search-header.component';
import { IntegrationsService } from 'src/shared/services/integrations-service/integrations.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('search') search: ElementRef;

  // CURRENT USER DATA
  userData: any;

  // Current Workspace Data
  workspaceData: any;

  storyData: any;

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector);

  // BASE URL OF THE APPLICATION
  baseUrl = environment.UTILITIES_USERS_UPLOADS

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink()

  // Router state of the application
  routerState: any = 'home'

  isGroupNavbar$ = new BehaviorSubject(false);
  isAdminNavbar$ = new BehaviorSubject(false);
  isWorkNavbar$ = new BehaviorSubject(false);
  isUserAccountNavbar$ = new BehaviorSubject(false);

  userGroups: any = [];

  iconsSidebar = false;
  isDocumentPage = false;

  // NOTIFICATIONS DATA
  public notificationsData: { readNotifications: [], unreadNotifications: [] } = {
    readNotifications: [],
    unreadNotifications: []
  }

  constructor(
    private integrationsService: IntegrationsService,
    private userService: UserService,
    private utilityService: UtilityService,
    private storageService: StorageService,
    public dialog: MatDialog,
    private injector: Injector,
    private _router: Router
  ) { }

  ngAfterContentChecked() {
    this.subSink.add(this.utilityService.routerStateData.subscribe((res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {
        this.routerState = res['state'];
        if (this.routerState === 'admin') {
          this.nextCommonNavbarState();

        } else if (this.routerState === 'group' || this.routerState === 'home') {
          this.nextGroupNavbarState();
        }
        else if (this.routerState === 'work' || this.routerState === 'lounge') {
          this.nextWorkNavbar();
        }
        else if (this.routerState === 'user-account') {
          this.nextUserAccountNavbarState();
        }
      }
    }));

    // Subscribe to the change in story data from the socket server
    this.subSink.add(this.utilityService.storyData.subscribe((res) => {
      this.storyData = res;
    }));
  }

  async ngOnInit() {

    this.utilityService.handleDeleteGroupFavorite().subscribe(event => {
      this.onFavoriteGroupSaved()
    });

    this.publicFunctions.reuseRoute(this._router)

    // FETCH THE USER DETAILS FROM THE SERVER
    this.userData = await this.getCurrentUser();
    // this.userData = await this.publicFunctions.getCurrentUser();
    this.userGroups = this.userData['stats']['favorite_groups'];
    this.iconsSidebar = this.userData['stats']['default_icons_sidebar'] || false;

    // Fetch current user from the service
    this.subSink.add(this.utilityService.currentUserData.subscribe(async (res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {

        // Assign the GroupData
        this.userData = res;
      }
    }))

    this.subSink.add(this._router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        this.isDocumentPage = e.url.includes('/document/');
      }
    }));

    // Call the HTTP API to fetch the current workspace details
    this.workspaceData = await this.publicFunctions.getWorkspaceDetailsFromHTTP();

    // IF WE FIND THAT THE GET REQUEST HAS FAILED, THEN WE USE LOCAL DATA TO INTIALISE THE userData
    if (JSON.stringify(this.userData) === JSON.stringify({}))
      this.userData = this.publicFunctions.getUserDetailsFromStorage();

    // IF WE FIND THAT THE GET REQUEST HAS FAILED, THEN WE USE LOCAL DATA TO INTIALISE THE workspaceData
    if (JSON.stringify(this.workspaceData) === JSON.stringify({}))
      this.workspaceData = this.publicFunctions.getWorkspaceDetailsFromStorage();

    // SENDING THE UPDATE THROUGH SERVICE TO UPDATE THE USER & WORKSPACE DETAILS AT ALL COMPONENTS
    if (this.userData && this.workspaceData) {
      this.publicFunctions.sendUpdatesToUserData(this.userData)
      this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData)
    }

    if (this.userData?.integrations?.gdrive?.token) {
      await this.integrationsService.handleGoogleSignIn()

      // This function is responsible for keep the cloud connected and refreshes the token in every 30mins(limit is 50 mins)
      setInterval(async () => {
        await this.integrationsService.handleGoogleSignIn()
      }, 1800000);
    }
  }

  ngAfterViewInit() {
    const searchRef = this.search;
    //this.addHotKeys(searchRef)
  }

  /**
   * This functions unsubscribes all the observables subscription to avoid memory leak
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe()
  }

  myAuthCheck() {
    return this.storageService.existData('authToken');
  }

  nextGroupNavbarState() {
    this.isUserAccountNavbar$.next(false);
    this.isAdminNavbar$.next(false);
    this.isWorkNavbar$.next(false);
    this.isGroupNavbar$.next(true);
  }

  nextCommonNavbarState() {
    this.isUserAccountNavbar$.next(false);
    this.isGroupNavbar$.next(false);
    this.isWorkNavbar$.next(false);
    this.isAdminNavbar$.next(true);
  }

  nextWorkNavbar() {
    this.isUserAccountNavbar$.next(false);
    this.isAdminNavbar$.next(false);
    this.isGroupNavbar$.next(false);
    this.isWorkNavbar$.next(true);
  }

  nextUserAccountNavbarState() {
    this.isUserAccountNavbar$.next(true);
    this.isAdminNavbar$.next(false);
    this.isGroupNavbar$.next(false);
    this.isWorkNavbar$.next(false);
  }

  /**
   * This function fetches the user details, makes a GET request to the server
   */
  async getCurrentUser() {
    return new Promise((resolve, reject) => {
      try {
        this.subSink.add(this.userService.getUser()
          .pipe(retry(3))
          .subscribe(res => resolve(res['user']))
        );
      } catch (err) {
        console.log('Error occurred while fetching the user details', err);
        this.utilityService.errorNotification($localize`:@@navbar.errorWhileFetchingProfile:Error occurred while fetching your profile details`);
        reject({});
      }
    })
  }

  closeModal() {
    this.utilityService.closeAllModals();
  }

  openSearchModal() {
    const dialogRef = this.dialog.open(SearchHeaderComponent, {
      width: '100%',
      height: '100%',
      disableClose: true
    });
  }

  switchSideBar() {
    this.iconsSidebar = !this.iconsSidebar;
  }

  async onFavoriteGroupSaved() {
    this.userData = await this.getCurrentUser();
    this.userGroups = this.userData['stats']['favorite_groups'];
  }

  showSideBar() {
    return !this.isDocumentPage;
  }

  existsElement(element: any) {
    return (element) && (JSON.stringify(element) != JSON.stringify({}));
  }
}
