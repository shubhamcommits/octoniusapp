import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'second-level-navbar',
  templateUrl: './second-level-navbar.component.html',
  styleUrls: ['./second-level-navbar.component.scss']
})
export class SecondLevelNavbarComponent implements OnInit {

  @Output() setNavLevel: EventEmitter<number> = new EventEmitter();
  @Input() navbarType;

  ngOnInit() {
  }

  displayMainNavbar() {
    this.setNavLevel.emit(0);
  }

}
