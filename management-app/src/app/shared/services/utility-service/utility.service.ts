import { Injectable } from '@angular/core';
import { SnotifyService, SnotifyToastConfig } from 'ng-snotify';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor(
    private modalService: NgbModal,
    private snotifyService: SnotifyService
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
   * Both of the variables listed down below are used to share the data through this common service among different components in the app
   * @constant otherUserDataSource
   * @constant otherUserData
   */
  private otherUserDataSource = new BehaviorSubject<any>({});
  otherUserData = this.otherUserDataSource.asObservable();

  /**
   * Both of the variables listed down below are used to share the data through this common service among different components in the app
   * @constant groupDataSource
   * @constant groupData
   */
  private groupDataSource = new BehaviorSubject<any>({});
  currentGroupData = this.groupDataSource.asObservable();

  /**
   * Both of the variables listed down below are used to share the data through this common service among different components in the app
   * @constant routerStateDataSource
   * @constant routerState
   */
  private routerStateDataSource = new BehaviorSubject<any>({});
  routerStateData = this.routerStateDataSource.asObservable();

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
   * This function generates a custom snotify notification for simple event
   * @param text
   * @param title - optional
   * @param config - optional
   */
  simpleNotification(text: string, title?: string, config?: SnotifyToastConfig){
    return this.snotifyService.simple(text, title, config);
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
   * This function generates a custom snotify notification for info event
   * @param text
   * @param title - optional
   * @param config - optional
   */
  infoNotification(text: string, title?: string, config?: SnotifyToastConfig){
    return this.snotifyService.info(text, title, config);
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
   * Used to emit the next value of observable so that where this is subscribed, will get the updated value
   * @param userData
   */
  public updateUserData(userData: any){
    this.userDataSource.next(userData);
  }

  /**
   * Used to emit the next value of observable so that where this is subscribed, will get the updated value
   * @param userData
   */
  public updateOtherUserData(userData: any){
    this.otherUserDataSource.next(userData);
  }

  /**
   * Used to emit the next value of observable so that where this is subscribed, will get the updated value
   * @param workplaceData
   */
  public updateWorkplaceData(workplaceData: any){
    this.workplaceDataSource.next(workplaceData);
  }

  /**
   * Used to emit the next value of observable so that where this is subscribed, will get the updated value
   * @param groupData
   */
  public updateGroupData(groupData: any){
    this.groupDataSource.next(groupData);
  }

  /**
   * Used to emit the next value of observable so that where this is subscribed, will get the updated value
   * @param routerStateData
   */
  public updateRouterStateData(routerStateData: any){
    this.routerStateDataSource.next(routerStateData);
  }

  /**
   * This function is resposible for showing a confirm dialog, with a function attached to the "Confirm"-button
   * and by passing a parameter, we can execute something else for "Cancel
   */
  public getConfirmDialogAlert(title?: string, text?: string){
    return Swal.fire({
      title: title || 'Are you sure?',
      text: text || "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, I am sure!'
    })
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
}
