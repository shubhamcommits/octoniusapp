import { Component, Injector, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export class DashboardPageComponent implements OnInit {

  period;

  periods = [
    {
     key: 7,
     value: 'Last 7 days'
    },
    {
     key: 30,
     value: 'Last month'
    },
    {
     key: 365,
     value: 'Last year'
    }
  ];

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(private injector: Injector) { }

  ngOnInit() {
    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'work'
    });

    this.period = 7;
  }

  periodSelected(event) {
    // this.period = event.value;
  }

}
