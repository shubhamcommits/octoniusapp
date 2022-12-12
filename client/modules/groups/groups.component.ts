import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {

  userData: any;
  workspaceData: any;

  userIsManager = false;

  selectedTab;

  groupsLabel = $localize`:@@groups.groups:Groups`;
  portfolioLabel = $localize`:@@groups.portfolio:Portfolio`;

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public injector: Injector,
    private activatedRoute: ActivatedRoute
  ) {
    const portfolioParam = this.activatedRoute.snapshot.queryParamMap.get('selectedTab');
    this.selectedTab = (portfolioParam) ? 1 : 0;
  }

  async ngOnInit() {
    this.userData = await this.publicFunctions.getCurrentUser();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.userIsManager = ['owner', 'admin', 'manager'].includes(this.userData?.role);
  }

  ngOnDestroy() {
  }
}
