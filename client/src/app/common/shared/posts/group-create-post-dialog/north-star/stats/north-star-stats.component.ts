import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-north-star-stats',
  templateUrl: './north-star-stats.component.html',
  styleUrls: ['./north-star-stats.component.scss'],
  providers:[CurrencyPipe]
})
export class NorthStarStatsComponent implements OnInit {

  @Input() isNorthStar = false;
  @Input() northStar;

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
