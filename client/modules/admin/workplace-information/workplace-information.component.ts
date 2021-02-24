import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-workplace-information',
  templateUrl: './workplace-information.component.html',
  styleUrls: ['./workplace-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkplaceInformationComponent implements OnInit {

  constructor() { }

  // Workspace Data Object
  @Input('workspaceData') workspaceData: any = {};

  // Router State Object - can have either 'billing' or 'general'
  @Input('routerState') routerState: string = '';

  ngOnInit() {
  }

}
