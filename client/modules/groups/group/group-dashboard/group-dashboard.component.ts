import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-group-dashboard',
  templateUrl: './group-dashboard.component.html',
  styleUrls: ['./group-dashboard.component.scss']
})
export class GroupDashboardComponent implements OnInit, OnDestroy {

  groupData: any;

  period = 7;

  periods = [
    {
     key: 7,
     value: 'Last 7 days'
    },
    {
     key: 30,
     value: 'Last month'
    },
    {
     key: 365,
     value: 'Last year'
    }
  ];

  userData: any;

  // Subsink Object
  subSink = new SubSink()

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector,
    private utilityService: UtilityService) { }

  async ngOnInit() {
    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'group'
    });

    this.subSink.add(this.utilityService.currentGroupData.subscribe((res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {

        // Assign the GroupData
        this.groupData = res;
      }
    }))

    // Fetch current user details
    this.userData = await this.publicFunctions.getCurrentUser();

    this.period = (this.userData.stats.group_dashboard_period) ? this.userData.stats.group_dashboard_period : 7;
  }

  async periodSelected(event) {
    this.period = event.value;
    this.userData.stats.group_dashboard_period = this.period;
    // User service
    const userService = this.injector.get(UserService);

    // Update user´s period
    await userService.updateUser(this.userData);
    await this.publicFunctions.sendUpdatesToUserData(this.userData);
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subSink.unsubscribe();
  }

}
