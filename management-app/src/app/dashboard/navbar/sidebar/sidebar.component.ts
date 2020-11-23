import { Component, OnInit, OnDestroy, Injector, Inject, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { MatSidenav } from '@angular/material/sidenav';
import { StorageService } from 'src/app/shared/services/storage-service/storage.service';
import { AuthService } from 'src/app/shared/services/auth-service/auth.service';
import { PublicFunctions } from 'src/app/shared/public.functions';
import { UtilityService } from 'src/app/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  constructor(
    private injector: Injector,
    private storageService: StorageService,
    private authService: AuthService,
    private router: Router
  ) { }

  @Input() sideNav: MatSidenav;

  // CURRENT USER DATA
  userData: any;

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector);

  // Users Base Url
  userBaseUrl = environment.UTILITIES_USERS_UPLOADS;

  // Utility Service
  public utilityService = this.injector.get(UtilityService);

  async ngOnInit() {
    // FETCH THE USER DETAILS
    this.userData = await this.publicFunctions.getCurrentUser();
  }

  /**
   * This function is responsible for logging the user out
   */
  async logout() {
    try {
      this.utilityService.asyncNotification('Please wait, while we log you out securely...',
        new Promise((resolve, reject) => {
          this.authService.signout().toPromise()
            .then((res) => {
              this.storageService.clear();
              this.publicFunctions.sendUpdatesToRouterState({})
              this.publicFunctions.sendUpdatesToUserData({})
              this.router.navigate(['/home'])
              resolve(this.utilityService.resolveAsyncPromise('Successfully Logged out!'));
            }).catch((err) => {
              console.log('Error occurred while logging out!', err);
              reject(this.utilityService.rejectAsyncPromise('Error occurred while logging you out!, please try again!'));
            });
        }));
    } catch (err) {
      console.log('Error occurred while logging out!', err);
      this.utilityService.errorNotification('Error occurred while logging you out!');
    }
  }

}
