import { OnInit, Component, EventEmitter, SimpleChanges,Injector, Input, OnDestroy, OnChanges, Output } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-member-list-menu',
  templateUrl: './member-list-menu.component.html',
  styleUrls: ['./member-list-menu.component.scss']
})
export class MemberListMenuComponent implements OnInit {

  @Input() groupMembers: any;
  @Input() filterfor: string;
  @Input() menuLable: string;
  @Input() menuFor: string;
  @Input() workspaceId: string;
  
  // Emitter to notify that a customField was edited/added
  @Output() userSelctionEmitter = new EventEmitter();

  searchText = '';
  picsUrl:string='';

  workspaceData;

  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector
    ) { }
  
  async ngOnInit(): Promise<void> {
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
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
        this.picsUrl = this.baseUrl + '/' + this.workspaceId + '/' +element.profile_pic;
      }
    });
    this.userSelctionEmitter.emit(selectedMemberId);
  }

}
