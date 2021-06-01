import { Component, Injector, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { BehaviorSubject } from 'rxjs';
import { UserService } from 'src/shared/services/user-service/user.service';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export class DashboardPageComponent implements OnInit {

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
  workspaceData: any;

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(private injector: Injector) { }

  async ngOnInit() {
    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'work'
    });

    // Fetch current user details
    this.userData = await this.publicFunctions.getCurrentUser();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.period = (this.userData.stats.dashboard_period) ? this.userData.stats.dashboard_period : 7;
  }

  async periodSelected(event) {
    this.period = event.value;
    this.userData.stats.dashboard_period = this.period;
    // User service
    const userService = this.injector.get(UserService);

    // Update user´s period
    await userService.updateUser(this.userData);
    await this.publicFunctions.sendUpdatesToUserData(this.userData);
  }

}
