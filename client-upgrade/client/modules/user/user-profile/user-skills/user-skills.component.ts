import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-user-skills',
  templateUrl: './user-skills.component.html',
  styleUrls: ['./user-skills.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserSkillsComponent implements OnInit {

  constructor(
    public utilityService: UtilityService
  ) { }

  // User Data Object
  @Input('userData') userData: any = {};

  ngOnInit() {
  }

}
