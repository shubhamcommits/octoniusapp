import { Component, OnInit, HostListener, Injector, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';

@Component({
  selector: 'app-start-subscription',
  templateUrl: './start-subscription.component.html',
  styleUrls: ['./start-subscription.component.scss']
})
export class StartSubscriptionComponent implements OnInit {

  
  // Workspace Data Object
  @Input('workspaceData') workspaceData: any;
  
  // User Data Object
  @Input('userData') userData: any;
  
  // Public Functions Object
  @Input('publicFunctions') publicFunctions: any;
  
  // Subscription Data Object
  @Input('subscription') subscription: any;
  
  @Output() subscriptionCreated = new EventEmitter();
  
  constructor(private injector: Injector) { }

  async ngOnInit() {
  }

  onSubscriptionChanges(subscription) {
    this.subscriptionCreated.emit(subscription);
  }
}
