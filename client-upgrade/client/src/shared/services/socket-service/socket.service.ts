import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor(private socket: Socket) { }

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

  public changeData(data: any){
    this.dataSource.next(data);
  }

  public disconnectSocket(){
    return this.socket.disconnect();
  }

}
