import { Injectable, EventEmitter, Injector } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { GroupCreatePostDialogComponent } from 'src/app/common/shared/posts/group-create-post-dialog/group-create-post-dialog.component';
import { MemberDialogComponent } from 'src/app/common/shared/member-dialog/member-dialog.component';
import { PostService } from '../post-service/post.service';
import { ColumnService } from '../column-service/column.service';
import { PermissionDialogComponent } from 'modules/groups/group/permission-dialog/permission-dialog.component';

import * as XLSX from 'xlsx';
import * as fileSaver from 'file-saver';
import moment from 'moment';
import { FilesService } from '../files-service/files.service';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor(
    private modalService: NgbModal,
    public dialog: MatDialog,
    private injector: Injector
    ) { }

   groupDeleteEvent: EventEmitter<any> = new EventEmitter();
   groupUpdateEvent: EventEmitter<any> = new EventEmitter();
   activeStateTopNavBarEvent: EventEmitter<any> = new EventEmitter();

   handleDeleteGroupFavorite() {
     return this.groupDeleteEvent;
   }

   handleUpdateGroupData() {
     return this.groupUpdateEvent;
   }

   handleActiveStateTopNavBar(){
     return this.activeStateTopNavBarEvent;
   }


  /**
  * Both of the variables listed down below are used to share the data through this common service among different components in the app
  * @constant accountDataSource
  * @constant currentAccountData
  */
  private accountDataSource = new BehaviorSubject<any>({});
  currentAccountData = this.accountDataSource.asObservable();


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
   * Both of the variables listed down below are used to share the data through this common service among different components in the app
   * @constant loungeDataSource
   * @constant loungeData
   */
  private loungeDataSource = new BehaviorSubject<any>({});
  loungeData = this.loungeDataSource.asObservable();

  /**
   * Both of the variables listed down below are used to share the data through this common service among different components in the app
   * @constant storyDataSource
   * @constant storyData
   */
  private storyDataSource = new BehaviorSubject<any>({});
  storyData = this.storyDataSource.asObservable();

  // isLoadingSpinner behaviou subject maintains the state for loading spinner
  public isLoadingSpinnerSource = new BehaviorSubject(false);
  isLoadingSpinner = this.isLoadingSpinnerSource.asObservable();

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
      position: 'bottom',
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
      position: 'bottom',
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
      position: 'bottom',
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
  errorNotification(text: string, title?: string) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'bottom',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });

    this.updateIsLoadingSpinnerSource(false);

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
  infoNotification(text: string, title?: string) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'bottom',
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
   * This function generates a custom notification for warning event
   * @param text
   * @param title - optional
   */
  workplaceBlockedNotification(text: string) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'bottom',
      showCloseButton: true,
      showConfirmButton: false
    })

    return Toast.fire({
      icon: 'warning',
      text: text
    });
  }


  /**
   * This function generates a custom  notification for asynchronous event
   * @param text
   * @param promise - which resolves() or rejects() on the basis of response
   */
  asyncNotification(text: string, promise: Promise<any>) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'bottom',
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
      title: $localize`:@@utilityService.subscriptionPending:Subscription pending`,
      text: $localize`:@@utilityService.daysTrialLeft:${timeRemaining} days trial left.`
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
  openCreatePostFullscreenModal(postId: string, groupId: string, isIdeaModuleAvailable: boolean, canOpen: boolean, columns?: any) {
    let dialogOpen;

    // !groupData?.enabled_rights || postData?.canView || postData?.canEdit
    if (canOpen) {
      const data = (columns) ?
        {
          postId: postId,
          groupId: groupId,
          columns: columns,
          isIdeaModuleAvailable: isIdeaModuleAvailable
        }
      :
        {
          postId: postId,
          groupId: groupId,
          isIdeaModuleAvailable: isIdeaModuleAvailable
        }

        dialogOpen = this.dialog.open(GroupCreatePostDialogComponent, {
        width: '100%',
        height: '100%',
        disableClose: true,
        panelClass: 'groupCreatePostDialog',
        data: data
      });
    } else {
      this.warningNotification($localize`:@@utilityService.noRightToOpenPost:You does not have rights to access the post. Contact with the Manager!`);
    }
    return dialogOpen;
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
   * Used to emit the next value of observable so that where this is subscribed, will get the updated value
   * @param accountData
   */
  public updateAccountData(accountData: any){
    this.accountDataSource.next(accountData);
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
   * @param loungeData
   */
  public updateLoungeData(loungeData: any){
    this.loungeDataSource.next(loungeData);
  }

  /**
   * Used to emit the next value of observable so that where this is subscribed, will get the updated value
   * @param storyData
   */
   public updateStoryData(storyData: any){
    this.storyDataSource.next(storyData);
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
  public getConfirmDialogAlert(title?: string, text?: string, confirmButtonText?: string){
    return Swal.fire({
      title: title || $localize`:@@utilityService.areYouSure:Are you sure?`,
      text: text || $localize`:@@utilityService.youWontRevert:You won't be able to revert this!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmButtonText || $localize`:@@utilityService.yesSure:Yes, I am sure!`
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
      position: 'bottom',
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

  openPermissionModal(item: any, groupData: any, userData: any, type: string) {
    return this.dialog.open(PermissionDialogComponent, {
      width: '60%',
      height: '85%',
      disableClose: true,
      hasBackdrop: true,
      data: {
        item: item,
        groupData: groupData,
        userData: userData,
        type: type
      }
    });
  }

  /**
   * This method is used to identify if the user can edit or view an elemnent
   * @param item This element can be a file or a folder
   * @param groupData
   * @param userData
   * @param action edit or view or hide
   * @returns
   */
  canUserDoFileAction(item: any, groupData: any, userData: any, action: string) {
    const isGroupManager = (groupData && groupData._admins) ? (groupData?._admins.findIndex((admin: any) => (admin?._id || admin) == userData?._id) >= 0) : false;
    let createdBy = (item?._posted_by ) ? (item?._posted_by?._id == userData?._id) : false;
    createdBy = (!createdBy && item?._created_by) ? (item?._created_by?._id == userData?._id) : createdBy;

    if (action == 'edit' && item?.approval_flow_launched) {
      return false;
    }

    if (userData?.role == 'admin' || userData?.role == 'owner' || createdBy || isGroupManager) {
      return true;
    } else {
      if (action == 'delete') {
        return false;
      }

      let canDoRagAction = false;
      if (groupData?.enabled_rights) {
        if (item?.permissions && item?.permissions?.length > 0) {
          item.permissions.forEach(permission => {
            const groupRagIndex = (groupData?.rags) ? groupData?.rags?.findIndex(groupRag => permission.rags.includes(groupRag.rag_tag)) : -1;
            let groupRag;
            if (groupRagIndex >= 0) {
              groupRag = groupData?.rags[groupRagIndex];
            }

            const userRagIndex = (groupRag && groupRag._members) ? groupRag._members.findIndex(ragMember => (ragMember?._id || ragMember) == userData?._id) : -1;
            const userPermissionIndex = (permission && permission._members) ? permission._members.findIndex(permissionMember => (permissionMember?._id || permissionMember) == userData?._id) : -1;
            if ((userRagIndex >= 0 || userPermissionIndex >= 0) && permission.right == action) {
              canDoRagAction = true;
            }
          });
        } else if (item?._folder || item?._parent) {
          canDoRagAction = this.checkParentFolderRagAction(item?._folder || item?._parent, groupData, userData, action);
        } else {
          canDoRagAction = true;
        }
      }

      return !groupData?.enabled_rights || canDoRagAction;
    }
  }

  checkParentFolderRagAction(item: any, groupData: any, userData: any, action: string) {
    let canDoRagAction = false;
    if (item?.permissions && item?.permissions?.length > 0) {

      item?.permissions.forEach(permission => {
        const groupRagIndex = (groupData?.rags) ? groupData?.rags?.findIndex(groupRag => permission.rags.includes(groupRag.rag_tag)) : -1;
        let groupRag;
        if (groupRagIndex >= 0) {
          groupRag = groupData?.rags[groupRagIndex];
        }

        const userRagIndex = (groupRag && groupRag._members) ? groupRag._members.findIndex(ragMember => (ragMember?._id || ragMember) == userData?._id) : -1;
        const userPermissionIndex = (permission && permission._members) ? permission._members.findIndex(permissionMember => (permissionMember?._id || permissionMember) == userData?._id) : -1;
        if ((userRagIndex >= 0 || userPermissionIndex >= 0) && permission.right == action) {
          canDoRagAction = true;
        }
      });
    } else if (item?._parent) {
      canDoRagAction = this.checkParentFolderRagAction(item?._parent, groupData, userData, action);
    } else {
      canDoRagAction = true;
    }

    return canDoRagAction;
  }

  /**
   * This method is used to identify if the user can edit or view an elemnent
   * @param item This element can be a post or a section
   * @param groupData
   * @param userData
   * @param action edit or view or hide
   * @returns
   */
  async canUserDoTaskAction(item: any, groupData: any, userData: any, action: string) {

    const isGroupManager = (groupData && groupData._admins) ? (groupData?._admins.findIndex((admin: any) => (admin?._id || admin) == userData?._id) >= 0) : false;
    let createdBy = (item?._posted_by ) ? ((item?._posted_by?._id || item?._posted_by) == userData?._id) : false;
    createdBy = (!createdBy && item?._created_by) ? ((item?._created_by?._id || item?._created_by) == userData?._id) : createdBy;

    if (action == 'edit' && item?.approval_flow_launched) {
      return false;
    }

    if (userData?.role == 'admin' || userData?.role == 'owner' || createdBy || isGroupManager) {
      return true;
    } else {
      if (action == 'delete') {
        return false;
      }

      let canDoRagAction = false;
      if (groupData?.enabled_rights) {
        if (item?.permissions && item?.permissions?.length > 0) {
          item.permissions.forEach(permission => {
            const groupRagIndex = (groupData?.rags) ? groupData?.rags?.findIndex(groupRag => permission.rags.includes(groupRag.rag_tag)) : -1;
            let groupRag;
            if (groupRagIndex >= 0) {
              groupRag = groupData?.rags[groupRagIndex];
            }

            const userRagIndex = (groupRag && groupRag._members) ? groupRag._members.findIndex(ragMember => (ragMember?._id || ragMember) == userData?._id) : -1;
            const userPermissionIndex = (permission && permission._members) ? permission._members.findIndex(permissionMember => (permissionMember?._id || permissionMember) == userData?._id) : -1;
            if ((userRagIndex >= 0 || userPermissionIndex >= 0) && permission.right == action) {
              canDoRagAction = true;
            }
          });
        } else if (item?.task?._column) {
          // Post Service Instance
          let columnService = this.injector.get(ColumnService);
          await columnService.getSection(item?.task?._column?._id || item?.task?._column).then(async res => {
            canDoRagAction = await this.canUserDoTaskAction(res['section'], groupData, userData, action);
          });
        } else if (item?.task?._parent_task) {
          // Post Service Instance
          let postService = this.injector.get(PostService);
          await postService.get(item?.task?._parent_task._id || item?.task?._parent_task).then(async res => {
            canDoRagAction = await this.canUserDoTaskAction(res['post'], groupData, userData, action);
          });
        } else {
          canDoRagAction = true;
        }
      }

      return !groupData?.enabled_rights || canDoRagAction;
    }
  }

  /**
   * Exports an array into an excel file
   * @param arrayToExport
   * @param fileName
   */
  saveAsExcelFile(arrayToExport: any, fileName: string): void {
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(arrayToExport);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], {type: EXCEL_TYPE});
    fileSaver.saveAs(data, fileName + '_export_' + moment(moment().utc(), "YYYY-MM-DD") + EXCEL_EXTENSION);
  }

  /**
   * Used to emit the next value of observable so that where this is subscribed, will get the updated value
   * @param status
   */
  public updateIsLoadingSpinnerSource(status: boolean){
    this.isLoadingSpinnerSource.next(status);
  }

  async getFileLastVersion(file: any) {
    let fileVersions;
    let filesService = this.injector.get(FilesService);
    await filesService.getFileVersions(file?._id).then(async res => {
      fileVersions = res['fileVersions'];
      fileVersions?.sort((f1, f2) => {
        if (f1.created_date && f2.created_date) {
          if (moment.utc(f1.created_date).isBefore(f2.created_date)) {
            return 1;
          } else {
            return -1;
          }
        } else {
          if (f1.created_date && !f2.created_date) {
            return 1;
          } else if (!f1.created_date && f2.created_date) {
            return -1;
          }
        }
      });
    });
    return (fileVersions && fileVersions.length > 0) ? fileVersions[0] : file;
  }

  objectExists(objectData: Object) {
    return objectData && JSON.stringify(objectData) != JSON.stringify({});
  }
}
