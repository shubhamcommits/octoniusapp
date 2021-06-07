import { Component, Injector, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';

@Component({
  selector: 'app-people-directory-card',
  templateUrl: './people-directory-card.component.html',
  styleUrls: ['./people-directory-card.component.scss']
})
export class PeopleDirectoryCardComponent implements OnInit {

  // Current Workspace Data
  workspaceData: any

  users: any = [];
  guests: any = [];

  num_users = 0;
  num_global_managers = 0;
  num_group_managers = 0;
  num_members =  0;
  num_guests = 0;

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector)

  constructor(
    private workspaceService: WorkspaceService,
    private injector: Injector
  ) { }

  ngOnInit() {
    this.initView();
  }

  async initView() {
    // Call the HTTP API to fetch the current workspace details
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.num_users = 0;
    this.num_global_managers = 0;
    this.num_group_managers = 0;
    this.num_members = 0;
    this.num_guests = 0;

    this.users = await this.getUsers();
    this.guests = await this.getGuests();

    for (let user of this.users) {
      if (user.role === 'admin' || user.role === 'owner') this.num_global_managers++;
      if (user.role === 'manager') this.num_group_managers++;
      if (user.role === 'member') this.num_members++;
    }

    this.num_users = this.users.length;
    this.num_guests = this.guests.length;
  }

  async getUsers() {
    return new Promise((resolve, reject) => {
      this.workspaceService.getWorkspaceUsers(this.workspaceData._id)
        .then((res) => {
          resolve(res['users'])
        })
        .catch(() => {
          reject([])
        });
    });
  }

  async getGuests() {
    return this.workspaceData.invited_users.filter((guest) => {
      return (guest.accepted);
    });
  }

}
