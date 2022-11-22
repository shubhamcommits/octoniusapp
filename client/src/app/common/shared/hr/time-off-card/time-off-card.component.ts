import { Component, OnInit, Injector, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-time-off-card',
  templateUrl: './time-off-card.component.html',
  styleUrls: ['./time-off-card.component.scss']
})
export class TimeOffCardComponent implements OnInit {

  @Input() userData;
  @Input() workspaceData;

  membersOff = [];

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  // Utility Service
  public utilityService = this.injector.get(UtilityService);

  constructor(
    private injector: Injector,
    public dialog: MatDialog
  ) { }

  async ngOnInit() {
    if (!this.utilityService.objectExists(this.workspaceData)) {
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    }

    if (!this.utilityService.objectExists(this.userData)) {
      this.userData = await this.publicFunctions.getCurrentUser();
    }

    this.membersOff = this.workspaceData?.members?.slice(0, 4);
  }
}
