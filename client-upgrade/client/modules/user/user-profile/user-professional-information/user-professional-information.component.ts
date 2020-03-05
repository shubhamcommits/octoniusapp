import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-user-professional-information',
  templateUrl: './user-professional-information.component.html',
  styleUrls: ['./user-professional-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfessionalInformationComponent implements OnInit {

  constructor() { }

  // User Data Object
  @Input('userData') userData: any = {};

  ngOnInit() {
    console.log('User Data from User Professional Component', this.userData);
  }

}
