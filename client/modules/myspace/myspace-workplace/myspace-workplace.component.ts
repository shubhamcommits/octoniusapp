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

  isIdeaModuleAvailable;

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector);

  async ngOnInit() {

    // Fetch current user details
    this.userData = await this.publicFunctions.getCurrentUser();

    const currentWorkspace = await this.publicFunctions.getCurrentWorkspace();
    this.isIdeaModuleAvailable = await this.publicFunctions.checkIdeaStatus(currentWorkspace['_id'], currentWorkspace['management_private_api_key']);

    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'home'
    })
  }

}
