import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-user-information',
  templateUrl: './user-information.component.html',
  styleUrls: ['./user-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserInformationComponent implements OnInit {

  constructor() { }

  // User Data Object
  @Input('userData') userData: any = {};

  ngOnInit() {
    console.log('User Data from User Information Component', this.userData);
  }

}
