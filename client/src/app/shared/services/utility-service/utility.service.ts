import { Injectable } from '@angular/core';
import { SnotifyService, SnotifyToastConfig } from 'ng-snotify';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor(
    private snotifyService: SnotifyService,
    private modalService: NgbModal
    ) { }

  snotifySucessConfig: SnotifyToastConfig = {
    timeout: 2000,
    type: 'success',
    closeOnClick: true,
    pauseOnHover: true,
    showProgressBar: true
  }

  snotifyErrorConfig: SnotifyToastConfig = {
    timeout: 2000,
    type: 'error',
    closeOnClick: true,
    pauseOnHover: true,
    showProgressBar: true
  }
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
   */
  successNotification(text: string, title?: string){
    return this.snotifyService.success(text, title);
  }

  /**
   * This function generates a custom snotify notification for warning event
   * @param text 
   * @param title - optional
   */
  warningNotification(text: string, title?: string){
    return this.snotifyService.warning(text, title);
  }

  /**
   * This function generates a custom snotify notification for error event
   * @param text 
   * @param title - optional
   */
  errorNotification(text: string, title?: string){
    return this.snotifyService.error(text, title);
  }

  /**
   * This function generates a custom snotify notification for asynchronous event
   * @param text 
   * @param promise - which resolves() or rejects() on the basis of response
   */
  asyncNotification(text: string, promise){
    return this.snotifyService.async(text, promise);
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

}
