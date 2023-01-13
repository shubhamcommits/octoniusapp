import { Component, OnInit, Input, EventEmitter, Output, Injector } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import moment from 'moment';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-north-star-stats',
  templateUrl: './north-star-stats.component.html',
  styleUrls: ['./north-star-stats.component.scss'],
  providers:[CurrencyPipe]
})
export class NorthStarStatsComponent implements OnInit {

  @Input() isNorthStar = false;
  @Input() northStar;

  workspaceData: any;

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector)

  constructor(
    private injector: Injector
    ) { }

  async ngOnInit() {
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.northStar.values = this.northStar?.values?.sort((v1, v2) => (moment.utc(v1.date).isBefore(v2.date)) ? 1 : -1);
    
    this.northStar?.values?.forEach(async (v, index) => {
      if (v?._user && !v?._user?._id) {
        v._user = await this.publicFunctions.getOtherUser(v._user);
      }

      v.difference = v.value - ((this.northStar?.values[index + 1]) ? this.northStar?.values[index + 1].value : 0);
    });
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
