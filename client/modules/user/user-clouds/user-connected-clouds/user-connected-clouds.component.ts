import { Component, Injector, Input, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UserService } from 'src/shared/services/user-service/user.service';

@Component({
  selector: 'app-user-connected-clouds',
  templateUrl: './user-connected-clouds.component.html',
  styleUrls: ['./user-connected-clouds.component.scss']
})
export class UserConnectedCloudsComponent implements OnInit {

  @Input('googleUser') googleUser: any;
  @Input('boxUser') boxUser: any;
  @Input() slackAuthSuccessful:boolean;

  workspaceData: any;

  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector,
    public userService: UserService,
  ) { }

  async ngOnInit() {
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
  }
}
