import { Component, OnInit } from '@angular/core';
import { WorkspaceService } from '../../../shared/services/workspace.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-groups-page-header',
  templateUrl: './groups-page-header.component.html',
  styleUrls: ['./groups-page-header.component.scss']
})
export class GroupsPageHeaderComponent implements OnInit {

  constructor(private _workspaceService: WorkspaceService) { }
  workspaceImageUrl;
  user_data;
  ngOnInit() {
    this.user_data = JSON.parse(localStorage.getItem('user'));

    this.loadWorkspace();
  }

  loadWorkspace() {
    this._workspaceService.getWorkspace(this.user_data.workspace)
      .subscribe((res) => {
        if (res['workspace']['workspace_avatar'] == '') {
          this.workspaceImageUrl = '/assets/images/organization.png';
        } else {
          this.workspaceImageUrl = environment.BASE_URL + `/uploads/${res['workspace']['workspace_avatar']}`;
        }

      }, (err) => {

      });
  }

}
