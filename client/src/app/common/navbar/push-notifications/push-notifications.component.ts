import { Component, OnInit, Input } from '@angular/core';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { retry } from 'rxjs/internal/operators/retry';
import { SubSink } from 'subsink';
import { take } from 'rxjs/internal/operators/take';
import { Router } from '@angular/router';

@Component({
    selector: 'push-notifications',
    templateUrl: './push-notifications.component.html',
    styleUrls: ['./push-notifications.component.scss']
})
export class PushNotificationsComponent implements OnInit {

    constructor(
        private socketService: SocketService,
        public utilityService: UtilityService,
        private router: Router
    ) { }

    // USER DATA FOR THE CURRENT USER
    @Input('userData') userData: any;

    // BASE URL OF THE CURRENT ENVIRONMENT
    @Input('baseUrl') baseUrl: any;

    // UNSUBSCRIBE THE OBSERVABLES
    private subSink = new SubSink();

    // NOTIFICATIONS DATA
    public notificationsData: { readNotifications: [], unreadNotifications: [] } = {
        readNotifications: [],
        unreadNotifications: []
    }

    async ngOnInit() {

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
     * This function is responsible for marking the notification as read
     * @param notificationId - notification object Id
     * @param userId - userId of the current user
     */
    markNotificationAsRead(notificationId: string, userId: string) {
        this.subSink.add(this.socketService.onEmit('markRead', notificationId, userId)
            .pipe(take(1))
            .subscribe())
    }

    /**
     * This function routes the user to the particular post where notification has occurred
     * @param notficationId - notification Object Id
     * @param postId - userId of the current user
     */
    viewNotification(notficationId: string, postId: string) {
        this.router.navigate([]);
    }

    /**
     * This functions unsubscribes all the observables subscription to avoid memory leak
     */
    ngOnDestroy(): void {
        this.subSink.unsubscribe();
    }
}
