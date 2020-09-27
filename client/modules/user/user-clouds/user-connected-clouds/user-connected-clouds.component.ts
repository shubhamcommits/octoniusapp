import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-connected-clouds',
  templateUrl: './user-connected-clouds.component.html',
  styleUrls: ['./user-connected-clouds.component.scss']
})
export class UserConnectedCloudsComponent implements OnInit {

  @Input('googleUser') googleUser: any;

  constructor() { }

  ngOnInit() {
  }
}
