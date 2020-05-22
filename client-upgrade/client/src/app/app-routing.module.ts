// MODULES
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// COMPONENTS
import { PageNotFoundComponent } from './common/page-not-found/page-not-found.component';

// GUARDS
import { AuthenticationGuard } from 'src/shared/guards/authentication-guard/authentication.guard';
import { RoutingGuard } from 'src/shared/guards/routing-guard/routing.guard';

// Preloading Routes Strategy
// import { QuicklinkStrategy, QuicklinkModule } from 'ngx-quicklink';


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
    loadChildren: () => import('modules/home/home.module')
      .then((module) => module.HomeModule),
    canActivate: [RoutingGuard],
  },

  // 'dashboard' ROUTE - LAZY LOAD THE DASHBOARD MODULE
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module')
      .then((module) => module.DashboardModule),
    canActivate: [AuthenticationGuard]
  },

  // 'authentication' ROUTE - LAZY LOAD THE AUTHENTICATION MODULE
  {
    path: 'authentication',
    loadChildren: () => import('modules/authentication/authentication.module')
      .then((module) => module.AuthenticationModule),
    canActivate: [RoutingGuard]
  },

  // 'document' ROUTE - LAZY LOAD THE OCTODOC MODULE
  {
    path: 'document',
    loadChildren: () => import('modules/folio/folio.module')
      .then((module) => module.FolioModule)
  },

  // NOT FOUND ROUTE
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

// IMPORTS, EXPORTS, & PROVIDERS
@NgModule({
  imports: [

    // ROUTER MODULE
    RouterModule.forRoot(routes),

  ],
  exports: [RouterModule],
  providers: [AuthenticationGuard]
})
export class AppRoutingModule { }
