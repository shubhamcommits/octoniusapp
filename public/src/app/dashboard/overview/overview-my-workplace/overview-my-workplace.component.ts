import { Component, OnInit } from '@angular/core';

import {WorkspaceService} from "../../../shared/services/workspace.service";
import { GoogleCloudService } from '../../../shared/services/google-cloud.service';

@Component({
  selector: 'app-overview-my-workplace',
  templateUrl: './overview-my-workplace.component.html',
  styleUrls: ['./overview-my-workplace.component.scss']
})
export class OverviewMyWorkplaceComponent implements OnInit {

  constructor(private workspaceService: WorkspaceService, private googleService: GoogleCloudService) { }

  async ngOnInit() {
        //it refreshes the access token as soon as we visit any group
    if(localStorage.getItem('google-cloud') != null && localStorage.getItem('google-cloud-token') != null){
      await this.googleService.refreshGoogleToken();
      //we have set a time interval of 30mins so as to refresh the access_token in the group
      setInterval(async ()=>{
        await this.googleService.refreshGoogleToken();
        //this.refreshGoogleToken()
      }, 1800000);
  }
}

}
