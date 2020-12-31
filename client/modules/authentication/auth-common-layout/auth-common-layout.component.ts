import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-auth-common-layout',
  templateUrl: './auth-common-layout.component.html',
  styleUrls: ['./auth-common-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthCommonLayoutComponent implements OnInit {

  constructor() { }

  // ROUTER NAME STATE OF THE COMPONENT - 'new-workplace', 'signup', 'signin', 'home', or 'reset-password'
  @Input('routerState') routerState: string;
  @Input() userWorkspaces = [];

  ngOnInit() {
  }

}
