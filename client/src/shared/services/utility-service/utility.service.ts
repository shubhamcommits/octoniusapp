import { Injectable, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { GroupCreatePostDialogComponent } from 'src/app/common/shared/activity-feed/group-postbox/group-create-post-dialog-component/group-create-post-dialog-component.component';
import { MemberDialogComponent } from 'src/app/common/shared/member-dialog/member-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor(
    private modalService: NgbModal,
    private ngxUiLoaderService: NgxUiLoaderService,
    public dialog: MatDialog
    ) { }

   groupDeleteEvent: EventEmitter<any> = new EventEmitter();


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
   * This function generates a custom notification for success event
   * @param text
   * @param title - optional
   */
  successNotification(text: string, title?: string) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    })

    return Toast.fire({
      icon: 'success',
      title: title,
      text: text
    })
  }

  /**
   * This function generates a custom notification for simple event
   * @param text
   * @param title - optional
   */
  simpleNotification(text: string, title?: string){
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    })

    return Toast.fire({
      title: title,
      text: text
    })
  }


  /**
   * This function generates a custom notification for warning event
   * @param text
   * @param title - optional
   */
  warningNotification(text: string, title?: string){
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    })

    return Toast.fire({
      icon: 'warning',
      title: title,
      text: text
    })
  }

  /**
   * This function generates a custom notification for error event
   * @param text
   * @param title - optional
   */
  errorNotification(text: string, title?: string){
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    })

    return Toast.fire({
      icon: 'error',
      title: title,
      text: text
    })
  }

  /**
   * This function generates a custom notification for info event
   * @param text
   * @param title - optional
   */
  infoNotification(text: string, title?: string){
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    })

    return Toast.fire({
      icon: 'info',
      title: title,
      text: text
    })
  }


  /**
   * This function generates a custom  notification for asynchronous event
   * @param text
   * @param promise - which resolves() or rejects() on the basis of response
   */
  asyncNotification(text: string, promise: Promise<any>){
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timerProgressBar: true
    })
    Toast.fire({
      icon: 'info',
      text: text
    })

    promise
      .then(res => {
          Toast.close();
          this.successNotification(res['body']);
        })
      .catch(err => {
          Toast.close();
          this.errorNotification(err['body']);
        }
      );
  }

  openTryOutNotification(timeRemaining: number) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      showCloseButton: true
    })

    return Toast.fire({
      icon: 'warning',
      title: 'Subscription pending',
      text: timeRemaining + ' days trial left.'
    })
  }

  /**
   * This function will be called when @function asyncNotification resolves the promise
   * @param text
   */
  resolveAsyncPromise(text: string){
    return {
      body: text
    }
  }

  /**
   * This function will be called when @function asyncNotification rejects the promise
   * @param text
   */
  rejectAsyncPromise(text: string){
    return {
      body: text
    }
  }

  /**
   * This function clears all the toasts present in the DOM
   */
  clearAllNotifications(){
    return Swal.close();
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
   * This function is responsible for opening a fullscreen dialog to edit a task
   */
  openCreatePostFullscreenModal(postData: any, userData: any, groupId: string, columns?: any,tasks?:any) {

    const data = (columns) ?
      {
        postData: postData,
        userData: userData,
        groupId: groupId,
        columns: columns,
        Tasks:tasks
      }
    :
      {
        postData: postData,
        userData: userData,
        groupId: groupId
      }

    return this.dialog.open(GroupCreatePostDialogComponent, {
      width: '100%',
      height: '100%',
      disableClose: true,
      panelClass: 'groupCreatePostDialog',
      data: data
    });
  }

  /*
  openCreateBARModal(groupData: any, groupId: string) {

    const data =
      {
        groupData: groupData,
        groupId: groupId
      }

    return this.dialog.open(GroupBarComponent, {
      width: '100%',
      height: '100%',
      disableClose: true,
      panelClass: 'groupBarComponent',
      data: data
    });
  }
  */

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
   * This function starts the foreground loader of master loader
   * @param taskId
   */
  public startForegroundLoader(taskId?: string){
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

  /**
   * This function is resposible for showing a confirm dialog, with a function attached to the "Confirm"-button
   * and by passing a parameter, we can execute something else for "Cancel
   */
  public getConfirmDialogAlert(title?: string, text?: string, confirmButtonText?: string){
    return Swal.fire({
      title: title || 'Are you sure?',
      text: text || "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmButtonText || 'Yes, I am sure!'
    })
  }

  /**
   * This function return the SWAL modal
   * @param title
   * @param text
   * @param icon
   */
  public getSwalFire(title?: string, text?: string, icon?: SweetAlertIcon){
    return Swal.fire(title, text, icon);
  }

  public getSwalModal(swalOptions: any){
    return Swal.fire(swalOptions);
  }

  /**
   * This function is responsible for showing the swal toast
   * @param icon - 'success', 'error', 'warning', 'info', 'question'
   */
  public getSwalToast(icon: SweetAlertIcon, title: string, text: string){
    let Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      onOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })

    return Toast.fire({
      icon: icon,
      title: title,
      text: text
    })
  }

  /**
   * This function is responsible for opening a fullscreen dialog to see the member profile
   */
  openFullscreenModal(userId: string): void {
    const data =
      {
        userId: userId,
        // userData: userData,
        // groupId: groupId
      };

    this.dialog.open(MemberDialogComponent, {
      width: '50%',
      //height: '75%',
      hasBackdrop: true,
      data: data
    });
  }

  handleDeleteGroupFavorite() {
    return this.groupDeleteEvent;
  }
}
