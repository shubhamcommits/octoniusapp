import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SearchRoutingModule } from './search-routing.module';
import { SearchHeaderComponent } from './search-header/search-header.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/common/shared/shared.module';


@NgModule({
  declarations: [SearchHeaderComponent, SearchResultsComponent],
  imports: [
    CommonModule,
    FormsModule,
    SearchRoutingModule,
    SharedModule
  ],
  exports: [
    SearchHeaderComponent,
    SearchResultsComponent,
  ]
})
export class SearchModule { }
