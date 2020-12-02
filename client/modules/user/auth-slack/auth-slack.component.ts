import { Component, OnInit, Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'auth-slack-component',
  templateUrl: './auth-slack.component.html',
  styleUrls: ['./auth-slack.component.scss']
})
export class AuthSlackComponent implements OnInit {
  code: string;
  state: any;

  constructor(
    private injector: Injector,
    private _router: Router,
    private activatedRoute: ActivatedRoute,
    private utilityService: UtilityService,
    public userService: UserService
    ) { }
    
    // Current User Data
    userData: any;

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector);

  async ngOnInit() {

    // Fetch current user details
    this.userData = await this.publicFunctions.getCurrentUser();
    this.activatedRoute.queryParams.subscribe(params => {
      this.code = params['code'];
    });
  }

  slackAuth(){
    return new Promise((resolve, reject)=>{
      this.userService.slackAuth(this.code, this.userData)
      .toPromise()
      .then((res)=> {
        // Resolve the promise
        resolve(this.utilityService.successNotification('Authenticated Successfully!'))
        this._router.navigate(['/']);
      })
      .catch(() => reject(this.utilityService.errorNotification('Unable to authenticate, please try again!')));
      this._router.navigate(['/']);
    })
  }

}
