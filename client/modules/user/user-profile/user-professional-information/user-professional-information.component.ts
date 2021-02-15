import { Component, OnInit, Input, Output,ChangeDetectionStrategy, Injector,EventEmitter } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UserUpdateUserPersonalInformationDialogComponent } from 'src/app/common/shared/user-update-user-personal-information-dialog/user-update-user-personal-information-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-user-professional-information',
  templateUrl: './user-professional-information.component.html',
  styleUrls: ['./user-professional-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfessionalInformationComponent implements OnInit {

  constructor(
    private injector: Injector,
    private dialog: MatDialog
  ) { }

  // User Data Object
  @Input('userData') userData: any = {};

  // Is current user variable
  @Input('currentUser') currentUser: boolean = false;

  @Output() updateData: EventEmitter<Object> = new EventEmitter<Object>();
  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  ngOnInit() {
  }

  /**
   * This function is responsible for opening a dialog to update User professional Information
   */
  openUpdateModel() {
    const data = {
        userData: this.userData,
    };

    const dialogRef = this.dialog.open(UserUpdateUserPersonalInformationDialogComponent, {
      width: '25%',
      height: '80%',
      hasBackdrop: true,
      data: data
    });
    
    const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
      this.updateData.emit(data);
    });
    dialogRef.afterClosed().subscribe(result => {
      closeEventSubs.unsubscribe();
    });
  }

}
