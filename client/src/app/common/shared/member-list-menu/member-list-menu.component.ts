import { OnInit, Component, EventEmitter, SimpleChanges,Injector, Input, OnDestroy, OnChanges, Output } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-member-list-menu',
  templateUrl: './member-list-menu.component.html',
  styleUrls: ['./member-list-menu.component.scss']
})
export class MemberListMenuComponent implements OnInit {

  constructor() { }
  @Input() groupMembers:any
  @Input() filterfor:string
  searchText = '';
  picsUrl:string='';

  baseUrl = environment.UTILITIES_USERS_UPLOADS;
  // Emitter to notify that a customField was edited/added
  @Output() userSelctionEmitter = new EventEmitter();
  
  ngOnInit(): void {
  }

  async ngOnChanges(changes: SimpleChanges) {

    for (const propName in changes) {
      const change = changes[propName];
      const to = change.currentValue;
      const from = change.previousValue;
      if (propName === 'filterfor') {
        this.filterfor = to;
      }
    }
  }

  getMemberDetails(selectedMemberId: any) {
    this.groupMembers.forEach(element => {
      if(element._id==selectedMemberId){
        this.picsUrl = this.baseUrl + '/' +element.profile_pic;
      }
    });
    this.userSelctionEmitter.emit(selectedMemberId);
  }

}
