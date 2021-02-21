import { Component, OnInit, Injector, Input, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { retry } from 'rxjs/internal/operators/retry';
import { SubSink } from 'subsink';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { PublicFunctions } from 'modules/public.functions';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import moment from 'moment';
import { map } from 'rxjs/internal/operators/map';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('search') search: ElementRef;

  constructor(
    private userService: UserService,
    private utilityService: UtilityService,
    private _ActivatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private socketService: SocketService,
    private injector: Injector,
    private _router: Router
  ) { }

  @Input() groupId: any;
  @Input() routerFromEvent: any;

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

  /*
  // My Workplace variable check
  myWorkplace: boolean = this._ActivatedRoute.snapshot.queryParamMap.has('myWorkplace')
      ? (this._ActivatedRoute.snapshot.queryParamMap.get('myWorkplace') == ('false') ? (false) : (true))
      : (this._ActivatedRoute.snapshot['_routerState'].url.toLowerCase().includes('myspace')
          ? true
          : false)
  */

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

  ngAfterContentChecked() {
    this.subSink.add(this.utilityService.routerStateData.subscribe((res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {
        this.routerState = res['state'];
        if (this.routerState === 'admin') {
          this.nextCommonNavbarState();

        } else if (this.routerState === 'group' || this.routerState === 'home') {
          this.nextGroupNavbarState();
        }
        else if (this.routerState === 'work') {
          this.nextWorkNavbar();
        }
        else if (this.routerState === 'user-account') {
          this.nextUserAccountNavbarState();
        }
      }
    }));
  }

  async ngOnInit() {

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

    // await this.initNotifications();

    await this.publicFunctions.handleGoogleSignIn()

    // This function is responsible for keep the cloud connected and refreshes the token in every 30mins(limit is 50 mins)
    setInterval(async () => {
      await this.publicFunctions.handleGoogleSignIn()
    }, 1800000);

    console.log('User Data', this.userData);
    console.log('Workspace Data', this.workspaceData);
  }

  ngAfterViewInit() {
    const searchRef = this.search;
    let socketService = this.injector.get(SocketService);
    let utilityService = this.injector.get(UtilityService);

    // Socket connection initilisation
    this.subSink.add(this.enableSocketConnection(socketService, utilityService));

    // Reconnection Socket Emitter
    this.subSink.add(this.enableReconnectSocket(socketService));
    //this.addHotKeys(searchRef)
  }

  /**
   * This function enables the socket connection in the application
   * @param socketService
   */
  enableSocketConnection(socketService: SocketService, utilityService: UtilityService) {
    return socketService.onEvent('connect')
      .pipe(retry(Infinity))
      .subscribe(() => {
        // Socket Notifications Data Transmitter
        this.subSink.add(this.enableNotificationDataTransmitter(socketService));

        // Notifications Feed Socket
        // this.subSink.add(this.enableNotificationsFeedSocket(socketService));

        // Workspace Data Socket
        this.subSink.add(this.enableWorkspaceDataSocket(socketService, this.publicFunctions));

        // User Role Data Socket
        this.subSink.add(this.enableUserRoleSocket(socketService, this.publicFunctions, utilityService));
      })
  }

  /**
   * Observable which return the value from the shared service,
   * now we can use this as the data transmitter across the entire application
   * @param socketService
   */
  enableNotificationDataTransmitter(socketService: SocketService) {
    return socketService.currentData.pipe(map((res) => res)).subscribe();
  }

  // /**
  //  * This function enables the notifications feed for the user
  //  * @param socketService
  //  * calling the @event notificationsFeed to get the notifications for the user
  //  */
  // enableNotificationsFeedSocket(socketService: SocketService) {
  //   return socketService.onEvent('notificationsFeed')
  //     .pipe(retry(Infinity))
  //     .subscribe((notifications) => {
  //       console.log("In APP Roaring");
  //       // Here we send the message to change and update the notifications feed through the shared service
  //       socketService.changeData(notifications);
  //     })
  // }

  /**
   * This function enables the workspace data sharing over the socket
   * @param publicFunctions
   * @param socketService
   * calling the @event workspaceDataUpdate to get the workspace data if there's any change in workspace
   */
  enableWorkspaceDataSocket(socketService: SocketService, publicFunctions: PublicFunctions) {
    return socketService.onEvent('workspaceDataUpdate')
      .pipe(retry(Infinity))
      .subscribe((workspaceData) => {
        // Here we send the message to change and update the workspace data through the shared service
        publicFunctions.sendUpdatesToWorkspaceData(workspaceData)
      })
  }

  /**
   * This function enables the user role sharing over the socket
   * @param publicFunctions
   * @param socketService
   * calling the @event userRoleUpdate to get the userRole data if there's any change in userRole
   */
  enableUserRoleSocket(socketService: SocketService, publicFunctions: PublicFunctions, utilityService: UtilityService) {
    return socketService.onEvent('userDataUpdate')
      .pipe(retry(Infinity))
      .subscribe(async (userData) => {

        // Fetch the current user
        let currentUser: any = await publicFunctions.getCurrentUser();

        // Update the profile picture and send the update accross the app
        if (userData.hasOwnProperty('profile_pic'))
          if (userData.profile_pic !== 'default_user.png')
            currentUser.profile_pic = userData.profile_pic || currentUser.profile_pic;

        // Update the role
        if (userData.hasOwnProperty('role')) {
          currentUser.role = userData.role || currentUser.role;
          utilityService.infoNotification(`Your role has been updated to ${currentUser.role}!`)
        }


        // Here we send the message to change and update the current user through the shared service and storage too
        publicFunctions.sendUpdatesToUserData(currentUser)
      })
  }

  /**
   * This function enables the reconnect_attempt socket, to check how many times the socket has been connecting
   * @param socketService
   */
  enableReconnectSocket(socketService: SocketService) {
    return socketService.onEvent('reconnect_attempt')
      .pipe(retry(Infinity))
      .subscribe();
  }

  // async initNotifications() {
  //   console.log("Am herer initNotifications");
  //   // Subscribe to the change in notifications data from the server
  //   this.subSink.add(this.socketService.currentData.subscribe((res) => {
  //     if (JSON.stringify(res) != JSON.stringify({}))
  //       this.notificationsData = res;
  //   }));

  //   /**
  //    * emitting the @event joinUser to let the server know that user has joined
  //    */
  //   this.subSink.add(this.socketService.onEmit('joinUser', this.userData['_id'])
  //     .pipe(retry(Infinity))
  //     .subscribe());

  //   /**
  //    * emitting the @event joinWorkspace to let the server know that user has joined
  //    */
  //   this.subSink.add(this.socketService.onEmit('joinWorkspace', {
  //     workspace_name: this.userData['workspace_name']
  //   })
  //     .pipe(retry(Infinity))
  //     .subscribe());

  //   /**
  //    * emitting the @event getNotifications to let the server know to give back the push notifications
  //    */
  //   this.subSink.add(this.socketService.onEmit('getNotifications', this.userData['_id'])
  //     .pipe(retry(Infinity))
  //     .subscribe());
  // }

  /**
   * This functions unsubscribes all the observables subscription to avoid memory leak
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe()
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
        console.log('Error occured while fetching the user details', err);
        this.utilityService.errorNotification('Error occured while fetching your profile details');
        reject({});
      }
    })
  }

  closeModal() {
    this.utilityService.closeAllModals();
  }

  openModal(content: any) {
    this.utilityService.openModal(content, {
      size: 'l',
      windowClass: 'search'
    });
  }

  switchSideBar() {
    this.iconsSidebar = !this.iconsSidebar;
  }

  async onFavoriteGroupSaved() {
    this.userData = await this.getCurrentUser();
    // this.userData = await this.publicFunctions.getCurrentUser();
    this.userGroups = this.userData['stats']['favorite_groups'];
  }

  showSideBar() {
    return !this.isDocumentPage;
  }
}
