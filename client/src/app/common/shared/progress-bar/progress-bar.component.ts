import { Component, OnInit, Input, ElementRef, ViewChild, AfterViewInit, AfterContentInit } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent implements OnInit, AfterViewInit {

  constructor() { }

  // @Input('id') id: any
  // @Input('preset') preset: any;
  // @Input('value') value: any;
  // @Input('stroke') stroke: any;
  @Input() color: any = "#005fd5";
  @Input() value: any;

  // DOM element div
  @ViewChild('progressbar') progressBar: ElementRef;

  ngOnInit() {
  }

  ngAfterViewInit() {
    // //  Set the data-preset attribute
    // this.progressBar.nativeElement.setAttribute('data-preset', this.preset)

    // //  Set the data-value attribute
    // this.progressBar.nativeElement.setAttribute('data-value', this.value);

    // //  Set the data-value attribute
    // this.progressBar.nativeElement.setAttribute('data-stroke', this.stroke);

  }
}
