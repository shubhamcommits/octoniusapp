import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-workplace-information',
  templateUrl: './workplace-information.component.html',
  styleUrls: ['./workplace-information.component.scss']
})
export class WorkplaceInformationComponent implements OnInit {

  constructor() { }

  @Input('workspaceData') workspaceData: any;

  ngOnInit() {
  }

}
