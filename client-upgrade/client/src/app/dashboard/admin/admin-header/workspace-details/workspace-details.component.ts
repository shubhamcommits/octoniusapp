import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-workspace-details',
  templateUrl: './workspace-details.component.html',
  styleUrls: ['./workspace-details.component.scss']
})
export class WorkspaceDetailsComponent implements OnInit {

  constructor() { }
  
  // USER DATA
  @Input('userData') userData: any;

  // WORKSPACE DATA
  @Input('workspaceData') workspaceData: any;
  
  // BASE URL OF THE APPLICATION
  @Input('baseUrl') baseUrl: string

  croppedImage;

  ngOnInit() {
  }

}
