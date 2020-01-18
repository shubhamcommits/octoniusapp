import { Component, OnInit, Injector } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'src/app/dashboard/public.functions';

@Component({
  selector: 'app-admin-billing',
  templateUrl: './admin-billing.component.html',
  styleUrls: ['./admin-billing.component.scss']
})
export class AdminBillingComponent implements OnInit {

  constructor(
    private injector: Injector
  ) { }

  // User Data Variable
  userData: any;

  // Workspace Data Varibale
  workspaceData: any;

  // Public Function Object
  publicFunctions = new PublicFunctions(this.injector)

  async ngOnInit() {

    let utilityService = this.injector.get(UtilityService)
    
    // Starts the foreground loader
    utilityService.startForegroundLoader();

    // Fetches the user data
    this.userData = await this.publicFunctions.getCurrentUser();

    // Fetches the workspace data
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    // Stops the foreground loader
    return utilityService.stopForegroundLoader();
  }


}
