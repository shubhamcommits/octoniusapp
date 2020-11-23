import { Component, OnInit, Injector, ViewChild, ElementRef, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { environment } from 'src/environments/environment';
import { retry } from 'rxjs/internal/operators/retry';
import { SubSink } from 'subsink';
import { UserService } from '../../shared/services/user-service/user.service';
import { UtilityService } from '../../shared/services/utility-service/utility.service';
import { PublicFunctions } from '../../shared/public.functions';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NavbarComponent implements OnInit, OnDestroy {

  @ViewChild('search', { static: false }) search: ElementRef;

  constructor(
    private userService: UserService,
    private utilityService: UtilityService,
    private injector: Injector
    ) { }

  // CURRENT USER DATA
  userData: any

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector)

  // BASE URL OF THE APPLICATION
  baseUrl = environment.UTILITIES_USERS_UPLOADS

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink()

  // Router state of the application
  routerState: any = 'home'

  async ngOnInit() {

    // FETCH THE USER DETAILS FROM THE SERVER
    this.userData = await this.getCurrentUser();

    // Fetch current user from the service
    this.subSink.add(this.utilityService.currentUserData.subscribe(async (res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {

        // Assign the GroupData
        this.userData = res;
      }
    }))

    // IF WE FIND THAT THE GET REQUEST HAS FAILED, THEN WE USE LOCAL DATA TO INTIALISE THE userData
    if (JSON.stringify(this.userData) === JSON.stringify({}))
      this.userData = this.publicFunctions.getUserDetailsFromStorage();

    console.log('User Data', this.userData);
  }

  /**
   * This functions unsubscribes all the observables subscription to avoid memory leak
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe()
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

  closeModal(){
    this.utilityService.closeAllModals();
  }

  openModal(content: any){
    this.utilityService.openModal(content, {
      size: 'l',
      windowClass: 'search'
    });
  }
}
