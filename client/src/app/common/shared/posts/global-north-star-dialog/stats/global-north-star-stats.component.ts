import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-global-north-star-stats',
  templateUrl: './global-north-star-stats.component.html',
  styleUrls: ['./global-north-star-stats.component.scss'],
  providers:[CurrencyPipe]
})
export class GlobalNorthStarStatsComponent implements OnChanges {

  @Input() northStarValues = [];

  constructor() { }

  ngOnChanges() {

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
