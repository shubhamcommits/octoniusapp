import { Component, OnInit, Injector } from '@angular/core';
import { PublicFunctions } from 'src/app/dashboard/public.functions';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit {

  constructor(
    private injector: Injector
  ) { }

  // Public Functions Object
  publicFunctions = new PublicFunctions(this.injector)

  ngOnInit() {

    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'group'
    })
  }

}
