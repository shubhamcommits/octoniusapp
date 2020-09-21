import { Component, OnInit, Injector, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { retry } from 'rxjs/internal/operators/retry';
import { SubSink } from 'subsink';
import { AuthService } from 'src/shared/services/auth-service/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
// import { GoogleCloudService } from 'modules/user/user-clouds/user-available-clouds/google-cloud/services/google-cloud.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('search', { static: false }) search: ElementRef;

  constructor(
    private storageService: StorageService,
    private userService: UserService,
    private utilityService: UtilityService,
    private authService: AuthService,
    private router: Router,
    private _ActivatedRoute: ActivatedRoute,
    private socketService: SocketService,
    private injector: Injector,
    ) { }

  // CURRENT USER DATA
  userData: any

  // Current Workspace Data
  workspaceData: any

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector)

  // BASE URL OF THE APPLICATION
  baseUrl = environment.UTILITIES_USERS_UPLOADS

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink()

  // Router state of the application
  routerState: any = 'home'

  // My Workplace variable check
  myWorkplace: boolean = this._ActivatedRoute.snapshot.queryParamMap.get('myWorkplace') ? true : false

  isGroupNavbar$ = new BehaviorSubject(false);
  isCommonNavbar$ = new BehaviorSubject(false);
  isWorkNavbar$ = new BehaviorSubject(false);

  // NOTIFICATIONS DATA
  public notificationsData: { readNotifications: [], unreadNotifications: [] } = {
      readNotifications: [],
      unreadNotifications: []
  }

  nextGroupNavbarState(){
    this.isGroupNavbar$.next(true);
    this.isCommonNavbar$.next(false)
    this.isWorkNavbar$.next(false)
  }

  nextCommonNavbarState() {
    this.isCommonNavbar$.next(true);
    this.isGroupNavbar$.next(false)
    this.isWorkNavbar$.next(false)
  }

  nextWorkNavbar() {
    this.isWorkNavbar$.next(true);
    this.isCommonNavbar$.next(false)
    this.isGroupNavbar$.next(false)
  }

  ngAfterContentChecked() {
    this.subSink.add(this.utilityService.routerStateData.subscribe((res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {
        this.routerState = res['state']
        if (this.routerState === 'home') {
          this.nextCommonNavbarState()
        }
        else if (this.routerState === 'group') {
          this.nextGroupNavbarState()

          // Check for myWorkplace
          this.myWorkplace = this._ActivatedRoute.snapshot.queryParamMap.get('myWorkplace') ? true : false
        }
        else if (this.routerState === 'work') {
          this.nextWorkNavbar()
        }
      }
    }));
  }

  async ngOnInit() {

    // FETCH THE USER DETAILS FROM THE SERVER
    this.userData = await this.getCurrentUser();

    // Fetch current user from the service
    this.subSink.add(this.utilityService.currentUserData.subscribe(async (res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {

        // Assign the GroupData
        this.userData = res;
      }
    }))

    // Call the HTTP API to fetch the current workspace details
    this.workspaceData = await this.publicFunctions.getWorkspaceDetailsFromHTTP();

    // IF WE FIND THAT THE GET REQUEST HAS FAILED, THEN WE USE LOCAL DATA TO INTIALISE THE userData
    if (JSON.stringify(this.userData) === JSON.stringify({}))
      this.userData = this.publicFunctions.getUserDetailsFromStorage();

    // IF WE FIND THAT THE GET REQUEST HAS FAILED, THEN WE USE LOCAL DATA TO INTIALISE THE workspaceData
    if (JSON.stringify(this.workspaceData) === JSON.stringify({}))
      this.userData = this.publicFunctions.getWorkspaceDetailsFromStorage();

    // SENDING THE UPDATE THROUGH SERVICE TO UPDATE THE USER & WORKSPACE DETAILS AT ALL COMPONENTS
    if (this.userData && this.workspaceData) {
      this.publicFunctions.sendUpdatesToUserData(this.userData)
      this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData)
    }

    await this.initNotifications();

    console.log('User Data', this.userData);
    console.log('Workspace Data', this.workspaceData);
  }

  ngAfterViewInit() {
    const searchRef = this.search;
    //this.addHotKeys(searchRef)
  }

  async initNotifications() {
    // Subscribe to the change in notifications data from the server
    this.subSink.add(this.socketService.currentData.subscribe((res) => {
        if (JSON.stringify(res) != JSON.stringify({}))
            this.notificationsData = res;
    }));

    /**
     * emitting the @event joinUser to let the server know that user has joined
     */
    this.subSink.add(this.socketService.onEmit('joinUser', this.userData['_id'])
        .pipe(retry(Infinity))
        .subscribe());

    /**
     * emitting the @event joinWorkspace to let the server know that user has joined
     */
    this.subSink.add(this.socketService.onEmit('joinWorkspace', {
        workspace_name: this.userData['workspace_name']
    })
        .pipe(retry(Infinity))
        .subscribe());

    /**
     * emitting the @event getNotifications to let the server know to give back the push notifications
     */
    this.subSink.add(this.socketService.onEmit('getNotifications', this.userData['_id'])
        .pipe(retry(Infinity))
        .subscribe());
  }

  /**
   * This functions unsubscribes all the observables subscription to avoid memory leak
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe()
  }

  // async getGoogleRefreshToken() {

  //   //it refreshes the access token as soon as we visit any group
  //   if (localStorage.getItem('google-cloud') != null && localStorage.getItem('google-cloud-token') != null) {
  //     await this.googleService.refreshGoogleToken();
  //     //we have set a time interval of 30mins so as to refresh the access_token in the group
  //     setInterval(async () => {
  //       await this.googleService.refreshGoogleToken();
  //       //this.refreshGoogleToken()
  //     }, 1800000);
  //   }
  // }

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
          console.log('Error occured while fetching the user details', err);
          this.utilityService.errorNotification('Error occured while fetching your profile details');
          reject({});
        }
      })
    }

    /**
     * This function is responsible for logging the user out
     */
    async logout() {
      try {
        this.utilityService.asyncNotification('Please wait, while we log you out securely...',
          new Promise((resolve, reject) => {
            this.subSink.add(this.authService.signout()
              .subscribe((res) => {
                this.storageService.clear();
                this.publicFunctions.sendUpdatesToGroupData({})
                this.publicFunctions.sendUpdatesToRouterState({})
                this.publicFunctions.sendUpdatesToUserData({})
                this.publicFunctions.sendUpdatesToWorkspaceData({})
                this.socketService.disconnectSocket();
                this.router.navigate(['/home'])
                  .then(() => resolve(this.utilityService.resolveAsyncPromise('Succesfully Logged out!')))

              }, (err) => {
                console.log('Error occured while logging out!', err);
                reject(this.utilityService.rejectAsyncPromise('Error occured while logging you out!, please try again!'));
              }))
          }))
      } catch (err) {
        console.log('Error occured while logging out!', err);
        this.utilityService.errorNotification('Error occured while logging you out!');
      }
    }

  /**
   * Add Hot Keys
   */
  /*
  addHotKeys(searchRef: any){
    this.hotKeysService.add(new Hotkey(['shift+space'], (event: KeyboardEvent, combo: string): boolean =>{
      this.openModal(searchRef);
      return false;
    }))
  }
  */

    closeModal(){
      this.utilityService.closeAllModals();
    }

    openModal(content: any){
      this.utilityService.openModal(content, {
        size: 'l',
        windowClass: 'search'
      });
    }

  }
