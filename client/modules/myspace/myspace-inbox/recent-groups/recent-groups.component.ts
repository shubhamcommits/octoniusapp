import { Component, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { UserService } from 'src/shared/services/user-service/user.service';

@Component({
  selector: 'app-recent-groups',
  templateUrl: './recent-groups.component.html',
  styleUrls: ['./recent-groups.component.scss']
})
export class RecentGroupsComponent implements OnInit {

  userData;
  recentGroups;

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
    const newGroup: any = await this.publicFunctions.getGroupDetails(groupId);
    await this.publicFunctions.sendUpdatesToGroupData(newGroup);
    if (newGroup.type == 'resource') {
      this._router.navigate(['dashboard', 'work', 'groups', 'resource']);
    } else {
      this._router.navigate(['dashboard', 'work', 'groups', 'activity']);
    }
  }
}
