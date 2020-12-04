import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConnectSlackComponent } from './connect-slack/connect-slack.component';
import { SlackAccountDetailsComponent } from './slack-account-details/slack-account-details.component';
// import { GoogleAccountDetailsComponent } from './google-account-details/google-account-details.component';


@NgModule({
  declarations: [ConnectSlackComponent, SlackAccountDetailsComponent],
  imports: [
    CommonModule
  ],
  exports: [
    ConnectSlackComponent,
    SlackAccountDetailsComponent
  ]
})
export class SlackCloudModule { }
