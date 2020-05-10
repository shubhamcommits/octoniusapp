import { Component, OnInit, Injector, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { retry } from 'rxjs/internal/operators/retry';
import { SubSink } from 'subsink';
import { AuthService } from 'src/shared/services/auth-service/auth.service';
import { Router } from '@angular/router';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit, AfterViewInit{

  @ViewChild('search', {static: false}) search: ElementRef;

  constructor(
    private storageService: StorageService,
    private userService: UserService,
    private utilityService: UtilityService,
    private authService: AuthService,
    private router: Router,
    private socketService: SocketService,
    private injector: Injector,
    private hotKeysService: HotkeysService,
    ) { }

  // CURRENT USER DATA
  userData: any;

  // Current Workspace Data
  workspaceData: any;

  // Public Functions Object
  publicFunctions = new PublicFunctions(this.injector)

  // BASE URL OF THE APPLICATION
  baseUrl = environment.UTILITIES_BASE_URL;

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink();

  async ngOnInit() {

    // FETCH THE USER DETAILS FROM THE SERVER
    this.userData = await this.getCurrentUser();

    // Call the HTTP API to fetch the current workspace details
    this.workspaceData = await this.publicFunctions.getWorkspaceDetailsFromHTTP();

    // IF WE FIND THAT THE GET REQUEST HAS FAILED, THEN WE USE LOCAL DATA TO INTIALISE THE userData
    if (JSON.stringify(this.userData) === JSON.stringify({}))
      this.userData = this.publicFunctions.getUserDetailsFromStorage();

    // IF WE FIND THAT THE GET REQUEST HAS FAILED, THEN WE USE LOCAL DATA TO INTIALISE THE workspaceData
    if (JSON.stringify(this.workspaceData) === JSON.stringify({}))
      this.userData = this.publicFunctions.getWorkspaceDetailsFromStorage();

    // SENDING THE UPDATE THROUGH SERVICE TO UPDATE THE USER & WORKSPACE DETAILS AT ALL COMPONENTS
    if (this.userData && this.workspaceData) {
      this.publicFunctions.sendUpdatesToUserData(this.userData)
      this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData)
    }

    console.log('User Data', this.userData)
    console.log('Workspace Data', this.workspaceData)

  }

  ngAfterViewInit(){
    const searchRef = this.search;
    this.addHotKeys(searchRef);
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
      try {
        this.utilityService.asyncNotification('Please wait, while we log you out securely...', 
        new Promise((resolve, reject)=>{
          this.subSink.add(this.authService.signout()
          .subscribe((res) => {
            this.storageService.clear();
            this.socketService.disconnectSocket();
            this.router.navigate(['/home'])
            .then(()=> resolve(this.utilityService.resolveAsyncPromise('Succesfully Logged out!')))
            
          }, (err) => {
            console.log('Error occured while logging out!', err);
            reject(this.utilityService.rejectAsyncPromise('Error occured while logging you out!, please try again!'));
          }))
        }))
      } catch (err) {
        console.log('Error occured while logging out!', err);
        this.utilityService.errorNotification('Error occured while logging you out!');
      }
  }


  /**
   * Add Hot Keys
   */
  addHotKeys(searchRef: any){
    this.hotKeysService.add(new Hotkey(['shift+space'], (event: KeyboardEvent, combo: string): boolean =>{
      this.openModal(searchRef);
      return false;
    }))
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

  /**
   * This functions unsubscribes all the observables subscription to avoid memory leak
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe()
  }

}
