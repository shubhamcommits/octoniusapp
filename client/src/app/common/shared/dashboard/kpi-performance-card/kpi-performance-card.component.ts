import { Component, Injector, Input, OnChanges } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ColumnService } from 'src/shared/services/column-service/column.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-kpi-performance-card',
  templateUrl: './kpi-performance-card.component.html',
  styleUrls: ['./kpi-performance-card.component.scss']
})
export class KpiPerformanceCardComponent implements OnChanges {

  @Input() parentId; // This could be a groupId or a workspaceId
  @Input() type = 'group'; // workspace or group
  @Input() filteringProjects; // For workspace type we will filter the

  groupName = '';

  // Workspace data
  public workspaceData: Object = {};

  // Projects
  public projects: any = [];

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  // IsLoading behavior subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  constructor(
    private columnService: ColumnService,
    private groupService: GroupService,
    private utilityService: UtilityService,
    private injector: Injector
  ) { }

  async ngOnChanges() {
    // Starts the spinner
    this.isLoading$.next(true);

    await this.initView();

    await this.initTimeTrackingEntities();
  }

  async initView() {

    if (this.parentId) {
      // Fetches the groups from the server
      this.projects = await this.getProjectColumns(this.parentId)
        .catch(() => {
          // If the function breaks, then catch the error and console to the application
          this.publicFunctions.sendError(new Error($localize`:@@kpiPerformanceCard.unableToConnectServer:Unable to connect to the server, please try again later!`));
          this.isLoading$.next(false);
        });
    }

    if (!this.projects) {
      this.projects = [];
    }

    // Stops the spinner and return the value with ngOnInit
    return this.isLoading$.next(false);
  }

  async initTimeTrackingEntities() {
    if (this.type == 'group') {
      let timeTrackingEntities = [];
      await this.groupService.getGroupTimeTrackingEntites(this.parentId, null, null, null).then(res => {
        timeTrackingEntities = res['timeTrackingEntities'];
      });

      timeTrackingEntities.forEach(async tte => {
        const index = (!!this.projects) ? this.projects.findIndex(p => p?._id == (tte?._task?.task?._column?._id || tte?._task?.task?._column)) : -1;
        if (index >= 0) {
          tte?.times?.forEach(time => {
            if (!this.projects[index].timeTrackingEntitiesMapped) {
              this.projects[index].timeTrackingEntitiesMapped = [];
            }

            this.projects[index].timeTrackingEntitiesMapped.push({
              _id: time._id,
              amount: time.cost,
              hours: time.hours,
              minutes: time.minutes
            });
          });

          this.projects[index].timeTrackingEntitiesMapped = await this.utilityService.removeDuplicates([...this.projects[index].timeTrackingEntitiesMapped], '_id');
        }
      });
    } else {
      await this.projects.forEach(async project => {
        let timeTrackingEntities = [];
        await this.groupService.getSectionTimeTrackingEntities(project._id).then(async res => {
          timeTrackingEntities = timeTrackingEntities.concat(res['timeTrackingEntities']);
          timeTrackingEntities = await this.utilityService.removeDuplicates(timeTrackingEntities, '_id');
        });

        timeTrackingEntities.forEach(async tte => {
          tte?.times?.forEach(time => {
            if (!project.timeTrackingEntitiesMapped) {
              project.timeTrackingEntitiesMapped = [];
            }

            project.timeTrackingEntitiesMapped.push({
              _id: time._id,
              amount: time.cost,
              hours: time.hours,
              minutes: time.minutes
            });
          });

          project.timeTrackingEntitiesMapped = await this.utilityService.removeDuplicates([...project.timeTrackingEntitiesMapped], '_id');
        });
      });
    }
  }

  /**
   * This function is resposible for fetching first 10 groups present in the workplace
   * @param workspaceId
   */
  public async getProjectColumns(parentId: string) {
    if (this.type == 'group') {
      return new Promise((resolve, reject) => {
        this.columnService.getGroupProjectColumns(parentId)
          .then((res) => resolve(res['columns']))
          .catch(() => reject([]))
      });
    } else if (this.type == 'workspace') {
      return new Promise(async (resolve, reject) => {
        if (this.filteringProjects && this.filteringProjects.length > 0) {
          resolve(this.filteringProjects);
        } else {
          const currentUser = await this.publicFunctions.getCurrentUser();
          this.columnService.getAllProjectColumns(parentId, currentUser._id)
            .then((res) => resolve(res['columns']))
            .catch(() => reject([]));
        }
      });
    }
  }
}
