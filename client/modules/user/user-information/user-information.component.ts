import { Component, OnInit, Input, ChangeDetectionStrategy, Injector } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-user-information',
  templateUrl: './user-information.component.html',
  styleUrls: ['./user-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserInformationComponent implements OnInit {

  constructor(
    private utilityService: UtilityService,
    private injector: Injector) { }

  // User Data Object
  @Input('userData') userData: any = {};

  // Is current user variable
  @Input('currentUser') currentUser: boolean = false;

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  ngOnInit() {
    // console.log('User Data from User Information Component', this.userData);
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

}
