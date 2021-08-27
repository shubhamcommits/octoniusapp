import { Component, OnInit, Input } from '@angular/core';
import { AdminService } from 'src/shared/services/admin-service/admin.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-workplace-invite-user',
  templateUrl: './workplace-invite-user.component.html',
  styleUrls: ['./workplace-invite-user.component.scss']
})
export class WorkplaceInviteUserComponent implements OnInit {

  constructor(
    private adminService: AdminService,
    private utilityService: UtilityService
  ) { }

  @Input('workspaceData') workspaceData: any;
  @Input('userData') userData: any;

  email: string = '';
  label: string = $localize`:@@workplaceInviteUser.theOptionIsMainlyInvite:The option is mainly for inviting super-admins, group admins, and external guests.`;
  placeholder: string = $localize`:@@workplaceInviteUser.pleaseProvideEmail:Please provide the email`;

  isValidEmail = false;

  ngOnInit() {
  }

  /**
   * This function gets the Valid Email from the @module <app-email-input></app-email-input>
   * @param $event
   */
  getValidEmail($event: string) {
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
  inviteUser(workspaceId: string, email: string){
    if (this.isValidEmail) {
      try {
        this.utilityService.asyncNotification($localize`:@@workplaceInviteUser.pleaseWaitSendingEmail:Please wait, while we are sending the email...`, new Promise((resolve, reject)=>{
          this.adminService.inviteNewUserViaEmail(workspaceId, email, 'workspace', '', this.userData?.first_name)
          .subscribe((res)=>{
            this.email = '';
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@workplaceInviteUser.weSentInvitationEmail:We have sent the invitation email at ${email} to join your workplace!`))
          }, (err)=>{
            this.email = '';
            console.log('Error occurred, while sending the email', err);
            reject(this.utilityService.rejectAsyncPromise($localize`:@@workplaceInviteUser.oopsErrorSendingEmail:Oops, an error occurred while sending the email, please try again!`))
          })
        }))
      } catch(err) {
        console.log('There\'s some unexpected error occurred, please try again!', err);
        this.utilityService.errorNotification($localize`:@@workplaceInviteUser.unexpectedError:There\'s some unexpected error occurred, please try again!`);
      }
    }
  }
}
