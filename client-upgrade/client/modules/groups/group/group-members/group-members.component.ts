import { Component, OnInit, Injector } from '@angular/core';
import { SubSink } from 'subsink';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-group-members',
  templateUrl: './group-members.component.html',
  styleUrls: ['./group-members.component.scss']
})
export class GroupMembersComponent implements OnInit {

  constructor(
    private injector: Injector,
    private utilityService: UtilityService
    ) { }

  // MEMBERS LIST
  public members: any = [];

  // PLACEHOLDER INPUT FOR SEARCH BAR
  public searchBarPlaceholder = "Whom you are looking for?";

  // WORKSPACE DATA
  public groupData: any;

  // Subsink Object
  subSink = new SubSink()

  async ngOnInit() {

    this.subSink.add(this.utilityService.currentGroupData.subscribe((res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {

        // Assign the GroupData
        this.groupData = res;

        // Merge the Admin and Members array
        Array.prototype.push.apply(this.groupData._members, this.groupData._admins)

        // Assign the members array to this new array
        this.members = Array.from(new Set(this.groupData._members.reverse()))
      }
    }))


  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subSink.unsubscribe();
  }



}

