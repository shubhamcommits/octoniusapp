import { OnInit, Component, EventEmitter, Injector, Input, OnDestroy, OnChanges, Output } from '@angular/core';


@Component({
  selector: 'app-member-list-menu',
  templateUrl: './member-list-menu.component.html',
  styleUrls: ['./member-list-menu.component.scss']
})
export class MemberListMenuComponent implements OnInit {

  constructor() { }
  @Input() groupMembers:any
  searchText = '';
  // Emitter to notify that a customField was edited/added
  @Output() userSelctionEmitter = new EventEmitter();
  
  ngOnInit(): void {
  }

  getMemberDetails(selectedMemberId: any) {
    console.log(selectedMemberId);
    this.userSelctionEmitter.emit(selectedMemberId);
  }

}
