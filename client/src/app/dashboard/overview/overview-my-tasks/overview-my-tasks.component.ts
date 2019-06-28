import { Component, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-overview-my-tasks',
  templateUrl: './overview-my-tasks.component.html',
  styleUrls: ['./overview-my-tasks.component.scss']
})
export class OverviewMyTasksComponent implements OnInit {


  constructor(private ngxService: NgxUiLoaderService) {

  }

  ngOnInit() {
    this.ngxService.start(); // start foreground loading with 'default' id

    // Stop the foreground loading after 5s
    setTimeout(() => {
      this.ngxService.stop(); // stop foreground loading with 'default' id
    }, 500);


  }

}
