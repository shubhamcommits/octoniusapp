import { Component, OnInit, Injector } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from '../../public.functions';

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
  
  publicFunctions = new PublicFunctions(this.injector);

  async ngOnInit() {
    this.utilityService.startForegroundLoader();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    this.utilityService.stopForegroundLoader();
  }

}
