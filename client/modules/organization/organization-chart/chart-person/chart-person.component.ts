import { Component, OnInit, Injector, Input, Output, EventEmitter } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
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

  @Output() nextLevelMembersEmitter = new EventEmitter();

  workspaceData;

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  // Utility Service
  public utilityService = this.injector.get(UtilityService);

  // Subsink to add subscriptions to this array
  public subSink = new SubSink();

  constructor(
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
}
