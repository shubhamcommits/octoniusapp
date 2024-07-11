import { Component, OnInit, Injector, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { retry } from 'rxjs/internal/operators/retry';
import { SubSink } from 'subsink';
import { NavigationEnd, Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { SearchHeaderComponent } from 'modules/search/search-header/search-header.component';
import { IntegrationsService } from 'src/shared/services/integrations-service/integrations.service';

@Component({
  selector: 'app-mobile-navbar',
  templateUrl: './mobile-navbar.component.html',
  styleUrls: ['./mobile-navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MobileNavbarComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('search') search: ElementRef;

  // CURRENT USER DATA
  userData: any

  // Current Workspace Data
  workspaceData: any

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector)

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink()

  // Router state of the application
  routerState: any = 'home'

  isGroupNavbar$ = new BehaviorSubject(false);
  isAdminNavbar$ = new BehaviorSubject(false);
  isWorkNavbar$ = new BehaviorSubject(false);
  isUserAccountNavbar$ = new BehaviorSubject(false);
  isPortfolioNavbar$ = new BehaviorSubject(false);

  userGroups: any = [];
  userPortfolios: any = [];

  iconsSidebar = false;
  isDocumentPage = false;

  isMobile = false;

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

  async ngOnInit() {

    this.utilityService.handleDeleteGroupFavorite().subscribe(event => {
      this.onFavoriteGroupSaved()
    });

    this.publicFunctions.reuseRoute(this._router);

    this.isMobile = await this.publicFunctions.isMobileDevice();

    // FETCH THE USER DETAILS FROM THE SERVER
    this.userData = await this.getCurrentUser();

    this.userGroups = this.userData['stats']['favorite_groups'];
    this.userPortfolios = this.userData['stats']['favorite_portfolios'];
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
    this.isPortfolioNavbar$.next(false);
  }

  nextCommonNavbarState() {
    this.isUserAccountNavbar$.next(false);
    this.isGroupNavbar$.next(false);
    this.isWorkNavbar$.next(false);
    this.isAdminNavbar$.next(true);
    this.isPortfolioNavbar$.next(false);
  }

  nextWorkNavbar() {
    this.isUserAccountNavbar$.next(false);
    this.isAdminNavbar$.next(false);
    this.isGroupNavbar$.next(false);
    this.isWorkNavbar$.next(true);
    this.isPortfolioNavbar$.next(false);
  }

  nextUserAccountNavbarState() {
    this.isUserAccountNavbar$.next(true);
    this.isAdminNavbar$.next(false);
    this.isGroupNavbar$.next(false);
    this.isWorkNavbar$.next(false);
    this.isPortfolioNavbar$.next(false);
  }

  nextPortfolioNavbarState() {
    this.isPortfolioNavbar$.next(true);
    this.isUserAccountNavbar$.next(false);
    this.isAdminNavbar$.next(false);
    this.isGroupNavbar$.next(false);
    this.isWorkNavbar$.next(false);
  }

  ngAfterContentChecked() {
    this.subSink.add(this.utilityService.routerStateData.subscribe((res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {
        this.routerState = res['state'];

        if (this.routerState === 'admin') {
          this.nextCommonNavbarState();

        } else if (this.routerState === 'group' || this.routerState === 'home') {
          this.nextGroupNavbarState();
        }
        else if (this.routerState === 'work' || this.routerState === 'lounge'
            || this.routerState === 'people-directory' || this.routerState === 'people-directory-chart'
            || this.routerState === 'hive-hr' || this.routerState == 'hive-hr-setup'
            || this.routerState == 'hive-hr-timeoff' || this.routerState == 'hive-hr-employees') {
          this.nextWorkNavbar();
        }
        else if (this.routerState === 'user-account') {
          this.nextUserAccountNavbarState();
        } else if (this.routerState === 'portfolio') {
          this.nextPortfolioNavbarState();
        }
      }
    }));
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
        this.utilityService.errorNotification($localize`:@@mobileNavbar.errorFetchingProfile:Error occurred while fetching your profile details`);
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

  async onFavoritePortfolioSaved() {
    this.userData = await this.getCurrentUser();
    this.userPortfolios = this.userData['stats']['favorite_portfolios'];
  }

  showSideBar() {
    return !this.isDocumentPage;
  }
}
