import { Component, OnInit, Input, ChangeDetectionStrategy, Injector } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import { UserService } from "src/shared/services/user-service/user.service";
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { AuthService } from 'src/shared/services/auth-service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-information',
  templateUrl: './user-information.component.html',
  styleUrls: ['./user-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserInformationComponent implements OnInit {

  constructor(
    private utilityService: UtilityService,
    private storageService: StorageService,
    private authService: AuthService,
    private userService:UserService,
    private injector: Injector,
    private router: Router
    ) { }

  // User Data Object
  @Input('userData') userData: any = {};

  // Is current user variable
  @Input('currentUser') currentUser: boolean = false;

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);


  ngOnInit() {
    // console.log('User Data from User Information Component', this.userData);
  }

  mycallback = (data?: any) => {
    document.getElementById("userData_company_name").innerText = " " + data?.company_name;
    document.getElementById("userData_mobile_number").innerText = " " + data?.mobile_number;
    document.getElementById("userData_phone_number").innerText = " " + data?.phone_number;
    this.userData.company_name = data?.company_name;
    this.userData.mobile_number = data?.mobile_number;
    this.userData.phone_number = data?.phone_number;
  }

  /**
 * This function opens the Swal modal to edit the user details
 * @param title 
 *  @param imageUrl 
 */
  openModal(title: string, imageUrl: string) {

    // Swal modal for update details
    return this.utilityService.getSwalModal({
      title: title,
      html:
        `<input id="phone-number" type="text" placeholder="Your Phone Number" 
      value="${this.userData.phone_number || ''}" class="swal2-input">` +

        `<input id="mobile-number" type="text" placeholder="Your Mobile Number" 
      value="${this.userData.mobile_number || ''}" class="swal2-input">` +

        `<input id="company-name" type="text" placeholder="Your Company Name" 
      value="${this.userData.company_name || ''}" class="swal2-input">`,

      focusConfirm: false,
      preConfirm: () => {

        // Return Object to passed in the req.body
        return {
          phone_number: document.getElementById('phone-number')['value'],
          mobile_number: document.getElementById('mobile-number')['value'],
          company_name: document.getElementById('company-name')['value'],
        }
      },
      confirmButtonText: 'Update Information!',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      cancelButtonColor: '#d33',
      scrollbarPadding: true,
      imageUrl: imageUrl,
      imageAlt: title,
      customClass: {
        content: 'content-class',
        container: 'container-class',
      }
    })
  }

  async removeUser(userID: string){
    
    // Ask User to remove this user from the group or not
    this.utilityService.getConfirmDialogAlert('Are you sure?',
    'This action will delete your account.')
      .then((result) => {
        if (result.value) {
          // Delete the User
          this.utilityService.asyncNotification('Please wait while we are Deleting the user ...',
            new Promise((resolve, reject) => {
              this.userService.removeUser(userID)
              .then(res => {
                  if(res){
                    this.authService.signout().toPromise()
                    .then((res) => {
                      this.storageService.clear();
                      this.publicFunctions.sendUpdatesToGroupData({})
                      this.publicFunctions.sendUpdatesToRouterState({})
                      this.publicFunctions.sendUpdatesToUserData({})
                      this.publicFunctions.sendUpdatesToWorkspaceData({})
                      this.router.navigate(['/home'])
                      resolve(this.utilityService.resolveAsyncPromise('Successfully Logged out!'));
                    }).catch((err) => {
                      console.log('Error occurred while logging out!', err);
                      reject(this.utilityService.rejectAsyncPromise('Error occurred while logging you out!, please try again!'));
                    });
                  }
                  // Resolve with success
                  resolve(this.utilityService.resolveAsyncPromise('User Deleted!'))
                })
                .catch(() => reject(this.utilityService.rejectAsyncPromise('Unable to remove the user from the workplace, please try again!')))
            }))
        }
      })

    console.log("User id to delete user",userID);
  }

}
