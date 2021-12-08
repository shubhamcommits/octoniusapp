import { Component, Injector, Input, OnChanges } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { GroupsService } from 'src/shared/services/groups-service/groups.service';

@Component({
  selector: 'app-pulse-card',
  templateUrl: './pulse-card.component.html',
  styleUrls: ['./pulse-card.component.scss']
})
export class PulseCardComponent implements OnChanges {

  @Input() period;
  @Input() filteringGroups;

  // Workspace data
  public workspaceData: Object = {};

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  num_updates = 0;
  num_updates_period = 0;

  constructor(
    private groupService: GroupsService,
    private injector: Injector
  ) { }

  async ngOnChanges() {

    // Fetches the workspace data
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.initView();
  }

  async initView() {

    if (this.filteringGroups) {
      this.filteringGroups = this.filteringGroups.map(group => (group._id || group));
    }

    this.num_updates = 0;
    this.num_updates_period = 0;

    this.getPulseCount();
    this.getPulseCountPeriod();
  }

  /**
   * This function returns the count of  pulse
   */
  public async getPulseCount() {
    return new Promise((resolve, reject) => {
      this.groupService.getPulseCount(this.workspaceData['_id'], this.filteringGroups)
        .then((res) => {
          this.num_updates = res['numPulse'];
          resolve(res['numPulse'])
        })
        .catch(() => reject(0));
    })
  }

  /**
   * This function returns the count of  pulse
   */
  public async getPulseCountPeriod() {
    return new Promise((resolve, reject) => {
      this.groupService.getPulseCount(this.workspaceData['_id'], this.filteringGroups, this.period.toString())
        .then((res) => {
          this.num_updates_period = res['numPulse'];
          resolve(res['numPulse'])
        })
        .catch(() => reject(0));
    })
  }

}
