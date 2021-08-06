import { Component, OnInit, Injector } from '@angular/core';
import { SubSink } from 'subsink';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';

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
  public searchBarPlaceholder = $localize`:@@groupMembers.searchUser:Search user...`;

  // WORKSPACE DATA
  public groupData: any;

  public userData: any;

  // Subsink Object
  subSink = new SubSink()

  // Public Functions class
  private publicFunctions = new PublicFunctions(this.injector);

  async ngOnInit() {

    this.subSink.add(this.utilityService.currentGroupData.subscribe((res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {

        // Assign the GroupData
        this.groupData = res;

        this.members = this.groupData._members.concat(this.groupData._admins);
        this.members = this.members.filter((member, index) => {
          return (this.members.findIndex(m => m._id == member._id) == index)
        });
      }
    }))

    await this.publicFunctions.getCurrentUser().then(user => this.userData = user);
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subSink.unsubscribe();
  }



}

