import { Component, Injector, Input, OnChanges, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { GroupsService } from 'src/shared/services/groups-service/groups.service';

@Component({
  selector: 'app-organizational-structure-card',
  templateUrl: './organizational-structure-card.component.html',
  styleUrls: ['./organizational-structure-card.component.scss']
})
export class OrganizationalStructureCardComponent implements OnInit, OnChanges {

  @Input() period;

  // Current Workspace Data
  workspaceData: any

  groups: any = [];

  num_groups = 0;
  num_agoras = 0;

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector)

  constructor(
    private groupsService: GroupsService,
    private injector: Injector
  ) { }

  ngOnInit() {
    this.initView();
  }

  ngOnChanges() {
    this.initView();
  }

  async initView() {
    // Call the HTTP API to fetch the current workspace details
    this.workspaceData = await this.publicFunctions.getWorkspaceDetailsFromHTTP();

    this.num_groups = 0;
    this.num_agoras = 0;

    this.groups = await this.getGroups();

console.log(this.groups);

    for (let group of this.groups) {
      if (group.type === 'agora') this.num_agoras++;
      // if (group.type === 'normal') this.num_groups++;
      else this.num_groups++;
    }
  }

  async getGroups() {
    return new Promise((resolve, reject) => {
      this.groupsService.getWorkspaceGroups(this.workspaceData._id, this.period)
        .then((res) => {
          resolve(res['groups'])
        })
        .catch(() => {
          reject([])
        });
    })
  }

}
