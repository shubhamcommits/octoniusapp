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
  @Input() parentId; // groupId or workspaceId depending where is the widget used

  // Members
  public members: any = [];

  userData: any;

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  // IsLoading behavior subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  constructor(
    private injector: Injector
  ) { }

  async ngOnInit() {
    this.userData = await this.publicFunctions.getCurrentUser();
  }

  async ngOnChanges() {
    // Starts the spinner
    this.isLoading$.next(true);

    await this.initView();
  }

  async initView() {
    if (this.filteringGroups) {
      this.filteringGroups = this.filteringGroups.map(group => (group._id || group));
    }

    if (this.type === 'group') {
      this.members = await this.publicFunctions.getGroupMembersSocialStats(this.parentId, this.period);
    } else {
      this.members = await this.publicFunctions.getWorkspaceMembersSocialStats(this.parentId, this.period, this.filteringGroups);
    }

    // Stops the spinner and return the value with ngOnInit
    return this.isLoading$.next(false);
  }
}
