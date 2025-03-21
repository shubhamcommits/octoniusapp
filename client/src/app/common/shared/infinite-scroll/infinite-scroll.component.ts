import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-infinite-scroll',
  templateUrl: './infinite-scroll.component.html',
  styleUrls: ['./infinite-scroll.component.scss']
})

export class InfiniteScrollComponent implements OnInit, OnDestroy {

  // Options Input Variable
  @Input() options = {};

  // Scrolled Output emitter
  @Output() scrolled = new EventEmitter();

  // ViewChild of the static achor division
  @ViewChild('anchor', { static: true }) anchor: ElementRef<HTMLElement>;

  // Intersection Observer which observes for the changes
  private observer: IntersectionObserver;

  constructor(private host: ElementRef) { }

  // Get the element on which scrolling module is applied
  get element() {
    return this.host.nativeElement;
  }

  ngOnInit() {

    /**
     * The root property indicates the element that is used as the viewport for checking the visibility of the target.
     * When set to null it defaults to the browser viewport.
     */
    const options = {
      // root: this.isHostScrollable() ? this.host.nativeElement : null,
      root: null,
      threshold: 0.8,
      ...this.options
    };

    // Emit the changes of intersection
    this.observer = new IntersectionObserver(([entry]) => {
      entry.isIntersecting && this.scrolled.emit();
    }, options);

    // Observe the changes
    this.observer.observe(this.anchor.nativeElement);
  }

  /**
   * There are times when we’ll need to have a scrollable container, and then we’d want that container to act as the root element
   */
  private isHostScrollable() {
    const style = window.getComputedStyle(this.element);

    return style.getPropertyValue('overflow') === 'auto' ||
      style.getPropertyValue('overflow-y') === 'scroll';
  }

  /**
   * Since we don’t want memory leaks in our application, so we’ll disconnect the observer when the component destroyed
   */
  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
