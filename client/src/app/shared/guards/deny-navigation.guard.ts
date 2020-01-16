import Swal from 'sweetalert2';
import {map} from 'rxjs/operators';
import {Injectable, OnInit, } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate, Router} from '@angular/router';
import { Observable } from 'rxjs';
import {AdminBillingComponent} from "../../dashboard/admin/admin-billing/admin-billing.component";
import {WorkspaceService} from "../services/workspace.service";

@Injectable()

export class DenyNavigationGuard implements CanDeactivate<AdminBillingComponent> {

  workspaceId;

  constructor(
    private workspaceService: WorkspaceService,
    private router: Router
  ) {}

  canDeactivate(
    component: AdminBillingComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot) {

      if(localStorage.length > 0){
        this.workspaceId = JSON.parse(localStorage.getItem('user')).workspace._id;
        // we want to check whether the owner of the workspace has paid
        //  If he has, we'll allow the user to navigate to other pages
        //   if he hasn't, the user won't be able to navigate away
            return this.workspaceService.getBillingStatus(this.workspaceId).pipe(
              map((res) => {
                if ( !res['status'] ) {
                  Swal.fire("Access restricted", "Please start your subscription.")
                }
                return res['status'];
        
              }));
      }

      else{
        return true;
      }

  }
}
