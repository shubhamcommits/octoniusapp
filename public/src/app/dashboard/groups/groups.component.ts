import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {
  groups = [{ title: 'group1', desc: 'this is group 1' }, { title: 'group2 ', desc: 'this is group 2' }];
  constructor() { }

  ngOnInit() {
  }

}
