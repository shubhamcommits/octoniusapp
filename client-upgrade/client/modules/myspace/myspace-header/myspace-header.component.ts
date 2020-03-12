import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-myspace-header',
  templateUrl: './myspace-header.component.html',
  styleUrls: ['./myspace-header.component.scss']
})
export class MyspaceHeaderComponent implements OnInit {

  constructor(
    private utilityService: UtilityService
  ) { }

  // CURRENT USER DATA
  userData: any;

  // BASE URL OF THE APPLICATION
  BASE_URL = environment.UTILITIES_BASE_URL;

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink();

  async ngOnInit() {

   // GETTING USER DATA FROM THE SHARED SERVICE
    this.subSink.add(
      this.utilityService.currentUserData
      .subscribe(res => this.userData = res)
    );

  }

  /**
   * This functions unsubscribes all the observables subscription to avoid memory leak
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

}
