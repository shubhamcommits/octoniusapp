import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-branding-panel',
  templateUrl: './branding-panel.component.html',
  styleUrls: ['./branding-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandingPanelComponent implements OnInit {

  constructor() {
  }

  // ROUTER NAME STATE OF THE COMPONENT - 'new-workplace', 'signup', 'signin', or 'home'
  @Input('routerState') routerState: string;

  ngOnInit() {
  }

}
