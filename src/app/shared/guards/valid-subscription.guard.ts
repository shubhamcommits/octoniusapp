import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import { Observable } from 'rxjs';
import {AuthService} from "../services/auth.service";

@Injectable()
export class ValidSubscriptionGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router){}


  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const userId = JSON.parse(localStorage.getItem('user')).user_id;

    return this.authService.checkSubscriptionValidity(userId)
      .map((res) => {
        console.log('res.valid', res.valid);
        if (!res.valid) {
          this.router.navigateByUrl('/dashboard/admin/billing');
        }
        return res.valid;
      })
  }
}
