import { Component, OnInit, Injector, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';

@Component({
  selector: 'app-hive-reports-card',
  templateUrl: './hive-reports-card.component.html',
  styleUrls: ['./hive-reports-card.component.scss']
})
export class HiveReportsCardComponent implements OnInit {

  @Input() userData;
  @Input() workspaceData;

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  // Utility Service
  public utilityService = this.injector.get(UtilityService);

  constructor(
    private userService: UserService,
    private workspaceService: WorkspaceService,
    private router: Router,
    private injector: Injector,
    public dialog: MatDialog
  ) { }

  async ngOnInit() {

  }
}
