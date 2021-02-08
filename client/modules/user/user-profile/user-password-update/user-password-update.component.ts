import { Component, OnInit ,Input,ChangeDetectionStrategy, Injector} from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
@Component({
  selector: 'app-user-password-update',
  templateUrl: './user-password-update.component.html',
  styleUrls: ['./user-password-update.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserPasswordUpdateComponent implements OnInit {

  

  constructor( 
    private utilityService: UtilityService,
    private injector: Injector
    ) { }
  
  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  // User Data Object
  @Input('userData') userData: any = {};

  // Is current user variable
  @Input('currentUser') currentUser: boolean = false;

  ngOnInit(): void {
  }

  mycallback = (data?: any) => {
    console.log("Data",data);
  }

  /**
 * This function opens the Swal modal to edit the user details
 * @param title 
 * @param imageUrl 
 */
  openModal(title: string, imageUrl: string) {
    // Swal modal for update details
    return this.utilityService.getSwalModal({
      title: title,
      html:
        `<input id="user-password" type="password" placeholder="Your Password"
      value="" class="swal2-input">` +

        `<input id="user-confirm-password" type="password" placeholder="Repeat Password" 
      value="" class="swal2-input">` ,
      focusConfirm: false,
      preConfirm: () => {
        const password = document.getElementById('user-password')['value'];
        const confirmPassword = document.getElementById('user-confirm-password')['value'];
        if(password === confirmPassword){
            // Return Object to passed in the req.body
            return {
              password: document.getElementById('user-password')['value']
            }
        } else {
          this.utilityService.asyncNotification('Please wait we are updating your information...',
          new Promise((resolve, reject) => {
                reject(this.utilityService.rejectAsyncPromise('Password did not match, please try again!'))
          }))
        }
        
      },
      confirmButtonText: 'Update Password!',
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
