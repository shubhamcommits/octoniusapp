import { Component, OnInit, OnDestroy, Injector, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PublicFunctions } from 'modules/public.functions';
import { SubSink } from 'subsink';
import { Router } from '@angular/router';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { UserService } from 'src/shared/services/user-service/user.service';

@Component({
  selector: 'app-portfolio-navbar',
  templateUrl: './portfolio-navbar.component.html',
  styleUrls: ['./portfolio-navbar.component.scss']
})
export class PortfolioNavbarComponent implements OnInit, OnDestroy {

  @Output() favoritePortfolioSaved = new EventEmitter();

  portfolioData: any;

  routerFromEvent: any;

  // User Data
  userData: any;

  isFavoritePortfolio: boolean;

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink();

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector,
    private router: Router,
    private utilityService: UtilityService,
    private userService: UserService
  ) {

  }

  async ngOnInit() {

    // Fetch the current user
    if (!this.userData) {
      this.userData = await this.publicFunctions.getCurrentUser();
    }

    this.portfolioData = await this.publicFunctions.getCurrentPortfolioDetails();

    this.isFavoritePortfolio = this.checkIsFavoritePortfolio();
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

  checkIsFavoritePortfolio() {
    let portfolioIndex = -1;
    if (this.userData && this.userData.stats && this.userData.stats.favorite_portfolios) {
      portfolioIndex = this.userData.stats.favorite_portfolios.findIndex(group => (group._id || group) == this.portfolioData?._id);
    }
    return portfolioIndex >= 0;
  }

  saveFavoritePortfolio() {
    // Utility Service
    let utilityService = this.injector.get(UtilityService);

    utilityService.asyncNotification($localize`:@@portfolioNavbar.pleaseWaitWeAreSaving:Please wait we are saving the information...`,
      new Promise((resolve, reject) => {
        // Call HTTP Request to change the request
        this.userService.saveFavoritePortfolio(this.userData._id, this.portfolioData?._id, !this.isFavoritePortfolio)
          .then((res) => {
            this.isFavoritePortfolio = !this.isFavoritePortfolio;
            this.userData = res['user'];
            this.publicFunctions.sendUpdatesToUserData(this.userData);
            this.favoritePortfolioSaved.emit(this.userData);
            resolve(utilityService.resolveAsyncPromise($localize`:@@portfolioNavbar.groupSavedFavorite:Portfolio saved as favorite!`))
          })
          .catch(() => {
            reject(utilityService.rejectAsyncPromise($localize`:@@portfolioNavbar.unableToSaveAsFavorite:Unable to save the portfolio as favorite, please try again!`))
          });
      }));
  }
}
