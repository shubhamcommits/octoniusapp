/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
import { Directive, ElementRef, Output, EventEmitter, HostListener, Input } from '@angular/core';
var ClickOutsideDirective = /** @class */ (function () {
    function ClickOutsideDirective(_elementRef) {
        this._elementRef = _elementRef;
        this.clickOutside = new EventEmitter();
    }
    /**
     * @param {?} event
     * @param {?} targetElement
     * @return {?}
     */
    ClickOutsideDirective.prototype.onClick = /**
     * @param {?} event
     * @param {?} targetElement
     * @return {?}
     */
    function (event, targetElement) {
        if (!targetElement) {
            return;
        }
        /** @type {?} */
        var clickedInside = this._elementRef.nativeElement.contains(targetElement);
        if (!clickedInside) {
            this.clickOutside.emit(event);
        }
    };
    ClickOutsideDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[clickOutside]'
                },] }
    ];
    /** @nocollapse */
    ClickOutsideDirective.ctorParameters = function () { return [
        { type: ElementRef }
    ]; };
    ClickOutsideDirective.propDecorators = {
        clickOutside: [{ type: Output }],
        onClick: [{ type: HostListener, args: ['document:click', ['$event', '$event.target'],] }, { type: HostListener, args: ['document:touchstart', ['$event', '$event.target'],] }]
    };
    return ClickOutsideDirective;
}());
export { ClickOutsideDirective };
if (false) {
    /** @type {?} */
    ClickOutsideDirective.prototype.clickOutside;
    /** @type {?} */
    ClickOutsideDirective.prototype._elementRef;
}
var ScrollDirective = /** @class */ (function () {
    function ScrollDirective(_elementRef) {
        this._elementRef = _elementRef;
        this.scroll = new EventEmitter();
    }
    /**
     * @param {?} event
     * @param {?} targetElement
     * @return {?}
     */
    ScrollDirective.prototype.onClick = /**
     * @param {?} event
     * @param {?} targetElement
     * @return {?}
     */
    function (event, targetElement) {
        this.scroll.emit(event);
    };
    ScrollDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[scroll]'
                },] }
    ];
    /** @nocollapse */
    ScrollDirective.ctorParameters = function () { return [
        { type: ElementRef }
    ]; };
    ScrollDirective.propDecorators = {
        scroll: [{ type: Output }],
        onClick: [{ type: HostListener, args: ['scroll', ['$event'],] }]
    };
    return ScrollDirective;
}());
export { ScrollDirective };
if (false) {
    /** @type {?} */
    ScrollDirective.prototype.scroll;
    /** @type {?} */
    ScrollDirective.prototype._elementRef;
}
var styleDirective = /** @class */ (function () {
    function styleDirective(el) {
        this.el = el;
    }
    /**
     * @return {?}
     */
    styleDirective.prototype.ngOnInit = /**
     * @return {?}
     */
    function () {
        this.el.nativeElement.style.top = this.styleVal;
    };
    /**
     * @return {?}
     */
    styleDirective.prototype.ngOnChanges = /**
     * @return {?}
     */
    function () {
        this.el.nativeElement.style.top = this.styleVal;
    };
    styleDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[styleProp]'
                },] }
    ];
    /** @nocollapse */
    styleDirective.ctorParameters = function () { return [
        { type: ElementRef }
    ]; };
    styleDirective.propDecorators = {
        styleVal: [{ type: Input, args: ['styleProp',] }]
    };
    return styleDirective;
}());
export { styleDirective };
if (false) {
    /** @type {?} */
    styleDirective.prototype.styleVal;
    /** @type {?} */
    styleDirective.prototype.el;
}
var setPosition = /** @class */ (function () {
    function setPosition(el) {
        this.el = el;
    }
    /**
     * @return {?}
     */
    setPosition.prototype.ngOnInit = /**
     * @return {?}
     */
    function () {
        if (this.height) {
            this.el.nativeElement.style.bottom = parseInt(this.height + 15 + "") + 'px';
        }
    };
    /**
     * @return {?}
     */
    setPosition.prototype.ngOnChanges = /**
     * @return {?}
     */
    function () {
        if (this.height) {
            this.el.nativeElement.style.bottom = parseInt(this.height + 15 + "") + 'px';
        }
    };
    setPosition.decorators = [
        { type: Directive, args: [{
                    selector: '[setPosition]'
                },] }
    ];
    /** @nocollapse */
    setPosition.ctorParameters = function () { return [
        { type: ElementRef }
    ]; };
    setPosition.propDecorators = {
        height: [{ type: Input, args: ['setPosition',] }]
    };
    return setPosition;
}());
export { setPosition };
if (false) {
    /** @type {?} */
    setPosition.prototype.height;
    /** @type {?} */
    setPosition.prototype.el;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpY2tPdXRzaWRlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhcjItbXVsdGlzZWxlY3QtZHJvcGRvd24vIiwic291cmNlcyI6WyJsaWIvY2xpY2tPdXRzaWRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQXFCLE1BQU0sZUFBZSxDQUFDOztJQU1oSCwrQkFBb0IsV0FBdUI7UUFBdkIsZ0JBQVcsR0FBWCxXQUFXLENBQVk7NEJBSXJCLElBQUksWUFBWSxFQUFjO0tBSG5EOzs7Ozs7SUFPTSx1Q0FBTzs7Ozs7SUFGZCxVQUVlLEtBQWlCLEVBQUUsYUFBMEI7UUFDeEQsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUNoQixPQUFPO1NBQ1Y7O1FBRUQsSUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzdFLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDaEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDakM7S0FDSjs7Z0JBckJKLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsZ0JBQWdCO2lCQUM3Qjs7OztnQkFKbUIsVUFBVTs7OytCQVN6QixNQUFNOzBCQUdOLFlBQVksU0FBQyxnQkFBZ0IsRUFBRSxDQUFDLFFBQVEsRUFBRSxlQUFlLENBQUMsY0FDMUQsWUFBWSxTQUFDLHFCQUFxQixFQUFFLENBQUMsUUFBUSxFQUFFLGVBQWUsQ0FBQzs7Z0NBYnBFOztTQUthLHFCQUFxQjs7Ozs7Ozs7SUF5QjlCLHlCQUFvQixXQUF1QjtRQUF2QixnQkFBVyxHQUFYLFdBQVcsQ0FBWTtzQkFJM0IsSUFBSSxZQUFZLEVBQWM7S0FIN0M7Ozs7OztJQU1NLGlDQUFPOzs7OztJQURkLFVBQ2UsS0FBaUIsRUFBRSxhQUEwQjtRQUN4RCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUMzQjs7Z0JBYkosU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxVQUFVO2lCQUN2Qjs7OztnQkE1Qm1CLFVBQVU7Ozt5QkFpQ3pCLE1BQU07MEJBR04sWUFBWSxTQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQzs7MEJBcEN0Qzs7U0E2QmEsZUFBZTs7Ozs7Ozs7SUFpQnhCLHdCQUFvQixFQUFjO1FBQWQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtLQUVqQzs7OztJQUlELGlDQUFROzs7SUFBUjtRQUVJLElBQUksQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztLQUNuRDs7OztJQUNELG9DQUFXOzs7SUFBWDtRQUNJLElBQUksQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztLQUNuRDs7Z0JBakJKLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsYUFBYTtpQkFDMUI7Ozs7Z0JBM0NtQixVQUFVOzs7MkJBa0R6QixLQUFLLFNBQUMsV0FBVzs7eUJBbER0Qjs7U0E0Q2EsY0FBYzs7Ozs7Ozs7SUF5QnZCLHFCQUFtQixFQUFjO1FBQWQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtLQUVoQzs7OztJQUNELDhCQUFROzs7SUFBUjtRQUNJLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNiLElBQUksQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQztTQUMvRTtLQUNKOzs7O0lBQ0QsaUNBQVc7OztJQUFYO1FBQ0ksSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2IsSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO1NBQy9FO0tBQ0o7O2dCQW5CSixTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLGVBQWU7aUJBQzVCOzs7O2dCQWhFbUIsVUFBVTs7O3lCQW1FekIsS0FBSyxTQUFDLGFBQWE7O3NCQW5FeEI7O1NBaUVhLFdBQVciLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIE91dHB1dCwgRXZlbnRFbWl0dGVyLCBIb3N0TGlzdGVuZXIsIElucHV0LCBPbkluaXQsIE9uQ2hhbmdlcyB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1tjbGlja091dHNpZGVdJ1xufSlcbmV4cG9ydCBjbGFzcyBDbGlja091dHNpZGVEaXJlY3RpdmUge1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHtcbiAgICB9XG5cbiAgICBAT3V0cHV0KClcbiAgICBwdWJsaWMgY2xpY2tPdXRzaWRlID0gbmV3IEV2ZW50RW1pdHRlcjxNb3VzZUV2ZW50PigpO1xuXG4gICAgQEhvc3RMaXN0ZW5lcignZG9jdW1lbnQ6Y2xpY2snLCBbJyRldmVudCcsICckZXZlbnQudGFyZ2V0J10pXG4gICAgQEhvc3RMaXN0ZW5lcignZG9jdW1lbnQ6dG91Y2hzdGFydCcsIFsnJGV2ZW50JywgJyRldmVudC50YXJnZXQnXSlcbiAgICBwdWJsaWMgb25DbGljayhldmVudDogTW91c2VFdmVudCwgdGFyZ2V0RWxlbWVudDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0YXJnZXRFbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjbGlja2VkSW5zaWRlID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNvbnRhaW5zKHRhcmdldEVsZW1lbnQpO1xuICAgICAgICBpZiAoIWNsaWNrZWRJbnNpZGUpIHtcbiAgICAgICAgICAgIHRoaXMuY2xpY2tPdXRzaWRlLmVtaXQoZXZlbnQpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1tzY3JvbGxdJ1xufSlcbmV4cG9ydCBjbGFzcyBTY3JvbGxEaXJlY3RpdmUge1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHtcbiAgICB9XG5cbiAgICBAT3V0cHV0KClcbiAgICBwdWJsaWMgc2Nyb2xsID0gbmV3IEV2ZW50RW1pdHRlcjxNb3VzZUV2ZW50PigpO1xuXG4gICAgQEhvc3RMaXN0ZW5lcignc2Nyb2xsJywgWyckZXZlbnQnXSlcbiAgICBwdWJsaWMgb25DbGljayhldmVudDogTW91c2VFdmVudCwgdGFyZ2V0RWxlbWVudDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5zY3JvbGwuZW1pdChldmVudCk7XG4gICAgfVxufVxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbc3R5bGVQcm9wXSdcbn0pXG5leHBvcnQgY2xhc3Mgc3R5bGVEaXJlY3RpdmUge1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBlbDogRWxlbWVudFJlZikge1xuXG4gICAgfVxuXG4gICAgQElucHV0KCdzdHlsZVByb3AnKSBzdHlsZVZhbDogbnVtYmVyO1xuXG4gICAgbmdPbkluaXQoKSB7XG5cbiAgICAgICAgdGhpcy5lbC5uYXRpdmVFbGVtZW50LnN0eWxlLnRvcCA9IHRoaXMuc3R5bGVWYWw7XG4gICAgfVxuICAgIG5nT25DaGFuZ2VzKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQuc3R5bGUudG9wID0gdGhpcy5zdHlsZVZhbDtcbiAgICB9XG59XG5cblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbc2V0UG9zaXRpb25dJ1xufSlcbmV4cG9ydCBjbGFzcyBzZXRQb3NpdGlvbiBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzIHtcblxuICAgIEBJbnB1dCgnc2V0UG9zaXRpb24nKSBoZWlnaHQ6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBlbDogRWxlbWVudFJlZikge1xuXG4gICAgfVxuICAgIG5nT25Jbml0KCkge1xuICAgICAgICBpZiAodGhpcy5oZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuZWwubmF0aXZlRWxlbWVudC5zdHlsZS5ib3R0b20gPSBwYXJzZUludCh0aGlzLmhlaWdodCArIDE1ICsgXCJcIikgKyAncHgnO1xuICAgICAgICB9XG4gICAgfVxuICAgIG5nT25DaGFuZ2VzKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5oZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuZWwubmF0aXZlRWxlbWVudC5zdHlsZS5ib3R0b20gPSBwYXJzZUludCh0aGlzLmhlaWdodCArIDE1ICsgXCJcIikgKyAncHgnO1xuICAgICAgICB9XG4gICAgfVxufSJdfQ==