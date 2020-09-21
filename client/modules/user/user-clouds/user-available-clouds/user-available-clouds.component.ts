import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-user-available-clouds',
  templateUrl: './user-available-clouds.component.html',
  styleUrls: ['./user-available-clouds.component.scss']
})
export class UserAvailableCloudsComponent implements OnInit {

  constructor() { }

  // Google User Output Event Emitter
  @Output('googleUser') googleUser = new EventEmitter();

  ngOnInit() {
  }

  emitGoogleUser(googleUser: any){
    this.googleUser.emit(googleUser)
  }

}
