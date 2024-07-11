import { Component, OnInit, Injector, Input } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';

@Component({
  selector: 'app-payroll-setup-card',
  templateUrl: './payroll-setup-card.component.html',
  styleUrls: ['./payroll-setup-card.component.scss']
})
export class PayrollSetupCardComponent implements OnInit {

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
