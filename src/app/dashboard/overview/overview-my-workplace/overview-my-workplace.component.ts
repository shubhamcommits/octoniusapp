import { Component, OnInit } from '@angular/core';

import {WorkspaceService} from "../../../shared/services/workspace.service";

@Component({
  selector: 'app-overview-my-workplace',
  templateUrl: './overview-my-workplace.component.html',
  styleUrls: ['./overview-my-workplace.component.scss']
})
export class OverviewMyWorkplaceComponent implements OnInit {

  constructor(private workspaceService: WorkspaceService) { }

  ngOnInit() {
  }

}
