import { Component, OnInit, Injector, Input } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit {

  @Input() userData;
  @Input() workspaceData;

  // Array of user portfolios
  public userPortfolios: any = [];

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    public injector: Injector,
    private router: Router,
  ) {
  }

  async ngOnInit() {

    // Starts the spinner
    this.isLoading$.next(true);

    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'work'
    })

    // Fetch the current loggedIn user data
    if (!this.utilityService.objectExists(this.userData)) {
      this.userData = await this.publicFunctions.getCurrentUser();
    }

    if (!this.utilityService.objectExists(this.workspaceData)) {
      // Fetch the current workspace data
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    }

    // Fetches the user groups from the server
    this.userPortfolios = await this.publicFunctions.getUserPortfolios()
      .catch(() => {
        // If the function breaks, then catch the error and console to the application
        this.publicFunctions.sendError(new Error($localize`:@@portfolio.unableToConnectToServer:Unable to connect to the server, please try again later!`));
        this.isLoading$.next(false);
      });

    // Stops the spinner and return the value with ngOnInit
    this.isLoading$.next(false);
  }

  ngOnDestroy() {
    this.isLoading$.complete()
  }

  onPortfolioCreated($event: Event) {
    this.userPortfolios.push($event);
  }

  async goToPortfolio(portfolioId: string) {
    const newPortfolio = await this.publicFunctions.getPortfolioDetails(portfolioId);
    await this.publicFunctions.sendUpdatesToPortfolioData(newPortfolio);
    this.router.navigate(['/dashboard', 'work', 'groups', 'portfolio']);
  }
}
