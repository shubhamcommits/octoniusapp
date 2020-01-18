import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'user-search-result',
  templateUrl: './user-search-result.component.html',
  styleUrls: ['./user-search-result.component.scss']
})
export class UserSearchResultComponent implements OnInit {

  @Input('user') user;
  @Input('deleteable') deleteable;

  @Output('saveSearch') sendSaveSearch = new EventEmitter();
  @Output('deleteSearchResult') deleteSearchResult = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  sendDeleteSearchResult() {
    this.deleteSearchResult.emit({
      type: 'user',
      user: this.user
    });
  }

  saveSearch() {
    this.sendSaveSearch.emit({
      user: this.user,
      type: 'user'
    });
  }

}
