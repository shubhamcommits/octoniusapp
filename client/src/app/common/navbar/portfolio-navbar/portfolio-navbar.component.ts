import { Component, OnInit, OnDestroy, Injector } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PublicFunctions } from 'modules/public.functions';
import { SubSink } from 'subsink';
import { Router } from '@angular/router';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-portfolio-navbar',
  templateUrl: './portfolio-navbar.component.html',
  styleUrls: ['./portfolio-navbar.component.scss']
})
export class PortfolioNavbarComponent implements OnInit, OnDestroy {

  portfolioData: any;

  routerFromEvent: any;

  // User Data
  userData: any;

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink();

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector,
    private router: Router,
    private utilityService: UtilityService
  ) {

  }

  async ngOnInit() {

    // Fetch the current user
    if (!this.userData) {
      this.userData = await this.publicFunctions.getCurrentUser();
    }

    this.portfolioData = await this.publicFunctions.getCurrentPortfolioDetails();
  }

  /**
   * This function unsubscribes all the observables as soon as the component is destroyed
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  openDetails(content: any) {
    this.utilityService.openModal(content, {});
  }

  goBack() {
    this.publicFunctions.sendUpdatesToPortfolioData({});
    this.router.navigate(['/dashboard', 'work', 'groups', 'all'],
        {
          queryParams: {
            selectedTab: 'portfolio'
          }
        }
      );
  }
}
