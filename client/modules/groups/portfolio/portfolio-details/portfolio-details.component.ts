import { Component, OnInit, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { PortfolioService } from 'src/shared/services/portfolio-service/portfolio.service';

@Component({
  selector: 'app-portfolio-details',
  templateUrl: './portfolio-details.component.html',
  styleUrls: ['./portfolio-details.component.scss']
})
export class PortfolioDetailsComponent implements OnInit {

  portfolioData;
  userData;
  workspaceData;

  userGroups: any = [];

  groupsLabel = $localize`:@@portfolioDetails.general:Groups`;
  workloadLabel = $localize`:@@portfolioDetails.workload:Workload`;

  period = 7;

  periods = [
    {
     key: 7,
     value: $localize`:@@portfolioDetails.last7Days:Last 7 days`
    },
    {
     key: 30,
     value: $localize`:@@portfolioDetails.lastMonth:Last month`
    },
    {
     key: 365,
     value: $localize`:@@portfolioDetails.lastYear:Last year`
    }
  ];

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public injector: Injector,
    public dialog: MatDialog,
    private utilityService: UtilityService,
    private portfolioService: PortfolioService
  ) {
  }

  async ngOnInit() {

    // Starts the spinner
    this.isLoading$.next(true);

    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'portfolio'
    })

    // Fetch the current loggedIn user data
    if (!this.objectExists(this.userData)) {
      this.userData = await this.publicFunctions.getCurrentUser();
    }

    if (!this.objectExists(this.workspaceData)) {
      // Fetch the current workspace data
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    }

    // Fetch the current loggedIn user data
    if (!this.objectExists(this.portfolioData)) {
      this.portfolioData = await this.publicFunctions.getCurrentPortfolioDetails();
    }

    this.period = (this.portfolioData?.dashboard_period) ? this.portfolioData?.dashboard_period : 7;

    // Fetches the user groups from the server
    this.userGroups = await this.publicFunctions.getUserGroups(this.workspaceData?._id, this.userData?._id)
      .catch(() => {
        // If the function breaks, then catch the error and console to the application
        this.publicFunctions.sendError(new Error($localize`:@@portfolioDetails.unableToConnectToServer:Unable to connect to the server, please try again later!`));
        this.isLoading$.next(false);
      });

    // Stops the spinner and return the value with ngOnInit
    this.isLoading$.next(false);
  }

  ngOnDestroy() {
    this.isLoading$.complete();
  }

  async periodSelected(event) {
    this.period = event.value;
    this.portfolioData.dashboard_period = this.period;

    // Update user´s period
    await this.portfolioService.updatePortfolioProperties(this.portfolioData?._id, { 'dashboard_period': this.period });
    await this.publicFunctions.sendUpdatesToPortfolioData(this.portfolioData);
  }

  objectExists(object: any) {
    return this.utilityService.objectExists(object);
  }
}
