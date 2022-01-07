import { Component, OnInit, OnDestroy, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { RouteStateService } from 'src/shared/services/router-service/route-state.service';
import { UserService } from 'src/shared/services/user-service/user.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit, OnDestroy {

  groupId;

  // Public Functions Object
  publicFunctions = new PublicFunctions(this.injector);

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink();

  constructor(
    private injector: Injector,
    private routeStateService: RouteStateService
  ) {


    this.subSink.add(this.routeStateService?.pathParams.subscribe(async (res) => {
      if (res && res.queryParams) {
        this.groupId = res.queryParams.group;
      }
    }));
  }

  async ngOnInit() {

    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'group'
    });

    // const userService = this.injector.get(UserService);

    // const userData = await this.publicFunctions.getCurrentUser();

    /*
    if (userData && this.groupId) {
      userService.increaseGroupVisit(userData._id, this.groupId).then(res => {
        if (res) {
          this.publicFunctions.sendUpdatesToUserData(res['user']);
        }
      });
    }
    */
  }

  /**
   * This function unsubscribes all the observables as soon as the component is destroyed
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

}
