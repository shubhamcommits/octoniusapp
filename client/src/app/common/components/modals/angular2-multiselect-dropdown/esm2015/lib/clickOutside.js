/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
import { Directive, ElementRef, Output, EventEmitter, HostListener, Input } from '@angular/core';
export class ClickOutsideDirective {
    /**
     * @param {?} _elementRef
     */
    constructor(_elementRef) {
        this._elementRef = _elementRef;
        this.clickOutside = new EventEmitter();
    }
    /**
     * @param {?} event
     * @param {?} targetElement
     * @return {?}
     */
    onClick(event, targetElement) {
        if (!targetElement) {
            return;
        }
        /** @type {?} */
        const clickedInside = this._elementRef.nativeElement.contains(targetElement);
        if (!clickedInside) {
            this.clickOutside.emit(event);
        }
    }
}
ClickOutsideDirective.decorators = [
    { type: Directive, args: [{
                selector: '[clickOutside]'
            },] }
];
/** @nocollapse */
ClickOutsideDirective.ctorParameters = () => [
    { type: ElementRef }
];
ClickOutsideDirective.propDecorators = {
    clickOutside: [{ type: Output }],
    onClick: [{ type: HostListener, args: ['document:click', ['$event', '$event.target'],] }, { type: HostListener, args: ['document:touchstart', ['$event', '$event.target'],] }]
};
if (false) {
    /** @type {?} */
    ClickOutsideDirective.prototype.clickOutside;
    /** @type {?} */
    ClickOutsideDirective.prototype._elementRef;
}
export class ScrollDirective {
    /**
     * @param {?} _elementRef
     */
    constructor(_elementRef) {
        this._elementRef = _elementRef;
        this.scroll = new EventEmitter();
    }
    /**
     * @param {?} event
     * @param {?} targetElement
     * @return {?}
     */
    onClick(event, targetElement) {
        this.scroll.emit(event);
    }
}
ScrollDirective.decorators = [
    { type: Directive, args: [{
                selector: '[scroll]'
            },] }
];
/** @nocollapse */
ScrollDirective.ctorParameters = () => [
    { type: ElementRef }
];
ScrollDirective.propDecorators = {
    scroll: [{ type: Output }],
    onClick: [{ type: HostListener, args: ['scroll', ['$event'],] }]
};
if (false) {
    /** @type {?} */
    ScrollDirective.prototype.scroll;
    /** @type {?} */
    ScrollDirective.prototype._elementRef;
}
export class styleDirective {
    /**
     * @param {?} el
     */
    constructor(el) {
        this.el = el;
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        this.el.nativeElement.style.top = this.styleVal;
    }
    /**
     * @return {?}
     */
    ngOnChanges() {
        this.el.nativeElement.style.top = this.styleVal;
    }
}
styleDirective.decorators = [
    { type: Directive, args: [{
                selector: '[styleProp]'
            },] }
];
/** @nocollapse */
styleDirective.ctorParameters = () => [
    { type: ElementRef }
];
styleDirective.propDecorators = {
    styleVal: [{ type: Input, args: ['styleProp',] }]
};
if (false) {
    /** @type {?} */
    styleDirective.prototype.styleVal;
    /** @type {?} */
    styleDirective.prototype.el;
}
export class setPosition {
    /**
     * @param {?} el
     */
    constructor(el) {
        this.el = el;
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        if (this.height) {
            this.el.nativeElement.style.bottom = parseInt(this.height + 15 + "") + 'px';
        }
    }
    /**
     * @return {?}
     */
    ngOnChanges() {
        if (this.height) {
            this.el.nativeElement.style.bottom = parseInt(this.height + 15 + "") + 'px';
        }
    }
}
setPosition.decorators = [
    { type: Directive, args: [{
                selector: '[setPosition]'
            },] }
];
/** @nocollapse */
setPosition.ctorParameters = () => [
    { type: ElementRef }
];
setPosition.propDecorators = {
    height: [{ type: Input, args: ['setPosition',] }]
};
if (false) {
    /** @type {?} */
    setPosition.prototype.height;
    /** @type {?} */
    setPosition.prototype.el;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpY2tPdXRzaWRlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhcjItbXVsdGlzZWxlY3QtZHJvcGRvd24vIiwic291cmNlcyI6WyJsaWIvY2xpY2tPdXRzaWRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQXFCLE1BQU0sZUFBZSxDQUFDO0FBS3BILE1BQU07Ozs7SUFDRixZQUFvQixXQUF1QjtRQUF2QixnQkFBVyxHQUFYLFdBQVcsQ0FBWTs0QkFJckIsSUFBSSxZQUFZLEVBQWM7S0FIbkQ7Ozs7OztJQU9NLE9BQU8sQ0FBQyxLQUFpQixFQUFFLGFBQTBCO1FBQ3hELElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDaEIsT0FBTztTQUNWOztRQUVELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUM3RSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ2hCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ2pDO0tBQ0o7OztZQXJCSixTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLGdCQUFnQjthQUM3Qjs7OztZQUptQixVQUFVOzs7MkJBU3pCLE1BQU07c0JBR04sWUFBWSxTQUFDLGdCQUFnQixFQUFFLENBQUMsUUFBUSxFQUFFLGVBQWUsQ0FBQyxjQUMxRCxZQUFZLFNBQUMscUJBQXFCLEVBQUUsQ0FBQyxRQUFRLEVBQUUsZUFBZSxDQUFDOzs7Ozs7OztBQWdCcEUsTUFBTTs7OztJQUNGLFlBQW9CLFdBQXVCO1FBQXZCLGdCQUFXLEdBQVgsV0FBVyxDQUFZO3NCQUkzQixJQUFJLFlBQVksRUFBYztLQUg3Qzs7Ozs7O0lBTU0sT0FBTyxDQUFDLEtBQWlCLEVBQUUsYUFBMEI7UUFDeEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDM0I7OztZQWJKLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsVUFBVTthQUN2Qjs7OztZQTVCbUIsVUFBVTs7O3FCQWlDekIsTUFBTTtzQkFHTixZQUFZLFNBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDOzs7Ozs7OztBQVF0QyxNQUFNOzs7O0lBRUYsWUFBb0IsRUFBYztRQUFkLE9BQUUsR0FBRixFQUFFLENBQVk7S0FFakM7Ozs7SUFJRCxRQUFRO1FBRUosSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0tBQ25EOzs7O0lBQ0QsV0FBVztRQUNQLElBQUksQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztLQUNuRDs7O1lBakJKLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsYUFBYTthQUMxQjs7OztZQTNDbUIsVUFBVTs7O3VCQWtEekIsS0FBSyxTQUFDLFdBQVc7Ozs7Ozs7O0FBZXRCLE1BQU07Ozs7SUFJRixZQUFtQixFQUFjO1FBQWQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtLQUVoQzs7OztJQUNELFFBQVE7UUFDSixJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDYixJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7U0FDL0U7S0FDSjs7OztJQUNELFdBQVc7UUFDUCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDYixJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7U0FDL0U7S0FDSjs7O1lBbkJKLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsZUFBZTthQUM1Qjs7OztZQWhFbUIsVUFBVTs7O3FCQW1FekIsS0FBSyxTQUFDLGFBQWEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIE91dHB1dCwgRXZlbnRFbWl0dGVyLCBIb3N0TGlzdGVuZXIsIElucHV0LCBPbkluaXQsIE9uQ2hhbmdlcyB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1tjbGlja091dHNpZGVdJ1xufSlcbmV4cG9ydCBjbGFzcyBDbGlja091dHNpZGVEaXJlY3RpdmUge1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHtcbiAgICB9XG5cbiAgICBAT3V0cHV0KClcbiAgICBwdWJsaWMgY2xpY2tPdXRzaWRlID0gbmV3IEV2ZW50RW1pdHRlcjxNb3VzZUV2ZW50PigpO1xuXG4gICAgQEhvc3RMaXN0ZW5lcignZG9jdW1lbnQ6Y2xpY2snLCBbJyRldmVudCcsICckZXZlbnQudGFyZ2V0J10pXG4gICAgQEhvc3RMaXN0ZW5lcignZG9jdW1lbnQ6dG91Y2hzdGFydCcsIFsnJGV2ZW50JywgJyRldmVudC50YXJnZXQnXSlcbiAgICBwdWJsaWMgb25DbGljayhldmVudDogTW91c2VFdmVudCwgdGFyZ2V0RWxlbWVudDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0YXJnZXRFbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjbGlja2VkSW5zaWRlID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNvbnRhaW5zKHRhcmdldEVsZW1lbnQpO1xuICAgICAgICBpZiAoIWNsaWNrZWRJbnNpZGUpIHtcbiAgICAgICAgICAgIHRoaXMuY2xpY2tPdXRzaWRlLmVtaXQoZXZlbnQpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1tzY3JvbGxdJ1xufSlcbmV4cG9ydCBjbGFzcyBTY3JvbGxEaXJlY3RpdmUge1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHtcbiAgICB9XG5cbiAgICBAT3V0cHV0KClcbiAgICBwdWJsaWMgc2Nyb2xsID0gbmV3IEV2ZW50RW1pdHRlcjxNb3VzZUV2ZW50PigpO1xuXG4gICAgQEhvc3RMaXN0ZW5lcignc2Nyb2xsJywgWyckZXZlbnQnXSlcbiAgICBwdWJsaWMgb25DbGljayhldmVudDogTW91c2VFdmVudCwgdGFyZ2V0RWxlbWVudDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5zY3JvbGwuZW1pdChldmVudCk7XG4gICAgfVxufVxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbc3R5bGVQcm9wXSdcbn0pXG5leHBvcnQgY2xhc3Mgc3R5bGVEaXJlY3RpdmUge1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBlbDogRWxlbWVudFJlZikge1xuXG4gICAgfVxuXG4gICAgQElucHV0KCdzdHlsZVByb3AnKSBzdHlsZVZhbDogbnVtYmVyO1xuXG4gICAgbmdPbkluaXQoKSB7XG5cbiAgICAgICAgdGhpcy5lbC5uYXRpdmVFbGVtZW50LnN0eWxlLnRvcCA9IHRoaXMuc3R5bGVWYWw7XG4gICAgfVxuICAgIG5nT25DaGFuZ2VzKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQuc3R5bGUudG9wID0gdGhpcy5zdHlsZVZhbDtcbiAgICB9XG59XG5cblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbc2V0UG9zaXRpb25dJ1xufSlcbmV4cG9ydCBjbGFzcyBzZXRQb3NpdGlvbiBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzIHtcblxuICAgIEBJbnB1dCgnc2V0UG9zaXRpb24nKSBoZWlnaHQ6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBlbDogRWxlbWVudFJlZikge1xuXG4gICAgfVxuICAgIG5nT25Jbml0KCkge1xuICAgICAgICBpZiAodGhpcy5oZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuZWwubmF0aXZlRWxlbWVudC5zdHlsZS5ib3R0b20gPSBwYXJzZUludCh0aGlzLmhlaWdodCArIDE1ICsgXCJcIikgKyAncHgnO1xuICAgICAgICB9XG4gICAgfVxuICAgIG5nT25DaGFuZ2VzKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5oZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuZWwubmF0aXZlRWxlbWVudC5zdHlsZS5ib3R0b20gPSBwYXJzZUludCh0aGlzLmhlaWdodCArIDE1ICsgXCJcIikgKyAncHgnO1xuICAgICAgICB9XG4gICAgfVxufSJdfQ==