import {Injectable, OnInit} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate} from '@angular/router';
import { Observable } from 'rxjs';
import {AdminBillingComponent} from "../../dashboard/admin/admin-billing/admin-billing.component";
import {WorkspaceService} from "../services/workspace.service";

@Injectable({
  providedIn: 'root'
})

export class DenyNavigationGuard implements CanDeactivate<AdminBillingComponent> {

  workspaceId;

  constructor(
    private workspaceService: WorkspaceService
  ) {}

  canDeactivate(
    component: AdminBillingComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot) {

    this.workspaceId = JSON.parse(localStorage.getItem('user')).workspace._id;
  // we want to check whether the owner of the workspace has paid
  //  If he has, we'll allow the user to navigate to other pages
  //   if he hasn't, the user won't be able to navigate away
    return this.workspaceService.getBillingStatus(this.workspaceId)
      .map((res) => {
        console.log('RES', res);
        return res['status'];
      });
  }
}
