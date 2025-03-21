import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SearchHeaderComponent } from './search-header/search-header.component';
import { SearchResultsComponent } from './search-results/search-results.component';

const routes: Routes = [
  {
    path: '', component: SearchHeaderComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchRoutingModule { }
