import { Component, Injector, Input, OnChanges } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-top-social-card',
  templateUrl: './top-social-card.component.html',
  styleUrls: ['./top-social-card.component.scss']
})
export class TopSocialCardComponent implements OnChanges {

  @Input() type = 'group'; // workspace or group
  @Input() filteringGroups; // For workspace type we will filter the
  @Input() period;

  groupName = '';

  // Base URL
  baseUrl = environment.UTILITIES_GROUPS_UPLOADS;

  // Workspace data
  public workspaceData: any = {};

  // Members
  public members: any = [];

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  // IsLoading behavior subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  constructor(
    private injector: Injector
  ) { }

  ngOnChanges() {
    // Starts the spinner
    this.isLoading$.next(true);

    this.initView();
  }

  async initView() {
    if (this.filteringGroups) {
      this.filteringGroups = this.filteringGroups.map(group => (group._id || group));
    }

    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    this.members = await this.publicFunctions.getWorkspaceMembersSocialStats(this.workspaceData?._id, this.period, this.filteringGroups);
console.log(this.members);
    // Stops the spinner and return the value with ngOnInit
    return this.isLoading$.next(false);
  }
}
