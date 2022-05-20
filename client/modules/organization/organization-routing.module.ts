import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrganizationComponent } from './organization/organization.component';
import { PeopleDirectorySearchResultsComponent } from './people-directory/people-directory-search-results/people-directory-search-results.component';
import { PeopleDirectoryComponent } from './people-directory/people-directory.component';

const routes: Routes = [
  {
    path: '', component: OrganizationComponent
  },
  {
    path: 'directory', component: PeopleDirectoryComponent
  },
  /*
  {
    path: 'chart', component: OrganizationComponent
  }
  */
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationRoutingModule { }
