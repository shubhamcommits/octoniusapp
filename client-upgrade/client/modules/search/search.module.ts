import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SearchRoutingModule } from './search-routing.module';
import { SearchHeaderComponent } from './search-header/search-header.component';
import { SearchResultsComponent } from './search-results/search-results.component';


@NgModule({
  declarations: [SearchHeaderComponent, SearchResultsComponent],
  imports: [
    CommonModule,
    SearchRoutingModule
  ]
})
export class SearchModule { }
