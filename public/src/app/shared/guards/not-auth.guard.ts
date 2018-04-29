import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../services/auth.service';

@Injectable()
export class NotAuthGuard implements CanActivate {

  constructor(private _auth: AuthService, private _router: Router) {
  }
  canActivate(): boolean {
    if (!this._auth.isLoggedIn()) {
      return true;
    } else {

      this._router.navigate(['/dashboard/overview']);
      return false;

    }
  }

}
