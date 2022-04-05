import { Component, OnInit, Injector, Inject, Input } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/shared/services/user-service/user.service';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  constructor(
    private injector: Injector,
    private router: ActivatedRoute,
    public dialog: MatDialog,
    private utilityService: UtilityService,
    private userService: UserService
  ) { }

  // User Data Variable
  userData: any;

  // Workspace Data Variable
  workspaceData: any;

  // Public functions class member
  publicFunctions = new PublicFunctions(this.injector);

  // Is current user component
  isCurrentUser: boolean = false;

  async ngOnInit() {

    // Setting Home State
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'user-account'
    });

    const userId = this.router.snapshot.queryParams['userId'];
    if (userId) {
      await this.publicFunctions.getOtherUser(userId).then((res) => {
        if(JSON.stringify(res) != JSON.stringify({})){
          this.userData = res;
        }

        // Instantiate the current user value
        this.isCurrentUser = (userId == this.userData['_id']);
      });
    } else {
      this.userData = await this.publicFunctions.getCurrentUser();
      this.isCurrentUser = true;
    }

    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

  }

  onUpdateUserEmitter(updatedUserData) {
    this.userData = updatedUserData;
  }

  async getUserInformation() {
    this.utilityService.getConfirmDialogAlert($localize`:@@userProfile.areYouSure:Are you sure?`, $localize`:@@userProfile.byDoingLDAPSync:By doing this, your user information will be synchronized with LDAP!`)
      .then(async (res) => {
        if (res.value) {
          const accountData = await this.publicFunctions.getCurrentAccount();
          this.userService.ldapUserInfo(this.workspaceData._id, accountData?.email).then(res => {
console.log(res);
          });
        }
    });
  }

}
