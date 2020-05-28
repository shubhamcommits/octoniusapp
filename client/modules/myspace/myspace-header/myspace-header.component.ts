import { Component, OnInit, Injector } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';
import { PublicFunctions } from 'src/app/dashboard/public.functions';

@Component({
  selector: 'app-myspace-header',
  templateUrl: './myspace-header.component.html',
  styleUrls: ['./myspace-header.component.scss']
})
export class MyspaceHeaderComponent implements OnInit {

  constructor(
    private utilityService: UtilityService,
    private injector: Injector
  ) { }

  // CURRENT USER DATA
  userData: any;

  // BASE URL OF THE APPLICATION
  BASE_URL = environment.UTILITIES_USERS_UPLOADS;

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink();

  // Public Functions Object
  publicFunctions = new PublicFunctions(this.injector)

  // Show Extended Navigation bar
  showExtendedNav = false;

  async ngOnInit() {

    // GETTING USER DATA FROM THE SHARED SERVICE
    this.subSink.add(
      this.utilityService.currentUserData
        .subscribe(res => this.userData = res)
    );

    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'home'
    })

  }

  /**
   * This functions unsubscribes all the observables subscription to avoid memory leak
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

}
