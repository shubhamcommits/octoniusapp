import { Component, OnInit, Input, Output,ChangeDetectionStrategy, Injector,EventEmitter } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment/moment';

@Component({
  selector: 'app-user-professional-information',
  templateUrl: './user-professional-information.component.html',
  styleUrls: ['./user-professional-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfessionalInformationComponent implements OnInit {

  constructor(
    private utilityService: UtilityService,
    private injector: Injector
  ) { }

  // User Data Object
  @Input('userData') userData: any = {};

  // Is current user variable
  @Input('currentUser') currentUser: boolean = false;

  @Output() updateData: EventEmitter<Object> = new EventEmitter<Object>();
  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  ngOnInit() {
    // console.log('User Data from User Professional Component', this.userData);
  }

  mycallback = (data?: any) => {
    this.userData.current_position = data?.current_position;
    this.userData.company_join_date = data?.company_join_date;
    this.userData.bio = data?.bio;
    this.updateData.emit(this.userData);

  }

  /**
 * This function opens the Swal modal to edit the user details
 * @param title 
 * @param imageUrl 
 */
  openModal(title: string, imageUrl: string) {

    // If company_join_dateis undefined or empty then assign current date to the same
    if (JSON.stringify(this.userData.company_join_date) === undefined || JSON.stringify(this.userData.company_join_date) === '')
      this.userData.company_join_date = moment().format('YYYY-MM-DD');
    else {

      // Else use the defined date and format it in YYYY-MM-DD
      this.userData.company_join_date = moment(this.userData.company_join_date).format('YYYY-MM-DD');
    }

    // Swal modal for update details
    return this.utilityService.getSwalModal({
      title: title,
      html:
        `<input id="current-position" type="text" placeholder="Your Current position" 
      value="${this.userData.current_position || ''}" class="swal2-input">` +

        `<input id="company-joining-date" type="date" placeholder="Your Company Joining Date" 
      value="${this.userData.company_join_date}" class="swal2-input">` +

        `<textarea id="biography" type="textarea" placeholder="Your Short Bio" class="swal2-textarea">${this.userData.bio || ''}</textarea>`,

      focusConfirm: false,
      preConfirm: () => {

        // Return Object to passed in the req.body
        return {
          current_position: document.getElementById('current-position')['value'],
          company_join_date: moment(document.getElementById('company-joining-date')['value']).format(),
          bio: document.getElementById('biography')['value']
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
