import { Component, Injector, Input, OnChanges, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';

@Component({
  selector: 'app-people-directory-card',
  templateUrl: './people-directory-card.component.html',
  styleUrls: ['./people-directory-card.component.scss']
})
export class PeopleDirectoryCardComponent implements OnInit, OnChanges {

  @Input() period;

  // Current Workspace Data
  workspaceData: any

  users: any = [];

  num_users = 0;
  num_global_managers = 0;
  num_group_managers = 0;
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

  ngOnChanges() {
    this.initView();
  }

  async initView() {
    // Call the HTTP API to fetch the current workspace details
    this.workspaceData = await this.publicFunctions.getWorkspaceDetailsFromHTTP();

    this.num_users = 0;
    this.num_global_managers = 0;
    this.num_group_managers = 0;
    this.num_guests = 0;

    this.users = await this.getUsers();

console.log(this.users);

    this.num_users = this.users.length;
  }

  async getUsers() {
    return new Promise((resolve, reject) => {
      this.workspaceService.getWorkspaceUsers(this.workspaceData._id, this.period)
        .then((res) => {
          resolve(res['users'])
        })
        .catch(() => {
          reject([])
        });
    });
  }

}
