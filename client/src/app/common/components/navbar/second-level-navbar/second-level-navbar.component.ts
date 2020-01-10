import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'second-level-navbar',
  templateUrl: './second-level-navbar.component.html',
  styleUrls: ['./second-level-navbar.component.scss']
})
export class SecondLevelNavbarComponent implements OnInit {

  navbarType = 'MY_SPACE';

  constructor(private router: Router) {

  }

  ngOnInit() {
    this.initNavbarType(this.router.url);
  }

  private initNavbarType(url: string) {
    if (url.includes('/dashboard/overview')) {
      this.navbarType = 'MY_SPACE';
    } else if (url == '/dashboard/groups' || url == '/dashboard/pulse') {
      this.navbarType = 'WORK';
    } else if (url.includes('/dashboard/admin/')) {
      this.navbarType = 'ADMIN';
    }
  }

}
