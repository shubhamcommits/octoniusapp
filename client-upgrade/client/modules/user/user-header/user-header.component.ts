import { Component, OnInit, Injector } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/shared/services/user-service/user.service';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import * as moment from 'moment';

@Component({
  selector: 'app-user-header',
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.scss']
})
export class UserHeaderComponent implements OnInit {

  constructor(
    private utilityService: UtilityService,
    private router: ActivatedRoute,
    private injector: Injector
  ) { }

  // CURRENT USER DATA
  userData: any;

  // BASE URL OF THE APPLICATION
  BASE_URL = environment.BASE_URL;

  // Is current user variable
  isCurrentUser: any = false;

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink();

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  // Defining User Service
  private userService = this.injector.get(UserService);

  async ngOnInit() {

    // Get current loggedIn user data
    this.userData = await this.publicFunctions.getCurrentUser();

    // Check if the profile view is private or is it for the other user
    this.isCurrentUser = this.checkIsCurrentUser(this.userData);

  }

  /**
   * This functions unsubscribes all the observables subscription to avoid memory leak
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  /**
   * This function checks if this is currently loggedIn user
   * @param userData 
   */
  checkIsCurrentUser(userData: any) {
    // If this is current loggedIn user
    if (this.router.snapshot.queryParams['userId'] == userData._id)
      return true
  }

  /**
 * This function opens the Swal modal to edit the user details
 * @param title 
 */
  openModal(title: string) {

    // If company_join_dateis undefined or empty then assign current date to the same
    if (JSON.stringify(this.userData.company_join_date) === undefined || JSON.stringify(this.userData.company_join_date) === '')
      this.userData.company_join_date = moment(new Date(Date.now())).format('YYYY-MM-DD');
    else {

      // Else use the defined date and format it in YYYY-MM-DD
      this.userData.company_join_date = moment(this.userData.company_join_date).format('YYYY-MM-DD');
    }

    // Swal modal for update details
    return this.utilityService.getSwalModal({
      title: title,
      html:
        `<label for="phone-number"><b>Phone Number:</b></label
        <input id="phone-number" type="tel" placeholder="Your Phone Number" 
        value="${this.userData.phone_number}" class="swal2-input">` +

        `<input id="mobile-number" type="tel" placeholder="Your Mobile Number" 
        value="${this.userData.mobile_number}" class="swal2-input">` +

        `<input id="company-name" type="text" placeholder="Your Company Name" 
        value="${this.userData.company_name}" class="swal2-input">` +

        `<input id="current-position" type="text" placeholder="Your Current position" 
        value="${this.userData.current_position}" class="swal2-input">` +

        `<input id="company-joining-date" type="date" placeholder="Your Company Joining Date" 
        value="${this.userData.company_join_date}" class="swal2-input">` +

        `<textarea id="biography" type="textarea" placeholder="Your Short Bio" class="swal2-textarea">${this.userData.bio}</textarea>`,

      focusConfirm: false,
      preConfirm: () => {

        // Return Object to passed in the req.body
        return {
          phone_number: document.getElementById('phone-number')['value'],
          mobile_number: document.getElementById('mobile-number')['value'],
          company_name: document.getElementById('company-name')['value'],
          current_position: document.getElementById('current-position')['value'],
          company_join_date: moment(document.getElementById('company-joining-date')['value']).format(),
          bio: document.getElementById('biography')['value']
        }
      },
      confirmButtonText: title,
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      cancelButtonColor: '#d33',
      scrollbarPadding: true,
      grow: 'fullscreen',
      customClass: {
        content: 'content-class',
        container: 'container-class',
      }
    })
  }

  /**
   * This function is responsible for editing the user details
   */
  async editUserDetails() {
    const { value: value } = await this.openModal('Update Details');
    if (value) {
      this.utilityService.asyncNotification('Please wait we are updating your information...',
        new Promise((resolve, reject) => {
          this.userDetailsServiceFunction(this.userService, value)
            .then((user) => {
              
              // Send the updates to the userData in the app for the updated data
              this.publicFunctions.sendUpdatesToUserData(user);

              // Resolve with success
              resolve(this.utilityService.resolveAsyncPromise('Details updated sucessfully!'))
            })
            .catch(() =>
              reject(this.utilityService.rejectAsyncPromise('An unexpected occured while updating the details, please try again!')))
        }))
    } else if (JSON.stringify(value) == '') {
      this.utilityService.warningNotification('Kindly fill up all the details properly!');
    }
  }

  /**
   * This is the service function which calls the edit user API
   * @param userService 
   * @param userData 
   */
  async userDetailsServiceFunction(userService: UserService, userData: Object) {
    return new Promise((resolve, reject) => {
      userService.updateUser(userData)
        .then((res) => resolve(res['user']))
        .catch(() => reject({}))
    })
  }

}
