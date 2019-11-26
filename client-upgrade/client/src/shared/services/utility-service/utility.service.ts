import { Injectable } from '@angular/core';
import { SnotifyService, SnotifyToastConfig } from 'ng-snotify';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor(
    private snotifyService: SnotifyService,
    private modalService: NgbModal,
    private ngxUiLoaderService: NgxUiLoaderService
    ) { }

  // After Resolving Promise in case of async notification 
  snotifySucessConfig: SnotifyToastConfig = {
    timeout: 2000,
    type: 'success',
    closeOnClick: true,
    pauseOnHover: true,
    showProgressBar: true
  }

  // After Rejecting the Promise in case of async notification
  snotifyErrorConfig: SnotifyToastConfig = {
    timeout: 2000,
    type: 'error',
    closeOnClick: true,
    pauseOnHover: true,
    showProgressBar: true
  }
  
  // USERDATA FOR THE CURRENT USER
  private userData: any

  // WORKPLACEDATA FOR THE CURRENT USER
  private workplaceData: any

  /**
   * Both of the variables listed down below are used to share the data through this common service among different components in the app
   * @constant userDataSource
   * @constant currentUserData
   */
  private userDataSource = new BehaviorSubject<any>({});
  currentUserData = this.userDataSource.asObservable();

  /**
   * Both of the variables listed down below are used to share the data through this common service among different components in the app
   * @constant workplaceDataSource
   * @constant currentWorkplaceData
   */
  private workplaceDataSource = new BehaviorSubject<any>({});
  currentWorkplaceData = this.workplaceDataSource.asObservable();

  /**
   * This function checks whether the input string is a vaild email or not
   * @param email 
   */
  validateEmail(email: String) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  /**
   * This function generates a custom snotify notification for success event
   * @param text
   * @param title - optional 
   * @param config - optional
   */
  successNotification(text: string, title?: string, config?: SnotifyToastConfig){
    return this.snotifyService.success(text, title, config);
  }

  /**
   * This function generates a custom snotify notification for warning event
   * @param text 
   * @param title - optional
   * @param config - optional
   */
  warningNotification(text: string, title?: string, config?: SnotifyToastConfig){
    return this.snotifyService.warning(text, title, config);
  }

  /**
   * This function generates a custom snotify notification for error event
   * @param text 
   * @param title - optional
   * @param config - optional
   */
  errorNotification(text: string, title?: string, config?: SnotifyToastConfig){
    return this.snotifyService.error(text, title, config);
  }

  /**
   * This function generates a custom snotify notification for asynchronous event
   * @param text 
   * @param promise - which resolves() or rejects() on the basis of response
   * @param config - optional
   */
  asyncNotification(text: string, promise: Promise<any>, config?: SnotifyToastConfig){
    return this.snotifyService.async(text, promise, config);
  }

  /**
   * This function will be called when @function asyncNotification resolves the promise
   * @param text 
   */
  resolveAsyncPromise(text: string){
    return {
      body: text,
      config: this.snotifySucessConfig
    }
  }

  /**
   * This function will be called when @function asyncNotification rejects the promise
   * @param text 
   */
  rejectAsyncPromise(text: string){
    return {
      body: text,
      config: this.snotifyErrorConfig
    }
  }

  /**
   * This function clears all the snotify toasts present in the DOM
   */
  clearAllNotifications(){
    return this.snotifyService.clear();
  }

  /**
   * This function opens up the bootstrap modal from the library
   * @param content - content to be displayed in the modal
   * @param config - config of the modal which you want to pass
   */
  openModal(content, config?){
    return this.modalService.open(content, config);
  }

  /**
   * This function removes/dismiss all the modals that are opened
   */
  async closeAllModals(){
    return this.modalService.dismissAll();
  }

  /**
   * This function removes the duplicates from arrays of Objects based on the @name property name
   * @param array - pass the array from which you want to remove duplicates
   * @param property - pass the property on the basis of which you want to define distinction among arrays of objects
   */
  async removeDuplicates(array: Array<any>, property: string) {
    return array.filter((obj, pos, arr) => {
      return arr.map(mapObj => mapObj[property]).indexOf(obj[property]) === pos;
    });
  }

  /**
   * This functions is responsible for maintaining track the index while iterating through *ngFor 
   * @param index - index of the element
   * @param element - entire element which needs to be tracked
   */
  trackByIndex(index, element){
    return element._id;
  }

  /**
   * Get the user data which can be shared across the application using this service function
   */
  getUserData(){
    return this.userData;
  }

  /**
   * Sets the user data which can be shared across the application using this service function
   * @param userData 
   */  
  setUserData(userData: any){
    return this.userData = userData 
  }

  /**
   * Used to emit the next value of observable so that where this is subscribed, will get the updated value
   * @param userData 
   */
  public updateUserData(userData: any){
    this.userDataSource.next(userData);
  }

  /**
   * Used to emit the next value of observable so that where this is subscribed, will get the updated value
   * @param workplaceData
   */
  public updateWorkplaceData(workplaceData: any){
    this.workplaceDataSource.next(workplaceData);
  }

  /**
   * This function starts the foreground loader of master loader
   * @param taskId
   */
  public startForegroundLoader(taskId?: string){
    console.log('start')
    return this.ngxUiLoaderService.start(taskId);
  }

  /**
   * This function stops the foreground loader of master loader
   * @param taskId
   */
  public stopForegroundLoader(taskId?: string){
    return this.ngxUiLoaderService.stop(taskId);
  }

  /**
   * This function starts the background loader of master loader
   * @param taskId - optional
   */
  public startBackgroundLoader(taskId?: string){
    this.ngxUiLoaderService.startBackground(taskId);
  }

  /**
   * This function stops the background loader of master loader
   * @param taskId 
   */
  public stopBackgroundLoader(taskId?: string){
    this.ngxUiLoaderService.stopBackground(taskId);
  }
  
  /**
   * This function stops all the foreground and background loader of master loader
   */
  public stopAllLoader(){
    this.ngxUiLoaderService.stopAll();
  }

}
