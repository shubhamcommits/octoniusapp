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
    console.log("workSPace data",this.workspaceData);
  }


  checkDataExist(object: Object){
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

  addNewUser(User:any){
    console.log("am herer",User,this.utilityService);
    this.utilityService.asyncNotification('Please wait while we are Deleting the user ...',
    new Promise((resolve, reject) => {
      this.userService.transferOwnership({
        userById: this.userData._id,
        userToId:User._id,
        workspaceId:this.workspaceData._id,
      }).then(res => {
        resolve(this.utilityService.resolveAsyncPromise('Successfully Transfered OwnerShip!'));
      })
      .catch(err => {
        reject(this.utilityService.rejectAsyncPromise('Error occurred while transfering ownership , please try again!'));
      })
    }));
    

  }

}
