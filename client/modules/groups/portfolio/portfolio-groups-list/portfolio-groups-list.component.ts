import { Component, OnInit, Injector, Input } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { PortfolioService } from 'src/shared/services/portfolio-service/portfolio.service';
import { GroupSelectorDialogComponent } from '../group-selector-dialog/group-selector-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-portfolio-groups-list',
  templateUrl: './portfolio-groups-list.component.html',
  styleUrls: ['./portfolio-groups-list.component.scss']
})
export class PortfolioGroupsListComponent implements OnInit {

  @Input() portfolioData;
  @Input() userData;
  @Input() workspaceData;
  @Input() userGroups: any = [];

  // Base Url
  baseUrl = environment.UTILITIES_GROUPS_UPLOADS;

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public injector: Injector,
    private router: Router,
    public dialog: MatDialog,
    private portfolioService: PortfolioService,
    private utilityService: UtilityService
  ) { }

  async ngOnInit() {

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

    if (!this.userGroups || this.userGroups?.length == 0) {
      // Fetches the user groups from the server
      this.userGroups = await this.publicFunctions.getUserGroups(this.workspaceData?._id, this.userData?._id)
        .catch(() => {
          // If the function breaks, then catch the error and console to the application
          this.publicFunctions.sendError(new Error($localize`:@@portfolioGroupsList.unableToConnectToServer:Unable to connect to the server, please try again later!`));
        });
    }
  }

  ngOnDestroy() {
  }

  async openGroupSelecter() {
    const data = {
      portfolioId: this.portfolioData?._id,
      userId: this.userData?._id,
      portfolioGroups: this.portfolioData?._groups,
      userGroups: this.userGroups
    }

    const dialogRef = this.dialog.open(GroupSelectorDialogComponent, {
      data: data,
      panelClass: 'groupCreatePostDialog',
      width: '50%',
      disableClose: true,
      hasBackdrop: true
    });

    const groupAddedEventSubs = dialogRef.componentInstance.groupAddedEvent.subscribe(async (data) => {
      const index = 
      this.portfolioData?._groups?.push(data);
      await this.publicFunctions.sendUpdatesToPortfolioData(this.portfolioData);
    });

    dialogRef.afterClosed().subscribe(result => {
      groupAddedEventSubs.unsubscribe();
    });
  }

  async goToGroup(groupId: string) {
    const newGroup = await this.publicFunctions.getGroupDetails(groupId);
    await this.publicFunctions.sendUpdatesToGroupData(newGroup);
    this.router.navigate(['/dashboard', 'work', 'groups', 'activity']);
  }

  objectExists(object: any) {
    return this.utilityService.objectExists(object);
  }
}
