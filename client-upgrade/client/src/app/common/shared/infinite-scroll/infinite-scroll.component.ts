import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-infinite-scroll',
  templateUrl: './infinite-scroll.component.html',
  styleUrls: ['./infinite-scroll.component.scss']
})
export class InfiniteScrollComponent implements OnInit {

  constructor(private host: ElementRef) { }

  
  @Input() options = {};

  // OUTPUT THE EVENT FOR EVERY SCROLL
  @Output() scrolled = new EventEmitter();

  // ANCHOR DIV REFERENCE
  @ViewChild('anchor', {static: false}) anchor: ElementRef<HTMLElement>;

  // OBSERVER WHICH OBSERVES FOR THE SCROLL CHANGE
  private observer: IntersectionObserver;

  ngOnInit() {
    let options = {
      root: this.isHostScrollable() ? this.host.nativeElement : null,
      ...this.options
    };

   this.observer = new IntersectionObserver(([entry]) => {
      entry.isIntersecting && this.scrolled.emit();
    }, options);

    this.observer.observe(this.anchor.nativeElement);
  }

  get element() {
    return this.host.nativeElement;
  }

  private isHostScrollable() {
    const style = window.getComputedStyle(this.element);

    return style.getPropertyValue('overflow') === 'auto' ||
      style.getPropertyValue('overflow-y') === 'scroll';
  }

  ngOnDestroy() {
    this.observer.disconnect();
  }

}
