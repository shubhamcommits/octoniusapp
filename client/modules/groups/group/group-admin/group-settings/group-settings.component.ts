import { Component, OnInit, Injector, Input } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { GroupRAGDialogComponent } from '../group-rag-dialog/group-rag-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { ColorPickerDialogComponent } from 'src/app/common/shared/color-picker-dialog/color-picker-dialog.component';
import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';

@Component({
  selector: 'app-group-settings',
  templateUrl: './group-settings.component.html',
  styleUrls: ['./group-settings.component.scss']
})
export class GroupSettingsComponent implements OnInit {

  // current group
  @Input() groupData: any;
  @Input() shuttleTasksModuleAvailable: any;
  @Input() campaignModuleAvailable: any;

  enabledRights: boolean = false;
  enabledProjectType: boolean = false;
  enabledShuttleType: boolean = false;
  enabledCampaign: boolean;
  switchAgora: boolean = false;
  freezeDates: boolean = false;
  enableAllocation: boolean = false;

  groupSections: any = [];

  isIndividualSubscription = false;

  // Public Functions Instancr
  publicFunctions = this.injector.get(PublicFunctions);

  constructor(
    private utilityService: UtilityService,
    private groupService: GroupService,
    private managementPortalService: ManagementPortalService,
    public dialog: MatDialog,
    private injector: Injector,
    public router: Router
  ) { }

  async ngOnInit() {

    this.isIndividualSubscription = await this.managementPortalService.checkIsIndividualSubscription();

    // Fetch the setting status
    this.enabledRights = this.groupData.enabled_rights;
    this.enabledProjectType = this.groupData.project_type;
    this.enabledShuttleType = this.groupData.shuttle_type;
    this.enabledCampaign = this.groupData.enabled_campaign
    this.switchAgora = this.groupData.type == 'agora';
    this.freezeDates = this.groupData.freeze_dates;

    if (!this.utilityService.objectExists(this.groupData)) {
      this.groupData = await this.publicFunctions.getCurrentGroupDetails();
    }

    this.groupSections = await this.publicFunctions.getAllColumns(this.groupData?._id);
  }

  /**
    * This function opens up the task content in a new modal, and takes #content in the ng-template inside HTML layout
    * @param content
    */
  async openDetails(content) {

    // Open Modal
    this.utilityService.openModal(content, {});
  }

  /**
  * This function is responsible to remove the image for the background
  * @param index
  */
  async removeImage() {
    this.utilityService.asyncNotification($localize`:@@groupSettings.pleaseWaitsavingSettings:Please wait we are saving the new setting...`,
      new Promise((resolve, reject)=>{
        this.groupService.saveSettings(this.groupData?._id, { background_image: null })
          .then(()=> {
            this.groupData.background_image = null;
            this.publicFunctions.sendUpdatesToGroupData(this.groupData);
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupSettings.settingsSaved:Settings saved to your group!`));
            window.location.reload();
          })
          .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@groupSettings.unableToSaveGroupSettings:Unable to save the settings to your group, please try again!`)))
      }));
  }

  /**
   * This function opens up the dialog to select a color
   */
  openColorPicker() {
    const dialogRef = this.dialog.open(ColorPickerDialogComponent, {
      width: '67%',
      height: '50%',
      disableClose: false,
      hasBackdrop: true,
      data: { colorSelected: this.groupData.background_color }
    });

    const colorPickedSubs = dialogRef.componentInstance.colorPickedEvent.subscribe(data => {
      this.saveBackgroundColor(data);
    });

    dialogRef.afterClosed().subscribe(result => {
      colorPickedSubs.unsubscribe();
    });
  }

  /**
  * This function is responsible to save the color for the background
  * @param index
  */
  async saveBackgroundColor(color: string) {
    this.utilityService.asyncNotification($localize`:@@groupSettings.pleaseWaitsavingSettings:Please wait we are saving the new setting...`,
      new Promise((resolve, reject)=>{
        this.groupService.saveSettings(this.groupData?._id, { background_color: color })
          .then(()=> {
            this.groupData.background_color = color;
            this.publicFunctions.sendUpdatesToGroupData(this.groupData);
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupSettings.settingsSaved:Settings saved to your group!`));
            window.location.reload();
          })
          .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@groupSettings.unableToSaveGroupSettings:Unable to save the settings to your group, please try again!`)))
      }));
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
              this.enabledRights = selected.checked;
              this.groupData.enabled_rights = selected.checked;
              this.publicFunctions.sendUpdatesToGroupData(this.groupData);
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupSettings.settingsSaved:Settings saved to your group!`));
            })
            .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@groupSettings.unableToSaveGroupSettings:Unable to save the settings to your group, please try again!`)))
        }

        if (selected.source.name === 'enabled_project_type') {
          this.groupService.saveSettings(this.groupData?._id, {project_type: selected.checked})
            .then(()=> {
              this.enabledProjectType = selected.checked;
              this.groupData.project_type = selected.checked;
              this.publicFunctions.sendUpdatesToGroupData(this.groupData);
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupSettings.settingsSaved:Settings saved to your group!`));
            })
            .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@groupSettings.unableToSaveGroupSettings:Unable to save the settings to your group, please try again!`)))
        }

        if (selected.source.name === 'enabled_shuttle_type') {
          this.groupService.saveSettings(this.groupData?._id, {shuttle_type: selected.checked})
            .then(()=> {
              this.enabledShuttleType = selected.checked;
              this.groupData.shuttle_type = selected.checked;
              this.publicFunctions.sendUpdatesToGroupData(this.groupData);
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupSettings.settingsSaved:Settings saved to your group!`));
            })
            .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@groupSettings.unableToSaveGroupSettings:Unable to save the settings to your group, please try again!`)))
        }

        if (selected.source.name === 'enable_allocation') {
          this.groupService.saveSettings(this.groupData?._id, {enable_allocation: selected.checked})
            .then(()=> {
              this.enableAllocation = selected.checked;
              this.groupData.enable_allocation = selected.checked;
              this.publicFunctions.sendUpdatesToGroupData(this.groupData);
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupSettings.settingsSaved:Settings saved to your group!`));
            })
            .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@groupSettings.unableToSaveGroupSettings:Unable to save the settings to your group, please try again!`)))
        }

        if(selected.source.name === 'enabled_campaign'){
          this.groupService.saveSettings(this.groupData?._id, {enabled_campaign: selected.checked})
            .then(()=> {
              this.enabledCampaign = selected.checked;
              this.groupData.enabled_campaign = selected.checked;
              this.publicFunctions.sendUpdatesToGroupData(this.groupData);
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupSettings.settingsSaved:Settings saved to your group!`));
            })
            .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@groupSettings.unableToSaveGroupSettings:Unable to save the settings to your group, please try again!`)))
        }

        if(selected.source.name === 'switch-agora'){
          this.groupService.saveSettings(this.groupData?._id, { type: (selected.checked) ? 'agora' : 'normal' })
            .then(()=> {
              this.switchAgora = selected.checked;
              this.groupData.type = (selected.checked) ? 'agora' : 'normal';
              this.publicFunctions.sendUpdatesToGroupData(this.groupData);
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupSettings.settingsSaved:Settings saved to your group!`));
            })
            .catch((err) => reject(this.utilityService.rejectAsyncPromise($localize`:@@groupSettings.unableToSaveGroupSettings:Unable to save the settings to your group, please try again!`)))
        }

        if(selected.source.name === 'freeze_dates') {
          this.groupService.saveSettings(this.groupData?._id, {freeze_dates: selected.checked})
            .then(()=> {
              this.freezeDates = selected.checked;
              this.groupData.freeze_dates = selected.checked;
              this.publicFunctions.sendUpdatesToGroupData(this.groupData);
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupSettings.settingsSaved:Settings saved to your group!`));
            })
            .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@groupSettings.unableToSaveGroupSettings:Unable to save the settings to your group, please try again!`)))
        }
      }));
  }

  selectShuttleSection(column: any) {

    this.utilityService.asyncNotification($localize`:@@groupSettings.pleaseWaitsavingSettings:Please wait we are saving the new setting...`,
      new Promise((resolve, reject)=>{
        this.groupService.selectShuttleSection(this.groupData?._id, column)
        .then((res)=> {
          this.publicFunctions.sendUpdatesToGroupData(res['group']);
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupSettings.settingsSaved:Settings saved to your group!`));
        })
        .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@groupSettings.unableToSaveGroupSettings:Unable to save the settings to your group, please try again!`)))
      }));
  }

  openRAGModal(){
    const dialogRef = this.dialog.open(GroupRAGDialogComponent, {
      width: '100%',
      height: '100%',
      disableClose: true,
      data: { groupData: this.groupData }
    });
    const sub = dialogRef.componentInstance.closeEvent.subscribe(async (data) => {
      this.groupData = await this.publicFunctions.getCurrentGroupDetails();
    });
    dialogRef.afterClosed().subscribe(result => {
      sub.unsubscribe();
    });
  }
}
