import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'main-navbar',
  templateUrl: './main-navbar.component.html',
  styleUrls: ['./main-navbar.component.scss']
})
export class MainNavbarComponent implements OnInit {

  @Input('user') user;

  constructor() { }

  ngOnInit() {
  }

  underline_navbar_overview() {
    const x = document.getElementById("li_overview");
    const y = document.getElementById("li_group");
    const z = document.getElementById("li_admin");

    if (z != null) {
      x.className = "active";
      y.className = "none";
      z.className = "none";
    }

  }

  underline_navbar_group() {
    const x = document.getElementById("li_overview");
    const y = document.getElementById("li_group");
    const z = document.getElementById("li_admin");
    if (z != null) {
      y.className = "active";
      x.className = "none";
      z.className = "none";
    }

  }

  underline_navbar_admin() {
    const x = document.getElementById("li_overview");
    const y = document.getElementById("li_group");
    const z = document.getElementById("li_admin");
    if (z != null) {
      z.className = "active";
      y.className = "none";
      x.className = "none";
    }
  }

}
