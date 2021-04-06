import { Component, OnInit,Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/shared/services/user-service/user.service';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-zap-auth-confirmation',
  templateUrl: './zap-auth-confirmation.component.html',
  styleUrls: ['./zap-auth-confirmation.component.scss']
})
export class ZapAuthConfirmationComponent implements OnInit {

  //connection params to connect user with Zapier
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
      if ( params['state'] ) {
        this.queryParms = params;
      }
    });
  }

  /**
    * This function redirect back the flow to Zapier authenticaiton
  */
   async cancel() {
    window.location.href = this.queryParms['redirect_uri'];
  }


  /**
    * This function is responsible to connecte zapier and then redirect back the flow to zapier authenticaiton
  */
  async alloweded() {
    const user = await this.publicFunctions.getCurrentUser();
    if (this.queryParms) {
      
      this.userService.zapierAuth(user._id)
      .subscribe(async (res) => {
        await this.userService.updateUser(res['update_user']);
        await this.publicFunctions.sendUpdatesToUserData(res['update_user']);
      }),
      ((err) => {
          console.log('Error occured, while coonecting to Zapier', err);
      });

      setTimeout(() => {
        if (this.queryParms['redirect_uri']){
          window.location.href = this.queryParms['redirect_uri'] + `?code=${user._id}&state=${this.queryParms['state']}`;
        } else {
          this.router.navigate(['dashboard', 'user', 'clouds']);
        }
      }, 2000);

    }
  }

}
