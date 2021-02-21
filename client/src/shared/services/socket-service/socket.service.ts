import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor(
    private http: HttpClient) { }

  // Socket variable
  private socket; 

  public baseUrl = environment.NOTIFICATIONS_BASE_URL;

  /**
   * Both of the variables listed down below are used to share the data through this common service among different components in the app
   * @constant dataSource
   * @constant currentData
   */
  private dataSource = new BehaviorSubject<any>({});
  currentData = this.dataSource.asObservable();

  public onEvent(eventName: string): Observable<any> {
    console.log(this.socket)
    return new Observable<any>(observer => {
        this.socket.on(eventName, (data: any) => {
          console.log(`Socket for event name - ${eventName} is connected!`);
          observer.next(data);
        });
    });
  }

  public onEmit(eventName: string, ...messageData: any) {
    return new Observable<any>(observer=>{
      this.socket.emit(eventName, ...messageData, (data: any)=> {
        console.log(`Socket for ${eventName} has emitted a message with data - ${messageData} and it says - ${data}`);
        observer.next(data);
      });
    })
  }

  /**
   * This function initates the request to socket server
   */
  public serverInit(){
    this.socket = io( environment.NOTIFICATIONS_BASE_URL, 
      {
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 2000,
          randomizationFactor: 0.5,
          autoConnect: true,
          transports: ['websocket'],
          upgrade: false
      })
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
