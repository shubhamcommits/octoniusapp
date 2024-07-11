import { Component, OnInit, Injector } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';

@Component({
  selector: 'app-organization-hr',
  templateUrl: './organization-hr.component.html',
  styleUrls: ['./organization-hr.component.scss']
})
export class OrganizationHRComponent implements OnInit {

  userData;
  workspaceData;

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  // Utility Service
  public utilityService = this.injector.get(UtilityService);

  constructor(
    private injector: Injector,
    public dialog: MatDialog
  ) { }

  async ngOnInit() {

    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'hive-hr'
    });

    this.userData = await this.publicFunctions.getCurrentUser();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
  }
}
