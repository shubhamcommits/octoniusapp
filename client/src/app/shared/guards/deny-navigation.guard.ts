import Swal from 'sweetalert2';
import {map} from 'rxjs/operators';
import {Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate, Router} from '@angular/router';
import {AdminBillingComponent} from "../../dashboard/admin/admin-billing/admin-billing.component";
import {WorkspaceService} from "../services/workspace.service";
import { StorageService } from '../services/storage-service/storage.service';

@Injectable()

export class DenyNavigationGuard implements CanDeactivate<AdminBillingComponent> {

  workspaceId;

  constructor(
    private workspaceService: WorkspaceService,
    private storageService: StorageService,
    private router: Router
  ) {}

  canDeactivate(
    component: AdminBillingComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot) {

      if(localStorage.length > 0){
        this.workspaceId = JSON.parse(localStorage.getItem('user'))._workspace._id;
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
