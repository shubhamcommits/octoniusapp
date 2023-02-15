import { Component, OnInit, OnDestroy, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit, OnDestroy {

  groupData;

  backgroundImageUrl = '';

  // Public Functions Object
  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector
  ) {
  }

  async ngOnInit() {

    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'group'
    });

    this.groupData =await this.publicFunctions.getCurrentGroupDetails();

    if (this.groupData && this.groupData?.background_image) {
      this.backgroundImageUrl = environment.UTILITIES_GROUPS_UPLOADS + '/' + (this.groupData?._workspace?._id || this.groupData?._workspace) + '/' + this.groupData?.background_image.replace(/\s/g, '%20') + '?noAuth=true';
    }
  }

  /**
   * This function unsubscribes all the observables as soon as the component is destroyed
   */
  ngOnDestroy(): void {
  }

}
