import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthSignInComponent } from './auth-sign-in/auth-sign-in.component';
import { AuthSignUpComponent } from './auth-sign-up/auth-sign-up.component';
import { AuthNewWorkplaceComponent } from './auth-new-workplace/auth-new-workplace.component';

const routes: Routes = [
  { path: 'signin', component: AuthSignInComponent },
  { path: 'signup', component: AuthSignUpComponent },
  { path: 'new-workplace', component: AuthNewWorkplaceComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule { }
