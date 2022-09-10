import { Component, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { BehaviorSubject } from 'rxjs';
import { retry } from 'rxjs/internal/operators/retry';
import { take } from 'rxjs/internal/operators/take';
import { environment } from 'src/environments/environment';
import { LoungeService } from 'src/shared/services/lounge-service/lounge.service';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-recent-activity',
  templateUrl: './recent-activity.component.html',
  styleUrls: ['./recent-activity.component.scss']
})
export class RecentActivityComponent implements OnInit {

  // Current User Data
  userData: any;
  workspaceData: any;

  // NOTIFICATIONS DATA
  public notificationsData: any = {
    readNotifications: [],
    unreadNotifications: [],
    unreadPosts: [],
    pendingApprovals: []
  }

  attendingEvents = [];

  approvals = [];

  selectedTab = 0;

  groupBaseUrl = environment.UTILITIES_GROUPS_UPLOADS;

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // Subsink Object
  subSink = new SubSink();

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private _router: Router,
    private injector: Injector,
    private socketService: SocketService,
    private loungeService: LoungeService
  ) {
    // Subscribe to the change in notifications data from the server
    this.subSink.add(this.socketService.currentData.subscribe((res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {
        this.notificationsData = res;
        this.selectedDefaultTab();
      }
    }));

    // Notifications Feed Socket
    this.subSink.add(this.enableNotificationsFeedSocket(socketService));
  }

  async ngOnInit() {
    // Start the loading spinner
    this.isLoading$.next(true);

    // Fetch current user details
    this.userData = await this.publicFunctions.getCurrentUser();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    await this.initNotifications();

    this.loungeService.getAttendingEvents(this.workspaceData?._id).then(res => {
      this.attendingEvents = res['stories'];
    });

    // Return the function via stopping the loader
    this.isLoading$.next(false);
  }

  /**
   * Unsubscribe all the observables to avoid memory leaks
   */
  ngOnDestroy() {
    this.subSink.unsubscribe();
    this.isLoading$.complete();
  }

  /**
   * This function enables the notifications feed for the user
   * @param socketService
   * calling the @event notificationsFeed to get the notifications for the user
   */
  enableNotificationsFeedSocket(socketService: SocketService) {
    return socketService.onEvent('notificationsFeed')
      .pipe(retry(Infinity))
      .subscribe((notifications) => {
        this.notificationsData = notifications;
        this.selectedDefaultTab();
        socketService.changeData(notifications);
      })
  }

  async initNotifications() {

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
   * This function is responsible for marking all the notification as read
   */
  markAllNotificationAsRead(type: string) {
    if (type != 'new-post') {
      this.notificationsData.unreadNotifications.forEach((notification, index) => {
        this.subSink.add(this.socketService.onEmit('markRead', notification['_id'], this.userData._id).subscribe())
        notification['read'] = true
      })

      this.notificationsData.unreadNotifications = [];
    } else {
      this.notificationsData.unreadPosts.forEach((notification, index) => {
        this.subSink.add(this.socketService.onEmit('markRead', notification['_id'], this.userData._id).subscribe())
        notification['read'] = true
      })

      this.notificationsData.unreadPosts = [];
    }
  }

  /**
   * This function is responsible for marking the notification as read
   * @param notificationId - notification object Id
   * @param userId - userId of the current user
   */
  markNotificationAsRead(notificationId: string, userId: string, index: any, type: string) {
    this.subSink.add(this.socketService.onEmit('markRead', notificationId, userId)
      .pipe(take(1))
      .subscribe());

    if (type != 'new-post') {
      this.notificationsData.unreadNotifications[index]['read'] = true
      this.notificationsData.unreadNotifications.splice(index, 1)
    } else {
      this.notificationsData.unreadPosts[index]['read'] = true
      this.notificationsData.unreadPosts.splice(index, 1)
    }
  }

  /**
   * This function routes the user to the particular post where notification has occurred
   * @param postId - userId of the current user
   * @param postType - post type
   * @param group - group Id
   */
  async viewNotification(postId: string, postType: string, groupId: string) {
    // redirect the user to the post
    const newGroup = await this.publicFunctions.getGroupDetails(groupId);
    await this.publicFunctions.sendUpdatesToGroupData(newGroup);
    // Set the Value of element selection box to be the url of the post
    if (postType === 'task') {
      this._router.navigate(['/dashboard', 'work', 'groups', 'tasks'], { queryParams: { postId: postId } });
    } else {
      this._router.navigate(['/dashboard', 'work', 'groups', 'activity'], { queryParams: { postId: postId } });
    }
  }

  async viewFolioNotification(folioId: string, groupId: string) {
    const newGroup = await this.publicFunctions.getGroupDetails(groupId);
    await this.publicFunctions.sendUpdatesToGroupData(newGroup);
    this._router.navigate(['/document', folioId]);
  }

  async viewApprovalNotification(notification: any) {
    if (notification?._origin_post && notification?._origin_post?.type == 'task') {
      const groupId = notification?._origin_post?._group._id || notification?._origin_post?._group;
      const newGroup = await this.publicFunctions.getGroupDetails(groupId);
      await this.publicFunctions.sendUpdatesToGroupData(newGroup);
      this._router.navigate(['/dashboard', 'work', 'groups', 'tasks'], { queryParams: { postId: notification?._origin_post?._id } });
    } else if (notification?._origin_folio) {
      const groupId = notification?._origin_folio?._group._id || notification?._origin_folio?._group;
      const newGroup = await this.publicFunctions.getGroupDetails(groupId);
      await this.publicFunctions.sendUpdatesToGroupData(newGroup);
      this._router.navigate(['/dashboard', 'work', 'groups', 'files'], { queryParams: { itemId: notification?._origin_folio?._id } });
    }
  }

  /**
   * This function opens the dialog of the post where notification has occurred
   * @param postId - userId of the current user
   * @param group - group Id
   */
  async viewPost(postId: string, group: any) {
    const groupId = (group._id) ? group._id : group;
    const newGroup = await this.publicFunctions.getGroupDetails(groupId);
    await this.publicFunctions.sendUpdatesToGroupData(newGroup);
    this._router.navigate(['/dashboard', 'work', 'groups', 'activity'], { queryParams: { postId: postId } });
  }

  selectedDefaultTab() {
    if (this.notificationsData.unreadNotifications.length > 0) {
      this.selectedTab = 0;
    } else if (this.notificationsData.pendingApprovals.length > 0) {
      this.selectedTab = 3;
    } else if (this.notificationsData.unreadPosts.length > 0) {
      this.selectedTab = 1;
    } else if (this.attendingEvents.length > 0) {
      this.selectedTab = 2;
    } else {
      this.selectedTab = 0;
    }
  }

  isAssistingEvent(participants: any) {
    return participants.findIndex((assist) => (assist._id || assist) == this.userData?._id) >= 0
  }
}
