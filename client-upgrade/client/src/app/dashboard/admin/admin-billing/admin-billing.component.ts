import {Component, OnInit, Injector} from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from '../../public.functions';

@Component({
  selector: 'app-admin-billing',
  templateUrl: './admin-billing.component.html',
  styleUrls: ['./admin-billing.component.scss']
})
export class AdminBillingComponent implements OnInit {

  constructor(
    private utilityService: UtilityService, 
    private injector: Injector
    ) { }

  userData: any;
  publicFunctions = new PublicFunctions(this.injector)
  workspaceData: any;

  async ngOnInit() {
    this.utilityService.startForegroundLoader();
    this.userData = await this.publicFunctions.getCurrentUser();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    return this.utilityService.stopForegroundLoader();
  }


}
