import { Component, Injector, Input, OnChanges, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { GroupsService } from 'src/shared/services/groups-service/groups.service';

@Component({
  selector: 'app-engagement-card',
  templateUrl: './engagement-card.component.html',
  styleUrls: ['./engagement-card.component.scss']
})
export class EngagementCardComponent implements OnChanges {

  @Input() period;

  // Current Workspace Data
  workspaceData: any

  groups: any = [];

  num_agoras = 0;
  num_topics = 0;
  num_highly_engaged = 0;

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector)

  constructor(
    private groupsService: GroupsService,
    private groupService: GroupService,
    private injector: Injector
  ) { }

  ngOnChanges() {
    this.initView();
  }

  async initView() {
    // Call the HTTP API to fetch the current workspace details
    this.workspaceData = await this.publicFunctions.getWorkspaceDetailsFromHTTP();

    this.num_agoras = 0;
    this.num_topics = 0;
    this.num_highly_engaged = 0;

    this.groups = await this.getGroups();

    const comparingDate = moment().local().subtract(this.period, 'days').toDate();

    for (let group of this.groups) {
      if (group.type === 'agora' && (new Date(group.created_date)).getTime() >= comparingDate.getTime()) {
        this.num_agoras++;
      }
      // if (group.type === 'normal') this.num_groups++;
      // else this.num_groups++;

      this.getTopicsCount(group._id);
    }
  }

  async getGroups() {
    return new Promise((resolve, reject) => {
      this.groupsService.getWorkspaceGroups(this.workspaceData._id)
        .then((res) => {
          resolve(res['groups'])
        })
        .catch(() => {
          reject([])
        });
    })
  }

  /**
   * This function returns the count of  pulse
   */
  async getTopicsCount(groupId) {
    return new Promise((resolve, reject) => {
      this.groupService.getPostsCount(groupId, this.period)
        .then((res) => {
          this.num_topics += res['numPosts'];
          resolve(res['numPosts'])
        })
        .catch(() => reject(0));
    })
  }

}
