import { Component, OnInit, Injector, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
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

  editGroups = false;

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public injector: Injector,
    public dialog: MatDialog,
    public utilityService: UtilityService,
    private portfolioService: PortfolioService,
    private router: Router,
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
      this.portfolioData?._groups?.push(data);
      await this.publicFunctions.sendUpdatesToPortfolioData(this.portfolioData);
    });

    dialogRef.afterClosed().subscribe(result => {
      groupAddedEventSubs.unsubscribe();
    });
  }

  async deleteGroup(groupId: string) {
    await this.utilityService.asyncNotification($localize`:@@portfolioGroupsList.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
        this.portfolioService.removeGroupFromPortfolio(this.portfolioData?._id, groupId)
          .then((res) => {
            this.portfolioData = res['portfolio'];
            this.publicFunctions.sendUpdatesToPortfolioData(this.portfolioData);

            resolve(this.utilityService.resolveAsyncPromise($localize`:@@portfolioGroupsList.detailsUpdated:Details updated!`));
          })
          .catch(() => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@portfolioGroupsList.unableToUpdateDetails:Unable to update the details, please try again!`));
          });
      }));
  }

  confirmGroups() {
    this.editGroups = !this.editGroups
    window.location.reload();
  }

  async goToGroup(groupId: string) {
    const group: any = await this.publicFunctions.getGroupDetails(groupId);
    const groupMembersIndex = group._members.findIndex((member: any) => member._id == this.userData._id);
    const groupAdminsIndex = group._admins.findIndex((admin: any) => admin._id == this.userData._id);
    const userGroupsIndex = this.userData._groups.findIndex((usergroup: any) => usergroup == group?._id);

    if (groupMembersIndex >= 0 || groupAdminsIndex >= 0 || userGroupsIndex >= 0) {
      const newGroup: any = await this.publicFunctions.getGroupDetails(groupId);
      await this.publicFunctions.sendUpdatesToGroupData(newGroup);
      await this.publicFunctions.sendUpdatesToPortfolioData({});
    if (newGroup.type == 'resource') {
      this.router.navigate(['dashboard', 'work', 'groups', 'resource']);
    } else {
      this.router.navigate(['dashboard', 'work', 'groups', 'activity']);
    }
    } else {
      this.utilityService.warningNotification($localize`:@@portfolioGroupsList.cannotAccess:You are not allow to access the group, you are not a member of it!`)
    }
  }

  objectExists(object: any) {
    return this.utilityService.objectExists(object);
  }
}
