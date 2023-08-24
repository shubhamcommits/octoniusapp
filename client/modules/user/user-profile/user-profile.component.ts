import { Component, OnInit, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  // User Data Variable
  userData: any;

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
