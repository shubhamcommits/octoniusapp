import { Component, Injector, Input, OnDestroy, OnChanges, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-shuttle-task',
  templateUrl: './shuttle-task.component.html',
  styleUrls: ['./shuttle-task.component.scss']
})
export class ShuttleTaskComponent implements OnChanges, OnInit, OnDestroy {

  @Input() postData: any;
  @Input() groupData: any;
  @Input() userData: any;
  @Input() isShuttleTasksModuleAvailable = false;

  currentShuttle: any;
  shuttleColumns: any = [];

  // Create subsink class to unsubscribe the observables
  public subSink = new SubSink();

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    private injector: Injector,
  ) { }

  async ngOnChanges() {

  }

  async ngOnInit() {
    if (this.postData?.task?.shuttles) {
      this.currentShuttle = this.postData?.task?.shuttles[this.postData?.task?.shuttles.length - 1];
      if (this.currentShuttle) {
        this.shuttleColumns = await this.publicFunctions.getAllColumns(this.currentShuttle?._shuttle_group?._id || this.currentShuttle?._shuttle_group);
      }

      // order shuttles based on the date shuttled
      this.postData.task.shuttles = await this.postData?.task?.shuttles.sort((s1, s2) => {
          return (moment.utc(s1?.shuttled_at).isBefore(s2.shuttled_at)) ? 1 : -1;
        });

    } else {
      this.currentShuttle = null;
    }
  }

  /**
   * Unsubscribe all the observables on destroying the component
   */
  ngOnDestroy() {
    this.subSink.unsubscribe()
  }
}
