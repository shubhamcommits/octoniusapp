import { Component, OnInit, Injector } from '@angular/core';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-myspace-inbox',
  templateUrl: './myspace-inbox.component.html',
  styleUrls: ['./myspace-inbox.component.scss']
})
export class MyspaceInboxComponent implements OnInit {

  constructor(private injector: Injector, public utilityService: UtilityService) { }

  // Current User Data
  userData: any;

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector);

  async ngOnInit() {

    // Fetch current user details
    this.userData = await this.publicFunctions.getCurrentUser();

  }
}
