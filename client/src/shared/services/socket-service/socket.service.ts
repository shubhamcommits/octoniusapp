import { Injectable } from '@angular/core';
// import { Socket, SocketIoConfig } from 'ngx-socket-io';
import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
// import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
// import { SocketServer } from 'src/app/app.module';
import { NotificationService } from '../notification-service/notification.service';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor(
    // private socket: SocketServer,
    // private http: HttpClient,
    private _notificationService: NotificationService) { }

  // Define baseurl
  public baseUrl = environment.NOTIFICATIONS_BASE_URL;
  private socket:any;

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
          console.log("on event ",eventName,data)
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
    console.log("on emit ",eventName)
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
    try {
       this.socket = io(this.baseUrl,{
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
     setTimeout(() => {
      console.log("status",this.socket,this.socket.connected)
      if(!this.socket.connected){
         console.log("can not connect to socket trying again.....");
         setTimeout(() => {
           return this.serverInit();
         },2000);
      }else if(this.socket.connected){
         console.log("connected to socket server....");
      }
     }, 1000);
     
    } catch (error) {
     console.log("error",error);
    }
    
    return this.socket;
    // return this.http.get(this.baseUrl + '/', { responseType: 'text' });
  }

  public getsocket(){
    return this.socket;
  }

  public changeData(data: any){
    this.dataSource.next(data);
  }

  public disconnectSocket(){
    console.log("disconnecting....")
    return this.socket.disconnect();
  }

  clear() {
    this.changeData({});
  }

}
