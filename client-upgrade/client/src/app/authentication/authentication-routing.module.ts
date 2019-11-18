import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthSignInComponent } from './auth-sign-in/auth-sign-in.component';

const routes: Routes = [
  { path: 'signin', component: AuthSignInComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule { }
