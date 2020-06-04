import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-select-member',
  templateUrl: './select-member.component.html',
  styleUrls: ['./select-member.component.scss']
})
export class SelectMemberComponent implements OnInit {

  constructor() { }

  // BASE URL OF THE APPLICATION
  baseUrl = environment.UTILITIES_BASE_URL;

  // User Data Input from component
  @Input('userData') userData: any;

  ngOnInit() {
  }

}
