import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { environment } from 'src/environments/environment';
import { NotificationService } from '../notification-service/notification.service';
import { io } from 'socket.io-client';
import { PublicFunctions } from 'modules/public.functions';
@Injectable({
  providedIn: 'root'
})
export class SocketService {

  // Define baseurl
  public baseUrl = environment.NOTIFICATIONS_BASE_URL;
  private socket: any;

  /**
   * Both of the variables listed down below are used to share the data through this common service among different components in the app
   * @constant dataSource
   * @constant currentData
   */
  private dataSource = new BehaviorSubject<any>({});
  currentData = this.dataSource.asObservable();
 
	private unreadMessages = new BehaviorSubject<[]>([]);
	unreadMessagesData = this.unreadMessages.asObservable();

	private numTotalUnreadMessages = new BehaviorSubject<number>(0);
  	numTotalUnreadMessagesData = this.numTotalUnreadMessages.asObservable();
 
	private numUnreadDirectMessages = new BehaviorSubject<Map<string, number>>(new Map<string, number>());
	numUnreadDirectMessagesData = this.numUnreadDirectMessages.asObservable();
 
	private numUnreadGroupMessages = new BehaviorSubject<Map<string, number>>(new Map<string, number>());
	numUnreadGroupMessagesData = this.numUnreadGroupMessages.asObservable();

  // Create public functions object
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private _notificationService: NotificationService,
    private injector: Injector) { }

  public onEvent(eventName: string): Observable<any> {

    return new Observable<any>(observer => {
      this.socket.on(eventName, (data: any) => {
        observer.next(data);
        if (eventName === 'notificationsFeed' && data.new) {
          const notify = data['unreadNotifications'][0];          
          let notifyData: Array<any> = [];
          if (notify?.type === 'mention_folio') {
            notifyData.push({
              'title': $localize`:@@socketService.notification:Notification`,
              'alertContent': `${notify?._actor?.first_name || 'Deleted'} ${notify?._actor?.last_name || 'User'} ${notify?.message} ${notify?._origin_folio?.original_name}`,
            });
          } else if (notify?.type === 'crm-task-assignment' || notify?.type === 'crm-update-assignment') {
            notifyData.push({
              'title': $localize`:@@socketService.notification:Notification`,
              'alertContent': `${notify?._actor?.first_name || 'Deleted'} ${notify?._actor?.last_name || 'User'} ${notify?.message} ${notify?.company_name}`,
            });
          } else {
            notifyData.push({
              'title': $localize`:@@socketService.notification:Notification`,
              'alertContent': `${notify?._actor?.first_name || 'Deleted'} ${notify?._actor?.last_name || 'User'} ${notify?.message} ${notify?._origin_post?.title}`,
            });
          }
          this._notificationService.generateNotification(notifyData);
        }
      });
    });
  }

  public onEmit(eventName: string, ...messageData: any) {
    return new Observable<any>(observer => {
      this.socket.emit(eventName, ...messageData, (data: any) => {
        observer.next(data);
      });
    })
  }

  /**
   * This function initates the request to socket server
   */
  public serverInit() {

    try {
      if (!this.socket) {
        this.socket = io(this.baseUrl, {
          secure: true,
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 2000,
          randomizationFactor: 0.5,
          autoConnect: true,
          transports: ['websocket'],
          upgrade: true
        });
      }

      setTimeout(() => {
        if (!this.socket.connected) {
          return this.serverInit();
        }
      }, 5000);

			this.socket.on("connect_error", () => {
				setTimeout(() => {
					this.socket.connect();
				}, 1000);
			});

    } catch (error) {
      console.log("error", error);
    }
    return this.socket;
  }

	public updateUnreadMessages(data: any) {
		this.unreadMessages.next(data);
	}

	public updateNumTotalUnreadMessages(data: any) {
		this.numTotalUnreadMessages.next(data);
	}

	public updateNumTotalUnreadDirectMessages(data: any) {
		this.numUnreadDirectMessages.next(data);
	}

	public updateNumTotalUnreadGroupMessages(data: any) {
		this.numUnreadGroupMessages.next(data);
	}

  public changeData(data: any) {
    this.dataSource.next(data);
  }

  public disconnectSocket() {
		this.clear();
    return this.socket.disconnect();
  }

  clear() {
    this.changeData({});
		this.updateUnreadMessages([]);
		this.updateNumTotalUnreadMessages(0);
		this.updateNumTotalUnreadDirectMessages(new Map<string, number>());
		this.updateNumTotalUnreadGroupMessages(new Map<string, number>());
  }

}
