import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'main-navbar',
  templateUrl: './main-navbar.component.html',
  styleUrls: ['./main-navbar.component.scss']
})
export class MainNavbarComponent implements OnInit {

  @Input('user') user;

  @Output() displaySecondLevelNavbar: EventEmitter<any> = new EventEmitter();

  ngOnInit() {
  }

  displayMySpace() {
    this.displaySecondLevelNavbar.emit('MY_SPACE');
  }

  displayWork() {
    this.displaySecondLevelNavbar.emit('WORK');
  }

  displayAdmin() {
    this.displaySecondLevelNavbar.emit('ADMIN');
  }

}
