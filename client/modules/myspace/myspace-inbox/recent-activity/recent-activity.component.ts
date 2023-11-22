import { Component, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { BehaviorSubject } from 'rxjs';
import { retry } from 'rxjs/internal/operators/retry';
import { take } from 'rxjs/internal/operators/take';
import { LoungeService } from 'src/shared/services/lounge-service/lounge.service';
import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { SubSink } from 'subsink';
import { DateTime } from 'luxon';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { UserService } from 'src/shared/services/user-service/user.service';
import { MatDialog } from '@angular/material/dialog';
import { HolidayRejectionDialogComponent } from 'src/app/common/shared/hr/holiday-rejection-dialog/holiday-rejection-dialog.component';
import { HRService } from 'src/shared/services/hr-service/hr.service';
import { EditMemberPayrollDialogComponent } from 'modules/organization/hr/employees/edit-member-payroll-dialog/edit-member-payroll-dialog.component';

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

  pendingHolidays = [];

  pendingHRTasks = [];

  selectedTab = 0;

  isOrganizationModuleAvailable = false;
  isBusinessSubscription = false;

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // Subsink Object
  subSink = new SubSink();

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private _router: Router,
    private injector: Injector,
    public dialog: MatDialog,
    private socketService: SocketService,
    private loungeService: LoungeService,
    private managementPortalService: ManagementPortalService,
    private utilityService: UtilityService,
    private userService: UserService,
    private hrService: HRService
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

    this.isOrganizationModuleAvailable = await this.publicFunctions.isOrganizationModuleAvailable();
    this.isBusinessSubscription = await this.managementPortalService.checkIsBusinessSubscription();

    await this.initNotifications();

    this.loungeService.getAttendingEvents(this.workspaceData?._id).then(res => {
      this.attendingEvents = res['stories'];
    });

    if (this.isBusinessSubscription) {
      await this.userService.getPendingApprovalHolidays().then(res => {
        this.pendingHolidays = res['holidays'];
      });

      if (this.isOrganizationModuleAvailable && (this.userData?.hr_role || this.userData?.role == 'owner')) {
        await this.hrService.getHRPendingNotifications(this.workspaceData?._id).then(res => {
          this.pendingHRTasks = res['notifications'];
        });
      }
    }

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
  async viewNotification(notification: any, index: any) {

    this.markNotificationAsRead(notification?._id, this.userData?._id, index, notification?.type);

    if (notification?._origin_post?._group?._id) {
      // redirect the user to the post
      const newGroup = await this.publicFunctions.getGroupDetails(notification?._origin_post?._group?._id);
      await this.publicFunctions.sendUpdatesToGroupData(newGroup);
      // Set the Value of element selection box to be the url of the post
      if (notification?._origin_post?.type === 'task') {
        this._router.navigate(['/dashboard', 'work', 'groups', 'tasks'], { queryParams: { postId: notification?._origin_post?._id } });
      } else {
        this._router.navigate(['/dashboard', 'work', 'groups', 'activity'], { queryParams: { postId: notification?._origin_post?._id } });
      } 
    } else {
      this._router.navigate(['/dashboard', 'work', 'northstar'], { queryParams: { postId: notification?._origin_post?._id } });
    }
  }

  async goToGroup(groupId: string, notificationId: string, index: any, type: string) {
    this.markNotificationAsRead(notificationId, this.userData._id, index, type);

    const newGroup = await this.publicFunctions.getGroupDetails(groupId);
    await this.publicFunctions.sendUpdatesToGroupData(newGroup);
    this._router.navigate(['/dashboard', 'work', 'groups', 'activity']);
  }

  async viewFolioNotification(notification: any, index: any) {
    this.markNotificationAsRead(notification?._id, this.userData?._id, index, notification?.type);

    const newGroup = await this.publicFunctions.getGroupDetails(notification?._origin_folio?._origin_group?._id);
    await this.publicFunctions.sendUpdatesToGroupData(newGroup);
    this._router.navigate(['/document', notification?._origin_folio?._id]);
  }

  async viewCollectionNotification(notification: any, index: any) {
    this.markNotificationAsRead(notification?._id, this.userData?._id, index, notification?.type);
    this._router.navigate(['/dashboard/work/groups/library/collection'], { queryParams: { collection: notification?._collection?._id } });
  }

  async viewPageNotification(notification: any, index: any) {
    this.markNotificationAsRead(notification?._id, this.userData?._id, index, notification?.type);
    this._router.navigate(['/dashboard/work/groups/library/collection/page'], { queryParams: { page: notification?._page?._id } });
  }

  async viewApprovalNotification(notification: any, index: any) {
    this.markNotificationAsRead(notification?._id, this.userData?._id, index, notification?.type)

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
    } else if (this.pendingHolidays.length > 0) {
      this.selectedTab = 4;
    } else if (this.pendingHRTasks.length > 0) {
      this.selectedTab = 5;
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

  doHolidayAction(action: string, holidayId: string) {
    this.utilityService.getConfirmDialogAlert($localize`:@@recentActivity.areYouSure:Are you sure?`, $localize`:@@recentActivity.actionConfirmation:By doing this, the item will be ${action}!`)
      .then((res) => {
        if (res.value) {
          if (action == 'approved') {
            this.userService.editHolidayStatus(holidayId, action).then(res => {
              const index = (this.pendingHolidays) ? this.pendingHolidays.findIndex(holiday => holiday._id == holidayId) : -1;
              if (index >= 0) {
                this.pendingHolidays.splice(index, 1);
              }
            }).catch(err => {
              this.utilityService.errorNotification(err.error.message);
            });
          } else if (action == 'rejected') {
            const dialogRef = this.dialog.open(HolidayRejectionDialogComponent, {
              disableClose: true,
              hasBackdrop: true,
            });

            dialogRef.afterClosed().subscribe(async rejectionDescription => {
              if (!!rejectionDescription) {
                this.userService.editHolidayStatus(holidayId, action, rejectionDescription).then(res => {
                  const index = (this.pendingHolidays) ? this.pendingHolidays.findIndex(holiday => holiday._id == holidayId) : -1;
                  if (index >= 0) {
                    this.pendingHolidays.splice(index, 1);
                  }
                }).catch(err => {
                  this.utilityService.errorNotification(err.error.message);
                });
              }
            });
          }
        }
      });
  }

  openUserProfile(userId: string) {
    const dialogRef = this.dialog.open(EditMemberPayrollDialogComponent, {
      data: {
        memberId: userId
      },
      width: '65%',
      height: '75%',
      disableClose: true,
      hasBackdrop: true
    });

    // const memberEditedEventSubs = dialogRef.componentInstance.memberEditedEvent.subscribe((data) => {
    //   this.initUsersTable();
    // });

    dialogRef.afterClosed().subscribe(result => {
      // memberEditedEventSubs.unsubscribe();
    });
  }

  markAsCompleted(notificationId: string) {
    this.utilityService.getConfirmDialogAlert($localize`:@@recentActivity.areYouSure:Are you sure?`, $localize`:@@recentActivity.completelyRemoved:By doing this, the task will be marked as DONE!`)
      .then((res) => {
        if (res.value) {
          this.utilityService.asyncNotification($localize`:@@recentActivity.pleaseWaitDeleting:Please wait we are update the notification...`, new Promise((resolve, reject) => {
            this.hrService.markNotificationAsDone(notificationId).then(async res => {
              const index = (this.pendingHRTasks) ? this.pendingHRTasks.findIndex(task => task._id == notificationId) : -1;
              if (index >= 0) {
                this.pendingHRTasks.splice(index, 1);
              }

              resolve(this.utilityService.resolveAsyncPromise($localize`:@@recentActivity.notificationUpdated:Notification marked as DONE!`));
              // window.location.reload();
            }).catch((err) => {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@recentActivity.unableUpdateNotifiaction:Unable to mark the notification as DONE, please try again!`));
            });
          }));
        }
      });
  }

  formateDate(date: any) {
    if (!!date && (date instanceof DateTime)) {
      return date.toLocaleString(DateTime.DATE_SHORT);
    }
    return (!!date) ? DateTime.fromISO(date).toLocaleString(DateTime.DATE_SHORT) : '';
  }
}
