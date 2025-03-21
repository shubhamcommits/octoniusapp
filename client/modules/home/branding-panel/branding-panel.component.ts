import { Component, OnInit, Input, ChangeDetectionStrategy, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-branding-panel',
  templateUrl: './branding-panel.component.html',
  styleUrls: ['./branding-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandingPanelComponent implements OnInit {

  publicFunctions = new PublicFunctions(this._Injector);

  constructor(
    private _Injector: Injector
    ) {
  }

  // ROUTER NAME STATE OF THE COMPONENT - 'new-workplace', 'signup', 'signin', or 'home'
  @Input('routerState') routerState: string;

  ngOnInit() {
  }

  clearData() {
    this.publicFunctions.sendUpdatesToGroupData({});
    this.publicFunctions.sendUpdatesToRouterState({});
    this.publicFunctions.sendUpdatesToUserData({});
    this.publicFunctions.sendUpdatesToAccountData({});
    this.publicFunctions.sendUpdatesToWorkspaceData({});
  }
}
