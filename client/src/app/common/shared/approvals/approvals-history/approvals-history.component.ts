import { Component, Input, OnChanges, ViewEncapsulation, Injector, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { environment } from 'src/environments/environment';
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
    public utilityService: UtilityService,
    private injector: Injector
  ) { }

  ngOnChanges() {
    if (this.itemData && this.itemData.approval_history) {
      this.sortHistory();
    }
  }

  ngOnInit() {
    if (this.itemData && this.itemData.approval_history) {
      this.sortHistory();
    }
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subSink.unsubscribe();
  }

  sortHistory() {
    this.itemData?.approval_history?.sort((a1, a2) => {
      if (a1.approval_date && a2.approval_date) {
        if (moment.utc(a1.approval_date).isBefore(a2.approval_date)) {
          return 1;
        } else {
          return -1;
        }
      } else {
        if (a1.approval_date && !a2.approval_date) {
          return 1;
        } else if (!a1.approval_date && a2.approval_date) {
          return -1;
        }
      }

    })
  }
}
