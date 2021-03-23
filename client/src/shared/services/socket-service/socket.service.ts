import { Injectable } from '@angular/core';
import { Socket, SocketIoConfig } from 'ngx-socket-io';
import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SocketServer } from 'src/app/app.module';
import { NotificationService } from '../notification-service/notification.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor(
    private socket: SocketServer,
    private http: HttpClient,
    private _notificationService: NotificationService) { }

  // Define baseurl
  public baseUrl = environment.NOTIFICATIONS_BASE_URL;

  /**
   * Both of the variables listed down below are used to share the data through this common service among different components in the app
   * @constant dataSource
   * @constant currentData
   */
  private dataSource = new BehaviorSubject<any>({});
  currentData = this.dataSource.asObservable();

  public onEvent(eventName: string): Observable<any> {

    return new Observable<any>(observer => {
        this.socket.on(eventName, (data: any) => {
          observer.next(data);
          // console.log("on event ",eventName,data)
          if(eventName === 'notificationsFeed' && data.new){
            const notify = data['unreadNotifications'][0];
            let notifyData: Array < any >= [];
            if(notify?.type === 'mention_folio'){
              notifyData.push({
                'title': 'Notification',
                'alertContent': `${notify?._actor?.first_name || 'Deleted'} ${notify?._actor?.last_name || 'User'} ${notify?.message} ${notify?._origin_folio?.original_name}` ,
              });
            } else {
              notifyData.push({
                  'title': 'Notification',
                  'alertContent': `${notify?._actor?.first_name || 'Deleted'} ${notify?._actor?.last_name || 'User'} ${notify?.message} ${notify?._origin_post?.title}` ,
              });
            }
            this._notificationService.generateNotification(notifyData);
          }
        });
    });
  }

  public onEmit(eventName: string, ...messageData: any) {
    // console.log("on emit ",eventName)
    return new Observable<any>(observer=>{
      this.socket.emit(eventName, ...messageData, (data: any)=> {
        observer.next(data);
      });
    })
  }

  /**
   * This function initates the request to socket server
   */
  public serverInit(){
    return this.http.get(this.baseUrl + '/', { responseType: 'text' });
  }

  public getsocket(){
    return this.socket;
  }

  public changeData(data: any){
    this.dataSource.next(data);
  }

  public disconnectSocket(){
    return this.socket.disconnect();
  }

  clear() {
    this.changeData({});
  }

}
