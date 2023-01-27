import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LibraryGuard } from 'src/shared/guards/library-guard/library.guard';
import { CollectionDetailsComponent } from './collection-details/collection-details.component';
import { CollectionNavbarComponent } from './collection-navbar/collection-navbar.component';
import { CollectionsComponent } from './collections/collections.component';
import { PageDetailsComponent } from './page-details/page-details.component';
import { PageNavbarComponent } from './page-navbar/page-navbar.component';

const routes: Routes = [
  { 
    path: '',
    component: CollectionsComponent
  },
  {
    path: 'collection', component: CollectionNavbarComponent, children: [
      { path: '', component: CollectionDetailsComponent }
    ]
  },
  {
    path: 'collection/page', component: PageNavbarComponent, children: [
      { path: '', component: PageDetailsComponent }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    LibraryGuard
  ]
})
export class LibraryRoutingModule { }
