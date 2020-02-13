import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GroupsRoutingModule } from './groups-routing.module';
import { GroupsHeaderComponent } from './groups-header/groups-header.component';
import { GroupsListComponent } from './groups-list/groups-list.component';
import { PulseComponent } from './pulse/pulse.component';
import { GroupsService } from 'src/shared/services/groups-service/groups.service';
import { SharedModule } from 'src/app/common/shared/shared.module';
import { CreateGroupComponent } from './groups-list/create-group/create-group.component';


@NgModule({
  declarations: [GroupsHeaderComponent, GroupsListComponent, PulseComponent, CreateGroupComponent],
  imports: [
    CommonModule,
    GroupsRoutingModule,
    SharedModule
  ],
  providers: [GroupsService]
})
export class GroupsModule { }
