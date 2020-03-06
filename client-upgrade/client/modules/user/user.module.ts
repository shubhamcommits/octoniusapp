import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/common/shared/shared.module';

import { UserRoutingModule } from './user-routing.module';
import { UserHeaderComponent } from './user-header/user-header.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserCloudsComponent } from './user-clouds/user-clouds.component';
import { UserInformationComponent } from './user-information/user-information.component';
import { UserProfessionalInformationComponent } from './user-profile/user-professional-information/user-professional-information.component';
import { UserSkillsComponent } from './user-profile/user-skills/user-skills.component';


@NgModule({
  declarations: [UserHeaderComponent, UserProfileComponent, UserCloudsComponent, UserInformationComponent, UserProfessionalInformationComponent, UserSkillsComponent],
  imports: [
    CommonModule,
    SharedModule,
    UserRoutingModule
  ]
})
export class UserModule { }
