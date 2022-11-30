import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-global-north-star-stats',
  templateUrl: './global-north-star-stats.component.html',
  styleUrls: ['./global-north-star-stats.component.scss'],
  providers:[CurrencyPipe]
})
export class GlobalNorthStarStatsComponent implements OnInit {

  @Input() northStarValues = [];

  constructor(private currencyPipe : CurrencyPipe) { }

  ngOnInit() {
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
