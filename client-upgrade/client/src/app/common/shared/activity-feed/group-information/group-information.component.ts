import { Component, OnInit, Input } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-group-information',
  templateUrl: './group-information.component.html',
  styleUrls: ['./group-information.component.scss']
})
export class GroupInformationComponent implements OnInit {

  constructor(
    private utilityService: UtilityService
  ) { }

  // Group Data Variable
  @Input('groupData') groupData: any;

  // User Data Variable
  @Input('userData') userData: any;

  // My workplace variable check
  @Input('myWorkplace') myWorkplace = false;

  ngOnInit() {
  }

}
