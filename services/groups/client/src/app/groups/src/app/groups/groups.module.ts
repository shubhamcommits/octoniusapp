import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GroupsRoutingModule } from './groups-routing.module';
import { GroupsHeaderComponent } from './groups-header/groups-header.component';
import { GroupsListComponent } from './groups-list/groups-list.component';
import { PulseComponent } from './pulse/pulse.component';
import { GroupsService } from 'src/shared/services/groups-service/groups.service';


@NgModule({
  declarations: [GroupsHeaderComponent, GroupsListComponent, PulseComponent],
  imports: [
    CommonModule,
    GroupsRoutingModule
  ],
  providers: [GroupsService]
})
export class GroupsModule { }
