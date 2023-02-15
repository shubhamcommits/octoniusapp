import { Component, Input, OnChanges, ViewEncapsulation, Injector, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-post-logs',
  templateUrl: './post-logs.component.html',
  styleUrls: ['./post-logs.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PostLogsComponent implements OnChanges, OnInit {

  @Input() logs;
  @Input() userData;

  groupData;

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  // Subsink Object
  subSink = new SubSink();

  constructor(
    public utilityService: UtilityService,
    private injector: Injector
  ) { }

  ngOnChanges() {
    if (this.logs) {
      this.sortLogs();
    }
  }

  ngOnInit() {
    if (this.logs) {
      this.sortLogs();
    }
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subSink.unsubscribe();
  }

  sortLogs() {
    this.logs?.sort((a1, a2) => {
      if (a1.action_date && a2.action_date) {
        if (moment.utc(a1.action_date).isBefore(a2.action_date)) {
          return 1;
        } else {
          return -1;
        }
      } else {
        if (a1.action_date && !a2.action_date) {
          return 1;
        } else if (!a1.action_date && a2.action_date) {
          return -1;
        }
      }
    });
  }
}
