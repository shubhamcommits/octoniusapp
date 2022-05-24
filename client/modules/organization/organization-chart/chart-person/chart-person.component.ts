import { Component, OnInit, Injector, Input, Output, EventEmitter } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-chart-person',
  templateUrl: './chart-person.component.html',
  styleUrls: ['./chart-person.component.scss']
})
export class ChartPersonComponent implements OnInit {

  @Input() person;
  @Input() selected = false;
  @Input() level = 0;

  @Output() nextLevelMembersEmitter = new EventEmitter();
  @Output() removeFromManagerEmitter = new EventEmitter();

  workspaceData;

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  // Utility Service
  public utilityService = this.injector.get(UtilityService);

  // Subsink to add subscriptions to this array
  public subSink = new SubSink();

  constructor(
    private userService: UserService,
    private workspaceService: WorkspaceService,
    private injector: Injector
  ) { }

  async ngOnInit() {
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.workspaceService.getOrganizationChartNextLevel(this.workspaceData?._id, this.person._id).then(res => {
      this.person.nextLevelMembers = res['members'];
    });
  }

  ngOnDestroy() {

  }

  openFullscreenModal(userId: string) {
    this.utilityService.openFullscreenModal(userId);
  }

  selectManager() {
    if (this.workspaceData && this.workspaceData?.manager_custom_field) {
      this.nextLevelMembersEmitter.emit({
        managerId: this.person?._id,
        nextLevelMembers: this.person?.nextLevelMembers
      });
    }
  }

  removeFromManager() {
    this.utilityService.asyncNotification($localize`:@@chartPerson.pleaseWaitsavingSettings:Please wait, we are saving the new setting...`,
      new Promise((resolve, reject)=>{
        this.userService.saveCustomField(this.person?._id, this.workspaceData?.manager_custom_field, null)
          .then(()=> {
            this.removeFromManagerEmitter.emit();
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@chartPerson.settingsSaved:Settings saved!`));
          })
          .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@chartPerson.unableToSaveGroupSettings:Unable to save the settings, please try again!`)));
      }));
  }
}
