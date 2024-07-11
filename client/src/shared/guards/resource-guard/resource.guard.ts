import { Injectable ,Injector} from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';

@Injectable({
  providedIn: 'root',
})
export class ResourceGuard   {

  private publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector
  ) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    return this.checkIsResourceGroup();
  }

  async checkIsResourceGroup() {
    const currentGroup: any = await this.publicFunctions.getCurrentGroupDetails();
    return !!currentGroup && !!currentGroup.type && currentGroup.type == 'resource';
  }
}
