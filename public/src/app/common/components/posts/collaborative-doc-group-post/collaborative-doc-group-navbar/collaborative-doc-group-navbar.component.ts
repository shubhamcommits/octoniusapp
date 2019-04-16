import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-collaborative-doc-group-navbar',
  templateUrl: './collaborative-doc-group-navbar.component.html',
  styleUrls: ['./collaborative-doc-group-navbar.component.scss']
})
export class CollaborativeDocGroupNavbarComponent implements OnInit {

  document_name = 'Untitled';

  @Output() clickBack: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  clickOnBack(){
    this.clickBack.emit('Click on back');
  }

}
