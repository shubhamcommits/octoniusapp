// MODULES
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// COMPONENTS
import { AuthSignInComponent } from './auth-sign-in/auth-sign-in.component';

const routes: Routes = [
  // 'sign-in' ROUTE
  {
    path: 'sign-in',
    component: AuthSignInComponent
  }
];

// IMPORT & EXPORT
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule { }
