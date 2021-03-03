import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-user-available-clouds',
  templateUrl: './user-available-clouds.component.html',
  styleUrls: ['./user-available-clouds.component.scss']
})
export class UserAvailableCloudsComponent implements OnInit {

  constructor(
    private utilityService: UtilityService,
  ) { }

  // Google User Output Event Emitter
  @Input() userData:any;
  @Output('googleUser') googleUser = new EventEmitter();

  ngOnInit() {
  }

  emitGoogleUser(googleUser: any) {
    this.googleUser.emit(googleUser)
  }

}
