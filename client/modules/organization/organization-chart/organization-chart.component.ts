import { Component, OnInit, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { SubSink } from 'subsink';
import { ChartSettingsDialogComponent } from './chart-settings-dialog/chart-settings-dialog.component';

@Component({
  selector: 'app-organization-chart',
  templateUrl: './organization-chart.component.html',
  styleUrls: ['./organization-chart.component.scss']
})
export class OrganizationChartComponent implements OnInit {

  levels = [];

  userData;
  workspaceData;

  selectedManagerField;

  isManager = false;

  searchText = '';
  possibleMembers = [];

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  // Utility Service
  public utilityService = this.injector.get(UtilityService);

  // Subsink to add subscriptions to this array
  public subSink = new SubSink();

  constructor(
    private userService: UserService,
    private workspaceService: WorkspaceService,
    private injector: Injector,
    public dialog: MatDialog
  ) { }

  async ngOnInit() {

    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'people-directory-chart'
    });

    this.userData = await this.publicFunctions.getCurrentUser();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.isManager = this.userData.role == 'manager' || this.userData.role == 'admin' || this.userData.role == 'owner';

    this.getOrganizationChartFirstLevel();

    this.selectedManagerField = this.workspaceData?.manager_custom_field;
  }

  ngOnDestroy(){

  }

  getOrganizationChartFirstLevel() {
    this.workspaceService.getOrganizationChartFirstLevel(this.workspaceData._id).then(res => {
      if (res['members']) {
        this.levels.push({
          members: res['members']
        });
      }
    });
  }

  newManagerSelected(data: any, levelIndex: any) {
    if (this.workspaceData && this.workspaceData?.manager_custom_field) {
      this.levels.splice(levelIndex + 1);

      this.levels.push({
        managerId: data.managerId,
        members: data.nextLevelMembers
      });
    }
  }

  selectPossibleMember(managerId: string) {
    this.possibleMembers = (this.workspaceData && this.workspaceData?.members) ? this.workspaceData?.members?.filter(member => member._id != managerId) : [];
  }

  getMemberDetails(selectedMember: any, managerId: string, levelIndex: any) {
      this.utilityService.asyncNotification($localize`:@@organizationChart.pleaseWaitsavingSettings:Please wait, we are saving the new setting...`,
      new Promise((resolve, reject)=>{
        this.userService.saveCustomField(selectedMember._id, this.workspaceData?.manager_custom_field, managerId)
          .then(()=> {
            selectedMember.nextLevelMembers = [];
            const index = (this.levels[0]?.members) ? this.levels[0]?.members.findIndex(member => member._id == selectedMember._id) : -1;
            if (index >= 0) {
              this.levels[0]?.members.splice(index, 1);
            }
            this.levels[levelIndex]?.members?.push(selectedMember);
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@organizationChart.settingsSaved:Settings saved!`));
          })
          .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@organizationChart.unableToSaveGroupSettings:Unable to save the settings, please try again!`)));
      }));
  }

  openCardSettingsDialog() {
    const dialogRef = this.dialog.open(ChartSettingsDialogComponent, {
      width: '45%',
      //height: '65%',
      disableClose: true,
      hasBackdrop: true,
      data: { workspaceData: this.workspaceData }
    });

    const sub = dialogRef.componentInstance.closeEvent.subscribe(async () => {
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    });

    dialogRef.afterClosed().subscribe(result => {
      sub.unsubscribe();
    });
  }
}
