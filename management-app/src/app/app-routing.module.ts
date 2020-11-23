import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { AuthenticationGuard } from './shared/guards/authentication-guard/authentication.guard';
import { RoutingGuard } from './shared/guards/routing-guard/routing.guard';
import { PageNotFoundComponent } from './shared/Components/page-not-found/page-not-found.component';


const routes: Routes = [
  // MAIN OR DEFAULT ROUTE
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },

  // 'home' ROUTE
  {
    path: 'home',
    loadChildren: () => import('src/app/home/home.module')
      .then((module) => module.HomeModule),
    canActivate: [RoutingGuard],
  },

  // 'authentication' ROUTE - LAZY LOAD THE AUTHENTICATION MODULE
  {
    path: 'authentication',
    loadChildren: () => import('src/app/authentication/authentication.module')
      .then((module) => module.AuthenticationModule),
    canActivate: [RoutingGuard]
  },

  // 'authentication' ROUTE - LAZY LOAD THE AUTHENTICATION MODULE
  {
    path: 'dashboard',
    loadChildren: () => import('src/app/dashboard/dashboard.module')
      .then((module) => module.DashboardModule),
    canActivate: [AuthenticationGuard]
  },

  // NOT FOUND ROUTE
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [

    // ROUTER MODULE
    RouterModule.forRoot(routes, {
      onSameUrlNavigation: 'reload',
      preloadingStrategy: PreloadAllModules
    }),

  ],
  exports: [RouterModule],
  providers: [AuthenticationGuard]
})
export class AppRoutingModule { }
