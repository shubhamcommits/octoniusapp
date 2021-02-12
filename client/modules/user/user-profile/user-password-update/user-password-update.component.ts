import { Component, OnInit ,Input,ChangeDetectionStrategy, Injector} from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import { MatDialog } from '@angular/material/dialog';
import { UserUpdateProfileDialogComponent } from 'src/app/common/shared/user-update-profile-dialog/user-update-profile-dialog.component';

@Component({
  selector: 'app-user-password-update',
  templateUrl: './user-password-update.component.html',
  styleUrls: ['./user-password-update.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserPasswordUpdateComponent implements OnInit {

  constructor( 
    private utilityService: UtilityService,
    private injector: Injector,
    private dialog: MatDialog
    ) { }
  
  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  // User Data Object
  @Input('userData') userData: any = {};

  // Is current user variable
  @Input('currentUser') currentUser: boolean = false;

  ngOnInit(): void {
  }
  
  /**
   * This function is responsible for opening a dialog to update User password.
   */
  openUpdatePasswordModal(){
    const data = {
      userData: this.userData,
    };

    this.dialog.open(UserUpdateProfileDialogComponent, {
      width: '25%',
      height: '60%',
      hasBackdrop: true,
      data: data
    });
  }

}
