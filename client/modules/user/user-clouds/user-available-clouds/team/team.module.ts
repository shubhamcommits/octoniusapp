import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamAccountDetailsComponent } from './team-account-details/team-account-details.component';
import { TeamAuthConfirmationComponent } from './team-auth-confirmation/team-auth-confirmation.component';



@NgModule({
  declarations: [TeamAccountDetailsComponent, TeamAuthConfirmationComponent],
  imports: [
    CommonModule
  ],
  exports: [
    TeamAccountDetailsComponent,
    TeamAuthConfirmationComponent
  ]
})
export class TeamModule { }
