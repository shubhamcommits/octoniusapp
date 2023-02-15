import { Component, OnInit, Input, Injector } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-global-north-star-stats',
  templateUrl: './global-north-star-stats.component.html',
  styleUrls: ['./global-north-star-stats.component.scss'],
  providers:[CurrencyPipe]
})
export class GlobalNorthStarStatsComponent implements OnInit {

  @Input() northStarValues = [];

  workspaceData: any;

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector) { }

  async ngOnInit() {
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
  }

  getNSStatusClass(status) {
    let retClass = "timeline-status";
    if (status === 'NOT STARTED') {
      retClass += ' not_started';
    } else if (status === 'ON TRACK') {
      retClass += ' on_track';
    } else if (status === 'IN DANGER') {
      retClass += ' in_danger';
    } else if (status === 'ACHIEVED') {
      retClass += ' achieved';
    }
    return retClass;
  }

}
