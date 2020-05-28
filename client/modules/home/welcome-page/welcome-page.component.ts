import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss']
})
export class WelcomePageComponent implements OnInit {

  constructor() { }

  isLoadingJoinWorkspace$ = new BehaviorSubject(false);
  isLoadingCreateWorkspace$ = new BehaviorSubject(false);

  ngOnInit() {
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
