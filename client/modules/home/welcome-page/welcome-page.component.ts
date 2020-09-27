import { Component, OnInit, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss']
})
export class WelcomePageComponent implements OnInit {

  constructor(
    private _Injector: Injector
  ) { }

  isLoadingJoinWorkspace$ = new BehaviorSubject(false);
  isLoadingCreateWorkspace$ = new BehaviorSubject(false);

  publicFunctions = new PublicFunctions(this._Injector)

  async ngOnInit() {
    this.publicFunctions.sendUpdatesToGroupData({})
    this.publicFunctions.sendUpdatesToRouterState({})
    this.publicFunctions.sendUpdatesToUserData({})
    this.publicFunctions.sendUpdatesToWorkspaceData({})
  }

  nextLoadingJoinWorskpaceState(){
    this.isLoadingJoinWorkspace$.next(true);
  }

  nextLoadingCreateWorskpaceState(){
    this.isLoadingCreateWorkspace$.next(true);
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.isLoadingJoinWorkspace$.complete();
    this.isLoadingCreateWorkspace$.complete();
  }

}
