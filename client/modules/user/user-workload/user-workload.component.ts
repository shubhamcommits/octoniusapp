import { Component, Injector, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-user-workload',
  templateUrl: './user-workload.component.html',
  styleUrls: ['./user-workload.component.scss']
})
export class UserWorkloadComponent implements OnInit {

  userData: any ;
  // Public functions class member
  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector
  ) { }

  async ngOnInit() {

    // Setting Home State
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'user-account'
    });

    this.userData = await this.publicFunctions.getCurrentUser();
  }

}
