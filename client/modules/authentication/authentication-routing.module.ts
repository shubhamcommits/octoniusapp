// MODULES
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthJoinWorkplaceComponent } from './auth-join-workplace/auth-join-workplace.component';

// COMPONENTS
import { AuthNewWorkplaceComponent } from './auth-new-workplace/auth-new-workplace.component';
import { AuthSignInComponent } from './auth-sign-in/auth-sign-in.component';
import { AuthSignUpComponent } from './auth-sign-up/auth-sign-up.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SelectWorkspaceComponent } from './select-workspace/select-workspace.component';

const routes: Routes = [
  // 'sign-in' ROUTE
  {
    path: 'sign-in',
    component: AuthSignInComponent
  },

  // 'select-workspace' ROUTE
  {
    path: 'select-workspace',
    component: SelectWorkspaceComponent
  },

  // 'sign-up' ROUTE
  {
    path: 'sign-up',
    component: AuthSignUpComponent
  },

  // 'new-workplace' ROUTE
  {
    path: 'new-workplace',
    component: AuthNewWorkplaceComponent
  },

  // 'join-workplace' ROUTE
  {
    path: 'join-workplace',
    component: AuthJoinWorkplaceComponent
  },

  // 'reset-password' ROUTE
  {
    path: 'reset-password/:resetPwdId',
    component: ResetPasswordComponent
  }
];

// IMPORT & EXPORT
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule { }
