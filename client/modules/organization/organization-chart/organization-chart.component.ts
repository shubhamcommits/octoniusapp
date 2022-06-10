import { Component, OnInit, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
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

  selectedUser;
  selectedUserManager;

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  // Utility Service
  public utilityService = this.injector.get(UtilityService);

  // Subsink to add subscriptions to this array
  public subSink = new SubSink();

  constructor(
    private userService: UserService,
    private workspaceService: WorkspaceService,
    private router: Router,
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
    this.selectedManagerField = this.workspaceData?.manager_custom_field;

    this.isManager = this.userData.role == 'manager' || this.userData.role == 'admin' || this.userData.role == 'owner';

    if (this.router.routerState.snapshot.root.queryParamMap.has('userId')) {
      this.levels = [];
      
      const userId = this.router.routerState.snapshot.root.queryParamMap.get('userId');

      this.selectedUser = await this.publicFunctions.getOtherUser(userId);
      if (this.utilityService.objectExists(this.selectedUser) && this.selectedUser?.profile_custom_fields
          && this.selectedUser?.profile_custom_fields[this.selectedManagerField]) {
        this.selectedUserManager = await this.publicFunctions.getOtherUser(this.selectedUser?.profile_custom_fields[this.selectedManagerField]);
      }
    }

    await this.initOrganizationChart();
  }

  async initOrganizationChart() {
    this.levels = [];

    if (this.utilityService.objectExists(this.selectedUser) && this.utilityService.objectExists(this.selectedUserManager)) {
      await this.workspaceService.getOrganizationChartNextLevel(this.workspaceData?._id, this.selectedUserManager?.profile_custom_fields[this.selectedManagerField]).then(res => {
        this.levels.push({
          managerId: this.selectedUserManager?.profile_custom_fields[this.selectedManagerField],
          members: res['members']
        });
      });

      await this.workspaceService.getOrganizationChartNextLevel(this.workspaceData?._id, this.selectedUserManager?._id).then(res => {
        this.newManagerSelected({
                managerId: this.selectedUserManager?._id,
                nextLevelMembers: res['members']
        }, 0);
      });
    } else {
      await this.workspaceService.getOrganizationChartFirstLevel(this.workspaceData._id).then(res => {
        if (res['members']) {
          this.levels.push({
            members: res['members']
          });

          if (this.levels[0].members.length == 1) {
            this.workspaceService.getOrganizationChartNextLevel(this.workspaceData?._id, this.levels[0].members[0]?._id).then(res => {
              this.newManagerSelected({
                managerId: this.levels[0].members[0]?._id,
                nextLevelMembers: res['members']
              }, 0);
            });
          }
        }
      });
    }
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
    this.possibleMembers = (this.workspaceData && this.workspaceData?.members) ? this.workspaceData?.members?.filter(member => member._id != managerId && member.active) : [];
  }

  getMemberDetails(selectedMember: any, managerId: string, levelIndex: any) {
    this.utilityService.asyncNotification($localize`:@@organizationChart.pleaseWaitsavingSettings:Please wait, we are saving the new setting...`,
      new Promise((resolve, reject)=>{
        this.userService.saveCustomField(selectedMember._id, this.workspaceData?.manager_custom_field, managerId)
          .then(()=> {
            selectedMember.nextLevelMembers = [];
            if (this.levels) {
              let levelIndex = -1;
              let managerIndex = -1;
              let memberIndex = -1;
              this.levels.forEach((level, index) => {
                if (level && level?.members && memberIndex < 0 && managerIndex < 0) {
                  managerIndex = (level?.members) ? level?.members.findIndex(member => member._id == selectedMember._id) : -1;

                  if (managerIndex >= 0) {
                    levelIndex = index;
                  } else {
                    level.members.forEach((manager, index2) => {
                      if (memberIndex < 0) {
                        memberIndex = (manager?.nextLevelMembers) ? manager?.nextLevelMembers.findIndex(member => member._id == selectedMember._id) : -1;

                        if (memberIndex >= 0) {
                          levelIndex = index;
                          managerIndex = index2;
                        }
                      }
                    });
                  }
                }
              });

              if (levelIndex >= 0 && managerIndex >= 0 && memberIndex >= 0) {
                this.levels[levelIndex]?.members[managerIndex]?.nextLevelMembers?.splice(memberIndex, 1);
              } else if (levelIndex >= 0 && managerIndex >= 0) {
                this.levels[levelIndex]?.members?.splice(managerIndex, 1);
              }
            }
            this.levels[levelIndex]?.members?.push(selectedMember);
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@organizationChart.settingsSaved:Settings saved!`));
          })
          .catch((err) => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@organizationChart.unableToSaveGroupSettings:Unable to save the settings, please try again!`));
          });
      }));
  }

  removeFromManager(user: any, levelIndex: any) {
    const index = (this.levels[levelIndex]?.members) ? this.levels[levelIndex]?.members.findIndex(member => member._id == user._id) : -1;
    if (index >= 0) {
      this.levels[levelIndex]?.members.splice(index, 1);
    }
    this.levels[0]?.members?.push(user);

  }

  openCardSettingsDialog() {
    const dialogRef = this.dialog.open(ChartSettingsDialogComponent, {
      width: '45%',
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

  async selectParentLevel(managerId: string) {
    const manager: any = await this.publicFunctions.getOtherUser(managerId);
    this.workspaceService.getOrganizationChartNextLevel(this.workspaceData?._id, manager?.profile_custom_fields[this.selectedManagerField]).then(res => {
      if (res['members'] && res['members'].length > 0) {
        this.levels.unshift({
          managerId: manager?.profile_custom_fields[this.selectedManagerField],
          members: res['members']
        });
      }
    });
  }
}
