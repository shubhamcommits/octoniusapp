import { Component, Injector } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { retry } from 'rxjs/internal/operators/retry';
import { map } from 'rxjs/internal/operators/map';
import { SubSink } from 'subsink';
import { Observable, Observer, fromEvent, merge } from 'rxjs';
import { PublicFunctions } from './dashboard/public.functions';

// Google API Variable
 declare const gapi: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  // Subsink
  private subSink = new SubSink();
  
  // Create public functions object
  public publicFunctions = new PublicFunctions(this.injector);

  /**
   * This function checks the following things in the application
   * @param connectionService - connection service 
   * @param utilityService - utility service for notifications
   * 1. Connects with Socket server
   * 2. Checks if the internet connection is valid of not
   * 3. Enabling and calling the @event notificationsFeed from the socket server
   * 4. Enabling and calling the @event workspaceData from the socket server
   */
  constructor(
    private injector: Injector
  ) {

    let socketService = this.injector.get(SocketService);
    let utilityService = this.injector.get(UtilityService);

    // Internet connection validity
    this.subSink.add(this.checkInternetConnectivity(utilityService));

    // Socket connection initilisation
    this.subSink.add(this.enableSocketConnection(socketService));

    // Socket Notifications Data Transmitter
    this.subSink.add(this.enableNotificationDataTransmitter(socketService));

    // Notifications Feed Socket
    this.subSink.add(this.enableNotificationsFeedSocket(socketService));

    // Workspace Data Socket
    this.subSink.add(this.enableWorkspaceDataSocket(socketService, this.publicFunctions));

    // Reconnection Socket Emitter
    this.subSink.add(this.enableReconnectSocket(socketService));

    // Initiate the gapi variable to confirm the check the gapi is ready to work
    this.loadGoogleAPI();

  }

  /**
   * This function checks for the active internet connection
   * @param utilityService 
   */
  checkInternetConnectivity(utilityService: UtilityService) {
    return this.createOnline$()
    .subscribe((isOnline) => {
      if (!isOnline) {
        utilityService.warningNotification('Oops, seems like you lost your internet connection', '', {
          showProgressBar: true,
          closeOnClick: false,
          backdrop: 0.8,
          timeout: 3000
        })
      }
      else
        utilityService.clearAllNotifications();
    })
  }

  /**
   * This function makes the HTTP initial request to the socket server in order to initiate the connection
   * @param socketService 
   */
  initSockerServer(socketService: SocketService) {
    socketService.serverInit()
      .subscribe()
  }

  /**
   * This function enables the socket connection in the application
   * @param socketService 
   */
  enableSocketConnection(socketService: SocketService) {
    return socketService.onEvent('connect')
      .pipe(retry(Infinity))
      .subscribe()
  }

  /**
   * Observable which return the value from the shared service, 
   * now we can use this as the data transmitter across the entire application
   * @param socketService 
   */
  enableNotificationDataTransmitter(socketService: SocketService) {
    return socketService.currentData.pipe(map((res) => res)).subscribe();
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
        // Here we send the message to change and update the notifications feed through the shared service
        socketService.changeData(notifications);
      })
  }

  /**
   * This function enables the workspace data sharing over the socket
   * @param publicFunctions
   * @param socketService
   * calling the @event workspaceDataUpdate to get the workspace data if there's any change in workspace
   */
  enableWorkspaceDataSocket(socketService: SocketService, publicFunctions: PublicFunctions) {
    return socketService.onEvent('workspaceDataUpdate')
      .pipe(retry(Infinity))
      .subscribe((workspaceData) => {
        // Here we send the message to change and update the workspace data through the shared service
        publicFunctions.sendUpdatesToWorkspaceData(workspaceData)
      })
  }

  /**
   * This function enables the reconnect_attempt socket, to check how many times the socket has been connecting
   * @param socketService 
   */
  enableReconnectSocket(socketService: SocketService) {
    return socketService.onEvent('reconnect_attempt')
      .pipe(retry(Infinity))
      .subscribe();
  }

  /**
   * This function checks for the active internet connection 
   */
  createOnline$() {
    return merge<boolean>(
      fromEvent(window, 'offline').pipe(map(() => false)),
      fromEvent(window, 'online').pipe(map(() => true)),
      new Observable((sub: Observer<boolean>) => {
        sub.next(navigator.onLine);
        sub.complete();
      }));
  }

  /**
   * This function enables the google api connection to the client
   */
  async loadGoogleAPI() {
    await gapi.load('auth', (() => {
      console.log('Google API is connected!')
    }));
  }

  /**
   * This function unsubscribes all the observables as soon as the component is destroyed
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

}
