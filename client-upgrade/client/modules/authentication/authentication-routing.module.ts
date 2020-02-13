// MODULES
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// COMPONENTS
import { AuthNewWorkplaceComponent } from './auth-new-workplace/auth-new-workplace.component';
import { AuthSignInComponent } from './auth-sign-in/auth-sign-in.component';
import { AuthSignUpComponent } from './auth-sign-up/auth-sign-up.component';

const routes: Routes = [
  // 'signin' ROUTE
  {
    path: 'signin',
    component: AuthSignInComponent
  },

  // 'signup' ROUTE
  {
    path: 'signup',
    component: AuthSignUpComponent
  },

  // 'new-workplace' ROUTE
  {
    path: 'new-workplace',
    component: AuthNewWorkplaceComponent
  }
];

// IMPORT & EXPORT
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule { }
