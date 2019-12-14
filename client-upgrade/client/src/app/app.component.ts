import { Component } from '@angular/core';
import { ConnectionService } from 'ng-connection-service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { retry } from 'rxjs/internal/operators/retry';
import { map } from 'rxjs/internal/operators/map';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  
  /**
   * This function checks the following things in the application
   * @param connectionService - connection service 
   * @param utilityService - utility service for notifications
   * 1. Connects with Socket server
   * 2. Checks if the internet connection is valid of not
   * 3. Enabling and calling the @event notificationsFeed from the socket server
   */
  constructor(
    private connectionService: ConnectionService, 
    private socketService: SocketService,
    private utilityService: UtilityService){

    // Socket connection initilisation
    let connection = this.socketService.onEvent('connect').pipe(retry(Infinity)).subscribe();
    
    // Observable which return the value from the shared service, now we can use this as the data transmitter across the entire application
    let messageData = this.socketService.currentData
    .pipe(map((res) => res))
    .subscribe();
    
    // Internet connection Validity
    this.connectionService.monitor()
    .subscribe((isConnected)=>{
      if(!isConnected){
        this.utilityService.warningNotification('Oops, seems like you lost your internet connection', '' ,{
          showProgressBar: false,
          closeOnClick: false,
          backdrop: 0.8,
          timeout: 500
        })
      }
      else
        this.utilityService.clearAllNotifications();
    })

    /**
    * calling the @event notificationsFeed to get the notifications for the user
    */
    let notificationsFeed = this.socketService.onEvent('notificationsFeed').pipe(retry(Infinity))
        .subscribe((notifications)=>{
          // Here we send the message to change and update the notifications feed through the shared service
          this.socketService.changeData(notifications);
    })

    let workspaceData = this.socketService.onEvent('workspaceData').pipe(retry(Infinity))
    .subscribe((workspaceData)=>{
      // Here we send the message to change and update the workspace data through the shared service
      this.socketService.changeData(workspaceData);
      console.log(workspaceData);
})
  }

}
