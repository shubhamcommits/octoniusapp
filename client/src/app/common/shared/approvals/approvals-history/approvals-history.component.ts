import { Component, Input, Output, OnChanges, EventEmitter, ViewChild, ViewEncapsulation, Injector, OnInit } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { PublicFunctions } from 'modules/public.functions';
import { environment } from 'src/environments/environment';
import { ApprovalService } from 'src/shared/services/approval-service/approval.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-approvals-history',
  templateUrl: './approvals-history.component.html',
  styleUrls: ['./approvals-history.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ApprovalsHistoryComponent implements OnChanges, OnInit {

  @Input() groupId;
  @Input() userData;
  @Input() itemData: any; // this could be a file or a post
  @Input() type; // post/file

  groupData;

  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  // Subsink Object
  subSink = new SubSink();

  constructor(
    private approvalService: ApprovalService,
    public utilityService: UtilityService,
    private injector: Injector
  ) { }

  ngOnChanges() {
  }

  async ngOnInit() {

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subSink.unsubscribe();
  }
}
