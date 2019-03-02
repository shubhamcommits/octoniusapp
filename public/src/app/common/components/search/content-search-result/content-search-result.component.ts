import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'content-search-result',
  templateUrl: './content-search-result.component.html',
  styleUrls: ['./content-search-result.component.scss']
})
export class ContentSearchResultComponent implements OnInit {

  @Input('post') post;
  @Input('deleteable') deleteable;

  @Output('saveSearch') sendSaveSearch = new EventEmitter();
  @Output('deleteSearchResult') deleteSearchResult = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  sendDeleteSearchResult() {
    this.deleteSearchResult.emit({
      type: 'content',
      content: this.post
    });
  }

  saveSearch() {
    this.sendSaveSearch.emit({
      type: 'content',
      content: this.post
    });
  }

}
