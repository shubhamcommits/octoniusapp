import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { IntegrationsService } from 'src/shared/services/integrations-service/integrations.service';
import { UserService } from 'src/shared/services/user-service/user.service';

@Component({
  selector: 'app-user-connected-clouds',
  templateUrl: './user-connected-clouds.component.html',
  styleUrls: ['./user-connected-clouds.component.scss']
})
export class UserConnectedCloudsComponent implements OnInit {

  @Input() googleUser: any;
  @Input() boxUser: any;
  @Input() ms365User:boolean;
  @Input() slackAuthSuccessful:boolean;

  @Output() ms365Disconnected = new EventEmitter();
  
  workspaceData: any;
  userData: any;

  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector,
    public userService: UserService,
    private integrationsService: IntegrationsService,
  ) { }

  async ngOnInit() {
    this.userData = await this.publicFunctions.getCurrentUser();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
  }

  async onMS365Disconnected($event) {
    this.ms365User = await this.integrationsService.getCurrentMS365User();
    await this.ngOnInit();

    this.ms365Disconnected.emit();
  }
}
