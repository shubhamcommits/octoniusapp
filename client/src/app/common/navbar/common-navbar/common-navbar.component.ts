import { Component, OnInit, Injector } from '@angular/core';
import { PublicFunctions } from 'src/app/dashboard/public.functions';

@Component({
  selector: 'app-common-navbar',
  templateUrl: './common-navbar.component.html',
  styleUrls: ['./common-navbar.component.scss']
})
export class CommonNavbarComponent implements OnInit {

  constructor(
    private injector: Injector,
  ) { }

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector)

  ngOnInit() {
  }

}
