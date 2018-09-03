import { Component, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader'; 

@Component({
  selector: 'app-group-calendar',
  templateUrl: './group-calendar.component.html',
  styleUrls: ['./group-calendar.component.scss']
})
export class GroupCalendarComponent implements OnInit {

  viewDate: Date = new Date();
  view: string = 'month';
  events = [];
  activeDayIsOpen: boolean = true;

  constructor(private ngxService: NgxUiLoaderService) { }

  ngOnInit() {
    this.ngxService.start(); // start foreground loading with 'default' id
 
    // Stop the foreground loading after 5s
    setTimeout(() => {
      this.ngxService.stop(); // stop foreground loading with 'default' id
    }, 500);
  }

}
