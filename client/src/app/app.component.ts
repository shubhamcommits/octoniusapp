import { Component, Injector } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { retry } from 'rxjs/internal/operators/retry';
import { map } from 'rxjs/internal/operators/map';
import { SubSink } from 'subsink';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { Observable, Observer, fromEvent, merge } from 'rxjs';
import { PublicFunctions } from '../../modules/public.functions';
import { Router, RouterEvent, NavigationEnd, ChildActivationEnd } from '@angular/router';

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

  routerFromEvent:any;
  groupId:any;

  constructor(
    private injector: Injector,
    private storageService: StorageService,
    private _router:Router
  ) {

    this.subSink.add(this._router.events.subscribe((e: any) => {
      if (e instanceof ChildActivationEnd) {
        this.groupId = e.snapshot.queryParamMap.get('group');
        this.routerFromEvent = e.snapshot;
      }
    }))

    let socketService = this.injector.get(SocketService);
    let utilityService = this.injector.get(UtilityService);

    // Internet connection validity
    this.subSink.add(this.checkInternetConnectivity(utilityService));

    // Initiate the gapi variable to confirm the check the gapi is ready to work
    this.loadGoogleAPI();

  }

  myAuthCheck() {
    return this.storageService.existData('authToken');
  }
  /**
   * This function checks for the active internet connection
   * @param utilityService
   */
  checkInternetConnectivity(utilityService: UtilityService) {
    return this.createOnline$()
      .subscribe((isOnline) => {
        if (!isOnline) {
          utilityService.warningNotification('Oops, seems like you lost your internet connection');
        }
        else
          utilityService.clearAllNotifications();
      })
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
