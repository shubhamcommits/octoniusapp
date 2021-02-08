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
  
  openUpdatePasswordModal(){
    this.utilityService.openUpdateUserProfileModal(this.userData);
  }

}
