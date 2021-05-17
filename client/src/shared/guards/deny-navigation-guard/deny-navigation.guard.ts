import Swal from 'sweetalert2';
import {Injectable, Injector, } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate, Router, UrlTree, CanActivateChild} from '@angular/router';
import { Observable } from 'rxjs';
import { AdminBillingComponent } from 'modules/admin/admin-billing/admin-billing.component';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { PublicFunctions } from 'modules/public.functions';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { AuthService } from 'src/shared/services/auth-service/auth.service';
import { SocketService } from 'src/shared/services/socket-service/socket.service';

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
    private workspaceService: WorkspaceService,
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

        return this.workspaceService.getBillingStatus(this.workspaceId).then(
          (res) => {
            if ( !res['status'] ) {
              Swal.fire("Access restricted", "Please start your subscription.")
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
      const userData = await this.publicFunctions.getCurrentUser();
      this.workspaceId = userData._workspace;

      return this.workspaceService.getBillingStatus(this.workspaceId).then(
        (res) => {
          if ( !res['status'] ) {
            if (!adminUser || res['message'] == 'Workspace does not exist') {
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
              this.router.navigate(['dashboard', 'admin', 'billing']);
            }
            return false;
          }
          // return res['status'];
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
