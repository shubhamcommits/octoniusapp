import { Component, OnInit, Input } from '@angular/core';
import { AdminService } from 'src/shared/services/admin-service/admin.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-invite-user',
  templateUrl: './invite-user.component.html',
  styleUrls: ['./invite-user.component.scss']
})
export class InviteUserComponent implements OnInit {

  constructor(
    private adminService: AdminService,
    private utilityService: UtilityService
  ) { }

  @Input('workspaceData') workspaceData: any;
  @Input('userData') userData: any;
  @Input('groupData') groupData: any;

  email: string = '';
  placeholder: string = $localize`:@@inviteUsers.pleaseProvideEmail:Please provide the email`;

  isValidEmail = false;

  ngOnInit() {
  }

  /**
   * This function gets the Valid Email from the @module <app-email-input></app-email-input>
   * @param $event
   */
   getValidEmail($event: string){
    this.email = $event;
    if (this.email && this.email != '') {
      this.isValidEmail = true;
    } else {
      this.isValidEmail = false;
    }
  }

  /**
   * This function is resposible for sending the invitation email to the user to join this current workspace
   * @param workspaceId
   * @param email
   * @param group_name
   * Calls the service function via making a POST request
   */
  inviteUser(workspaceId: string, email: string, groupId: string){
    try{
      this.utilityService.asyncNotification($localize`:@@inviteUsers.pleaseWaitSendingEmail:Please wait, while we are sending the email...`, new Promise((resolve, reject)=>{
        this.adminService.inviteNewUserViaEmail(workspaceId, email, 'group', groupId, this.userData?.first_name)
        .subscribe((res)=>{
          this.email = '';
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@inviteUsers.weHaveSentInvitationEmail:We have sent the invitation email at ${email} to join your group!`))
        }, (err)=>{
          this.email = '';
          console.log('Error occured, while sending the email', err);
          reject(this.utilityService.rejectAsyncPromise($localize`:@@inviteUsers.oopsErrorWhileSendingEmail:Oops, an error occured while sending the email, please try again!`))
        })
      }))
    } catch(err){
      console.log('There\'s some unexpected error occured, please try again!', err);
      this.utilityService.errorNotification($localize`:@@inviteUsers.unexpectedErrorOccured:There\'s some unexpected error occured, please try again!`);
    }
  }

}
