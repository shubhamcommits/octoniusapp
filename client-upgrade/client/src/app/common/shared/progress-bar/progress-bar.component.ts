import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent implements OnInit {

  constructor() { }

  // Id of the element
  @Input('id') id: any

  // data-preset attribute
  @Input('preset') preset: any;

  // data-value attribute
  @Input('value') value: any;

  // data-stroke attribute
  @Input('stroke') stroke: any;

  // DOM element div
  @ViewChild('progressbar', { static: false }) public progressBar: ElementRef;

  ngOnInit() {
  }

  ngAfterViewInit() {
    // console.log(this.progressBar.nativeElement);

    //  Set the data-preset attribute
    this.progressBar.nativeElement.setAttribute('data-preset', this.preset)

    //  Set the data-value attribute
    this.progressBar.nativeElement.setAttribute('data-value', this.value);

    //  Set the data-value attribute
    this.progressBar.nativeElement.setAttribute('data-stroke', this.stroke);

  }

}
