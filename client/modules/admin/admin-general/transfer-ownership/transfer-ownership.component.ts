import { Component, OnInit,Input } from '@angular/core';
import { UserService } from "src/shared/services/user-service/user.service";
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-transfer-ownership',
  templateUrl: './transfer-ownership.component.html',
  styleUrls: ['./transfer-ownership.component.scss']
})
export class TransferOwnershipComponent implements OnInit {

  @Input('workspaceData') workspaceData: any;
  @Input('userData') userData: any;
  constructor(
    private userService : UserService,
    private utilityService: UtilityService,
  ) { }

  ngOnInit(): void {
  }


  checkDataExist(object: Object){
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

  addNewUser(User:any){
    this.utilityService.asyncNotification($localize`:@@transferOwnership.pleaseWait:Please wait while we are Transfering Ownership ...`,
    new Promise((resolve, reject) => {
      this.userService.transferOwnership({
        userById: this.userData._id,
        userToId:User._id,
        workspaceId:this.workspaceData._id,
      }).then(res => {
        resolve(this.utilityService.resolveAsyncPromise($localize`:@@transferOwnership.successfully:Successfully Transfered OwnerShip!`));
      })
      .catch(err => {
        reject(this.utilityService.rejectAsyncPromise($localize`:@@transferOwnership.errorWhileTransferingOwnership:Error occurred while transfering ownership , please try again!`));
      })
    }));


  }

}
