import { Component, Injector, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-user-my-group-settings',
  templateUrl: './user-my-group-settings.component.html',
  styleUrls: ['./user-my-group-settings.component.scss']
})
export class UserMyGroupSettingsComponent implements OnInit {

  userData: any ;
  groupData: any;

  selectedCard = 'task'; // task/normal/event/northStar/CRMOrder/CRMLead
  
  // shuttleTasksModuleAvailable: boolean = false;
  isIdeaModuleAvailable: boolean = false;
  // campaignModuleAvailable: boolean = false;
  // isIndividualSubscription: boolean = false;
  
  groupSections: any = [];

  // Public functions class member
  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    private groupService: GroupService,
    public dialog: MatDialog,
    private injector: Injector,
    public router: Router
  ) { }

  async ngOnInit() {

    // Setting Home State
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'user-account'
    });

    this.userData = await this.publicFunctions.getCurrentUser();
    
    this.groupData = await this.publicFunctions.getGroupDetails(this.userData?._private_group?._id || this.userData?._private_group);
    this.publicFunctions.sendUpdatesToGroupData(this.groupData);

    if (!this.groupData.dialog_properties_to_show) {
      this.groupData.dialog_properties_to_show = {
        task: [],
        northStar: [],
        CRMOrder: [],
        CRMLead: []
      };
    }

    // this.isIndividualSubscription = await this.publicFunctions.checkIsIndividualSubscription();
    // this.shuttleTasksModuleAvailable = await this.publicFunctions.isShuttleTasksModuleAvailable();
    this.isIdeaModuleAvailable = await this.publicFunctions.checkIdeaStatus();
    // this.campaignModuleAvailable = await this.publicFunctions.isCampaignModuleAvailable();

    this.groupSections = await this.publicFunctions.getAllColumns(this.groupData?._id);
  }


  saveSettings(selected) {

    // Save the settings
    this.utilityService.asyncNotification($localize`:@@groupSettings.pleaseWaitsavingSettings:Please wait we are saving the new setting...`,
      new Promise((resolve, reject)=>{
        if (selected.source.name === 'share_files') {
          this.groupService.saveSettings(this.groupData?._id, {share_files: selected.checked})
            .then(()=> {
              this.groupData.share_files = selected.checked;
              this.publicFunctions.sendUpdatesToGroupData(this.groupData);
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupSettings.settingsSaved:Settings saved to your group!`));
            })
            .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@groupSettings.unableToSaveGroupSettings:Unable to save the settings to your group, please try again!`)))
        }

        if (selected.source.name === 'enabled_rights') {
          this.groupService.saveSettings(this.groupData?._id, {enabled_rights: selected.checked})
            .then(()=> {
              // this.enabledRights = selected.checked;
              this.groupData.enabled_rights = selected.checked;
              this.publicFunctions.sendUpdatesToGroupData(this.groupData);
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupSettings.settingsSaved:Settings saved to your group!`));
            })
            .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@groupSettings.unableToSaveGroupSettings:Unable to save the settings to your group, please try again!`)))
        }

        if (selected.source.name === 'enabled_project_type') {
          this.groupService.saveSettings(this.groupData?._id, {project_type: selected.checked})
            .then(()=> {
              // this.enabledProjectType = selected.checked;
              this.groupData.project_type = selected.checked;
              this.publicFunctions.sendUpdatesToGroupData(this.groupData);
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupSettings.settingsSaved:Settings saved to your group!`));
            })
            .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@groupSettings.unableToSaveGroupSettings:Unable to save the settings to your group, please try again!`)))
        }

        if (selected.source.name === 'enabled_shuttle_type') {
          this.groupService.saveSettings(this.groupData?._id, {shuttle_type: selected.checked})
            .then(()=> {
              // this.enabledShuttleType = selected.checked;
              this.groupData.shuttle_type = selected.checked;
              this.publicFunctions.sendUpdatesToGroupData(this.groupData);
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupSettings.settingsSaved:Settings saved to your group!`));
            })
            .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@groupSettings.unableToSaveGroupSettings:Unable to save the settings to your group, please try again!`)))
        }

        // if (selected.source.name === 'enable_allocation') {
        //   this.groupService.saveSettings(this.groupData?._id, {enable_allocation: selected.checked})
        //     .then(()=> {
        //       this.enableAllocation = selected.checked;
        //       this.groupData.enable_allocation = selected.checked;
        //       this.publicFunctions.sendUpdatesToGroupData(this.groupData);
        //       resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupSettings.settingsSaved:Settings saved to your group!`));
        //     })
        //     .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@groupSettings.unableToSaveGroupSettings:Unable to save the settings to your group, please try again!`)))
        // }

        if(selected.source.name === 'enabled_campaign'){
          this.groupService.saveSettings(this.groupData?._id, {enabled_campaign: selected.checked})
            .then(()=> {
              // this.enabledCampaign = selected.checked;
              this.groupData.enabled_campaign = selected.checked;
              this.publicFunctions.sendUpdatesToGroupData(this.groupData);
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupSettings.settingsSaved:Settings saved to your group!`));
            })
            .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@groupSettings.unableToSaveGroupSettings:Unable to save the settings to your group, please try again!`)))
        }
      }));
  }

  saveDialogsPropertiesToShow(selected) {
    // Save the settings
    this.utilityService.asyncNotification($localize`:@@groupSettings.pleaseWaitsavingSettings:Please wait we are saving the new setting...`,
      new Promise((resolve, reject)=>{

        if (!this.groupData.dialog_properties_to_show) {
          this.groupData.dialog_properties_to_show = {};
        }

        if (!this.groupData.dialog_properties_to_show[this.selectedCard]) {
          this.groupData.dialog_properties_to_show[this.selectedCard] = [];
        }

        const indexInGroup = (!!this.groupData.dialog_properties_to_show && !!this.groupData.dialog_properties_to_show[this.selectedCard])
          ? this.groupData.dialog_properties_to_show[this.selectedCard].findIndex(prop => prop == selected.source.name)
          : -1;

        if (selected.checked) {
          if (indexInGroup < 0) {
            this.groupData.dialog_properties_to_show[this.selectedCard].push(selected.source.name);
          }
        } else {
          if (indexInGroup >= 0) {
            this.groupData.dialog_properties_to_show[this.selectedCard].splice(indexInGroup, 1);
          }
        }

        this.groupService.saveSettings(this.groupData?._id, { dialog_properties_to_show: this.groupData.dialog_properties_to_show })
          .then(async ()=> {
            this.publicFunctions.sendUpdatesToGroupData(this.groupData);
            await this.groupService.triggerUpdateGroupData(this.groupData);
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupSettings.settingsSaved:Settings saved to your group!`));
          })
          .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@groupSettings.unableToSaveGroupSettings:Unable to save the settings to your group, please try again!`)))
      }));
  }

  saveDefaultBoardCard(type: string) {
    // Save the settings
    this.utilityService.asyncNotification($localize`:@@groupSettings.pleaseWaitsavingSettings:Please wait we are saving the new setting...`,
      new Promise((resolve, reject) => {
        this.groupService.saveSettings(this.groupData?._id, { default_board_card: type })
        .then(async ()=> {
            this.groupData.default_board_card = type;
            this.publicFunctions.sendUpdatesToGroupData(this.groupData);
            await this.groupService.triggerUpdateGroupData(this.groupData);
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupSettings.settingsSaved:Settings saved to your group!`));
          })
          .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@groupSettings.unableToSaveGroupSettings:Unable to save the settings to your group, please try again!`)))
      }));
  }

  objectExists(object: any) {
    return this.utilityService.objectExists(object);
  }
}
