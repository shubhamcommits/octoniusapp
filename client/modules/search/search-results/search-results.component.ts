import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html'

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {

  @Input() data: any;

  @Input() type: string;

  constructor() { }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges){

    // Fetch the changed contents
    let changedContent = changes.data.currentValue.content

    // Add the data content 
    this.data.content = changedContent

    // Create an empyt cfg object
    let cfg = {}

    if(this.data.content != "" && this.data.content != null){

      // Initiate the converter
      var converter = new QuillDeltaToHtmlConverter(JSON.parse(this.data.content)['ops'], cfg)

      // Convert into html
      var html = converter.convert()

      // Add the html dynamically
      this.data.html = html
    }
  }

}
