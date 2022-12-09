import { Component, Injector, Input, OnChanges } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ColumnService } from 'src/shared/services/column-service/column.service';
import { PortfolioService } from 'src/shared/services/portfolio-service/portfolio.service';

@Component({
  selector: 'app-portfolio-projects-performance-card',
  templateUrl: './portfolio-projects-performance-card.component.html',
  styleUrls: ['./portfolio-projects-performance-card.component.scss']
})
export class PortfolioProjectsPerformanceCardComponent implements OnChanges {

  @Input() portfolioId; // This could be a groupId or a workspaceId

  groupName = '';

  // Base URL
  baseUrl = environment.UTILITIES_GROUPS_UPLOADS;

  // Workspace data
  public workspaceData: Object = {};

  // Projects
  public projects: any = [];

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  // IsLoading behavior subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  constructor(
    private portfolioService: PortfolioService,
    private injector: Injector
  ) { }

  ngOnChanges() {
    // Starts the spinner
    this.isLoading$.next(true);

    this.initView();
  }

  async initView() {

    if (this.portfolioId) {
      // Fetches the groups from the server
      this.projects = await this.getProjectColumns()
        .catch(() => {
          // If the function breaks, then catch the error and console to the application
          this.publicFunctions.sendError(new Error($localize`:@@portfolioKpiPerformanceCard.unableToConnectServer:Unable to connect to the server, please try again later!`));
          this.isLoading$.next(false);
        });
    }

    if (!this.projects) {
      this.projects = [];
    }

    // Stops the spinner and return the value with ngOnInit
    return this.isLoading$.next(false);
  }

  /**
   * This function is resposible for fetching first 10 groups present in the workplace
   * @param workspaceId
   */
  public async getProjectColumns() {
    return new Promise(async (resolve, reject) => {
      this.portfolioService.getAllPortfolioProjectColumns(this.portfolioId)
        .then((res) => resolve(res['columns']))
        .catch(() => reject([]));
    });
  }
}
