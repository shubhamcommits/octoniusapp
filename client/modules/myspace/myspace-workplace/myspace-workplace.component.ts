import { Component, OnInit, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-myspace-workplace',
  templateUrl: './myspace-workplace.component.html',
  styleUrls: ['./myspace-workplace.component.scss']
})
export class MyspaceWorkplaceComponent implements OnInit {

  constructor(private injector: Injector) { }

  // Current User Data
  userData: any;

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector);

  async ngOnInit() {

    // Fetch current user details
    this.userData = await this.publicFunctions.getCurrentUser();

    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'home'
    })
  }

}
