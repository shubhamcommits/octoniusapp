import { Component, OnInit, Injector, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { PublicFunctions } from 'modules/public.functions';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';
import { take } from 'rxjs/internal/operators/take';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/shared/services/user-service/user.service';
import moment from 'moment';

@Component({
  selector: 'app-myspace-inbox',
  templateUrl: './myspace-inbox.component.html',
  styleUrls: ['./myspace-inbox.component.scss']
})
export class MyspaceInboxComponent implements OnInit, OnDestroy {

  // Subsink Object
  subSink = new SubSink();

  // Global Feed Variable check
  // globalFeed: boolean = (this.router.snapshot.url.findIndex((segment) => segment.path == 'inbox') == -1) ? false : true;

  // Current User Data
  userData: any;

  // NOTIFICATIONS DATA
  public notificationsData: any = {
    readNotifications: [],
    unreadNotifications: []
  }

  // BASE URL OF THE APPLICATION
  baseUrl = environment.UTILITIES_USERS_UPLOADS

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private router: ActivatedRoute,
    private _router: Router,
    private injector: Injector,
    public utilityService: UtilityService,
    public userService: UserService,
    private socketService: SocketService
  ) {
    // Subscribe to the change in notifications data from the server
    this.subSink.add(this.socketService.currentData.subscribe((res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {
        this.notificationsData = res;
      }
    }));
  }

  async ngOnInit() {
    // Start the loading spinner
    this.isLoading$.next(true);

    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'home'
    })

    // Fetch current user details
    this.userData = await this.publicFunctions.getCurrentUser();

    // Return the function via stopping the loader
    this.isLoading$.next(false);
    this.userData = await this.publicFunctions.getCurrentUser();
    this.router.queryParams.subscribe(params => {
      if (params['code']) {
        try {
          this.utilityService.asyncNotification('Please wait, while we are authenticating the slack...', new Promise((resolve, reject) => {
            this.userService.slackAuth(params['code'], this.userData)
              .subscribe(() => {
                // Resolve the promise
                resolve(this.utilityService.resolveAsyncPromise('Authenticated Successfully!'))
                this.userData.integrations.is_slack_connected = true
                this.userService.updateUser(this.userData);
                this.publicFunctions.sendUpdatesToUserData(this.userData);
              }),
              ((err) => {
                console.log('Error occured, while authenticating for Slack', err);
                reject(this.utilityService.rejectAsyncPromise('Oops, an error occured while authenticating for Slack, please try again!'))
              });
            this._router.navigate(['/']);
          }));
        }
        catch (err) {
          console.log('There\'s some unexpected error occured, please try again!', err);
          this.utilityService.errorNotification('There\'s some unexpected error occured, please try again!');
          this._router.navigate(['/']);
        }
      }
    });

    const workspaceData = await this.publicFunctions.getCurrentWorkspace();

    if ((this.userData?.role == 'admin' || this.userData?.role == 'owner')
        && (workspaceData['time_remaining'] <= 0
          || !workspaceData['billing']?.current_period_end
          || (workspaceData['time_remaining'] > 0
            && moment(workspaceData['billing']?.current_period_end).isBefore(moment())))
        && !workspaceData['billing']?.subscription_id) {
      this.utilityService.openTryOutNotification(workspaceData['time_remaining']);
    }
  }

  /**
   * Unsubscribe all the observables to avoid memory leaks
   */
  ngOnDestroy() {
    this.subSink.unsubscribe()
    this.isLoading$.complete()
  }

  /**
   * This function is responsible for marking all the notification as read
   */
  markAllNotificationAsRead() {
    this.notificationsData.unreadNotifications.forEach((notification, index) => {
      this.subSink.add(this.socketService.onEmit('markRead', notification['_id'], this.userData._id).subscribe())
      notification['read'] = true
    })

    this.notificationsData.unreadNotifications = []
  }

  /**
   * This function is responsible for marking the notification as read
   * @param notificationId - notification object Id
   * @param userId - userId of the current user
   */
  markNotificationAsRead(notificationId: string, userId: string, index: any) {
    this.subSink.add(this.socketService.onEmit('markRead', notificationId, userId)
      .pipe(take(1))
      .subscribe());
    this.notificationsData.unreadNotifications[index]['read'] = true
    this.notificationsData.unreadNotifications.splice(index, 1)
  }

  /**
   * This function routes the user to the particular post where notification has occured
   * @param postId - userId of the current user
   * @param postType - post type
   * @param group - group Id
   */
  viewNotification(notificationId: string, postId: string, postType: string, group: any) {

    // mark notification as read
    // this.markNotificationAsRead(notificationId, this.userData._id);

    // redirect the user to the post
    const groupId = (group._id) ? group._id : group;
    // Set the Value of element selection box to be the url of the post
    if (postType === 'task') {
      this._router.navigate(['/dashboard', 'work', 'groups', 'tasks'], { queryParams: { group: groupId, myWorkplace: false, postId: postId } });
    } else {
      this._router.navigate(['/dashboard', 'work', 'groups', 'activity'], { queryParams: { group: groupId, myWorkplace: false, postId: postId } });
    }
  }

  viewFolioNotification(notificationId: string, folioId: string, group: any) {

    // mark notification as read
    // this.markNotificationAsRead(notificationId, this.userData._id);

    const groupId = (group._id) ? group._id : group;
    this._router.navigate(['/document', folioId], { queryParams: { group: groupId } });
  }
}
