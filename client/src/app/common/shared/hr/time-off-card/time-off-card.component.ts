import { Component, OnInit, Injector, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { HRService } from 'src/shared/services/hr-service/hr.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { DateTime } from 'luxon';
import { DatesService } from 'src/shared/services/dates-service/dates.service';

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
    public dialog: MatDialog,
    public datesService: DatesService,
    private hrService: HRService
  ) { }

  async ngOnInit() {
    if (!this.utilityService.objectExists(this.workspaceData)) {
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    }

    if (!this.utilityService.objectExists(this.userData)) {
      this.userData = await this.publicFunctions.getCurrentUser();
    }

    this.hrService.getTopMembersOff(this.workspaceData?._id).then(res => {
      this.membersOff = res['members'];
    });
  }

  formateDate(date: any) {
    return this.datesService.formateDate(date, DateTime.DATE_SHORT);
  }
}
