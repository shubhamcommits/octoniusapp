import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { retry } from 'rxjs/internal/operators/retry';
import { SubSink } from 'subsink';
import { AuthService } from 'src/shared/services/auth-service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit {

  constructor(
    private storageService: StorageService,
    private userService: UserService,
    private utilityService: UtilityService,
    private authService: AuthService,
    private router: Router) { }

  // CURRENT USER DATA
  userData: any;

  // BASE URL OF THE APPLICATION
  baseUrl = environment.BASE_URL;

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink();

  async ngOnInit() {

    // FETCH THE USER DETAILS FROM THE SERVER
    this.userData = await this.getCurrentUser();

    // IF WE FIND THAT THE GET REQUEST HAS FAILED, THEN WE USE LOCAL DATA TO INTIALISE THE userData
    if (JSON.stringify(this.userData) === JSON.stringify({}))
      this.userData = this.storageService.getLocalData('userData');

    // SENDING THE UPDATE THROUGH SERVICE TO UPDATE THE USER DETAILS AT ALL COMPONENTS
    if (this.userData) {
      this.utilityService.updateUserData(this.userData);
      this.storageService.setLocalData('userData', JSON.stringify(this.userData))
    }

    console.log(this.userData)

  }

  /**
   * This function fetches the user details, makes a GET request to the server
   */
  async getCurrentUser() {
    return new Promise((resolve, reject) => {
      try {
        this.subSink.add(this.userService.getUser()
          .pipe(retry(3))
          .subscribe(res => resolve(res['user']))
        );
      } catch (err) {
        console.log('Error occured while fetching the user details', err);
        this.utilityService.errorNotification('Error occured while fetching your profile details');
        reject({});
      }
    })
  }

  /**
   * This function is responsible for logging the user out
   */
  async logout() {
    return new Promise((resolve, reject) => {
      try {
        this.subSink.add(this.authService.signout()
          .subscribe((res) => {
            this.storageService.clear();
            this.router.navigate(['/home'])
            .then(()=> this.utilityService.successNotification('Succesfully Logged out!'))
            resolve();
          }, (err) => {
            console.log('Error occured while logging out!', err);
            this.utilityService.errorNotification('Error occured while logging you out!');
            reject();
          }))
      } catch (err) {
        console.log('Error occured while logging out!', err);
        this.utilityService.errorNotification('Error occured while logging you out!');
      }
    })
  }

  /**
   * This functions unsubscribes all the observables subscription to avoid memory leak
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe()
  }

}
