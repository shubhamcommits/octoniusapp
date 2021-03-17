import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-team-auth-confirmation',
  templateUrl: './team-auth-confirmation.component.html',
  styleUrls: ['./team-auth-confirmation.component.scss']
})
export class TeamAuthConfirmationComponent implements OnInit {

  queryParms: any;

  publicFunctions = new PublicFunctions(this._Injector);

  constructor(
    private utilityService: UtilityService,
    public userService: UserService,
    public router: Router,
    public activeRouter: ActivatedRoute,
    private _Injector: Injector
  ) { }

  ngOnInit(): void {
    this.activeRouter.queryParams.subscribe(params => {
      if (params['tid']) {
        this.queryParms = params;
      }
    });
  }

  async cancel() {
    window.location.href = this.queryParms['redirect_uri'];
  }

  async alloweded() {
    const userAccount = await this.publicFunctions.getCurrentAccount();
    if (this.queryParms) {
      this.userService.teamAuth(this.queryParms, userAccount)
        .subscribe((res) => {
        }),
        ((err) => {
          console.log('Error occured, while authenticating for Slack', err);
        });
      setTimeout(() => {
        window.location.href = this.queryParms['redirect_uri'] + `/#access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJqZWN0IjoiNWZiYmI5YmQ4Yzc4MmU1NTgyZTY2OWI0IiwiaWF0IjoxNjE1NDUzOTk4fQ.fBIlyVcHKE-Du2maoEjFtfXQDUctHWLVHVCIh6m88vs&id_token=dcscsdvdsnsdnvnsdvsd&token_type=JWT&expires_in=1hr&state=${this.queryParms['state']}`;
      }, 2000);
    }
  }

}
