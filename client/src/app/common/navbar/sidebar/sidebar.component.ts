import { Component, OnInit, OnDestroy, Injector, Inject, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { environment } from 'src/environments/environment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { AuthService } from 'src/shared/services/auth-service/auth.service';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { SubSink } from 'subsink';
import { NavbarComponent } from '../navbar.component';
import { MatSidenav } from '@angular/material/sidenav';
// import * as $ from 'jquery';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {

  constructor(
    private injector: Injector,
    private storageService: StorageService,
    private authService: AuthService,
    private socketService: SocketService,
    private router: Router
  ) { }

  @Input() sideNav: MatSidenav;

  // CURRENT USER DATA
  userData: any;

  // Workspace data for the current workspace
  public workspaceData: any = {};

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector);

  // BASE URL OF THE APPLICATION
  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink();

  // Array of user groups
  public userGroups: any = [];

  // Utility Service
  public utilityService = this.injector.get(UtilityService);

  async ngOnInit() {
    // FETCH THE USER DETAILS
    this.userData = await this.publicFunctions.getCurrentUser();

    // Fetch the current workspace data
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    // Fetches the user groups from the server
    this.userGroups = await this.publicFunctions.getUserGroups(this.workspaceData._id, this.userData._id)
      .catch(() => {
        // If the function breaks, then catch the error and console to the application
        this.publicFunctions.sendError(new Error('Unable to connect to the server, please try again later!'));
      });
  }

  /**
   * This functions unsubscribes all the observables subscription to avoid memory leak
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  /**
   * This function is responsible for logging the user out
   */
  async logout() {
    try {
      this.utilityService.asyncNotification('Please wait, while we log you out securely...',
      new Promise((resolve, reject) => {
        this.subSink.add(this.authService.signout()
        .subscribe((res) => {
          this.storageService.clear();
          this.publicFunctions.sendUpdatesToGroupData({})
          this.publicFunctions.sendUpdatesToRouterState({})
          this.publicFunctions.sendUpdatesToUserData({})
          this.publicFunctions.sendUpdatesToWorkspaceData({})
          this.socketService.disconnectSocket();
          this.router.navigate(['/home'])
          .then(() => resolve(this.utilityService.resolveAsyncPromise('Successfully Logged out!')));

        }, (err) => {
          console.log('Error occurred while logging out!', err);
          reject(this.utilityService.rejectAsyncPromise('Error occurred while logging you out!, please try again!'));
        }));
      }));
    } catch (err) {
      console.log('Error occurred while logging out!', err);
      this.utilityService.errorNotification('Error occurred while logging you out!');
    }
  }

}
