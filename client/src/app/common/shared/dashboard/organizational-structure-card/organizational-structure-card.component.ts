import { Component, Injector, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { GroupsService } from 'src/shared/services/groups-service/groups.service';

@Component({
  selector: 'app-organizational-structure-card',
  templateUrl: './organizational-structure-card.component.html',
  styleUrls: ['./organizational-structure-card.component.scss']
})
export class OrganizationalStructureCardComponent implements OnInit {

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

  async initView() {
    // Call the HTTP API to fetch the current workspace details
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.num_groups = 0;
    this.num_agoras = 0;

    this.groups = await this.getGroups();

    for (let group of this.groups) {
      if (group.type === 'agora') this.num_agoras++;
      else this.num_groups++;
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

}
