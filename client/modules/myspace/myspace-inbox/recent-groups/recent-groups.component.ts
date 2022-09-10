import { Component, Injector, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/shared/services/user-service/user.service';

@Component({
  selector: 'app-recent-groups',
  templateUrl: './recent-groups.component.html',
  styleUrls: ['./recent-groups.component.scss']
})
export class RecentGroupsComponent implements OnInit {

  userData;
  recentGroups;

  groupBaseUrl = environment.UTILITIES_GROUPS_UPLOADS;


  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private _router: Router,
    private injector: Injector,
    private userService: UserService
  ) { }

  async ngOnInit() {
    // Fetch current user details
    this.userData = await this.publicFunctions.getCurrentUser();

    await this.userService.getRecentGroups(this.userData._id).then(res => {
      if (res['user'] && res['user']['stats'] && res['user']['stats']['groups']) {
        this.recentGroups = res['user']['stats']['groups'];
      }
    });
  }

  async goToGroup(groupId: string) {
    const newGroup = await this.publicFunctions.getGroupDetails(groupId);
    await this.publicFunctions.sendUpdatesToGroupData(newGroup);
    this._router.navigate(['/dashboard', 'work', 'groups', 'activity']);
  }
}
