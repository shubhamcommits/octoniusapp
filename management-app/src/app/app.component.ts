import { Component, Injector } from '@angular/core';
import { map } from 'rxjs/internal/operators/map';
import { SubSink } from 'subsink';
import { Observable, Observer, fromEvent, merge } from 'rxjs';
import { UtilityService } from './shared/services/utility-service/utility.service';

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
    let utilityService = this.injector.get(UtilityService);

    // Internet connection validity
    this.subSink.add(this.checkInternetConnectivity(utilityService));
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
   * This function unsubscribes all the observables as soon as the component is destroyed
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }
}
