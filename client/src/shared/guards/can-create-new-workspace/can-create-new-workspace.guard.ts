import { Injectable ,Injector} from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { AuthService } from 'src/shared/services/auth-service/auth.service';

@Injectable({
  providedIn: 'root',
})
export class CanCreateNewWorkspaceGuard implements CanActivate  {

  private publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private router: Router,
    private injector: Injector
  ) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    return this.checkUserCanCreateNewWorkspace();
  }

  async checkUserCanCreateNewWorkspace() {
    let authService = this.injector.get(AuthService);
    const currentGroup: any = await this.publicFunctions.getCurrentGroupDetails();
    return await authService.isNewWorkplacesAvailable().then(res => {
      if (!!res['status']) {
        return true;
      } else {
        this.router.navigate(['authentication', 'select-workspace']);
        return false;
      }
    });
  }
}
