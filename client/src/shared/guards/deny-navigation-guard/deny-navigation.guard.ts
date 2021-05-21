import Swal from 'sweetalert2';
import {Injectable, Injector, } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate, Router, UrlTree, CanActivateChild} from '@angular/router';
import { Observable } from 'rxjs';
import { AdminBillingComponent } from 'modules/admin/admin-billing/admin-billing.component';
import { PublicFunctions } from 'modules/public.functions';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { AuthService } from 'src/shared/services/auth-service/auth.service';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Injectable()
export class DenyNavigationGuard implements CanActivate, CanActivateChild, CanDeactivate<AdminBillingComponent> {

  workspaceId;

  // PUBLIC FUNCTIONS
  private publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    private socketService: SocketService,
    private injector: Injector,
    private utilityService: UtilityService,
    private managementPortalService: ManagementPortalService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.checkBillingStatus();
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.checkBillingStatus();
  }

  async canDeactivate(
    component: AdminBillingComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot) {

      if (localStorage.length > 0 && !currentState.url.match('/logout*')) {
        const userData = await this.publicFunctions.getCurrentUser();
        this.workspaceId = userData._workspace;
        const currentWorkspace = await this.publicFunctions.getCurrentWorkspace();

        return this.managementPortalService.getBillingStatus(this.workspaceId, currentWorkspace['management_private_api_key']).then(
          (res) => {
            if ( !res['status'] ) {
              Swal.fire("Access restricted", "Please start your subscription.");
            }
            return res['status'];
          }).catch((err) => {
            this.router.navigate(['/home']);
            return false;
          });
      } else {
        return true;
      }

  }

  async checkBillingStatus() {

    let adminUser = false;
    const currentUser = await this.publicFunctions.getCurrentUser();
    let userAdminState = (currentUser.role === 'member' || currentUser.role === 'guest') ? false : true;
    if(userAdminState) {
      adminUser = true;
    }

    if (localStorage.length > 0) {
      const currentWorkspace = await this.publicFunctions.getCurrentWorkspace();
      const userData = await this.publicFunctions.getCurrentUser();
      this.workspaceId = userData._workspace;
      return this.managementPortalService.getBillingStatus(this.workspaceId, currentWorkspace['management_private_api_key']).then(
        (res) => {
          if (res['blocked'] ) {
            this.utilityService.warningNotification('Your workspace is not available, please contact your administrator!');
            this.authService.signout().subscribe((res) => {
              this.storageService.clear();
              this.publicFunctions.sendUpdatesToGroupData({});
              this.publicFunctions.sendUpdatesToRouterState({});
              this.publicFunctions.sendUpdatesToUserData({});
              this.publicFunctions.sendUpdatesToWorkspaceData({});
              this.socketService.disconnectSocket();
              this.router.navigate(['/home']);
            });
            return false;
          }

          if ( !res['status']) {
            if (!adminUser || res['onPremise'] || res['message'] == 'Workspace does not exist') {
              this.authService.signout().subscribe((res) => {
                this.storageService.clear();
                this.publicFunctions.sendUpdatesToGroupData({});
                this.publicFunctions.sendUpdatesToRouterState({});
                this.publicFunctions.sendUpdatesToUserData({});
                this.publicFunctions.sendUpdatesToWorkspaceData({});
                this.socketService.disconnectSocket();
                this.router.navigate(['/home']);
              });
            } else {
              if (adminUser && !res['onPremise']) {
                this.router.navigate(['dashboard', 'admin', 'billing']);
              }
            }
            return false;
          }

          return true;
        }).catch((err) => {
          this.router.navigate(['/home']);
          return false;
        });
    } else {
      return false;
    }
  }
}
