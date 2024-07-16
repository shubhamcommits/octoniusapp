import { Component, OnInit, Injector, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-myspace-tasks',
  templateUrl: './myspace-tasks.component.html',
  styleUrls: ['./myspace-tasks.component.scss']
})
export class MyspaceTasksComponent implements OnInit, OnDestroy {

  // Modal Content
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  userData: any;

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector)

  constructor(
    private injector: Injector,
    private utilityService: UtilityService,
  ) { }

  async ngOnInit() {

    // Fetch the current user
    this.userData = await this.publicFunctions.getCurrentUser();

    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'home'
    });
  }

  ngOnDestroy() {
    this.utilityService.closeAllModals();
  }
}
