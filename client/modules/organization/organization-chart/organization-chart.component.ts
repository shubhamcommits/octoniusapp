import { Component, OnInit, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { SubSink } from 'subsink';
import { AddMemberToLevelComponent } from './add-member-to-level/add-member-to-level.component';

@Component({
  selector: 'app-organization-chart',
  templateUrl: './organization-chart.component.html',
  styleUrls: ['./organization-chart.component.scss']
})
export class OrganizationChartComponent implements OnInit {

  levels = [];

  userData;
  workspaceData;

  posibleManagerCF = [];
  selectedManagerField;

  isManager = false;

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  // Utility Service
  public utilityService = this.injector.get(UtilityService);

  // Subsink to add subscriptions to this array
  public subSink = new SubSink();

  constructor(
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

    this.posibleManagerCF = (this.workspaceData?.profile_custom_fields) ? this.workspaceData?.profile_custom_fields?.filter(cf =>  cf.user_type) : [];
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

  selectManagerField(cfSelected) {
    this.utilityService.asyncNotification($localize`:@@organizationChart.pleaseWaitsavingSettings:Please wait, we are saving the new setting...`,
    new Promise((resolve, reject)=>{
      this.workspaceService.saveSettings(this.workspaceData?._id, { manager_custom_field: cfSelected.value })
        .then(()=> {
          this.selectedManagerField = cfSelected.value;
          this.workspaceData.manager_custom_field = cfSelected.value;
          this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData);
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@organizationChart.settingsSaved:Settings saved!`));
        })
        .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@organizationChart.unableToSaveGroupSettings:Unable to save the settings, please try again!`)));
    }));
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

  addMember(managerId: string, levelIndex: any) {
    const managersIds = this.levels.map(level => level.managerId);
    const data = {
      managerId: managerId,
      members: (this.levels && this.levels[0]) ? this.levels[0]?.members.filter(member => !managersIds.includes(member._id)) : []
    };

    const dialogRef = this.dialog.open(AddMemberToLevelComponent, {
      hasBackdrop: true,
      data: data
    });

    const memberAddedEventSubs = dialogRef.componentInstance.memberAddedEmitter.subscribe(async (data) => {
      const index = (this.levels[0]?.members) ? this.levels[0]?.members.findIndex(member => member._id == data._id) : -1;
      if (index >= 0) {
        this.levels[0]?.members.splice(index, 1);
      }
      this.levels[levelIndex]?.members?.push(data);
    });

    dialogRef.afterClosed().subscribe(async result => {
      memberAddedEventSubs.unsubscribe();
    });
  }
}
