import { Component, EventEmitter, Inject, Injector, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { PortfolioService } from 'src/shared/services/portfolio-service/portfolio.service';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-group-selector-dialog',
  templateUrl: './group-selector-dialog.component.html',
  styleUrls: ['./group-selector-dialog.component.scss']
})
export class GroupSelectorDialogComponent implements OnInit {

  @Output() groupAddedEvent = new EventEmitter();

  portfolioId;
  userId;

  portfolioGroups = [];
  userGroups = [];

  workspaceData: any;

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private portfolioService: PortfolioService,
    public utilityService: UtilityService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdDialogRef: MatDialogRef<GroupSelectorDialogComponent>,
    private injector: Injector
  ) {
    this.portfolioId = this.data.portfolioId;
    this.userId = this.data.userId;
    this.portfolioGroups = this.data.portfolioGroups;
    this.userGroups = this.data.userGroups;
  }

  async ngOnInit() {
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.userGroups = this.userGroups.filter(group => {
      const index = (this.portfolioGroups) ? this.portfolioGroups.findIndex(g => g?._id == group?._id) : -1;
      return index < 0;
    });
  }

  async selectGroup(groupId: string) {
    await this.utilityService.asyncNotification($localize`:@@portfolioGroupsList.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
        this.portfolioService.addGroupToPortfolio(this.portfolioId, groupId).then(res => {
            this.groupAddedEvent.emit(res['group']);
            // Resolve with success
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@portfolioGroupsList.detailsUpdated:Details updated!`));
            this.closeDialog();
          })
          .catch(() => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@portfolioGroupsList.unableToUpdateDetails:Unable to update the details, please try again!`));
          });
      }));
  }

  closeDialog() {
    this.mdDialogRef.close();
  }
}
