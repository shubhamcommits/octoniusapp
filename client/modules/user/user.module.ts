import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/common/shared/shared.module';

import { UserRoutingModule } from './user-routing.module';
import { UserHeaderComponent } from './user-header/user-header.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserCloudsComponent } from './user-clouds/user-clouds.component';
import { UserInformationComponent } from './user-information/user-information.component';
import { UserProfessionalInformationComponent } from './user-profile/user-professional-information/user-professional-information.component';
import { UserAvailableCloudsComponent } from './user-clouds/user-available-clouds/user-available-clouds.component';
import { UserConnectedCloudsComponent } from './user-clouds/user-connected-clouds/user-connected-clouds.component';

import { GoogleCloudModule } from './user-clouds/user-available-clouds/google-cloud/google-cloud.module';
import { UserService } from 'src/shared/services/user-service/user.service';
import { SlackCloudModule } from './user-clouds/user-available-clouds/slack/slack.module';
import { BoxCloudModule } from './user-clouds/user-available-clouds/box-cloud/box-cloud.module';
import { TeamModule } from './user-clouds/user-available-clouds/team/team.module';
import { ZapModule } from './user-clouds/user-available-clouds/zapier/zapier.module';
import { UserWorkloadComponent } from './user-workload/user-workload.component';
import { MatSelectModule } from '@angular/material/select';
import { UserPasswordUpdateComponent } from './user-profile/user-password-update/user-password-update.component';
import { UserProfileCustomFieldsComponent } from './user-profile/user-profile-custom-fields/user-profile-custom-fields.component';
import { FormsModule } from '@angular/forms';
import { UserHiveComponent } from './user-hive/user-hive.component';
import { OrganizationHRModule } from 'modules/organization/hr/organization-hr.module';
import { MS365CloudModule } from './user-clouds/user-available-clouds/ms-365/ms-365-cloud.module';
import { UserMyGroupSettingsComponent } from './user-my-group-settings/user-my-group-settings.component';


@NgModule({
    declarations: [
        UserHeaderComponent,
        UserProfileComponent,
        UserCloudsComponent,
        UserInformationComponent,
        UserHiveComponent,
        UserProfessionalInformationComponent,
        UserAvailableCloudsComponent,
        UserConnectedCloudsComponent,
        UserWorkloadComponent,
        UserMyGroupSettingsComponent,
        UserPasswordUpdateComponent,
        UserProfileCustomFieldsComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        GoogleCloudModule,
        BoxCloudModule,
        MS365CloudModule,
        SlackCloudModule,
        TeamModule,
        ZapModule,
        UserRoutingModule,
        MatSelectModule,
        OrganizationHRModule
    ],
    providers: [
        UserService
    ],
    exports: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UserModule { }
