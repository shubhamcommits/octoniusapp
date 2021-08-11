import { Component, Inject, Injector, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-member-dialog',
  templateUrl: './member-dialog.component.html',
  styleUrls: ['./member-dialog.component.scss']
})
export class MemberDialogComponent implements OnInit {

  userId;
  userData;

  userBaseUrl = environment.UTILITIES_USERS_UPLOADS;

  // Public functions class member
  publicFunctions = new PublicFunctions(this.injector);

  // Is current user component
  isCurrentUser: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private injector: Injector,
  ) { }

  async ngOnInit() {
    this.userId = this.data.userId;

    if (this.userId) {
      await this.publicFunctions.getOtherUser(this.userId).then((res) => {
        if(JSON.stringify(res) != JSON.stringify({})){
          this.userData = res;
        }
      });
    }
  }

}
