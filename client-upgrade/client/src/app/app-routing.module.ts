import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './common/page-not-found/page-not-found.component';
import { WelcomePageComponent } from './common/welcome-page/welcome-page.component';
import { AuthenticationGuard } from 'src/shared/guards/authentication-guard/authentication.guard';
import { RoutingGuard } from 'src/shared/guards/routing-guard/routing.guard';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: WelcomePageComponent, canActivate: [RoutingGuard] },
  { path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule', canActivate:[AuthenticationGuard] },
  { path: 'authentication', loadChildren: './authentication/authentication.module#AuthenticationModule', canActivate:[RoutingGuard] },
  { path: '**', component: PageNotFoundComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers:[AuthenticationGuard]
})
export class AppRoutingModule { }
