import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-workplace-add-domain',
  templateUrl: './workplace-add-domain.component.html',
  styleUrls: ['./workplace-add-domain.component.scss']
})
export class WorkplaceAddDomainComponent implements OnInit {

  constructor() { }

  @Input('workspaceData') workspaceData: any;

  addDomain;

  allowedDomains;

  ngOnInit() {
  }

  getAllowedDomains(workspaceId: string){
    return new Promise((resolve, reject)=>{

    })
  }


}
