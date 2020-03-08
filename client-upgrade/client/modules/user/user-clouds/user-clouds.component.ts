import { Component, OnInit, Injector } from '@angular/core';
import { PublicFunctions } from 'src/app/dashboard/public.functions';

@Component({
  selector: 'app-user-clouds',
  templateUrl: './user-clouds.component.html',
  styleUrls: ['./user-clouds.component.scss']
})
export class UserCloudsComponent implements OnInit {

  constructor(
    public injector: Injector
  ) { }

  // User Data Variable
  userData: Object;

  // Public functions class member
  publicFunctions = new PublicFunctions(this.injector);

  async ngOnInit() {
    
    // Intialise the userData variable
    this.userData = await this.publicFunctions.getCurrentUser();
  }

}
