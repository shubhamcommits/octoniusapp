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
  label: string = "The option is mainly for inviting super-admins, group admins, and external guests.";
  placeholder: string = "Please provide the email";

  isValidEmail = false;

  ngOnInit() {
  }

  /**
   * This function gets the Valid Email from the @module <app-email-input></app-email-input>
   * @param $event
   */
  getValidEmail($event: string){
    this.email = $event;
    const userEmailDomain = this.email.split('@')[1];
    this.isValidEmail = (this.workspaceData.allowed_domains.findIndex(domain => domain == userEmailDomain) >= 0);
    if (!this.isValidEmail) {
      this.utilityService.errorNotification('The domain of the email is not allow in the workspace!');
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
        this.utilityService.asyncNotification('Please wait, while we are sending the email...', new Promise((resolve, reject)=>{
          this.adminService.inviteNewUserViaEmail(workspaceId, email, 'workspace', '')
          .subscribe((res)=>{
            this.email = '';
            resolve(this.utilityService.resolveAsyncPromise(`We have sent the invitation email at ${email} to join your workplace!`))
          }, (err)=>{
            this.email = '';
            console.log('Error occured, while sending the email', err);
            reject(this.utilityService.rejectAsyncPromise('Oops, an error occured while sending the email, please try again!'))
          })
        }))
      } catch(err) {
        console.log('There\'s some unexpected error occured, please try again!', err);
        this.utilityService.errorNotification('There\'s some unexpected error occured, please try again!');
      }
    }
  }
}
