import { Component, OnInit, HostListener, Injector, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';
import { AuthService } from 'src/shared/services/auth-service/auth.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';

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
  
  // Subscription Data Object
  @Input('subscription') subscription: any;
  
  @Output() subscriptionCreated = new EventEmitter();

  publicFunctions = new PublicFunctions(this.injector);
  
  constructor(
    private injector: Injector,
    private router: Router,
    private authService: AuthService,
    private storageService: StorageService) { }

  async ngOnInit() {
  }

  onSubscriptionChanges(subscription) {
    this.subscriptionCreated.emit(subscription);
  }

  removeWorkspace() {
    this.authService.signout();

    this.storageService.clear();
    this.publicFunctions.sendUpdatesToRouterState({});
    this.publicFunctions.sendUpdatesToUserData({});
    this.router.navigate(['/home']);
  }
}
