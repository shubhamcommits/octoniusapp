import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/shared/services/user-service/user.service';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-team-auth-confirmation',
  templateUrl: './team-auth-confirmation.component.html',
  styleUrls: ['./team-auth-confirmation.component.scss']
})
export class TeamAuthConfirmationComponent implements OnInit {

  //connection params to connect user with team
  queryParms: any;

  publicFunctions = new PublicFunctions(this._Injector);

  constructor(
    public userService: UserService,
    public router: Router,
    public activeRouter: ActivatedRoute,
    private _Injector: Injector
  ) { }

  ngOnInit(): void {
    this.activeRouter.queryParams.subscribe(params => {
      if ( params['tid'] ) {
        this.queryParms = params;
      }
    });
  }

  /**
    * This function redirect back the flow to teams authenticaiton end
  */
  async cancel() {
    window.location.href = this.queryParms['redirect_uri'];
  }


  /**
    * This function is responsible to connecte teams and then redirect back the flow to teams authenticaiton end
  */
  async alloweded() {
    const userAccount = await this.publicFunctions.getCurrentAccount();
    if (this.queryParms) {
      
      this.userService.teamAuth(this.queryParms, userAccount)
      .subscribe(async (res) => {
        await this.userService.updateUser(res['update_user']);
        await this.publicFunctions.sendUpdatesToUserData(res['update_user']);
      }),
      ((err) => {
          console.log('Error occured, while coonecting to teams', err);
      });

      setTimeout(() => {
        if (this.queryParms['redirect_uri']){
          window.location.href = this.queryParms['redirect_uri'] + `/#access_token=notrequiredonlyforcheck&token_type=JWT&expires_in=1hr&state=${this.queryParms['state']}`;
        } else {
          this.router.navigate(['dashboard', 'user', 'clouds']);
        }
      }, 2000);

    }
  }

}
