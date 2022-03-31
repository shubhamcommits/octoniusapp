import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/common/shared/shared.module';

import { UserRoutingModule } from './user-routing.module';
import { UserHeaderComponent } from './user-header/user-header.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserCloudsComponent } from './user-clouds/user-clouds.component';
import { UserInformationComponent } from './user-information/user-information.component';
import { UserProfessionalInformationComponent } from './user-profile/user-professional-information/user-professional-information.component';
import { UserSkillsComponent } from './user-profile/user-skills/user-skills.component';
import { UserAvailableCloudsComponent } from './user-clouds/user-available-clouds/user-available-clouds.component';
import { UserConnectedCloudsComponent } from './user-clouds/user-connected-clouds/user-connected-clouds.component';

import { GoogleCloudModule } from './user-clouds/user-available-clouds/google-cloud/google-cloud.module';
import { UserService } from 'src/shared/services/user-service/user.service';
import { SlackCloudModule } from './user-clouds/user-available-clouds/slack/slack.module';
import { TeamModule } from './user-clouds/user-available-clouds/team/team.module';
import { ZapModule } from './user-clouds/user-available-clouds/zapier/zapier.module';
import { UserWorkloadComponent } from './user-workload/user-workload.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { UserWorkloadCalendarComponent } from './user-workload/user-workload-calendar/user-workload-calendar.component';
import { UserAvailabilityDayDialogComponent } from './user-workload/user-availability-day-dialog/user-availability-day-dialog.component';
import { MatSelectModule } from '@angular/material/select';
import { UserPasswordUpdateComponent } from './user-profile/user-password-update/user-password-update.component';
import { UserProfileCustomFieldsComponent } from './user-profile/user-profile-custom-fields/user-profile-custom-fields.component';


@NgModule({
    declarations: [
        UserHeaderComponent,
        UserProfileComponent,
        UserCloudsComponent,
        UserInformationComponent,
        UserProfessionalInformationComponent,
        UserSkillsComponent,
        UserAvailableCloudsComponent,
        UserConnectedCloudsComponent,
        UserWorkloadComponent,
        UserWorkloadCalendarComponent,
        UserAvailabilityDayDialogComponent,
        UserPasswordUpdateComponent,
        UserProfileCustomFieldsComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        GoogleCloudModule,
        SlackCloudModule,
        TeamModule,
        ZapModule,
        UserRoutingModule,
        MatSelectModule,
        CalendarModule.forRoot({
            provide: DateAdapter,
            useFactory: adapterFactory
        })
    ],
    providers: [
        UserService
    ],
    exports: [
        UserAvailabilityDayDialogComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UserModule { }
