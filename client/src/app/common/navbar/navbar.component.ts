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
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { SearchHeaderComponent } from 'modules/search/search-header/search-header.component';
import { IntegrationsService } from 'src/shared/services/integrations-service/integrations.service';
import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';


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
  userCollections: any = [];
  
  iconsSidebar = false;
  isDocumentPage = false;
  isCollectionPage = false;

  isIndividualSubscription = false;

  // NOTIFICATIONS DATA
  public notificationsData: { readNotifications: [], unreadNotifications: [] } = {
    readNotifications: [],
    unreadNotifications: []
  }

  constructor(
    @Inject(LOCALE_ID) public locale: string,
    private integrationsService: IntegrationsService,
    private userService: UserService,
    private utilityService: UtilityService,
    private storageService: StorageService,
    private managementPortalService:  ManagementPortalService,
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

        } else if (this.routerState === 'group' || this.routerState === 'home' || this.routerState === 'library' || this.routerState === 'collection') {
          this.nextGroupNavbarState();

          this.isCollectionPage = (this.routerState === 'collection') ? true : false;
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

    if (environment.production && this.userData && this.utilityService.objectExists(this.userData)
        && this.userData?.stats && this.userData?.stats?.locale && this.userData?.stats?.locale != this.locale) {
      this.selectLanguage(this.userData?.stats?.locale);
    }

    // Call the HTTP API to fetch the current workspace details
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    // SENDING THE UPDATE THROUGH SERVICE TO UPDATE THE USER & WORKSPACE DETAILS AT ALL COMPONENTS
    if (this.userData && this.workspaceData) {
      this.publicFunctions.sendUpdatesToUserData(this.userData)
      this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData)
    }

    this.isIndividualSubscription = await this.publicFunctions.checkIsIndividualSubscription();

    this.subSink.add(this._router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        this.isDocumentPage = e.url.includes('/document/');
        this.isCollectionPage = e.url.includes('/library/collection');
      }
    }));

    // this.userData = await this.publicFunctions.getCurrentUser();
    this.userGroups = this.userData['stats']['favorite_groups'];
    this.userPortfolios = this.userData['stats']['favorite_portfolios'];
    this.userCollections = this.userData['stats']['favorite_collections'];
    this.iconsSidebar = this.userData['stats']['default_icons_sidebar'] || false;

    if (this.userData?.integrations?.gdrive?.token) {
      await this.integrationsService.handleGoogleSignIn()

      // This function is responsible for keep the cloud connected and refreshes the token in every 30mins(limit is 50 mins)
      setInterval(async () => {
        await this.integrationsService.handleGoogleSignIn()
      }, 1800000);
    }

    window['Appcues'].identify(
      this.userData?._id, // unique, required
      {
        createdAt: this.userData?.created_date,
        role: this.userData?.role,
        firstName: this.userData?.first_name,
        companyName: this.userData?.company_name,
        workSpaceName: this.userData?.workspace_name,
        email: this.userData?.email
      }
    );
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

  async onFavoritePortfolioSaved() {
    this.userData = await this.getCurrentUser();
    this.userPortfolios = this.userData['stats']['favorite_portfolios'];
  }

  showSideBar() {
    return !this.isDocumentPage && !this.isCollectionPage;
  }

  selectLanguage(languageCode: any) {
    this.userService.saveLocale(languageCode).then(res => {

      this.userData = res['user'];
      this.publicFunctions.sendUpdatesToUserData(this.userData);

      localStorage.setItem('locale', languageCode);

      let redirect_uri = environment.clientUrl;
      if (environment.production) {
        redirect_uri += '/' + languageCode;
      }

      redirect_uri += this._router.url;

      if (this.locale != languageCode) {
        window.location.href = redirect_uri;
      }
    });
  }
}
