import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor(private socket: Socket) { }

  public onEvent(eventName: string): Observable<any> {
    return new Observable<any>(observer => {
        this.socket.on(eventName, (data: any) => observer.next(data));
    });
  }

  public onEmit(eventName: string, message?: any) {
    return new Observable<any>(observer=>{
      this.socket.emit(eventName, message, (callback?: any)=> observer.next());
    })
  }

}
