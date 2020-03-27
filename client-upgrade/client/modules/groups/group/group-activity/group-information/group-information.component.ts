import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-group-information',
  templateUrl: './group-information.component.html',
  styleUrls: ['./group-information.component.scss']
})
export class GroupInformationComponent implements OnInit {

  constructor() { }

  // Group Data Variable
  @Input('groupData') groupData: any

  ngOnInit() {
  }

}
