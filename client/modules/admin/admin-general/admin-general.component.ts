import { Component, OnInit, Injector } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'src/app/dashboard/public.functions';

@Component({
  selector: 'app-admin-general',
  templateUrl: './admin-general.component.html',
  styleUrls: ['./admin-general.component.scss']
})
export class AdminGeneralComponent implements OnInit {

  constructor(
    private utilityService: UtilityService,
    private injector: Injector
  ) { }
  
  workspaceData: Object;

  userData: Object;
  
  publicFunctions = new PublicFunctions(this.injector);

  async ngOnInit() {
    //this.utilityService.startForegroundLoader();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    this.userData = await this.publicFunctions.getCurrentUser();
  }

  ngAfterViewChecked(): void {
   // this.utilityService.stopForegroundLoader();
  }

}
