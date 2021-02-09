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
  }

  openUpdateModel(){
    
    const dialogRef = this.utilityService.openUpdateUserPersonalModal(this.userData);

    const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
      this.updateData.emit(data);
    });
    dialogRef.afterClosed().subscribe(result => {
      closeEventSubs.unsubscribe();
    });
  }

}
