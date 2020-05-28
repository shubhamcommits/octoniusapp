import { Component, OnInit, Input } from '@angular/core';
import { Location } from '@angular/common';


@Component({
  selector: 'app-board-bar',
  templateUrl: './board-bar.component.html',
  styleUrls: ['./board-bar.component.scss']
})
export class BoardBarComponent implements OnInit {

  constructor(
    public _location: Location
  ) { }

  // GroupData Variable
  @Input('groupData') groupData: any

  ngOnInit() {
  }

}
