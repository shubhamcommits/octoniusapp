import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-user-available-clouds',
  templateUrl: './user-available-clouds.component.html',
  styleUrls: ['./user-available-clouds.component.scss']
})
export class UserAvailableCloudsComponent implements OnInit {

  // Google User Output Event Emitter
  @Input() userData:any;
  @Output('googleUser') googleUser = new EventEmitter();

  workspaceData: any;

  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector,
  ) { }

  async ngOnInit() {
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
  }

  emitGoogleUser(googleUser: any) {
    this.googleUser.emit(googleUser)
  }
}
