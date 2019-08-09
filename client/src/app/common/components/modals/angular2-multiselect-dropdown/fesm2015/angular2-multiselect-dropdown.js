import { Directive, ElementRef, Output, EventEmitter, HostListener, Input, Injectable, Pipe, Component, TemplateRef, ContentChild, ViewContainerRef, ViewEncapsulation, NgZone, Renderer2, ViewChild, NgModule, ChangeDetectorRef, forwardRef } from '@angular/core';
import { Subject } from 'rxjs';
import { FormsModule, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { CommonModule } from '@angular/common';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
class MyException {
    /**
     * @param {?} status
     * @param {?} body
     */
    constructor(status, body) {
        this.status = status;
        this.body = body;
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
class ClickOutsideDirective {
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
class ScrollDirective {
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
class styleDirective {
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
class setPosition {
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
class DataService {
    constructor() {
        this.filteredData = [];
        this.subject = new Subject();
    }
    /**
     * @param {?} data
     * @return {?}
     */
    setData(data) {
        this.filteredData = data;
        this.subject.next(data);
    }
    /**
     * @return {?}
     */
    getData() {
        return this.subject.asObservable();
    }
    /**
     * @return {?}
     */
    getFilteredData() {
        if (this.filteredData && this.filteredData.length > 0) {
            return this.filteredData;
        }
        else {
            return [];
        }
    }
}
DataService.decorators = [
    { type: Injectable }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
class ListFilterPipe {
    /**
     * @param {?} ds
     */
    constructor(ds) {
        this.ds = ds;
        this.filteredList = [];
    }
    /**
     * @param {?} items
     * @param {?} filter
     * @param {?} searchBy
     * @return {?}
     */
    transform(items, filter, searchBy) {
        if (!items || !filter) {
            this.ds.setData(items);
            return items;
        }
        this.filteredList = items.filter((item) => this.applyFilter(item, filter, searchBy));
        this.ds.setData(this.filteredList);
        return this.filteredList;
    }
    /**
     * @param {?} item
     * @param {?} filter
     * @param {?} searchBy
     * @return {?}
     */
    applyFilter(item, filter, searchBy) {
        /** @type {?} */
        let found = false;
        if (searchBy.length > 0) {
            if (item.grpTitle) {
                found = true;
            }
            else {
                for (var t = 0; t < searchBy.length; t++) {
                    if (filter && item[searchBy[t]] && item[searchBy[t]] != "") {
                        if (item[searchBy[t]].toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0) {
                            found = true;
                        }
                    }
                }
            }
        }
        else {
            if (item.grpTitle) {
                found = true;
            }
            else {
                for (var prop in item) {
                    if (filter && item[prop]) {
                        if (item[prop].toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0) {
                            found = true;
                        }
                    }
                }
            }
        }
        return found;
    }
}
ListFilterPipe.decorators = [
    { type: Pipe, args: [{
                name: 'listFilter',
                pure: true
            },] }
];
/** @nocollapse */
ListFilterPipe.ctorParameters = () => [
    { type: DataService }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
class Item {
    constructor() {
    }
}
Item.decorators = [
    { type: Component, args: [{
                selector: 'c-item',
                template: ``
            }] }
];
/** @nocollapse */
Item.ctorParameters = () => [];
Item.propDecorators = {
    template: [{ type: ContentChild, args: [TemplateRef,] }]
};
class Badge {
    constructor() {
    }
}
Badge.decorators = [
    { type: Component, args: [{
                selector: 'c-badge',
                template: ``
            }] }
];
/** @nocollapse */
Badge.ctorParameters = () => [];
Badge.propDecorators = {
    template: [{ type: ContentChild, args: [TemplateRef,] }]
};
class Search {
    constructor() {
    }
}
Search.decorators = [
    { type: Component, args: [{
                selector: 'c-search',
                template: ``
            }] }
];
/** @nocollapse */
Search.ctorParameters = () => [];
Search.propDecorators = {
    template: [{ type: ContentChild, args: [TemplateRef,] }]
};
class TemplateRenderer {
    /**
     * @param {?} viewContainer
     */
    constructor(viewContainer) {
        this.viewContainer = viewContainer;
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        this.view = this.viewContainer.createEmbeddedView(this.data.template, {
            '\$implicit': this.data,
            'item': this.item
        });
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this.view.destroy();
    }
}
TemplateRenderer.decorators = [
    { type: Component, args: [{
                selector: 'c-templateRenderer',
                template: ``
            }] }
];
/** @nocollapse */
TemplateRenderer.ctorParameters = () => [
    { type: ViewContainerRef }
];
TemplateRenderer.propDecorators = {
    data: [{ type: Input }],
    item: [{ type: Input }]
};
class CIcon {
}
CIcon.decorators = [
    { type: Component, args: [{
                selector: 'c-icon',
                template: `<svg *ngIf="name == 'remove'" width="100%" height="100%" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                        viewBox="0 0 47.971 47.971" style="enable-background:new 0 0 47.971 47.971;" xml:space="preserve">
                        <g>
                            <path d="M28.228,23.986L47.092,5.122c1.172-1.171,1.172-3.071,0-4.242c-1.172-1.172-3.07-1.172-4.242,0L23.986,19.744L5.121,0.88
                                c-1.172-1.172-3.07-1.172-4.242,0c-1.172,1.171-1.172,3.071,0,4.242l18.865,18.864L0.879,42.85c-1.172,1.171-1.172,3.071,0,4.242
                                C1.465,47.677,2.233,47.97,3,47.97s1.535-0.293,2.121-0.879l18.865-18.864L42.85,47.091c0.586,0.586,1.354,0.879,2.121,0.879
                                s1.535-0.293,2.121-0.879c1.172-1.171,1.172-3.071,0-4.242L28.228,23.986z"/>
                        </g>
                    </svg>
            <svg *ngIf="name == 'angle-down'" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="100%" height="100%" viewBox="0 0 612 612" style="enable-background:new 0 0 612 612;" xml:space="preserve">
<g>
	<g id="_x31_0_34_">
		<g>
			<path d="M604.501,134.782c-9.999-10.05-26.222-10.05-36.221,0L306.014,422.558L43.721,134.782
				c-9.999-10.05-26.223-10.05-36.222,0s-9.999,26.35,0,36.399l279.103,306.241c5.331,5.357,12.422,7.652,19.386,7.296
				c6.988,0.356,14.055-1.939,19.386-7.296l279.128-306.268C614.5,161.106,614.5,144.832,604.501,134.782z"/>
		</g>
	</g>
</g>
</svg>
<svg *ngIf="name == 'angle-up'" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="100%" height="100%" viewBox="0 0 612 612" style="enable-background:new 0 0 612 612;" xml:space="preserve">
<g>
	<g id="_x39__30_">
		<g>
			<path d="M604.501,440.509L325.398,134.956c-5.331-5.357-12.423-7.627-19.386-7.27c-6.989-0.357-14.056,1.913-19.387,7.27
				L7.499,440.509c-9.999,10.024-9.999,26.298,0,36.323s26.223,10.024,36.222,0l262.293-287.164L568.28,476.832
				c9.999,10.024,26.222,10.024,36.221,0C614.5,466.809,614.5,450.534,604.501,440.509z"/>
		</g>
	</g>
</g>

</svg>
<svg *ngIf="name == 'search'" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="100%" height="100%" viewBox="0 0 615.52 615.52" style="enable-background:new 0 0 615.52 615.52;"
	 xml:space="preserve">
<g>
	<g>
		<g id="Search__x28_and_thou_shall_find_x29_">
			<g>
				<path d="M602.531,549.736l-184.31-185.368c26.679-37.72,42.528-83.729,42.528-133.548C460.75,103.35,357.997,0,231.258,0
					C104.518,0,1.765,103.35,1.765,230.82c0,127.47,102.753,230.82,229.493,230.82c49.53,0,95.271-15.944,132.78-42.777
					l184.31,185.366c7.482,7.521,17.292,11.291,27.102,11.291c9.812,0,19.62-3.77,27.083-11.291
					C617.496,589.188,617.496,564.777,602.531,549.736z M355.9,319.763l-15.042,21.273L319.7,356.174
					c-26.083,18.658-56.667,28.526-88.442,28.526c-84.365,0-152.995-69.035-152.995-153.88c0-84.846,68.63-153.88,152.995-153.88
					s152.996,69.034,152.996,153.88C384.271,262.769,374.462,293.526,355.9,319.763z"/>
			</g>
		</g>
	</g>
</g>

</svg>
<svg *ngIf="name == 'clear'" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 51.976 51.976" style="enable-background:new 0 0 51.976 51.976;" xml:space="preserve">
<g>
	<path d="M44.373,7.603c-10.137-10.137-26.632-10.138-36.77,0c-10.138,10.138-10.137,26.632,0,36.77s26.632,10.138,36.77,0
		C54.51,34.235,54.51,17.74,44.373,7.603z M36.241,36.241c-0.781,0.781-2.047,0.781-2.828,0l-7.425-7.425l-7.778,7.778
		c-0.781,0.781-2.047,0.781-2.828,0c-0.781-0.781-0.781-2.047,0-2.828l7.778-7.778l-7.425-7.425c-0.781-0.781-0.781-2.048,0-2.828
		c0.781-0.781,2.047-0.781,2.828,0l7.425,7.425l7.071-7.071c0.781-0.781,2.047-0.781,2.828,0c0.781,0.781,0.781,2.047,0,2.828
		l-7.071,7.071l7.425,7.425C37.022,34.194,37.022,35.46,36.241,36.241z"/>
</g>
</svg>`,
                encapsulation: ViewEncapsulation.None
            }] }
];
CIcon.propDecorators = {
    name: [{ type: Input }]
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
class VirtualScrollComponent {
    /**
     * @param {?} element
     * @param {?} renderer
     * @param {?} zone
     */
    constructor(element, renderer, zone) {
        this.element = element;
        this.renderer = renderer;
        this.zone = zone;
        this.window = window;
        this._enableUnequalChildrenSizes = false;
        this.useMarginInsteadOfTranslate = false;
        this._bufferAmount = 0;
        this.scrollAnimationTime = 750;
        this.resizeBypassRefreshTheshold = 5;
        this._checkResizeInterval = 1000;
        this._items = [];
        this.compareItems = (item1, item2) => item1 === item2;
        this.update = new EventEmitter();
        this.vsUpdate = new EventEmitter();
        this.change = new EventEmitter();
        this.vsChange = new EventEmitter();
        this.start = new EventEmitter();
        this.vsStart = new EventEmitter();
        this.end = new EventEmitter();
        this.vsEnd = new EventEmitter();
        this.calculatedScrollbarWidth = 0;
        this.calculatedScrollbarHeight = 0;
        this.padding = 0;
        this.previousViewPort = /** @type {?} */ ({});
        this.cachedPageSize = 0;
        this.previousScrollNumberElements = 0;
        this.horizontal = false;
        this.scrollThrottlingTime = 0;
        this.resetWrapGroupDimensions();
    }
    /**
     * @return {?}
     */
    get viewPortIndices() {
        /** @type {?} */
        let pageInfo = this.previousViewPort || /** @type {?} */ ({});
        return {
            startIndex: pageInfo.startIndex || 0,
            endIndex: pageInfo.endIndex || 0
        };
    }
    /**
     * @return {?}
     */
    get enableUnequalChildrenSizes() {
        return this._enableUnequalChildrenSizes;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set enableUnequalChildrenSizes(value) {
        if (this._enableUnequalChildrenSizes === value) {
            return;
        }
        this._enableUnequalChildrenSizes = value;
        this.minMeasuredChildWidth = undefined;
        this.minMeasuredChildHeight = undefined;
    }
    /**
     * @return {?}
     */
    get bufferAmount() {
        return Math.max(this._bufferAmount, this.enableUnequalChildrenSizes ? 5 : 0);
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set bufferAmount(value) {
        this._bufferAmount = value;
    }
    /**
     * @return {?}
     */
    get scrollThrottlingTime() {
        return this._scrollThrottlingTime;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set scrollThrottlingTime(value) {
        this._scrollThrottlingTime = value;
        this.refresh_throttled = /** @type {?} */ (this.throttleTrailing(() => {
            this.refresh_internal(false);
        }, this._scrollThrottlingTime));
    }
    /**
     * @return {?}
     */
    get checkResizeInterval() {
        return this._checkResizeInterval;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set checkResizeInterval(value) {
        if (this._checkResizeInterval === value) {
            return;
        }
        this._checkResizeInterval = value;
        this.addScrollEventHandlers();
    }
    /**
     * @return {?}
     */
    get items() {
        return this._items;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set items(value) {
        if (value === this._items) {
            return;
        }
        this._items = value || [];
        this.refresh_internal(true);
    }
    /**
     * @return {?}
     */
    get horizontal() {
        return this._horizontal;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set horizontal(value) {
        this._horizontal = value;
        this.updateDirection();
    }
    /**
     * @return {?}
     */
    revertParentOverscroll() {
        /** @type {?} */
        const scrollElement = this.getScrollElement();
        if (scrollElement && this.oldParentScrollOverflow) {
            scrollElement.style['overflow-y'] = this.oldParentScrollOverflow.y;
            scrollElement.style['overflow-x'] = this.oldParentScrollOverflow.x;
        }
        this.oldParentScrollOverflow = undefined;
    }
    /**
     * @return {?}
     */
    get parentScroll() {
        return this._parentScroll;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set parentScroll(value) {
        if (this._parentScroll === value) {
            return;
        }
        this.revertParentOverscroll();
        this._parentScroll = value;
        this.addScrollEventHandlers();
        /** @type {?} */
        const scrollElement = this.getScrollElement();
        if (scrollElement !== this.element.nativeElement) {
            this.oldParentScrollOverflow = { x: scrollElement.style['overflow-x'], y: scrollElement.style['overflow-y'] };
            scrollElement.style['overflow-y'] = this.horizontal ? 'visible' : 'auto';
            scrollElement.style['overflow-x'] = this.horizontal ? 'auto' : 'visible';
        }
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        this.addScrollEventHandlers();
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this.removeScrollEventHandlers();
        this.revertParentOverscroll();
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        /** @type {?} */
        let indexLengthChanged = this.cachedItemsLength !== this.items.length;
        this.cachedItemsLength = this.items.length;
        /** @type {?} */
        const firstRun = !changes.items || !changes.items.previousValue || changes.items.previousValue.length === 0;
        this.refresh_internal(indexLengthChanged || firstRun);
    }
    /**
     * @return {?}
     */
    ngDoCheck() {
        if (this.cachedItemsLength !== this.items.length) {
            this.cachedItemsLength = this.items.length;
            this.refresh_internal(true);
        }
    }
    /**
     * @return {?}
     */
    refresh() {
        this.refresh_internal(true);
    }
    /**
     * @param {?} item
     * @param {?=} alignToBeginning
     * @param {?=} additionalOffset
     * @param {?=} animationMilliseconds
     * @param {?=} animationCompletedCallback
     * @return {?}
     */
    scrollInto(item, alignToBeginning = true, additionalOffset = 0, animationMilliseconds = undefined, animationCompletedCallback = undefined) {
        /** @type {?} */
        let index = this.items.indexOf(item);
        if (index === -1) {
            return;
        }
        this.scrollToIndex(index, alignToBeginning, additionalOffset, animationMilliseconds, animationCompletedCallback);
    }
    /**
     * @param {?} index
     * @param {?=} alignToBeginning
     * @param {?=} additionalOffset
     * @param {?=} animationMilliseconds
     * @param {?=} animationCompletedCallback
     * @return {?}
     */
    scrollToIndex(index, alignToBeginning = true, additionalOffset = 0, animationMilliseconds = undefined, animationCompletedCallback = undefined) {
        /** @type {?} */
        let maxRetries = 5;
        /** @type {?} */
        let retryIfNeeded = () => {
            --maxRetries;
            if (maxRetries <= 0) {
                if (animationCompletedCallback) {
                    animationCompletedCallback();
                }
                return;
            }
            /** @type {?} */
            let dimensions = this.calculateDimensions();
            /** @type {?} */
            let desiredStartIndex = Math.min(Math.max(index, 0), dimensions.itemCount - 1);
            if (this.previousViewPort.startIndex === desiredStartIndex) {
                if (animationCompletedCallback) {
                    animationCompletedCallback();
                }
                return;
            }
            this.scrollToIndex_internal(index, alignToBeginning, additionalOffset, 0, retryIfNeeded);
        };
        this.scrollToIndex_internal(index, alignToBeginning, additionalOffset, animationMilliseconds, retryIfNeeded);
    }
    /**
     * @param {?} index
     * @param {?=} alignToBeginning
     * @param {?=} additionalOffset
     * @param {?=} animationMilliseconds
     * @param {?=} animationCompletedCallback
     * @return {?}
     */
    scrollToIndex_internal(index, alignToBeginning = true, additionalOffset = 0, animationMilliseconds = undefined, animationCompletedCallback = undefined) {
        animationMilliseconds = animationMilliseconds === undefined ? this.scrollAnimationTime : animationMilliseconds;
        /** @type {?} */
        let scrollElement = this.getScrollElement();
        /** @type {?} */
        let offset = this.getElementsOffset();
        /** @type {?} */
        let dimensions = this.calculateDimensions();
        /** @type {?} */
        let scroll = this.calculatePadding(index, dimensions, false) + offset + additionalOffset;
        if (!alignToBeginning) {
            scroll -= dimensions.wrapGroupsPerPage * dimensions[this._childScrollDim];
        }
        if (!animationMilliseconds) {
            this.renderer.setProperty(scrollElement, this._scrollType, scroll);
            this.refresh_internal(false, animationCompletedCallback);
            return;
        }
    }
    /**
     * @return {?}
     */
    checkScrollElementResized() {
        /** @type {?} */
        let boundingRect = this.getScrollElement().getBoundingClientRect();
        /** @type {?} */
        let sizeChanged;
        if (!this.previousScrollBoundingRect) {
            sizeChanged = true;
        }
        else {
            /** @type {?} */
            let widthChange = Math.abs(boundingRect.width - this.previousScrollBoundingRect.width);
            /** @type {?} */
            let heightChange = Math.abs(boundingRect.height - this.previousScrollBoundingRect.height);
            sizeChanged = widthChange > this.resizeBypassRefreshTheshold || heightChange > this.resizeBypassRefreshTheshold;
        }
        if (sizeChanged) {
            this.previousScrollBoundingRect = boundingRect;
            if (boundingRect.width > 0 && boundingRect.height > 0) {
                this.refresh_internal(false);
            }
        }
    }
    /**
     * @return {?}
     */
    updateDirection() {
        if (this.horizontal) {
            this._invisiblePaddingProperty = 'width';
            this._offsetType = 'offsetLeft';
            this._pageOffsetType = 'pageXOffset';
            this._childScrollDim = 'childWidth';
            this._marginDir = 'margin-left';
            this._translateDir = 'translateX';
            this._scrollType = 'scrollLeft';
        }
        else {
            this._invisiblePaddingProperty = 'height';
            this._offsetType = 'offsetTop';
            this._pageOffsetType = 'pageYOffset';
            this._childScrollDim = 'childHeight';
            this._marginDir = 'margin-top';
            this._translateDir = 'translateY';
            this._scrollType = 'scrollTop';
        }
    }
    /**
     * @param {?} func
     * @param {?} wait
     * @return {?}
     */
    throttleTrailing(func, wait) {
        /** @type {?} */
        let timeout = undefined;
        /** @type {?} */
        const result = function () {
            /** @type {?} */
            const _this = this;
            /** @type {?} */
            const _arguments = arguments;
            if (timeout) {
                return;
            }
            if (wait <= 0) {
                func.apply(_this, _arguments);
            }
            else {
                timeout = setTimeout(function () {
                    timeout = undefined;
                    func.apply(_this, _arguments);
                }, wait);
            }
        };
        return result;
    }
    /**
     * @param {?} itemsArrayModified
     * @param {?=} refreshCompletedCallback
     * @param {?=} maxRunTimes
     * @return {?}
     */
    refresh_internal(itemsArrayModified, refreshCompletedCallback = undefined, maxRunTimes = 2) {
        //note: maxRunTimes is to force it to keep recalculating if the previous iteration caused a re-render (different sliced items in viewport or scrollPosition changed).
        //The default of 2x max will probably be accurate enough without causing too large a performance bottleneck
        //The code would typically quit out on the 2nd iteration anyways. The main time it'd think more than 2 runs would be necessary would be for vastly different sized child items or if this is the 1st time the items array was initialized.
        //Without maxRunTimes, If the user is actively scrolling this code would become an infinite loop until they stopped scrolling. This would be okay, except each scroll event would start an additional infinte loop. We want to short-circuit it to prevent his.
        this.zone.runOutsideAngular(() => {
            requestAnimationFrame(() => {
                if (itemsArrayModified) {
                    this.resetWrapGroupDimensions();
                }
                /** @type {?} */
                let viewport = this.calculateViewport();
                /** @type {?} */
                let startChanged = itemsArrayModified || viewport.startIndex !== this.previousViewPort.startIndex;
                /** @type {?} */
                let endChanged = itemsArrayModified || viewport.endIndex !== this.previousViewPort.endIndex;
                /** @type {?} */
                let scrollLengthChanged = viewport.scrollLength !== this.previousViewPort.scrollLength;
                /** @type {?} */
                let paddingChanged = viewport.padding !== this.previousViewPort.padding;
                this.previousViewPort = viewport;
                if (scrollLengthChanged) {
                    this.renderer.setStyle(this.invisiblePaddingElementRef.nativeElement, this._invisiblePaddingProperty, `${viewport.scrollLength}px`);
                }
                if (paddingChanged) {
                    if (this.useMarginInsteadOfTranslate) {
                        this.renderer.setStyle(this.contentElementRef.nativeElement, this._marginDir, `${viewport.padding}px`);
                    }
                    else {
                        this.renderer.setStyle(this.contentElementRef.nativeElement, 'transform', `${this._translateDir}(${viewport.padding}px)`);
                        this.renderer.setStyle(this.contentElementRef.nativeElement, 'webkitTransform', `${this._translateDir}(${viewport.padding}px)`);
                    }
                }
                if (startChanged || endChanged) {
                    this.zone.run(() => {
                        // update the scroll list to trigger re-render of components in viewport
                        this.viewPortItems = viewport.startIndexWithBuffer >= 0 && viewport.endIndexWithBuffer >= 0 ? this.items.slice(viewport.startIndexWithBuffer, viewport.endIndexWithBuffer + 1) : [];
                        this.update.emit(this.viewPortItems);
                        this.vsUpdate.emit(this.viewPortItems);
                        {
                            if (startChanged) {
                                this.start.emit({ start: viewport.startIndex, end: viewport.endIndex });
                                this.vsStart.emit({ start: viewport.startIndex, end: viewport.endIndex });
                            }
                            if (endChanged) {
                                this.end.emit({ start: viewport.startIndex, end: viewport.endIndex });
                                this.vsEnd.emit({ start: viewport.startIndex, end: viewport.endIndex });
                            }
                            if (startChanged || endChanged) {
                                this.change.emit({ start: viewport.startIndex, end: viewport.endIndex });
                                this.vsChange.emit({ start: viewport.startIndex, end: viewport.endIndex });
                            }
                        }
                        if (maxRunTimes > 0) {
                            this.refresh_internal(false, refreshCompletedCallback, maxRunTimes - 1);
                            return;
                        }
                        if (refreshCompletedCallback) {
                            refreshCompletedCallback();
                        }
                    });
                }
                else {
                    if (maxRunTimes > 0 && (scrollLengthChanged || paddingChanged)) {
                        this.refresh_internal(false, refreshCompletedCallback, maxRunTimes - 1);
                        return;
                    }
                    if (refreshCompletedCallback) {
                        refreshCompletedCallback();
                    }
                }
            });
        });
    }
    /**
     * @return {?}
     */
    getScrollElement() {
        return this.parentScroll instanceof Window ? document.scrollingElement || document.documentElement || document.body : this.parentScroll || this.element.nativeElement;
    }
    /**
     * @return {?}
     */
    addScrollEventHandlers() {
        /** @type {?} */
        let scrollElement = this.getScrollElement();
        this.removeScrollEventHandlers();
        this.zone.runOutsideAngular(() => {
            if (this.parentScroll instanceof Window) {
                this.disposeScrollHandler = this.renderer.listen('window', 'scroll', this.refresh_throttled);
                this.disposeResizeHandler = this.renderer.listen('window', 'resize', this.refresh_throttled);
            }
            else {
                this.disposeScrollHandler = this.renderer.listen(scrollElement, 'scroll', this.refresh_throttled);
                if (this._checkResizeInterval > 0) {
                    this.checkScrollElementResizedTimer = /** @type {?} */ (setInterval(() => { this.checkScrollElementResized(); }, this._checkResizeInterval));
                }
            }
        });
    }
    /**
     * @return {?}
     */
    removeScrollEventHandlers() {
        if (this.checkScrollElementResizedTimer) {
            clearInterval(this.checkScrollElementResizedTimer);
        }
        if (this.disposeScrollHandler) {
            this.disposeScrollHandler();
            this.disposeScrollHandler = undefined;
        }
        if (this.disposeResizeHandler) {
            this.disposeResizeHandler();
            this.disposeResizeHandler = undefined;
        }
    }
    /**
     * @return {?}
     */
    getElementsOffset() {
        /** @type {?} */
        let offset = 0;
        if (this.containerElementRef && this.containerElementRef.nativeElement) {
            offset += this.containerElementRef.nativeElement[this._offsetType];
        }
        if (this.parentScroll) {
            /** @type {?} */
            let scrollElement = this.getScrollElement();
            /** @type {?} */
            let elementClientRect = this.element.nativeElement.getBoundingClientRect();
            /** @type {?} */
            let scrollClientRect = scrollElement.getBoundingClientRect();
            if (this.horizontal) {
                offset += elementClientRect.left - scrollClientRect.left;
            }
            else {
                offset += elementClientRect.top - scrollClientRect.top;
            }
            if (!(this.parentScroll instanceof Window)) {
                offset += scrollElement[this._scrollType];
            }
        }
        return offset;
    }
    /**
     * @return {?}
     */
    countItemsPerWrapGroup() {
        /** @type {?} */
        let propertyName = this.horizontal ? 'offsetLeft' : 'offsetTop';
        /** @type {?} */
        let children = ((this.containerElementRef && this.containerElementRef.nativeElement) || this.contentElementRef.nativeElement).children;
        /** @type {?} */
        let childrenLength = children ? children.length : 0;
        if (childrenLength === 0) {
            return 1;
        }
        /** @type {?} */
        let firstOffset = children[0][propertyName];
        /** @type {?} */
        let result = 1;
        while (result < childrenLength && firstOffset === children[result][propertyName]) {
            ++result;
        }
        return result;
    }
    /**
     * @return {?}
     */
    getScrollPosition() {
        /** @type {?} */
        let windowScrollValue = undefined;
        if (this.parentScroll instanceof Window) {
            /** @type {?} */
            var window;
            windowScrollValue = window[this._pageOffsetType];
        }
        return windowScrollValue || this.getScrollElement()[this._scrollType] || 0;
    }
    /**
     * @return {?}
     */
    resetWrapGroupDimensions() {
        /** @type {?} */
        const oldWrapGroupDimensions = this.wrapGroupDimensions;
        this.wrapGroupDimensions = {
            maxChildSizePerWrapGroup: [],
            numberOfKnownWrapGroupChildSizes: 0,
            sumOfKnownWrapGroupChildWidths: 0,
            sumOfKnownWrapGroupChildHeights: 0
        };
        if (!this.enableUnequalChildrenSizes || !oldWrapGroupDimensions || oldWrapGroupDimensions.numberOfKnownWrapGroupChildSizes === 0) {
            return;
        }
        /** @type {?} */
        const itemsPerWrapGroup = this.countItemsPerWrapGroup();
        for (let wrapGroupIndex = 0; wrapGroupIndex < oldWrapGroupDimensions.maxChildSizePerWrapGroup.length; ++wrapGroupIndex) {
            /** @type {?} */
            const oldWrapGroupDimension = oldWrapGroupDimensions.maxChildSizePerWrapGroup[wrapGroupIndex];
            if (!oldWrapGroupDimension || !oldWrapGroupDimension.items || !oldWrapGroupDimension.items.length) {
                continue;
            }
            if (oldWrapGroupDimension.items.length !== itemsPerWrapGroup) {
                return;
            }
            /** @type {?} */
            let itemsChanged = false;
            /** @type {?} */
            let arrayStartIndex = itemsPerWrapGroup * wrapGroupIndex;
            for (let i = 0; i < itemsPerWrapGroup; ++i) {
                if (!this.compareItems(oldWrapGroupDimension.items[i], this.items[arrayStartIndex + i])) {
                    itemsChanged = true;
                    break;
                }
            }
            if (!itemsChanged) {
                ++this.wrapGroupDimensions.numberOfKnownWrapGroupChildSizes;
                this.wrapGroupDimensions.sumOfKnownWrapGroupChildWidths += oldWrapGroupDimension.childWidth || 0;
                this.wrapGroupDimensions.sumOfKnownWrapGroupChildHeights += oldWrapGroupDimension.childHeight || 0;
                this.wrapGroupDimensions.maxChildSizePerWrapGroup[wrapGroupIndex] = oldWrapGroupDimension;
            }
        }
    }
    /**
     * @return {?}
     */
    calculateDimensions() {
        /** @type {?} */
        let scrollElement = this.getScrollElement();
        /** @type {?} */
        let itemCount = this.items.length;
        /** @type {?} */
        const maxCalculatedScrollBarSize = 25; // Note: Formula to auto-calculate doesn't work for ParentScroll, so we default to this if not set by consuming application
        this.calculatedScrollbarHeight = Math.max(Math.min(scrollElement.offsetHeight - scrollElement.clientHeight, maxCalculatedScrollBarSize), this.calculatedScrollbarHeight);
        this.calculatedScrollbarWidth = Math.max(Math.min(scrollElement.offsetWidth - scrollElement.clientWidth, maxCalculatedScrollBarSize), this.calculatedScrollbarWidth);
        /** @type {?} */
        let viewWidth = scrollElement.offsetWidth - (this.scrollbarWidth || this.calculatedScrollbarWidth || (this.horizontal ? 0 : maxCalculatedScrollBarSize));
        /** @type {?} */
        let viewHeight = scrollElement.offsetHeight - (this.scrollbarHeight || this.calculatedScrollbarHeight || (this.horizontal ? maxCalculatedScrollBarSize : 0));
        /** @type {?} */
        let content = (this.containerElementRef && this.containerElementRef.nativeElement) || this.contentElementRef.nativeElement;
        /** @type {?} */
        let itemsPerWrapGroup = this.countItemsPerWrapGroup();
        /** @type {?} */
        let wrapGroupsPerPage;
        /** @type {?} */
        let defaultChildWidth;
        /** @type {?} */
        let defaultChildHeight;
        if (!this.enableUnequalChildrenSizes) {
            if (content.children.length > 0) {
                if (!this.childWidth || !this.childHeight) {
                    if (!this.minMeasuredChildWidth && viewWidth > 0) {
                        this.minMeasuredChildWidth = viewWidth;
                    }
                    if (!this.minMeasuredChildHeight && viewHeight > 0) {
                        this.minMeasuredChildHeight = viewHeight;
                    }
                }
                /** @type {?} */
                let child = content.children[0];
                /** @type {?} */
                let clientRect = child.getBoundingClientRect();
                this.minMeasuredChildWidth = Math.min(this.minMeasuredChildWidth, clientRect.width);
                this.minMeasuredChildHeight = Math.min(this.minMeasuredChildHeight, clientRect.height);
            }
            defaultChildWidth = this.childWidth || this.minMeasuredChildWidth || viewWidth;
            defaultChildHeight = this.childHeight || this.minMeasuredChildHeight || viewHeight;
            /** @type {?} */
            let itemsPerRow = Math.max(Math.ceil(viewWidth / defaultChildWidth), 1);
            /** @type {?} */
            let itemsPerCol = Math.max(Math.ceil(viewHeight / defaultChildHeight), 1);
            wrapGroupsPerPage = this.horizontal ? itemsPerRow : itemsPerCol;
        }
        else {
            /** @type {?} */
            let scrollOffset = scrollElement[this._scrollType] - (this.previousViewPort ? this.previousViewPort.padding : 0);
            /** @type {?} */
            let arrayStartIndex = this.previousViewPort.startIndexWithBuffer || 0;
            /** @type {?} */
            let wrapGroupIndex = Math.ceil(arrayStartIndex / itemsPerWrapGroup);
            /** @type {?} */
            let maxWidthForWrapGroup = 0;
            /** @type {?} */
            let maxHeightForWrapGroup = 0;
            /** @type {?} */
            let sumOfVisibleMaxWidths = 0;
            /** @type {?} */
            let sumOfVisibleMaxHeights = 0;
            wrapGroupsPerPage = 0;
            for (let i = 0; i < content.children.length; ++i) {
                ++arrayStartIndex;
                /** @type {?} */
                let child = content.children[i];
                /** @type {?} */
                let clientRect = child.getBoundingClientRect();
                maxWidthForWrapGroup = Math.max(maxWidthForWrapGroup, clientRect.width);
                maxHeightForWrapGroup = Math.max(maxHeightForWrapGroup, clientRect.height);
                if (arrayStartIndex % itemsPerWrapGroup === 0) {
                    /** @type {?} */
                    let oldValue = this.wrapGroupDimensions.maxChildSizePerWrapGroup[wrapGroupIndex];
                    if (oldValue) {
                        --this.wrapGroupDimensions.numberOfKnownWrapGroupChildSizes;
                        this.wrapGroupDimensions.sumOfKnownWrapGroupChildWidths -= oldValue.childWidth || 0;
                        this.wrapGroupDimensions.sumOfKnownWrapGroupChildHeights -= oldValue.childHeight || 0;
                    }
                    ++this.wrapGroupDimensions.numberOfKnownWrapGroupChildSizes;
                    /** @type {?} */
                    const items = this.items.slice(arrayStartIndex - itemsPerWrapGroup, arrayStartIndex);
                    this.wrapGroupDimensions.maxChildSizePerWrapGroup[wrapGroupIndex] = {
                        childWidth: maxWidthForWrapGroup,
                        childHeight: maxHeightForWrapGroup,
                        items: items
                    };
                    this.wrapGroupDimensions.sumOfKnownWrapGroupChildWidths += maxWidthForWrapGroup;
                    this.wrapGroupDimensions.sumOfKnownWrapGroupChildHeights += maxHeightForWrapGroup;
                    if (this.horizontal) {
                        /** @type {?} */
                        let maxVisibleWidthForWrapGroup = Math.min(maxWidthForWrapGroup, Math.max(viewWidth - sumOfVisibleMaxWidths, 0));
                        if (scrollOffset > 0) {
                            /** @type {?} */
                            let scrollOffsetToRemove = Math.min(scrollOffset, maxVisibleWidthForWrapGroup);
                            maxVisibleWidthForWrapGroup -= scrollOffsetToRemove;
                            scrollOffset -= scrollOffsetToRemove;
                        }
                        sumOfVisibleMaxWidths += maxVisibleWidthForWrapGroup;
                        if (maxVisibleWidthForWrapGroup > 0 && viewWidth >= sumOfVisibleMaxWidths) {
                            ++wrapGroupsPerPage;
                        }
                    }
                    else {
                        /** @type {?} */
                        let maxVisibleHeightForWrapGroup = Math.min(maxHeightForWrapGroup, Math.max(viewHeight - sumOfVisibleMaxHeights, 0));
                        if (scrollOffset > 0) {
                            /** @type {?} */
                            let scrollOffsetToRemove = Math.min(scrollOffset, maxVisibleHeightForWrapGroup);
                            maxVisibleHeightForWrapGroup -= scrollOffsetToRemove;
                            scrollOffset -= scrollOffsetToRemove;
                        }
                        sumOfVisibleMaxHeights += maxVisibleHeightForWrapGroup;
                        if (maxVisibleHeightForWrapGroup > 0 && viewHeight >= sumOfVisibleMaxHeights) {
                            ++wrapGroupsPerPage;
                        }
                    }
                    ++wrapGroupIndex;
                    maxWidthForWrapGroup = 0;
                    maxHeightForWrapGroup = 0;
                }
            }
            /** @type {?} */
            let averageChildWidth = this.wrapGroupDimensions.sumOfKnownWrapGroupChildWidths / this.wrapGroupDimensions.numberOfKnownWrapGroupChildSizes;
            /** @type {?} */
            let averageChildHeight = this.wrapGroupDimensions.sumOfKnownWrapGroupChildHeights / this.wrapGroupDimensions.numberOfKnownWrapGroupChildSizes;
            defaultChildWidth = this.childWidth || averageChildWidth || viewWidth;
            defaultChildHeight = this.childHeight || averageChildHeight || viewHeight;
            if (this.horizontal) {
                if (viewWidth > sumOfVisibleMaxWidths) {
                    wrapGroupsPerPage += Math.ceil((viewWidth - sumOfVisibleMaxWidths) / defaultChildWidth);
                }
            }
            else {
                if (viewHeight > sumOfVisibleMaxHeights) {
                    wrapGroupsPerPage += Math.ceil((viewHeight - sumOfVisibleMaxHeights) / defaultChildHeight);
                }
            }
        }
        /** @type {?} */
        let itemsPerPage = itemsPerWrapGroup * wrapGroupsPerPage;
        /** @type {?} */
        let pageCount_fractional = itemCount / itemsPerPage;
        /** @type {?} */
        let numberOfWrapGroups = Math.ceil(itemCount / itemsPerWrapGroup);
        /** @type {?} */
        let scrollLength = 0;
        /** @type {?} */
        let defaultScrollLengthPerWrapGroup = this.horizontal ? defaultChildWidth : defaultChildHeight;
        if (this.enableUnequalChildrenSizes) {
            /** @type {?} */
            let numUnknownChildSizes = 0;
            for (let i = 0; i < numberOfWrapGroups; ++i) {
                /** @type {?} */
                let childSize = this.wrapGroupDimensions.maxChildSizePerWrapGroup[i] && this.wrapGroupDimensions.maxChildSizePerWrapGroup[i][this._childScrollDim];
                if (childSize) {
                    scrollLength += childSize;
                }
                else {
                    ++numUnknownChildSizes;
                }
            }
            scrollLength += Math.round(numUnknownChildSizes * defaultScrollLengthPerWrapGroup);
        }
        else {
            scrollLength = numberOfWrapGroups * defaultScrollLengthPerWrapGroup;
        }
        return {
            itemCount: itemCount,
            itemsPerWrapGroup: itemsPerWrapGroup,
            wrapGroupsPerPage: wrapGroupsPerPage,
            itemsPerPage: itemsPerPage,
            pageCount_fractional: pageCount_fractional,
            childWidth: defaultChildWidth,
            childHeight: defaultChildHeight,
            scrollLength: scrollLength
        };
    }
    /**
     * @param {?} arrayStartIndexWithBuffer
     * @param {?} dimensions
     * @param {?} allowUnequalChildrenSizes_Experimental
     * @return {?}
     */
    calculatePadding(arrayStartIndexWithBuffer, dimensions, allowUnequalChildrenSizes_Experimental) {
        if (dimensions.itemCount === 0) {
            return 0;
        }
        /** @type {?} */
        let defaultScrollLengthPerWrapGroup = dimensions[this._childScrollDim];
        /** @type {?} */
        let startingWrapGroupIndex = Math.ceil(arrayStartIndexWithBuffer / dimensions.itemsPerWrapGroup) || 0;
        if (!this.enableUnequalChildrenSizes) {
            return defaultScrollLengthPerWrapGroup * startingWrapGroupIndex;
        }
        /** @type {?} */
        let numUnknownChildSizes = 0;
        /** @type {?} */
        let result = 0;
        for (let i = 0; i < startingWrapGroupIndex; ++i) {
            /** @type {?} */
            let childSize = this.wrapGroupDimensions.maxChildSizePerWrapGroup[i] && this.wrapGroupDimensions.maxChildSizePerWrapGroup[i][this._childScrollDim];
            if (childSize) {
                result += childSize;
            }
            else {
                ++numUnknownChildSizes;
            }
        }
        result += Math.round(numUnknownChildSizes * defaultScrollLengthPerWrapGroup);
        return result;
    }
    /**
     * @param {?} scrollPosition
     * @param {?} dimensions
     * @return {?}
     */
    calculatePageInfo(scrollPosition, dimensions) {
        /** @type {?} */
        let scrollPercentage = 0;
        if (this.enableUnequalChildrenSizes) {
            /** @type {?} */
            const numberOfWrapGroups = Math.ceil(dimensions.itemCount / dimensions.itemsPerWrapGroup);
            /** @type {?} */
            let totalScrolledLength = 0;
            /** @type {?} */
            let defaultScrollLengthPerWrapGroup = dimensions[this._childScrollDim];
            for (let i = 0; i < numberOfWrapGroups; ++i) {
                /** @type {?} */
                let childSize = this.wrapGroupDimensions.maxChildSizePerWrapGroup[i] && this.wrapGroupDimensions.maxChildSizePerWrapGroup[i][this._childScrollDim];
                if (childSize) {
                    totalScrolledLength += childSize;
                }
                else {
                    totalScrolledLength += defaultScrollLengthPerWrapGroup;
                }
                if (scrollPosition < totalScrolledLength) {
                    scrollPercentage = i / numberOfWrapGroups;
                    break;
                }
            }
        }
        else {
            scrollPercentage = scrollPosition / dimensions.scrollLength;
        }
        /** @type {?} */
        let startingArrayIndex_fractional = Math.min(Math.max(scrollPercentage * dimensions.pageCount_fractional, 0), dimensions.pageCount_fractional) * dimensions.itemsPerPage;
        /** @type {?} */
        let maxStart = dimensions.itemCount - dimensions.itemsPerPage - 1;
        /** @type {?} */
        let arrayStartIndex = Math.min(Math.floor(startingArrayIndex_fractional), maxStart);
        arrayStartIndex -= arrayStartIndex % dimensions.itemsPerWrapGroup;
        /** @type {?} */
        let arrayEndIndex = Math.ceil(startingArrayIndex_fractional) + dimensions.itemsPerPage - 1;
        arrayEndIndex += (dimensions.itemsPerWrapGroup - ((arrayEndIndex + 1) % dimensions.itemsPerWrapGroup)); // round up to end of wrapGroup
        if (isNaN(arrayStartIndex)) {
            arrayStartIndex = 0;
        }
        if (isNaN(arrayEndIndex)) {
            arrayEndIndex = 0;
        }
        arrayStartIndex = Math.min(Math.max(arrayStartIndex, 0), dimensions.itemCount - 1);
        arrayEndIndex = Math.min(Math.max(arrayEndIndex, 0), dimensions.itemCount - 1);
        /** @type {?} */
        let bufferSize = this.bufferAmount * dimensions.itemsPerWrapGroup;
        /** @type {?} */
        let startIndexWithBuffer = Math.min(Math.max(arrayStartIndex - bufferSize, 0), dimensions.itemCount - 1);
        /** @type {?} */
        let endIndexWithBuffer = Math.min(Math.max(arrayEndIndex + bufferSize, 0), dimensions.itemCount - 1);
        return {
            startIndex: arrayStartIndex,
            endIndex: arrayEndIndex,
            startIndexWithBuffer: startIndexWithBuffer,
            endIndexWithBuffer: endIndexWithBuffer
        };
    }
    /**
     * @return {?}
     */
    calculateViewport() {
        /** @type {?} */
        let dimensions = this.calculateDimensions();
        /** @type {?} */
        let offset = this.getElementsOffset();
        /** @type {?} */
        let scrollPosition = this.getScrollPosition();
        if (scrollPosition > dimensions.scrollLength && !(this.parentScroll instanceof Window)) {
            scrollPosition = dimensions.scrollLength;
        }
        else {
            scrollPosition -= offset;
        }
        scrollPosition = Math.max(0, scrollPosition);
        /** @type {?} */
        let pageInfo = this.calculatePageInfo(scrollPosition, dimensions);
        /** @type {?} */
        let newPadding = this.calculatePadding(pageInfo.startIndexWithBuffer, dimensions, true);
        /** @type {?} */
        let newScrollLength = dimensions.scrollLength;
        return {
            startIndex: pageInfo.startIndex,
            endIndex: pageInfo.endIndex,
            startIndexWithBuffer: pageInfo.startIndexWithBuffer,
            endIndexWithBuffer: pageInfo.endIndexWithBuffer,
            padding: Math.round(newPadding),
            scrollLength: Math.round(newScrollLength)
        };
    }
}
VirtualScrollComponent.decorators = [
    { type: Component, args: [{
                selector: 'virtual-scroll,[virtualScroll]',
                exportAs: 'virtualScroll',
                template: `
    <div class="total-padding" #invisiblePadding></div>
    <div class="scrollable-content" #content>
      <ng-content></ng-content>
    </div>
  `,
                host: {
                    '[class.horizontal]': "horizontal",
                    '[class.vertical]': "!horizontal",
                    '[class.selfScroll]': "!parentScroll"
                },
                styles: [`
    :host {
      position: relative;
	  display: block;
      -webkit-overflow-scrolling: touch;
    }
	
	:host.horizontal.selfScroll {
      overflow-y: visible;
      overflow-x: auto;
	}
	:host.vertical.selfScroll {
      overflow-y: auto;
      overflow-x: visible;
	}
	
    .scrollable-content {
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      max-width: 100vw;
      max-height: 100vh;
      position: absolute;
    }

	.scrollable-content ::ng-deep > * {
		box-sizing: border-box;
	}
	
	:host.horizontal {
		white-space: nowrap;
	}
	
	:host.horizontal .scrollable-content {
		display: flex;
	}
	
	:host.horizontal .scrollable-content ::ng-deep > * {
		flex-shrink: 0;
		flex-grow: 0;
		white-space: initial;
	}
	
    .total-padding {
      width: 1px;
      opacity: 0;
    }
    
    :host.horizontal .total-padding {
      height: 100%;
    }
  `]
            }] }
];
/** @nocollapse */
VirtualScrollComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: Renderer2 },
    { type: NgZone }
];
VirtualScrollComponent.propDecorators = {
    enableUnequalChildrenSizes: [{ type: Input }],
    useMarginInsteadOfTranslate: [{ type: Input }],
    scrollbarWidth: [{ type: Input }],
    scrollbarHeight: [{ type: Input }],
    childWidth: [{ type: Input }],
    childHeight: [{ type: Input }],
    bufferAmount: [{ type: Input }],
    scrollAnimationTime: [{ type: Input }],
    resizeBypassRefreshTheshold: [{ type: Input }],
    scrollThrottlingTime: [{ type: Input }],
    checkResizeInterval: [{ type: Input }],
    items: [{ type: Input }],
    compareItems: [{ type: Input }],
    horizontal: [{ type: Input }],
    parentScroll: [{ type: Input }],
    update: [{ type: Output }],
    vsUpdate: [{ type: Output }],
    change: [{ type: Output }],
    vsChange: [{ type: Output }],
    start: [{ type: Output }],
    vsStart: [{ type: Output }],
    end: [{ type: Output }],
    vsEnd: [{ type: Output }],
    contentElementRef: [{ type: ViewChild, args: ['content', { read: ElementRef },] }],
    invisiblePaddingElementRef: [{ type: ViewChild, args: ['invisiblePadding', { read: ElementRef },] }],
    containerElementRef: [{ type: ContentChild, args: ['container', { read: ElementRef },] }]
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const DROPDOWN_CONTROL_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AngularMultiSelect),
    multi: true
};
/** @type {?} */
const DROPDOWN_CONTROL_VALIDATION = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => AngularMultiSelect),
    multi: true,
};
/** @type {?} */
const noop = () => {
};
class AngularMultiSelect {
    /**
     * @param {?} _elementRef
     * @param {?} cdr
     * @param {?} ds
     */
    constructor(_elementRef, cdr, ds) {
        this._elementRef = _elementRef;
        this.cdr = cdr;
        this.ds = ds;
        this.onSelect = new EventEmitter();
        this.onDeSelect = new EventEmitter();
        this.onSelectAll = new EventEmitter();
        this.onDeSelectAll = new EventEmitter();
        this.onOpen = new EventEmitter();
        this.onClose = new EventEmitter();
        this.onScrollToEnd = new EventEmitter();
        this.onFilterSelectAll = new EventEmitter();
        this.onFilterDeSelectAll = new EventEmitter();
        this.onAddFilterNewItem = new EventEmitter();
        this.isActive = false;
        this.isSelectAll = false;
        this.isFilterSelectAll = false;
        this.isInfiniteFilterSelectAll = false;
        this.chunkIndex = [];
        this.cachedItems = [];
        this.groupCachedItems = [];
        this.itemHeight = 41.6;
        this.filterLength = 0;
        this.infiniteFilterLength = 0;
        this.dropdownListYOffset = 0;
        this.defaultSettings = {
            singleSelection: false,
            text: 'Select',
            enableCheckAll: true,
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            filterSelectAllText: 'Select all filtered results',
            filterUnSelectAllText: 'UnSelect all filtered results',
            enableSearchFilter: false,
            searchBy: [],
            maxHeight: 300,
            badgeShowLimit: 999999999999,
            classes: '',
            disabled: false,
            searchPlaceholderText: 'Search',
            showCheckbox: true,
            noDataLabel: 'No Data Available',
            searchAutofocus: true,
            lazyLoading: false,
            labelKey: 'itemName',
            primaryKey: 'id',
            position: 'bottom',
            autoPosition: true,
            enableFilterSelectAll: true,
            selectGroup: false,
            addNewItemOnFilter: false,
            addNewButtonText: "Add",
            escapeToClose: true
        };
        this.filteredList = [];
        this.onTouchedCallback = noop;
        this.onChangeCallback = noop;
    }
    /**
     * @param {?} event
     * @return {?}
     */
    onEscapeDown(event) {
        if (this.settings.escapeToClose) {
            this.closeDropdown();
        }
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        this.settings = Object.assign(this.defaultSettings, this.settings);
        if (this.settings.groupBy) {
            this.groupedData = this.transformData(this.data, this.settings.groupBy);
            this.groupCachedItems = this.cloneArray(this.groupedData);
        }
        this.cachedItems = this.cloneArray(this.data);
        if (this.settings.position == 'top') {
            setTimeout(() => {
                this.selectedListHeight = { val: 0 };
                this.selectedListHeight.val = this.selectedListElem.nativeElement.clientHeight;
            });
        }
        this.subscription = this.ds.getData().subscribe(data => {
            if (data) {
                /** @type {?} */
                var len = 0;
                data.forEach((obj, i) => {
                    if (!obj.hasOwnProperty('grpTitle')) {
                        len++;
                    }
                });
                this.filterLength = len;
                this.onFilterChange(data);
            }
        });
        setTimeout(() => {
            this.calculateDropdownDirection();
        });
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (changes["data"] && !changes["data"].firstChange) {
            if (this.settings.groupBy) {
                this.groupedData = this.transformData(this.data, this.settings.groupBy);
                if (this.data.length == 0) {
                    this.selectedItems = [];
                }
            }
            this.cachedItems = this.cloneArray(this.data);
        }
        if (changes["settings"] && !changes["settings"].firstChange) {
            this.settings = Object.assign(this.defaultSettings, this.settings);
        }
        if (changes["loading"]) {
            console.log(this.loading);
        }
    }
    /**
     * @return {?}
     */
    ngDoCheck() {
        if (this.selectedItems) {
            if (this.selectedItems.length == 0 || this.data.length == 0 || this.selectedItems.length < this.data.length) {
                this.isSelectAll = false;
            }
        }
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        if (this.settings.lazyLoading) ;
    }
    /**
     * @return {?}
     */
    ngAfterViewChecked() {
        if (this.selectedListElem.nativeElement.clientHeight && this.settings.position == 'top' && this.selectedListHeight) {
            this.selectedListHeight.val = this.selectedListElem.nativeElement.clientHeight;
            this.cdr.detectChanges();
        }
    }
    /**
     * @param {?} item
     * @param {?} index
     * @param {?} evt
     * @return {?}
     */
    onItemClick(item, index, evt) {
        if (this.settings.disabled) {
            return false;
        }
        /** @type {?} */
        let found = this.isSelected(item);
        /** @type {?} */
        let limit = this.selectedItems.length < this.settings.limitSelection ? true : false;
        if (!found) {
            if (this.settings.limitSelection) {
                if (limit) {
                    this.addSelected(item);
                    this.onSelect.emit(item);
                }
            }
            else {
                this.addSelected(item);
                this.onSelect.emit(item);
            }
        }
        else {
            this.removeSelected(item);
            this.onDeSelect.emit(item);
        }
        if (this.isSelectAll || this.data.length > this.selectedItems.length) {
            this.isSelectAll = false;
        }
        if (this.data.length == this.selectedItems.length) {
            this.isSelectAll = true;
        }
        if (this.settings.groupBy) {
            this.updateGroupInfo(item);
        }
    }
    /**
     * @param {?} c
     * @return {?}
     */
    validate(c) {
        return null;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    writeValue(value) {
        if (value !== undefined && value !== null && value !== '') {
            if (this.settings.singleSelection) {
                try {
                    if (value.length > 1) {
                        this.selectedItems = [value[0]];
                        throw new MyException(404, { "msg": "Single Selection Mode, Selected Items cannot have more than one item." });
                    }
                    else {
                        this.selectedItems = value;
                    }
                }
                catch (e) {
                    console.error(e.body.msg);
                }
            }
            else {
                if (this.settings.limitSelection) {
                    this.selectedItems = value.slice(0, this.settings.limitSelection);
                }
                else {
                    this.selectedItems = value;
                }
                if (this.selectedItems.length === this.data.length && this.data.length > 0) {
                    this.isSelectAll = true;
                }
            }
        }
        else {
            this.selectedItems = [];
        }
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    registerOnChange(fn) {
        this.onChangeCallback = fn;
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    registerOnTouched(fn) {
        this.onTouchedCallback = fn;
    }
    /**
     * @param {?} index
     * @param {?} item
     * @return {?}
     */
    trackByFn(index, item) {
        return item[this.settings.primaryKey];
    }
    /**
     * @param {?} clickedItem
     * @return {?}
     */
    isSelected(clickedItem) {
        /** @type {?} */
        let found = false;
        this.selectedItems && this.selectedItems.forEach(item => {
            if (clickedItem[this.settings.primaryKey] === item[this.settings.primaryKey]) {
                found = true;
            }
        });
        return found;
    }
    /**
     * @param {?} item
     * @return {?}
     */
    addSelected(item) {
        if (this.settings.singleSelection) {
            this.selectedItems = [];
            this.selectedItems.push(item);
            this.closeDropdown();
        }
        else
            this.selectedItems.push(item);
        this.onChangeCallback(this.selectedItems);
        this.onTouchedCallback(this.selectedItems);
    }
    /**
     * @param {?} clickedItem
     * @return {?}
     */
    removeSelected(clickedItem) {
        this.selectedItems && this.selectedItems.forEach(item => {
            if (clickedItem[this.settings.primaryKey] === item[this.settings.primaryKey]) {
                this.selectedItems.splice(this.selectedItems.indexOf(item), 1);
            }
        });
        this.onChangeCallback(this.selectedItems);
        this.onTouchedCallback(this.selectedItems);
    }
    /**
     * @param {?} evt
     * @return {?}
     */
    toggleDropdown(evt) {
        if (this.settings.disabled) {
            return false;
        }
        this.isActive = !this.isActive;
        if (this.isActive) {
            if (this.settings.searchAutofocus && this.searchInput && this.settings.enableSearchFilter && !this.searchTempl) {
                setTimeout(() => {
                    this.searchInput.nativeElement.focus();
                }, 0);
            }
            this.onOpen.emit(true);
        }
        else {
            this.onClose.emit(false);
        }
        setTimeout(() => {
            this.calculateDropdownDirection();
        }, 0);
        evt.preventDefault();
    }
    /**
     * @return {?}
     */
    openDropdown() {
        if (this.settings.disabled) {
            return false;
        }
        this.isActive = true;
        if (this.settings.searchAutofocus && this.searchInput && this.settings.enableSearchFilter && !this.searchTempl) {
            setTimeout(() => {
                this.searchInput.nativeElement.focus();
            }, 0);
        }
        this.onOpen.emit(true);
    }
    /**
     * @return {?}
     */
    closeDropdown() {
        if (this.searchInput && this.settings.lazyLoading) {
            this.searchInput.nativeElement.value = "";
        }
        if (this.searchInput) {
            this.searchInput.nativeElement.value = "";
        }
        this.filter = "";
        this.isActive = false;
        this.onClose.emit(false);
    }
    /**
     * @return {?}
     */
    closeDropdownOnClickOut() {
        if (this.searchInput && this.settings.lazyLoading) {
            this.searchInput.nativeElement.value = "";
        }
        if (this.searchInput) {
            this.searchInput.nativeElement.value = "";
        }
        this.filter = "";
        this.isActive = false;
        this.onClose.emit(false);
    }
    /**
     * @return {?}
     */
    toggleSelectAll() {
        if (!this.isSelectAll) {
            this.selectedItems = [];
            if (this.settings.groupBy) {
                this.groupedData.forEach((obj) => {
                    obj.selected = true;
                });
                this.groupCachedItems.forEach((obj) => {
                    obj.selected = true;
                });
            }
            this.selectedItems = this.data.slice();
            this.isSelectAll = true;
            this.onChangeCallback(this.selectedItems);
            this.onTouchedCallback(this.selectedItems);
            this.onSelectAll.emit(this.selectedItems);
        }
        else {
            if (this.settings.groupBy) {
                this.groupedData.forEach((obj) => {
                    obj.selected = false;
                });
                this.groupCachedItems.forEach((obj) => {
                    obj.selected = false;
                });
            }
            this.selectedItems = [];
            this.isSelectAll = false;
            this.onChangeCallback(this.selectedItems);
            this.onTouchedCallback(this.selectedItems);
            this.onDeSelectAll.emit(this.selectedItems);
        }
    }
    /**
     * @return {?}
     */
    filterGroupedList() {
        if (this.filter == "" || this.filter == null) {
            this.clearSearch();
            return;
        }
        this.groupedData = this.cloneArray(this.groupCachedItems);
        this.groupedData = this.groupedData.filter(obj => {
            /** @type {?} */
            var arr = obj.list.filter(t => {
                return t.itemName.toLowerCase().indexOf(this.filter.toLowerCase()) > -1;
            });
            obj.list = arr;
            return arr.some(cat => {
                return cat.itemName.toLowerCase().indexOf(this.filter.toLowerCase()) > -1;
            });
        });
        console.log(this.groupedData);
    }
    /**
     * @return {?}
     */
    toggleFilterSelectAll() {
        if (!this.isFilterSelectAll) {
            /** @type {?} */
            let added = [];
            if (this.settings.groupBy) {
                this.groupedData.forEach((item) => {
                    if (item.list) {
                        item.list.forEach((el) => {
                            if (!this.isSelected(el)) {
                                this.addSelected(el);
                                added.push(el);
                            }
                        });
                    }
                    this.updateGroupInfo(item);
                });
            }
            else {
                this.ds.getFilteredData().forEach((item) => {
                    if (!this.isSelected(item)) {
                        this.addSelected(item);
                        added.push(item);
                    }
                });
            }
            this.isFilterSelectAll = true;
            this.onFilterSelectAll.emit(added);
        }
        else {
            /** @type {?} */
            let removed = [];
            if (this.settings.groupBy) {
                this.groupedData.forEach((item) => {
                    if (item.list) {
                        item.list.forEach((el) => {
                            if (this.isSelected(el)) {
                                this.removeSelected(el);
                                removed.push(el);
                            }
                        });
                    }
                });
            }
            else {
                this.ds.getFilteredData().forEach((item) => {
                    if (this.isSelected(item)) {
                        this.removeSelected(item);
                        removed.push(item);
                    }
                });
            }
            this.isFilterSelectAll = false;
            this.onFilterDeSelectAll.emit(removed);
        }
    }
    /**
     * @return {?}
     */
    toggleInfiniteFilterSelectAll() {
        if (!this.isInfiniteFilterSelectAll) {
            this.data.forEach((item) => {
                if (!this.isSelected(item)) {
                    this.addSelected(item);
                }
            });
            this.isInfiniteFilterSelectAll = true;
        }
        else {
            this.data.forEach((item) => {
                if (this.isSelected(item)) {
                    this.removeSelected(item);
                }
            });
            this.isInfiniteFilterSelectAll = false;
        }
    }
    /**
     * @return {?}
     */
    clearSearch() {
        if (this.settings.groupBy) {
            this.groupedData = [];
            this.groupedData = this.cloneArray(this.groupCachedItems);
        }
        this.filter = "";
        this.isFilterSelectAll = false;
    }
    /**
     * @param {?} data
     * @return {?}
     */
    onFilterChange(data) {
        if (this.filter && this.filter == "" || data.length == 0) {
            this.isFilterSelectAll = false;
        }
        /** @type {?} */
        let cnt = 0;
        data.forEach((item) => {
            if (!item.hasOwnProperty('grpTitle') && this.isSelected(item)) {
                cnt++;
            }
        });
        if (cnt > 0 && this.filterLength == cnt) {
            this.isFilterSelectAll = true;
        }
        else if (cnt > 0 && this.filterLength != cnt) {
            this.isFilterSelectAll = false;
        }
        this.cdr.detectChanges();
    }
    /**
     * @param {?} arr
     * @return {?}
     */
    cloneArray(arr) {
        if (Array.isArray(arr)) {
            return JSON.parse(JSON.stringify(arr));
        }
        else if (typeof arr === 'object') {
            throw 'Cannot clone array containing an object!';
        }
        else {
            return arr;
        }
    }
    /**
     * @param {?} item
     * @return {?}
     */
    updateGroupInfo(item) {
        /** @type {?} */
        var key = this.settings.groupBy;
        this.groupedData.forEach((obj) => {
            /** @type {?} */
            var cnt = 0;
            if (obj.grpTitle && (item[key] == obj[key])) {
                if (obj.list) {
                    obj.list.forEach((el) => {
                        if (this.isSelected(el)) {
                            cnt++;
                        }
                    });
                }
            }
            if (obj.list && (cnt === obj.list.length) && (item[key] == obj[key])) {
                obj.selected = true;
            }
            else if (obj.list && (cnt != obj.list.length) && (item[key] == obj[key])) {
                obj.selected = false;
            }
        });
        this.groupCachedItems.forEach((obj) => {
            /** @type {?} */
            var cnt = 0;
            if (obj.grpTitle && (item[key] == obj[key])) {
                if (obj.list) {
                    obj.list.forEach((el) => {
                        if (this.isSelected(el)) {
                            cnt++;
                        }
                    });
                }
            }
            if (obj.list && (cnt === obj.list.length) && (item[key] == obj[key])) {
                obj.selected = true;
            }
            else if (obj.list && (cnt != obj.list.length) && (item[key] == obj[key])) {
                obj.selected = false;
            }
        });
    }
    /**
     * @param {?} arr
     * @param {?} field
     * @return {?}
     */
    transformData(arr, field) {
        /** @type {?} */
        const groupedObj = arr.reduce((prev, cur) => {
            if (!prev[cur[field]]) {
                prev[cur[field]] = [cur];
            }
            else {
                prev[cur[field]].push(cur);
            }
            return prev;
        }, {});
        /** @type {?} */
        const tempArr = [];
        Object.keys(groupedObj).map((x) => {
            /** @type {?} */
            var obj = {};
            obj["grpTitle"] = true;
            obj[this.settings.labelKey] = x;
            obj[this.settings.groupBy] = x;
            obj['selected'] = false;
            obj['list'] = [];
            groupedObj[x].forEach((item) => {
                item['list'] = [];
                obj.list.push(item);
            });
            tempArr.push(obj);
            // obj.list.forEach((item: any) => {
            //     tempArr.push(item);
            // });
        });
        return tempArr;
    }
    /**
     * @param {?} evt
     * @return {?}
     */
    filterInfiniteList(evt) {
        /** @type {?} */
        var filteredElems = [];
        if (this.settings.groupBy) {
            this.groupedData = this.groupCachedItems.slice();
        }
        else {
            this.data = this.cachedItems.slice();
        }
        if ((evt.target.value != null || evt.target.value != '') && !this.settings.groupBy) {
            if (this.settings.searchBy.length > 0) {
                for (var t = 0; t < this.settings.searchBy.length; t++) {
                    this.data.filter((el) => {
                        if (el[this.settings.searchBy[t].toString()].toString().toLowerCase().indexOf(evt.target.value.toString().toLowerCase()) >= 0) {
                            filteredElems.push(el);
                        }
                    });
                    /*                    if (filter && item[searchBy[t]] && item[searchBy[t]] != "") {
                                                                if (item[searchBy[t]].toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0) {
                                                                    found = true;
                                                                }
                                                            }*/
                }
            }
            else {
                this.data.filter(function (el) {
                    for (var prop in el) {
                        if (el[prop].toString().toLowerCase().indexOf(evt.target.value.toString().toLowerCase()) >= 0) {
                            filteredElems.push(el);
                            break;
                        }
                    }
                });
            }
            this.data = [];
            this.data = filteredElems;
            this.infiniteFilterLength = this.data.length;
        }
        if (evt.target.value.toString() != '' && this.settings.groupBy) {
            this.groupedData.filter(function (el) {
                if (el.hasOwnProperty('grpTitle')) {
                    filteredElems.push(el);
                }
                else {
                    for (var prop in el) {
                        if (el[prop].toString().toLowerCase().indexOf(evt.target.value.toString().toLowerCase()) >= 0) {
                            filteredElems.push(el);
                            break;
                        }
                    }
                }
            });
            this.groupedData = [];
            this.groupedData = filteredElems;
            this.infiniteFilterLength = this.groupedData.length;
        }
        else if (evt.target.value.toString() == '' && this.cachedItems.length > 0) {
            this.data = [];
            this.data = this.cachedItems;
            this.infiniteFilterLength = 0;
        }
    }
    /**
     * @return {?}
     */
    resetInfiniteSearch() {
        this.filter = "";
        this.isInfiniteFilterSelectAll = false;
        this.data = [];
        this.data = this.cachedItems;
        this.groupedData = this.groupCachedItems;
        this.infiniteFilterLength = 0;
    }
    /**
     * @param {?} e
     * @return {?}
     */
    onScrollEnd(e) {
        this.onScrollToEnd.emit(e);
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
    /**
     * @param {?} item
     * @return {?}
     */
    selectGroup(item) {
        if (item.selected) {
            item.selected = false;
            item.list.forEach((obj) => {
                this.removeSelected(obj);
            });
        }
        else {
            item.selected = true;
            item.list.forEach((obj) => {
                if (!this.isSelected(obj)) {
                    this.addSelected(obj);
                }
            });
        }
        this.updateGroupInfo(item);
    }
    /**
     * @return {?}
     */
    addFilterNewItem() {
        this.onAddFilterNewItem.emit(this.filter);
        this.filterPipe = new ListFilterPipe(this.ds);
        this.filterPipe.transform(this.data, this.filter, this.settings.searchBy);
    }
    /**
     * @return {?}
     */
    calculateDropdownDirection() {
        /** @type {?} */
        let shouldOpenTowardsTop = this.settings.position == 'top';
        if (this.settings.autoPosition) {
            /** @type {?} */
            const dropdownHeight = this.dropdownListElem.nativeElement.clientHeight;
            /** @type {?} */
            const viewportHeight = document.documentElement.clientHeight;
            /** @type {?} */
            const selectedListBounds = this.selectedListElem.nativeElement.getBoundingClientRect();
            /** @type {?} */
            const spaceOnTop = selectedListBounds.top;
            /** @type {?} */
            const spaceOnBottom = viewportHeight - selectedListBounds.top;
            if (spaceOnBottom < spaceOnTop && dropdownHeight < spaceOnTop) {
                this.openTowardsTop(true);
            }
            else {
                this.openTowardsTop(false);
            }
            // Keep preference if there is not enough space on either the top or bottom
            /* 			if (spaceOnTop || spaceOnBottom) {
                                        if (shouldOpenTowardsTop) {
                                            shouldOpenTowardsTop = spaceOnTop;
                                        } else {
                                            shouldOpenTowardsTop = !spaceOnBottom;
                                        }
                                    } */
        }
    }
    /**
     * @param {?} value
     * @return {?}
     */
    openTowardsTop(value) {
        if (value && this.selectedListElem.nativeElement.clientHeight) {
            this.dropdownListYOffset = 15 + this.selectedListElem.nativeElement.clientHeight;
        }
        else {
            this.dropdownListYOffset = 0;
        }
    }
}
AngularMultiSelect.decorators = [
    { type: Component, args: [{
                selector: 'angular2-multiselect',
                template: "<div class=\"cuppa-dropdown\" (clickOutside)=\"closeDropdownOnClickOut()\">\n    <div class=\"selected-list\" #selectedList>\n        <div class=\"c-btn\" (click)=\"toggleDropdown($event)\" [ngClass]=\"{'disabled': settings.disabled}\" [attr.tabindex]=\"0\">\n\n            <span *ngIf=\"selectedItems?.length == 0\">{{settings.text}}</span>\n            <span *ngIf=\"settings.singleSelection && !badgeTempl\">\n                <span *ngFor=\"let item of selectedItems;trackBy: trackByFn.bind(this);\">\n                    {{item[settings.labelKey]}}\n                </span>\n            </span>\n            <span class=\"c-list\" *ngIf=\"selectedItems?.length > 0 && settings.singleSelection && badgeTempl \">\n                <div class=\"c-token\" *ngFor=\"let item of selectedItems;trackBy: trackByFn.bind(this);let k = index\">\n                <span *ngIf=\"!badgeTempl\" class=\"c-label\">{{item[settings.labelKey]}}</span>\n\n            <span *ngIf=\"badgeTempl\" class=\"c-label\">\n                            <c-templateRenderer [data]=\"badgeTempl\" [item]=\"item\"></c-templateRenderer>\n                        </span>\n            <span class=\"c-remove\" (click)=\"onItemClick(item,k,$event);$event.stopPropagation()\">\n                <c-icon [name]=\"'remove'\"></c-icon>\n            </span>\n        </div>\n        </span>\n        <div class=\"c-list\" *ngIf=\"selectedItems?.length > 0 && !settings.singleSelection\">\n            <div class=\"c-token\" *ngFor=\"let item of selectedItems;trackBy: trackByFn.bind(this);let k = index\" [hidden]=\"k > settings.badgeShowLimit-1\">\n                <span *ngIf=\"!badgeTempl\" class=\"c-label\">{{item[settings.labelKey]}}</span>\n                <span *ngIf=\"badgeTempl\" class=\"c-label\">\n                    <c-templateRenderer [data]=\"badgeTempl\" [item]=\"item\"></c-templateRenderer>\n                </span>\n                <span class=\"c-remove\" (click)=\"onItemClick(item,k,$event);$event.stopPropagation()\">\n                    <c-icon [name]=\"'remove'\"></c-icon>\n                </span>\n            </div>\n        </div>\n        <span class=\"countplaceholder\" *ngIf=\"selectedItems?.length > settings.badgeShowLimit\">+{{selectedItems?.length - settings.badgeShowLimit }}</span>\n        <span *ngIf=\"!isActive\" class=\"c-angle-down\">\n    <c-icon [name]=\"'angle-down'\"></c-icon>\n            </span>\n        <span *ngIf=\"isActive\" class=\"c-angle-up\">\n            <c-icon [name]=\"'angle-up'\"></c-icon>\n\n            </span>\n    </div>\n</div>\n<div #dropdownList class=\"dropdown-list\"\n[ngClass]=\"{'dropdown-list-top': dropdownListYOffset}\"\n[style.bottom.px]=\"dropdownListYOffset ? dropdownListYOffset : null\"\n[hidden]=\"!isActive\">\n    <div [ngClass]=\"{'arrow-up': !dropdownListYOffset, 'arrow-down': dropdownListYOffset}\" class=\"arrow-2\"></div>\n    <div [ngClass]=\"{'arrow-up': !dropdownListYOffset, 'arrow-down': dropdownListYOffset}\"></div>\n<div class=\"list-area\">\n        <div class=\"pure-checkbox select-all\" *ngIf=\"settings.enableCheckAll && !settings.singleSelection && !settings.limitSelection && data?.length > 0\"\n            (click)=\"toggleSelectAll()\">\n            <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelectAll\" [disabled]=\"settings.limitSelection == selectedItems?.length\"\n            />\n            <label>\n                <span [hidden]=\"isSelectAll\">{{settings.selectAllText}}</span>\n                <span [hidden]=\"!isSelectAll\">{{settings.unSelectAllText}}</span>\n            </label>\n            <img class=\"loading-icon\" *ngIf=\"loading\" src=\"assets/img/loading.gif\"/>\n        </div>\n        <div class=\"list-filter\" *ngIf=\"settings.enableSearchFilter\">\n            <span class=\"c-search\">\n                <c-icon [name]=\"'search'\"></c-icon>\n                </span>\n            <span *ngIf=\"!settings.lazyLoading\" [hidden]=\"filter == undefined || filter?.length == 0\" class=\"c-clear\" (click)=\"clearSearch()\">\n                <c-icon [name]=\"'clear'\"></c-icon>\n                </span>\n            <span *ngIf=\"settings.lazyLoading\" [hidden]=\"filter == undefined || filter?.length == 0\" class=\"c-clear\" (click)=\"resetInfiniteSearch()\">\n                <c-icon [name]=\"'clear'\"></c-icon>\n                </span>\n\n            <input class=\"c-input\" *ngIf=\"settings.groupBy && !settings.lazyLoading && !searchTempl\" #searchInput type=\"text\" [placeholder]=\"settings.searchPlaceholderText\"\n                [(ngModel)]=\"filter\" (keyup)=\"filterGroupedList()\">\n                <input class=\"c-input\" *ngIf=\"!settings.groupBy && !settings.lazyLoading && !searchTempl\" #searchInput type=\"text\" [placeholder]=\"settings.searchPlaceholderText\"\n                [(ngModel)]=\"filter\" >\n            <input class=\"c-input\" *ngIf=\"settings.lazyLoading && !searchTempl\" #searchInput type=\"text\" [placeholder]=\"settings.searchPlaceholderText\"\n                [(ngModel)]=\"filter\" (keyup)=\"filterInfiniteList($event)\">\n            <!--            <input class=\"c-input\" *ngIf=\"!settings.lazyLoading && !searchTempl && settings.groupBy\" #searchInput type=\"text\" [placeholder]=\"settings.searchPlaceholderText\"\n                [(ngModel)]=\"filter\" (keyup)=\"filterGroupList($event)\">-->\n            <c-templateRenderer *ngIf=\"searchTempl\" [data]=\"searchTempl\" [item]=\"item\"></c-templateRenderer>\n        </div>\n        <div class=\"filter-select-all\" *ngIf=\"!settings.lazyLoading && settings.enableFilterSelectAll\">\n            <div class=\"pure-checkbox select-all\" *ngIf=\"!settings.groupBy && filter?.length > 0 && filterLength > 0\" (click)=\"toggleFilterSelectAll()\">\n                <input type=\"checkbox\" [checked]=\"isFilterSelectAll\" [disabled]=\"settings.limitSelection == selectedItems?.length\" />\n                <label>\n                <span [hidden]=\"isFilterSelectAll\">{{settings.filterSelectAllText}}</span>\n                <span [hidden]=\"!isFilterSelectAll\">{{settings.filterUnSelectAllText}}</span>\n            </label>\n            </div>\n            <div class=\"pure-checkbox select-all\" *ngIf=\"settings.groupBy && filter?.length > 0 && groupedData?.length > 0\" (click)=\"toggleFilterSelectAll()\">\n                    <input type=\"checkbox\" [checked]=\"isFilterSelectAll && filter?.length > 0\" [disabled]=\"settings.limitSelection == selectedItems?.length\" />\n                    <label>\n                    <span [hidden]=\"isFilterSelectAll\">{{settings.filterSelectAllText}}</span>\n                    <span [hidden]=\"!isFilterSelectAll\">{{settings.filterUnSelectAllText}}</span>\n                </label>\n                </div>\n            <label class=\"nodata-label\" *ngIf=\"!settings.groupBy && filterLength == 0\" [hidden]=\"filter == undefined || filter?.length == 0\">{{settings.noDataLabel}}</label>\n            <label class=\"nodata-label\" *ngIf=\"settings.groupBy && groupedData?.length == 0\" [hidden]=\"filter == undefined || filter?.length == 0\">{{settings.noDataLabel}}</label>\n\n            <div class=\"btn-container\" *ngIf=\"settings.addNewItemOnFilter && filterLength == 0\" [hidden]=\"filter == undefined || filter?.length == 0\">\n            <button class=\"c-btn btn-iceblue\" (click)=\"addFilterNewItem()\">{{settings.addNewButtonText}}</button>\n            </div>\n        </div>\n        <div class=\"filter-select-all\" *ngIf=\"settings.lazyLoading && settings.enableFilterSelectAll\">\n            <div class=\"pure-checkbox select-all\" *ngIf=\"filter?.length > 0 && infiniteFilterLength > 0\" (click)=\"toggleInfiniteFilterSelectAll()\">\n                <input type=\"checkbox\" [checked]=\"isInfiniteFilterSelectAll\" [disabled]=\"settings.limitSelection == selectedItems?.length\"\n                />\n                <label>\n                <span [hidden]=\"isInfiniteFilterSelectAll\">{{settings.filterSelectAllText}}</span>\n                <span [hidden]=\"!isInfiniteFilterSelectAll\">{{settings.filterUnSelectAllText}}</span>\n            </label>\n            </div>\n        </div>\n\n        <div *ngIf=\"!settings.groupBy && !settings.lazyLoading && itemTempl == undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n            <ul class=\"lazyContainer\">\n                <li *ngFor=\"let item of data | listFilter:filter : settings.searchBy; let i = index;\" (click)=\"onItemClick(item,i,$event)\"\n                    class=\"pure-checkbox\" [ngClass]=\"{'selected-item': isSelected(item) == true }\">\n                    <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label>{{item[settings.labelKey]}}</label>\n                </li>\n            </ul>\n        </div>\n        <div *ngIf=\"!settings.groupBy && settings.lazyLoading && itemTempl == undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n            <virtual-scroll [items]=\"data\" (vsUpdate)=\"viewPortItems = $event\" (vsEnd)=\"onScrollEnd($event)\" [ngStyle]=\"{'height': settings.maxHeight+'px'}\">\n                <ul class=\"lazyContainer\">\n                    <li *ngFor=\"let item of viewPortItems | listFilter:filter : settings.searchBy; let i = index;\" (click)=\"onItemClick(item,i,$event)\"\n                        class=\"pure-checkbox\" [ngClass]=\"{'selected-item': isSelected(item) == true }\">\n                        <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                        />\n                        <label>{{item[settings.labelKey]}}</label>\n                    </li>\n                </ul>\n            </virtual-scroll>\n        </div>\n        <div *ngIf=\"!settings.groupBy && !settings.lazyLoading && itemTempl != undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n            <ul class=\"lazyContainer\">\n                <li *ngFor=\"let item of data | listFilter:filter : settings.searchBy; let i = index;\" (click)=\"onItemClick(item,i,$event)\"\n                    class=\"pure-checkbox\" [ngClass]=\"{'selected-item': isSelected(item) == true }\">\n                    <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label></label>\n                    <c-templateRenderer [data]=\"itemTempl\" [item]=\"item\"></c-templateRenderer>\n                </li>\n            </ul>\n        </div>\n        <div *ngIf=\"!settings.groupBy && settings.lazyLoading && itemTempl != undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n            <virtual-scroll [items]=\"data\" (vsUpdate)=\"viewPortItems = $event\" (vsEnd)=\"onScrollEnd($event)\" [ngStyle]=\"{'height': settings.maxHeight+'px'}\">\n\n                <ul class=\"lazyContainer\">\n                    <li *ngFor=\"let item of viewPortItems | listFilter:filter : settings.searchBy; let i = index;\" (click)=\"onItemClick(item,i,$event)\"\n                        class=\"pure-checkbox\" [ngClass]=\"{'selected-item': isSelected(item) == true }\">\n                        <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                        />\n                        <label></label>\n                        <c-templateRenderer [data]=\"itemTempl\" [item]=\"item\"></c-templateRenderer>\n                    </li>\n                </ul>\n            </virtual-scroll>\n        </div>\n        <div *ngIf=\"settings.groupBy && settings.lazyLoading && itemTempl != undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n            <virtual-scroll [items]=\"groupedData\" (vsUpdate)=\"viewPortItems = $event\" (vsEnd)=\"onScrollEnd($event)\" [ngStyle]=\"{'height': settings.maxHeight+'px'}\">\n            <ul class=\"lazyContainer\">\n                <span *ngFor=\"let item of viewPortItems | listFilter:filter : settings.searchBy; let i = index;\">\n                <li (click)=\"onItemClick(item,i,$event)\" *ngIf=\"!item.grpTitle\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle}\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label></label>\n                    <c-templateRenderer [data]=\"itemTempl\" [item]=\"item\"></c-templateRenderer>\n                </li>\n                <li *ngIf=\"item.grpTitle\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle}\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label></label>\n                    <c-templateRenderer [data]=\"itemTempl\" [item]=\"item\"></c-templateRenderer>\n                </li>\n                </span>\n            </ul>\n            </virtual-scroll>\n        </div>\n        <div *ngIf=\"settings.groupBy && !settings.lazyLoading && itemTempl != undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n            <ul class=\"lazyContainer\">\n                <span *ngFor=\"let item of groupedData | listFilter:filter : settings.searchBy; let i = index;\">\n                    <li (click)=\"onItemClick(item,i,$event)\" *ngIf=\"!item.grpTitle\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle}\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label></label>\n                    <c-templateRenderer [data]=\"itemTempl\" [item]=\"item\"></c-templateRenderer>\n                </li>\n                <li *ngIf=\"item.grpTitle\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle}\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label></label>\n                    <c-templateRenderer [data]=\"itemTempl\" [item]=\"item\"></c-templateRenderer>\n                </li>\n                </span>\n            </ul>\n        </div>\n        <div *ngIf=\"settings.groupBy && settings.lazyLoading && itemTempl == undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n            <virtual-scroll [items]=\"groupedData\" (vsUpdate)=\"viewPortItems = $event\" (vsEnd)=\"onScrollEnd($event)\" [ngStyle]=\"{'height': settings.maxHeight+'px'}\">\n                <ul class=\"lazyContainer\">\n                    <span *ngFor=\"let item of viewPortItems; let i = index;\">\n                <li  *ngIf=\"item.grpTitle\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle, 'selected-item': isSelected(item) == true }\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox && !item.grpTitle\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label>{{item[settings.labelKey]}}</label>\n                </li>\n                <li (click)=\"onItemClick(item,i,$event)\" *ngIf=\"!item.grpTitle\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle, 'selected-item': isSelected(item) == true }\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox && !item.grpTitle\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label>{{item[settings.labelKey]}}</label>\n                </li>\n                </span>\n                </ul>\n            </virtual-scroll>\n        </div>\n        <div *ngIf=\"settings.groupBy && !settings.lazyLoading && itemTempl == undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n            <ul class=\"lazyContainer\">\n                    <span *ngFor=\"let item of groupedData ; let i = index;\">\n                            <li (click)=\"selectGroup(item)\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle}\" class=\"pure-checkbox\">\n                                    <input  *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"item.selected\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                                    />\n                                    <label>{{item[settings.labelKey]}}</label>\n                                    <ul class=\"lazyContainer\">\n                                            <span *ngFor=\"let val of item.list ; let j = index;\">\n                                            <li (click)=\"onItemClick(val,j,$event); $event.stopPropagation()\" [ngClass]=\"{'grp-title': val.grpTitle,'grp-item': !val.grpTitle}\" class=\"pure-checkbox\">\n                                                    <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(val)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(val)\"\n                                                    />\n                                                    <label>{{val[settings.labelKey]}}</label>\n                                                </li>\n                                                </span>\n                                    </ul>\n                                </li>\n                    </span>\n                <!-- <span *ngFor=\"let item of groupedData ; let i = index;\">\n                    <li (click)=\"onItemClick(item,i,$event)\" *ngIf=\"!item.grpTitle\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle}\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox && !item.grpTitle\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label>{{item[settings.labelKey]}}</label>\n                </li>\n                <li *ngIf=\"item.grpTitle && !settings.selectGroup\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle}\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox && settings.selectGroup\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label>{{item[settings.labelKey]}}</label>\n                </li>\n                 <li  (click)=\"selectGroup(item)\" *ngIf=\"item.grpTitle && settings.selectGroup\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle}\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox && settings.selectGroup\" type=\"checkbox\" [checked]=\"item.selected\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label>{{item[settings.labelKey]}}</label>\n                </li>\n                </span> -->\n            </ul>\n        </div>\n        <h5 class=\"list-message\" *ngIf=\"data?.length == 0\">{{settings.noDataLabel}}</h5>\n    </div>\n</div>\n</div>",
                host: { '[class]': 'defaultSettings.classes' },
                providers: [DROPDOWN_CONTROL_VALUE_ACCESSOR, DROPDOWN_CONTROL_VALIDATION],
                encapsulation: ViewEncapsulation.None,
                styles: ["virtual-scroll{display:block;width:100%}.cuppa-dropdown{position:relative}.c-btn{display:inline-block;border-width:1px;line-height:1.25;border-radius:3px;font-size:14px;padding:5px 10px;cursor:pointer}.c-btn.disabled{background:#ccc}.selected-list .c-list{float:left;padding:0;margin:0;width:calc(100% - 20px)}.selected-list .c-list .c-token{list-style:none;padding:2px 25px 2px 8px;border-radius:2px;margin-right:4px;margin-top:2px;float:left;position:relative}.selected-list .c-list .c-token .c-label{display:block;float:left}.selected-list .c-list .c-token .c-remove{position:absolute;right:8px;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%);width:10px}.selected-list .c-list .c-token .c-remove svg{fill:#fff}.selected-list .fa-angle-down,.selected-list .fa-angle-up{font-size:15pt;position:absolute;right:10px;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%)}.selected-list .c-angle-down,.selected-list .c-angle-up{width:15px;height:15px;position:absolute;right:10px;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%);pointer-events:none}.selected-list .c-angle-down svg,.selected-list .c-angle-up svg{fill:#333}.selected-list .countplaceholder{position:absolute;right:30px;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%)}.selected-list .c-btn{width:100%;padding:10px;cursor:pointer;display:flex;position:relative}.selected-list .c-btn .c-icon{position:absolute;right:5px;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%)}.dropdown-list{position:absolute;padding-top:14px;width:100%;z-index:99999}.dropdown-list ul{padding:0;list-style:none;overflow:auto;margin:0}.dropdown-list ul li{padding:10px;cursor:pointer;text-align:left}.dropdown-list ul li:first-child{padding-top:10px}.dropdown-list ul li:last-child{padding-bottom:10px}.dropdown-list ::-webkit-scrollbar{width:8px}.dropdown-list ::-webkit-scrollbar-thumb{background:#ccc;border-radius:5px}.dropdown-list ::-webkit-scrollbar-track{background:#f2f2f2}.arrow-down,.arrow-up{width:0;height:0;border-left:13px solid transparent;border-right:13px solid transparent;border-bottom:15px solid #fff;margin-left:15px;position:absolute;top:0}.arrow-down{bottom:-14px;top:unset;-webkit-transform:rotate(180deg);transform:rotate(180deg)}.arrow-2{border-bottom:15px solid #ccc;top:-1px}.arrow-down.arrow-2{top:unset;bottom:-16px}.list-area{border:1px solid #ccc;border-radius:3px;background:#fff;margin:0}.select-all{padding:10px;border-bottom:1px solid #ccc;text-align:left}.list-filter{border-bottom:1px solid #ccc;position:relative;padding-left:35px;height:35px}.list-filter input{border:0;width:100%;height:100%;padding:0}.list-filter input:focus{outline:0}.list-filter .c-search{position:absolute;top:9px;left:10px;width:15px;height:15px}.list-filter .c-search svg{fill:#888}.list-filter .c-clear{position:absolute;top:10px;right:10px;width:15px;height:15px}.list-filter .c-clear svg{fill:#888}.pure-checkbox input[type=checkbox]{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.pure-checkbox input[type=checkbox]:focus+label:before,.pure-checkbox input[type=checkbox]:hover+label:before{background-color:#f2f2f2}.pure-checkbox input[type=checkbox]:active+label:before{transition-duration:0s}.pure-checkbox input[type=checkbox]+label{position:relative;padding-left:2em;vertical-align:middle;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer;margin:0;font-weight:300}.pure-checkbox input[type=checkbox]+label:before{box-sizing:content-box;content:'';position:absolute;top:50%;left:0;width:14px;height:14px;margin-top:-9px;text-align:center;transition:.4s}.pure-checkbox input[type=checkbox]+label:after{box-sizing:content-box;content:'';position:absolute;-webkit-transform:scale(0);transform:scale(0);-webkit-transform-origin:50%;transform-origin:50%;transition:transform .2s ease-out,-webkit-transform .2s ease-out;background-color:transparent;top:50%;left:4px;width:8px;height:3px;margin-top:-4px;border-style:solid;border-color:#fff;border-width:0 0 3px 3px;-o-border-image:none;border-image:none;-webkit-transform:rotate(-45deg) scale(0);transform:rotate(-45deg) scale(0)}.pure-checkbox input[type=checkbox]:disabled+label:before{border-color:#ccc}.pure-checkbox input[type=checkbox]:disabled:focus+label:before .pure-checkbox input[type=checkbox]:disabled:hover+label:before{background-color:inherit}.pure-checkbox input[type=checkbox]:disabled:checked+label:before{background-color:#ccc}.pure-checkbox input[type=radio]:checked+label:before{background-color:#fff}.pure-checkbox input[type=radio]:checked+label:after{-webkit-transform:scale(1);transform:scale(1)}.pure-checkbox input[type=radio]+label:before{border-radius:50%}.pure-checkbox input[type=checkbox]:checked+label:after{content:'';transition:transform .2s ease-out,-webkit-transform .2s ease-out;-webkit-transform:rotate(-45deg) scale(1);transform:rotate(-45deg) scale(1)}.list-message{text-align:center;margin:0;padding:15px 0;font-size:initial}.list-grp{padding:0 15px!important}.list-grp h4{text-transform:capitalize;margin:15px 0 0;font-size:14px;font-weight:700}.list-grp>li{padding-left:15px!important}.grp-item{padding-left:30px!important}.grp-title{padding-bottom:0!important}.grp-title label{margin-bottom:0!important;font-weight:800;text-transform:capitalize}.grp-title:hover{background:0 0!important}.loading-icon{width:20px;float:right}.nodata-label{width:100%;text-align:center;padding:10px 0 0}.btn-container{text-align:center;padding:0 5px 10px}"]
            }] }
];
/** @nocollapse */
AngularMultiSelect.ctorParameters = () => [
    { type: ElementRef },
    { type: ChangeDetectorRef },
    { type: DataService }
];
AngularMultiSelect.propDecorators = {
    data: [{ type: Input }],
    settings: [{ type: Input }],
    loading: [{ type: Input }],
    onSelect: [{ type: Output, args: ['onSelect',] }],
    onDeSelect: [{ type: Output, args: ['onDeSelect',] }],
    onSelectAll: [{ type: Output, args: ['onSelectAll',] }],
    onDeSelectAll: [{ type: Output, args: ['onDeSelectAll',] }],
    onOpen: [{ type: Output, args: ['onOpen',] }],
    onClose: [{ type: Output, args: ['onClose',] }],
    onScrollToEnd: [{ type: Output, args: ['onScrollToEnd',] }],
    onFilterSelectAll: [{ type: Output, args: ['onFilterSelectAll',] }],
    onFilterDeSelectAll: [{ type: Output, args: ['onFilterDeSelectAll',] }],
    onAddFilterNewItem: [{ type: Output, args: ['onAddFilterNewItem',] }],
    itemTempl: [{ type: ContentChild, args: [Item,] }],
    badgeTempl: [{ type: ContentChild, args: [Badge,] }],
    searchTempl: [{ type: ContentChild, args: [Search,] }],
    searchInput: [{ type: ViewChild, args: ['searchInput',] }],
    selectedListElem: [{ type: ViewChild, args: ['selectedList',] }],
    dropdownListElem: [{ type: ViewChild, args: ['dropdownList',] }],
    onEscapeDown: [{ type: HostListener, args: ['document:keyup.escape', ['$event'],] }]
};
class AngularMultiSelectModule {
}
AngularMultiSelectModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule, FormsModule],
                declarations: [AngularMultiSelect, ClickOutsideDirective, ScrollDirective, styleDirective, ListFilterPipe, Item, TemplateRenderer, Badge, Search, setPosition, VirtualScrollComponent, CIcon],
                exports: [AngularMultiSelect, ClickOutsideDirective, ScrollDirective, styleDirective, ListFilterPipe, Item, TemplateRenderer, Badge, Search, setPosition, VirtualScrollComponent, CIcon],
                providers: [DataService]
            },] }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

export { AngularMultiSelect, ClickOutsideDirective, ListFilterPipe, Item, TemplateRenderer, AngularMultiSelectModule, ScrollDirective as ɵc, setPosition as ɵe, styleDirective as ɵd, Badge as ɵf, CIcon as ɵh, Search as ɵg, DROPDOWN_CONTROL_VALIDATION as ɵb, DROPDOWN_CONTROL_VALUE_ACCESSOR as ɵa, DataService as ɵi, VirtualScrollComponent as ɵj };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhcjItbXVsdGlzZWxlY3QtZHJvcGRvd24uanMubWFwIiwic291cmNlcyI6WyJuZzovL2FuZ3VsYXIyLW11bHRpc2VsZWN0LWRyb3Bkb3duL2xpYi9tdWx0aXNlbGVjdC5tb2RlbC50cyIsIm5nOi8vYW5ndWxhcjItbXVsdGlzZWxlY3QtZHJvcGRvd24vbGliL2NsaWNrT3V0c2lkZS50cyIsIm5nOi8vYW5ndWxhcjItbXVsdGlzZWxlY3QtZHJvcGRvd24vbGliL211bHRpc2VsZWN0LnNlcnZpY2UudHMiLCJuZzovL2FuZ3VsYXIyLW11bHRpc2VsZWN0LWRyb3Bkb3duL2xpYi9saXN0LWZpbHRlci50cyIsIm5nOi8vYW5ndWxhcjItbXVsdGlzZWxlY3QtZHJvcGRvd24vbGliL21lbnUtaXRlbS50cyIsIm5nOi8vYW5ndWxhcjItbXVsdGlzZWxlY3QtZHJvcGRvd24vbGliL3ZpcnR1YWwtc2Nyb2xsLnRzIiwibmc6Ly9hbmd1bGFyMi1tdWx0aXNlbGVjdC1kcm9wZG93bi9saWIvbXVsdGlzZWxlY3QuY29tcG9uZW50LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBNeUV4Y2VwdGlvbiB7XG5cdHN0YXR1cyA6IG51bWJlcjtcblx0Ym9keSA6IGFueTtcblx0Y29uc3RydWN0b3Ioc3RhdHVzIDogbnVtYmVyLCBib2R5IDogYW55KSB7XG5cdFx0dGhpcy5zdGF0dXMgPSBzdGF0dXM7XG5cdFx0dGhpcy5ib2R5ID0gYm9keTtcblx0fVxuXHRcbn0iLCJpbXBvcnQgeyBEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIE91dHB1dCwgRXZlbnRFbWl0dGVyLCBIb3N0TGlzdGVuZXIsIElucHV0LCBPbkluaXQsIE9uQ2hhbmdlcyB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1tjbGlja091dHNpZGVdJ1xufSlcbmV4cG9ydCBjbGFzcyBDbGlja091dHNpZGVEaXJlY3RpdmUge1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHtcbiAgICB9XG5cbiAgICBAT3V0cHV0KClcbiAgICBwdWJsaWMgY2xpY2tPdXRzaWRlID0gbmV3IEV2ZW50RW1pdHRlcjxNb3VzZUV2ZW50PigpO1xuXG4gICAgQEhvc3RMaXN0ZW5lcignZG9jdW1lbnQ6Y2xpY2snLCBbJyRldmVudCcsICckZXZlbnQudGFyZ2V0J10pXG4gICAgQEhvc3RMaXN0ZW5lcignZG9jdW1lbnQ6dG91Y2hzdGFydCcsIFsnJGV2ZW50JywgJyRldmVudC50YXJnZXQnXSlcbiAgICBwdWJsaWMgb25DbGljayhldmVudDogTW91c2VFdmVudCwgdGFyZ2V0RWxlbWVudDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0YXJnZXRFbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjbGlja2VkSW5zaWRlID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNvbnRhaW5zKHRhcmdldEVsZW1lbnQpO1xuICAgICAgICBpZiAoIWNsaWNrZWRJbnNpZGUpIHtcbiAgICAgICAgICAgIHRoaXMuY2xpY2tPdXRzaWRlLmVtaXQoZXZlbnQpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1tzY3JvbGxdJ1xufSlcbmV4cG9ydCBjbGFzcyBTY3JvbGxEaXJlY3RpdmUge1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHtcbiAgICB9XG5cbiAgICBAT3V0cHV0KClcbiAgICBwdWJsaWMgc2Nyb2xsID0gbmV3IEV2ZW50RW1pdHRlcjxNb3VzZUV2ZW50PigpO1xuXG4gICAgQEhvc3RMaXN0ZW5lcignc2Nyb2xsJywgWyckZXZlbnQnXSlcbiAgICBwdWJsaWMgb25DbGljayhldmVudDogTW91c2VFdmVudCwgdGFyZ2V0RWxlbWVudDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5zY3JvbGwuZW1pdChldmVudCk7XG4gICAgfVxufVxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbc3R5bGVQcm9wXSdcbn0pXG5leHBvcnQgY2xhc3Mgc3R5bGVEaXJlY3RpdmUge1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBlbDogRWxlbWVudFJlZikge1xuXG4gICAgfVxuXG4gICAgQElucHV0KCdzdHlsZVByb3AnKSBzdHlsZVZhbDogbnVtYmVyO1xuXG4gICAgbmdPbkluaXQoKSB7XG5cbiAgICAgICAgdGhpcy5lbC5uYXRpdmVFbGVtZW50LnN0eWxlLnRvcCA9IHRoaXMuc3R5bGVWYWw7XG4gICAgfVxuICAgIG5nT25DaGFuZ2VzKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQuc3R5bGUudG9wID0gdGhpcy5zdHlsZVZhbDtcbiAgICB9XG59XG5cblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbc2V0UG9zaXRpb25dJ1xufSlcbmV4cG9ydCBjbGFzcyBzZXRQb3NpdGlvbiBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzIHtcblxuICAgIEBJbnB1dCgnc2V0UG9zaXRpb24nKSBoZWlnaHQ6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBlbDogRWxlbWVudFJlZikge1xuXG4gICAgfVxuICAgIG5nT25Jbml0KCkge1xuICAgICAgICBpZiAodGhpcy5oZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuZWwubmF0aXZlRWxlbWVudC5zdHlsZS5ib3R0b20gPSBwYXJzZUludCh0aGlzLmhlaWdodCArIDE1ICsgXCJcIikgKyAncHgnO1xuICAgICAgICB9XG4gICAgfVxuICAgIG5nT25DaGFuZ2VzKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5oZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuZWwubmF0aXZlRWxlbWVudC5zdHlsZS5ib3R0b20gPSBwYXJzZUludCh0aGlzLmhlaWdodCArIDE1ICsgXCJcIikgKyAncHgnO1xuICAgICAgICB9XG4gICAgfVxufSIsImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcblxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRGF0YVNlcnZpY2Uge1xuXG4gIGZpbHRlcmVkRGF0YTogYW55ID0gW107XG4gIHByaXZhdGUgc3ViamVjdCA9IG5ldyBTdWJqZWN0PGFueT4oKTtcblxuICBzZXREYXRhKGRhdGE6IGFueSkge1xuXG4gICAgdGhpcy5maWx0ZXJlZERhdGEgPSBkYXRhO1xuICAgIHRoaXMuc3ViamVjdC5uZXh0KGRhdGEpO1xuICB9XG4gIGdldERhdGEoKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICByZXR1cm4gdGhpcy5zdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICB9XG4gIGdldEZpbHRlcmVkRGF0YSgpIHtcbiAgICBpZiAodGhpcy5maWx0ZXJlZERhdGEgJiYgdGhpcy5maWx0ZXJlZERhdGEubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHRoaXMuZmlsdGVyZWREYXRhO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gIH1cblxufSIsImltcG9ydCB7IFBpcGUsIFBpcGVUcmFuc2Zvcm0gfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IERhdGFTZXJ2aWNlIH0gZnJvbSAnLi9tdWx0aXNlbGVjdC5zZXJ2aWNlJztcblxuXG5AUGlwZSh7XG4gICAgbmFtZTogJ2xpc3RGaWx0ZXInLFxuICAgIHB1cmU6IHRydWVcbn0pXG5leHBvcnQgY2xhc3MgTGlzdEZpbHRlclBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcblxuICAgIHB1YmxpYyBmaWx0ZXJlZExpc3Q6IGFueSA9IFtdO1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgZHM6IERhdGFTZXJ2aWNlKSB7XG5cbiAgICB9XG5cbiAgICB0cmFuc2Zvcm0oaXRlbXM6IGFueVtdLCBmaWx0ZXI6IGFueSwgc2VhcmNoQnk6IGFueSk6IGFueVtdIHtcbiAgICAgICAgaWYgKCFpdGVtcyB8fCAhZmlsdGVyKSB7XG4gICAgICAgICAgICB0aGlzLmRzLnNldERhdGEoaXRlbXMpO1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW1zO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZmlsdGVyZWRMaXN0ID0gaXRlbXMuZmlsdGVyKChpdGVtOiBhbnkpID0+IHRoaXMuYXBwbHlGaWx0ZXIoaXRlbSwgZmlsdGVyLCBzZWFyY2hCeSkpO1xuICAgICAgICB0aGlzLmRzLnNldERhdGEodGhpcy5maWx0ZXJlZExpc3QpO1xuICAgICAgICByZXR1cm4gdGhpcy5maWx0ZXJlZExpc3Q7XG4gICAgfVxuICAgIGFwcGx5RmlsdGVyKGl0ZW06IGFueSwgZmlsdGVyOiBhbnksIHNlYXJjaEJ5OiBhbnkpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IGZvdW5kID0gZmFsc2U7XG4gICAgICAgIGlmIChzZWFyY2hCeS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBpZiAoaXRlbS5ncnBUaXRsZSkge1xuICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHQgPSAwOyB0IDwgc2VhcmNoQnkubGVuZ3RoOyB0KyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbHRlciAmJiBpdGVtW3NlYXJjaEJ5W3RdXSAmJiBpdGVtW3NlYXJjaEJ5W3RdXSAhPSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbVtzZWFyY2hCeVt0XV0udG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoZmlsdGVyLnRvTG93ZXJDYXNlKCkpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpdGVtLmdycFRpdGxlKSB7XG4gICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWx0ZXIgJiYgaXRlbVtwcm9wXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW1bcHJvcF0udG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoZmlsdGVyLnRvTG93ZXJDYXNlKCkpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZm91bmQ7XG4gICAgfVxufSIsImltcG9ydCB7IENvbXBvbmVudCwgT25Jbml0LCBPbkRlc3Ryb3ksIE5nTW9kdWxlLCBUZW1wbGF0ZVJlZiwgQWZ0ZXJDb250ZW50SW5pdCwgQ29udGVudENoaWxkLCBFbWJlZGRlZFZpZXdSZWYsIE9uQ2hhbmdlcywgVmlld0NvbnRhaW5lclJlZiwgVmlld0VuY2Fwc3VsYXRpb24sIElucHV0LCBPdXRwdXQsIEV2ZW50RW1pdHRlciwgRWxlbWVudFJlZiwgQWZ0ZXJWaWV3SW5pdCwgUGlwZSwgUGlwZVRyYW5zZm9ybSwgRGlyZWN0aXZlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBTYWZlUmVzb3VyY2VVcmwsIERvbVNhbml0aXplciB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInO1xuaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gICAgICAgZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnYy1pdGVtJyxcbiAgdGVtcGxhdGU6IGBgXG59KVxuXG5leHBvcnQgY2xhc3MgSXRlbSB7IFxuXG4gICAgQENvbnRlbnRDaGlsZChUZW1wbGF0ZVJlZikgdGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT5cbiAgICBjb25zdHJ1Y3RvcigpIHsgICBcbiAgICB9XG5cbn1cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnYy1iYWRnZScsXG4gIHRlbXBsYXRlOiBgYFxufSlcblxuZXhwb3J0IGNsYXNzIEJhZGdlIHsgXG5cbiAgICBAQ29udGVudENoaWxkKFRlbXBsYXRlUmVmKSB0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PlxuICAgIGNvbnN0cnVjdG9yKCkgeyAgIFxuICAgIH1cblxufVxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdjLXNlYXJjaCcsXG4gIHRlbXBsYXRlOiBgYFxufSlcblxuZXhwb3J0IGNsYXNzIFNlYXJjaCB7IFxuXG4gICAgQENvbnRlbnRDaGlsZChUZW1wbGF0ZVJlZikgdGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT5cbiAgICBjb25zdHJ1Y3RvcigpIHsgICBcbiAgICB9XG5cbn1cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2MtdGVtcGxhdGVSZW5kZXJlcicsXG4gIHRlbXBsYXRlOiBgYFxufSlcblxuZXhwb3J0IGNsYXNzIFRlbXBsYXRlUmVuZGVyZXIgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7IFxuXG4gICAgQElucHV0KCkgZGF0YTogYW55XG4gICAgQElucHV0KCkgaXRlbTogYW55XG4gICAgdmlldzogRW1iZWRkZWRWaWV3UmVmPGFueT47XG5cbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZikgeyAgIFxuICAgIH1cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgdGhpcy52aWV3ID0gdGhpcy52aWV3Q29udGFpbmVyLmNyZWF0ZUVtYmVkZGVkVmlldyh0aGlzLmRhdGEudGVtcGxhdGUsIHtcbiAgICAgICAgICAgICdcXCRpbXBsaWNpdCc6IHRoaXMuZGF0YSxcbiAgICAgICAgICAgICdpdGVtJzp0aGlzLml0ZW1cbiAgICAgICAgfSk7XG4gICAgfVxuXHRcbiAgICBuZ09uRGVzdHJveSgpIHtcblx0XHR0aGlzLnZpZXcuZGVzdHJveSgpO1xuXHR9XG5cbn1cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnYy1pY29uJyxcbiAgdGVtcGxhdGU6IGA8c3ZnICpuZ0lmPVwibmFtZSA9PSAncmVtb3ZlJ1wiIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIiB2ZXJzaW9uPVwiMS4xXCIgaWQ9XCJDYXBhXzFcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgeG1sbnM6eGxpbms9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIgeD1cIjBweFwiIHk9XCIwcHhcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmlld0JveD1cIjAgMCA0Ny45NzEgNDcuOTcxXCIgc3R5bGU9XCJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ3Ljk3MSA0Ny45NzE7XCIgeG1sOnNwYWNlPVwicHJlc2VydmVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxnPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMjguMjI4LDIzLjk4Nkw0Ny4wOTIsNS4xMjJjMS4xNzItMS4xNzEsMS4xNzItMy4wNzEsMC00LjI0MmMtMS4xNzItMS4xNzItMy4wNy0xLjE3Mi00LjI0MiwwTDIzLjk4NiwxOS43NDRMNS4xMjEsMC44OFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjLTEuMTcyLTEuMTcyLTMuMDctMS4xNzItNC4yNDIsMGMtMS4xNzIsMS4xNzEtMS4xNzIsMy4wNzEsMCw0LjI0MmwxOC44NjUsMTguODY0TDAuODc5LDQyLjg1Yy0xLjE3MiwxLjE3MS0xLjE3MiwzLjA3MSwwLDQuMjQyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEMxLjQ2NSw0Ny42NzcsMi4yMzMsNDcuOTcsMyw0Ny45N3MxLjUzNS0wLjI5MywyLjEyMS0wLjg3OWwxOC44NjUtMTguODY0TDQyLjg1LDQ3LjA5MWMwLjU4NiwwLjU4NiwxLjM1NCwwLjg3OSwyLjEyMSwwLjg3OVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzMS41MzUtMC4yOTMsMi4xMjEtMC44NzljMS4xNzItMS4xNzEsMS4xNzItMy4wNzEsMC00LjI0MkwyOC4yMjgsMjMuOTg2elwiLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZz5cbiAgICAgICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICA8c3ZnICpuZ0lmPVwibmFtZSA9PSAnYW5nbGUtZG93bidcIiB2ZXJzaW9uPVwiMS4xXCIgaWQ9XCJDYXBhXzFcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgeG1sbnM6eGxpbms9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIgeD1cIjBweFwiIHk9XCIwcHhcIlxuXHQgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiIHZpZXdCb3g9XCIwIDAgNjEyIDYxMlwiIHN0eWxlPVwiZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA2MTIgNjEyO1wiIHhtbDpzcGFjZT1cInByZXNlcnZlXCI+XG48Zz5cblx0PGcgaWQ9XCJfeDMxXzBfMzRfXCI+XG5cdFx0PGc+XG5cdFx0XHQ8cGF0aCBkPVwiTTYwNC41MDEsMTM0Ljc4MmMtOS45OTktMTAuMDUtMjYuMjIyLTEwLjA1LTM2LjIyMSwwTDMwNi4wMTQsNDIyLjU1OEw0My43MjEsMTM0Ljc4MlxuXHRcdFx0XHRjLTkuOTk5LTEwLjA1LTI2LjIyMy0xMC4wNS0zNi4yMjIsMHMtOS45OTksMjYuMzUsMCwzNi4zOTlsMjc5LjEwMywzMDYuMjQxYzUuMzMxLDUuMzU3LDEyLjQyMiw3LjY1MiwxOS4zODYsNy4yOTZcblx0XHRcdFx0YzYuOTg4LDAuMzU2LDE0LjA1NS0xLjkzOSwxOS4zODYtNy4yOTZsMjc5LjEyOC0zMDYuMjY4QzYxNC41LDE2MS4xMDYsNjE0LjUsMTQ0LjgzMiw2MDQuNTAxLDEzNC43ODJ6XCIvPlxuXHRcdDwvZz5cblx0PC9nPlxuPC9nPlxuPC9zdmc+XG48c3ZnICpuZ0lmPVwibmFtZSA9PSAnYW5nbGUtdXAnXCIgdmVyc2lvbj1cIjEuMVwiIGlkPVwiQ2FwYV8xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiIHg9XCIwcHhcIiB5PVwiMHB4XCJcblx0IHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIiB2aWV3Qm94PVwiMCAwIDYxMiA2MTJcIiBzdHlsZT1cImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNjEyIDYxMjtcIiB4bWw6c3BhY2U9XCJwcmVzZXJ2ZVwiPlxuPGc+XG5cdDxnIGlkPVwiX3gzOV9fMzBfXCI+XG5cdFx0PGc+XG5cdFx0XHQ8cGF0aCBkPVwiTTYwNC41MDEsNDQwLjUwOUwzMjUuMzk4LDEzNC45NTZjLTUuMzMxLTUuMzU3LTEyLjQyMy03LjYyNy0xOS4zODYtNy4yN2MtNi45ODktMC4zNTctMTQuMDU2LDEuOTEzLTE5LjM4Nyw3LjI3XG5cdFx0XHRcdEw3LjQ5OSw0NDAuNTA5Yy05Ljk5OSwxMC4wMjQtOS45OTksMjYuMjk4LDAsMzYuMzIzczI2LjIyMywxMC4wMjQsMzYuMjIyLDBsMjYyLjI5My0yODcuMTY0TDU2OC4yOCw0NzYuODMyXG5cdFx0XHRcdGM5Ljk5OSwxMC4wMjQsMjYuMjIyLDEwLjAyNCwzNi4yMjEsMEM2MTQuNSw0NjYuODA5LDYxNC41LDQ1MC41MzQsNjA0LjUwMSw0NDAuNTA5elwiLz5cblx0XHQ8L2c+XG5cdDwvZz5cbjwvZz5cblxuPC9zdmc+XG48c3ZnICpuZ0lmPVwibmFtZSA9PSAnc2VhcmNoJ1wiIHZlcnNpb249XCIxLjFcIiBpZD1cIkNhcGFfMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiB4PVwiMHB4XCIgeT1cIjBweFwiXG5cdCB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgdmlld0JveD1cIjAgMCA2MTUuNTIgNjE1LjUyXCIgc3R5bGU9XCJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDYxNS41MiA2MTUuNTI7XCJcblx0IHhtbDpzcGFjZT1cInByZXNlcnZlXCI+XG48Zz5cblx0PGc+XG5cdFx0PGcgaWQ9XCJTZWFyY2hfX3gyOF9hbmRfdGhvdV9zaGFsbF9maW5kX3gyOV9cIj5cblx0XHRcdDxnPlxuXHRcdFx0XHQ8cGF0aCBkPVwiTTYwMi41MzEsNTQ5LjczNmwtMTg0LjMxLTE4NS4zNjhjMjYuNjc5LTM3LjcyLDQyLjUyOC04My43MjksNDIuNTI4LTEzMy41NDhDNDYwLjc1LDEwMy4zNSwzNTcuOTk3LDAsMjMxLjI1OCwwXG5cdFx0XHRcdFx0QzEwNC41MTgsMCwxLjc2NSwxMDMuMzUsMS43NjUsMjMwLjgyYzAsMTI3LjQ3LDEwMi43NTMsMjMwLjgyLDIyOS40OTMsMjMwLjgyYzQ5LjUzLDAsOTUuMjcxLTE1Ljk0NCwxMzIuNzgtNDIuNzc3XG5cdFx0XHRcdFx0bDE4NC4zMSwxODUuMzY2YzcuNDgyLDcuNTIxLDE3LjI5MiwxMS4yOTEsMjcuMTAyLDExLjI5MWM5LjgxMiwwLDE5LjYyLTMuNzcsMjcuMDgzLTExLjI5MVxuXHRcdFx0XHRcdEM2MTcuNDk2LDU4OS4xODgsNjE3LjQ5Niw1NjQuNzc3LDYwMi41MzEsNTQ5LjczNnogTTM1NS45LDMxOS43NjNsLTE1LjA0MiwyMS4yNzNMMzE5LjcsMzU2LjE3NFxuXHRcdFx0XHRcdGMtMjYuMDgzLDE4LjY1OC01Ni42NjcsMjguNTI2LTg4LjQ0MiwyOC41MjZjLTg0LjM2NSwwLTE1Mi45OTUtNjkuMDM1LTE1Mi45OTUtMTUzLjg4YzAtODQuODQ2LDY4LjYzLTE1My44OCwxNTIuOTk1LTE1My44OFxuXHRcdFx0XHRcdHMxNTIuOTk2LDY5LjAzNCwxNTIuOTk2LDE1My44OEMzODQuMjcxLDI2Mi43NjksMzc0LjQ2MiwyOTMuNTI2LDM1NS45LDMxOS43NjN6XCIvPlxuXHRcdFx0PC9nPlxuXHRcdDwvZz5cblx0PC9nPlxuPC9nPlxuXG48L3N2Zz5cbjxzdmcgKm5nSWY9XCJuYW1lID09ICdjbGVhcidcIiB2ZXJzaW9uPVwiMS4xXCIgaWQ9XCJDYXBhXzFcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgeG1sbnM6eGxpbms9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIgeD1cIjBweFwiIHk9XCIwcHhcIlxuXHQgdmlld0JveD1cIjAgMCA1MS45NzYgNTEuOTc2XCIgc3R5bGU9XCJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxLjk3NiA1MS45NzY7XCIgeG1sOnNwYWNlPVwicHJlc2VydmVcIj5cbjxnPlxuXHQ8cGF0aCBkPVwiTTQ0LjM3Myw3LjYwM2MtMTAuMTM3LTEwLjEzNy0yNi42MzItMTAuMTM4LTM2Ljc3LDBjLTEwLjEzOCwxMC4xMzgtMTAuMTM3LDI2LjYzMiwwLDM2Ljc3czI2LjYzMiwxMC4xMzgsMzYuNzcsMFxuXHRcdEM1NC41MSwzNC4yMzUsNTQuNTEsMTcuNzQsNDQuMzczLDcuNjAzeiBNMzYuMjQxLDM2LjI0MWMtMC43ODEsMC43ODEtMi4wNDcsMC43ODEtMi44MjgsMGwtNy40MjUtNy40MjVsLTcuNzc4LDcuNzc4XG5cdFx0Yy0wLjc4MSwwLjc4MS0yLjA0NywwLjc4MS0yLjgyOCwwYy0wLjc4MS0wLjc4MS0wLjc4MS0yLjA0NywwLTIuODI4bDcuNzc4LTcuNzc4bC03LjQyNS03LjQyNWMtMC43ODEtMC43ODEtMC43ODEtMi4wNDgsMC0yLjgyOFxuXHRcdGMwLjc4MS0wLjc4MSwyLjA0Ny0wLjc4MSwyLjgyOCwwbDcuNDI1LDcuNDI1bDcuMDcxLTcuMDcxYzAuNzgxLTAuNzgxLDIuMDQ3LTAuNzgxLDIuODI4LDBjMC43ODEsMC43ODEsMC43ODEsMi4wNDcsMCwyLjgyOFxuXHRcdGwtNy4wNzEsNy4wNzFsNy40MjUsNy40MjVDMzcuMDIyLDM0LjE5NCwzNy4wMjIsMzUuNDYsMzYuMjQxLDM2LjI0MXpcIi8+XG48L2c+XG48L3N2Zz5gLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuXG59KVxuXG5leHBvcnQgY2xhc3MgQ0ljb24geyBcblxuICAgIEBJbnB1dCgpIG5hbWU6YW55O1xuXG59IiwiaW1wb3J0IHtcblx0Q29tcG9uZW50LFxuXHRDb250ZW50Q2hpbGQsXG5cdEVsZW1lbnRSZWYsXG5cdEV2ZW50RW1pdHRlcixcblx0SW5wdXQsXG5cdE5nTW9kdWxlLFxuXHROZ1pvbmUsXG5cdE9uQ2hhbmdlcyxcblx0T25EZXN0cm95LFxuXHRPbkluaXQsXG5cdE91dHB1dCxcblx0UmVuZGVyZXIyLFxuXHRWaWV3Q2hpbGQsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2hhbmdlRXZlbnQge1xuXHRzdGFydD86IG51bWJlcjtcblx0ZW5kPzogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFdyYXBHcm91cERpbWVuc2lvbnMge1xuXHRudW1iZXJPZktub3duV3JhcEdyb3VwQ2hpbGRTaXplczogbnVtYmVyO1xuXHRzdW1PZktub3duV3JhcEdyb3VwQ2hpbGRXaWR0aHM6IG51bWJlcjtcblx0c3VtT2ZLbm93bldyYXBHcm91cENoaWxkSGVpZ2h0czogbnVtYmVyO1xuXHRtYXhDaGlsZFNpemVQZXJXcmFwR3JvdXA6IFdyYXBHcm91cERpbWVuc2lvbltdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFdyYXBHcm91cERpbWVuc2lvbiB7XG5cdGNoaWxkV2lkdGg6IG51bWJlcjtcblx0Y2hpbGRIZWlnaHQ6IG51bWJlcjtcblx0aXRlbXM6IGFueVtdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElEaW1lbnNpb25zIHtcblx0aXRlbUNvdW50OiBudW1iZXI7XG5cdGl0ZW1zUGVyV3JhcEdyb3VwOiBudW1iZXI7XG5cdHdyYXBHcm91cHNQZXJQYWdlOiBudW1iZXI7XG5cdGl0ZW1zUGVyUGFnZTogbnVtYmVyO1xuXHRwYWdlQ291bnRfZnJhY3Rpb25hbDogbnVtYmVyO1xuXHRjaGlsZFdpZHRoOiBudW1iZXI7XG5cdGNoaWxkSGVpZ2h0OiBudW1iZXI7XG5cdHNjcm9sbExlbmd0aDogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElQYWdlSW5mbyB7XG5cdHN0YXJ0SW5kZXg6IG51bWJlcjtcblx0ZW5kSW5kZXg6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJUGFnZUluZm9XaXRoQnVmZmVyIGV4dGVuZHMgSVBhZ2VJbmZvIHtcblx0c3RhcnRJbmRleFdpdGhCdWZmZXI6IG51bWJlcjtcblx0ZW5kSW5kZXhXaXRoQnVmZmVyOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVZpZXdwb3J0IGV4dGVuZHMgSVBhZ2VJbmZvV2l0aEJ1ZmZlciB7XG5cdHBhZGRpbmc6IG51bWJlcjtcblx0c2Nyb2xsTGVuZ3RoOiBudW1iZXI7XG59XG5cbkBDb21wb25lbnQoe1xuXHRzZWxlY3RvcjogJ3ZpcnR1YWwtc2Nyb2xsLFt2aXJ0dWFsU2Nyb2xsXScsXG5cdGV4cG9ydEFzOiAndmlydHVhbFNjcm9sbCcsXG5cdHRlbXBsYXRlOiBgXG4gICAgPGRpdiBjbGFzcz1cInRvdGFsLXBhZGRpbmdcIiAjaW52aXNpYmxlUGFkZGluZz48L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwic2Nyb2xsYWJsZS1jb250ZW50XCIgI2NvbnRlbnQ+XG4gICAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG4gICAgPC9kaXY+XG4gIGAsXG5cdGhvc3Q6IHtcblx0XHQnW2NsYXNzLmhvcml6b250YWxdJzogXCJob3Jpem9udGFsXCIsXG5cdFx0J1tjbGFzcy52ZXJ0aWNhbF0nOiBcIiFob3Jpem9udGFsXCIsXG5cdFx0J1tjbGFzcy5zZWxmU2Nyb2xsXSc6IFwiIXBhcmVudFNjcm9sbFwiXG5cdH0sXG5cdHN0eWxlczogW2BcbiAgICA6aG9zdCB7XG4gICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG5cdCAgZGlzcGxheTogYmxvY2s7XG4gICAgICAtd2Via2l0LW92ZXJmbG93LXNjcm9sbGluZzogdG91Y2g7XG4gICAgfVxuXHRcblx0Omhvc3QuaG9yaXpvbnRhbC5zZWxmU2Nyb2xsIHtcbiAgICAgIG92ZXJmbG93LXk6IHZpc2libGU7XG4gICAgICBvdmVyZmxvdy14OiBhdXRvO1xuXHR9XG5cdDpob3N0LnZlcnRpY2FsLnNlbGZTY3JvbGwge1xuICAgICAgb3ZlcmZsb3cteTogYXV0bztcbiAgICAgIG92ZXJmbG93LXg6IHZpc2libGU7XG5cdH1cblx0XG4gICAgLnNjcm9sbGFibGUtY29udGVudCB7XG4gICAgICB0b3A6IDA7XG4gICAgICBsZWZ0OiAwO1xuICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICBoZWlnaHQ6IDEwMCU7XG4gICAgICBtYXgtd2lkdGg6IDEwMHZ3O1xuICAgICAgbWF4LWhlaWdodDogMTAwdmg7XG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgfVxuXG5cdC5zY3JvbGxhYmxlLWNvbnRlbnQgOjpuZy1kZWVwID4gKiB7XG5cdFx0Ym94LXNpemluZzogYm9yZGVyLWJveDtcblx0fVxuXHRcblx0Omhvc3QuaG9yaXpvbnRhbCB7XG5cdFx0d2hpdGUtc3BhY2U6IG5vd3JhcDtcblx0fVxuXHRcblx0Omhvc3QuaG9yaXpvbnRhbCAuc2Nyb2xsYWJsZS1jb250ZW50IHtcblx0XHRkaXNwbGF5OiBmbGV4O1xuXHR9XG5cdFxuXHQ6aG9zdC5ob3Jpem9udGFsIC5zY3JvbGxhYmxlLWNvbnRlbnQgOjpuZy1kZWVwID4gKiB7XG5cdFx0ZmxleC1zaHJpbms6IDA7XG5cdFx0ZmxleC1ncm93OiAwO1xuXHRcdHdoaXRlLXNwYWNlOiBpbml0aWFsO1xuXHR9XG5cdFxuICAgIC50b3RhbC1wYWRkaW5nIHtcbiAgICAgIHdpZHRoOiAxcHg7XG4gICAgICBvcGFjaXR5OiAwO1xuICAgIH1cbiAgICBcbiAgICA6aG9zdC5ob3Jpem9udGFsIC50b3RhbC1wYWRkaW5nIHtcbiAgICAgIGhlaWdodDogMTAwJTtcbiAgICB9XG4gIGBdXG59KVxuZXhwb3J0IGNsYXNzIFZpcnR1YWxTY3JvbGxDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgT25EZXN0cm95IHtcblx0cHVibGljIHZpZXdQb3J0SXRlbXM6IGFueVtdO1xuXHRwdWJsaWMgd2luZG93ID0gd2luZG93O1xuXG5cdHB1YmxpYyBnZXQgdmlld1BvcnRJbmRpY2VzKCk6IElQYWdlSW5mbyB7XG5cdFx0bGV0IHBhZ2VJbmZvOiBJUGFnZUluZm8gPSB0aGlzLnByZXZpb3VzVmlld1BvcnQgfHwgPGFueT57fTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0c3RhcnRJbmRleDogcGFnZUluZm8uc3RhcnRJbmRleCB8fCAwLFxuXHRcdFx0ZW5kSW5kZXg6IHBhZ2VJbmZvLmVuZEluZGV4IHx8IDBcblx0XHR9O1xuXHR9XG5cblx0cHJvdGVjdGVkIF9lbmFibGVVbmVxdWFsQ2hpbGRyZW5TaXplczogYm9vbGVhbiA9IGZhbHNlO1xuXHRASW5wdXQoKVxuXHRwdWJsaWMgZ2V0IGVuYWJsZVVuZXF1YWxDaGlsZHJlblNpemVzKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLl9lbmFibGVVbmVxdWFsQ2hpbGRyZW5TaXplcztcblx0fVxuXHRwdWJsaWMgc2V0IGVuYWJsZVVuZXF1YWxDaGlsZHJlblNpemVzKHZhbHVlOiBib29sZWFuKSB7XG5cdFx0aWYgKHRoaXMuX2VuYWJsZVVuZXF1YWxDaGlsZHJlblNpemVzID09PSB2YWx1ZSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuX2VuYWJsZVVuZXF1YWxDaGlsZHJlblNpemVzID0gdmFsdWU7XG5cdFx0dGhpcy5taW5NZWFzdXJlZENoaWxkV2lkdGggPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5taW5NZWFzdXJlZENoaWxkSGVpZ2h0ID0gdW5kZWZpbmVkO1xuXHR9XG5cblx0QElucHV0KClcblx0cHVibGljIHVzZU1hcmdpbkluc3RlYWRPZlRyYW5zbGF0ZTogYm9vbGVhbiA9IGZhbHNlO1xuXG5cdEBJbnB1dCgpXG5cdHB1YmxpYyBzY3JvbGxiYXJXaWR0aDogbnVtYmVyO1xuXG5cdEBJbnB1dCgpXG5cdHB1YmxpYyBzY3JvbGxiYXJIZWlnaHQ6IG51bWJlcjtcblxuXHRASW5wdXQoKVxuXHRwdWJsaWMgY2hpbGRXaWR0aDogbnVtYmVyO1xuXG5cdEBJbnB1dCgpXG5cdHB1YmxpYyBjaGlsZEhlaWdodDogbnVtYmVyO1xuXG5cdHByb3RlY3RlZCBfYnVmZmVyQW1vdW50OiBudW1iZXIgPSAwO1xuXHRASW5wdXQoKVxuXHRwdWJsaWMgZ2V0IGJ1ZmZlckFtb3VudCgpOiBudW1iZXIge1xuXHRcdHJldHVybiBNYXRoLm1heCh0aGlzLl9idWZmZXJBbW91bnQsIHRoaXMuZW5hYmxlVW5lcXVhbENoaWxkcmVuU2l6ZXMgPyA1IDogMCk7XG5cdH1cblx0cHVibGljIHNldCBidWZmZXJBbW91bnQodmFsdWU6IG51bWJlcikge1xuXHRcdHRoaXMuX2J1ZmZlckFtb3VudCA9IHZhbHVlO1xuXHR9XG5cblx0QElucHV0KClcblx0cHVibGljIHNjcm9sbEFuaW1hdGlvblRpbWU6IG51bWJlciA9IDc1MDtcblxuXHRASW5wdXQoKVxuXHRwdWJsaWMgcmVzaXplQnlwYXNzUmVmcmVzaFRoZXNob2xkOiBudW1iZXIgPSA1O1xuXG5cdHByb3RlY3RlZCBfc2Nyb2xsVGhyb3R0bGluZ1RpbWU6IG51bWJlcjtcblx0QElucHV0KClcblx0cHVibGljIGdldCBzY3JvbGxUaHJvdHRsaW5nVGltZSgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLl9zY3JvbGxUaHJvdHRsaW5nVGltZTtcblx0fVxuXHRwdWJsaWMgc2V0IHNjcm9sbFRocm90dGxpbmdUaW1lKHZhbHVlOiBudW1iZXIpIHtcblx0XHR0aGlzLl9zY3JvbGxUaHJvdHRsaW5nVGltZSA9IHZhbHVlO1xuXHRcdHRoaXMucmVmcmVzaF90aHJvdHRsZWQgPSA8YW55PnRoaXMudGhyb3R0bGVUcmFpbGluZygoKSA9PiB7XG5cdFx0XHR0aGlzLnJlZnJlc2hfaW50ZXJuYWwoZmFsc2UpO1xuXHRcdH0sIHRoaXMuX3Njcm9sbFRocm90dGxpbmdUaW1lKTtcblx0fVxuXG5cdHByb3RlY3RlZCBjaGVja1Njcm9sbEVsZW1lbnRSZXNpemVkVGltZXI6IG51bWJlcjtcblx0cHJvdGVjdGVkIF9jaGVja1Jlc2l6ZUludGVydmFsOiBudW1iZXIgPSAxMDAwO1xuXHRASW5wdXQoKVxuXHRwdWJsaWMgZ2V0IGNoZWNrUmVzaXplSW50ZXJ2YWwoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5fY2hlY2tSZXNpemVJbnRlcnZhbDtcblx0fVxuXHRwdWJsaWMgc2V0IGNoZWNrUmVzaXplSW50ZXJ2YWwodmFsdWU6IG51bWJlcikge1xuXHRcdGlmICh0aGlzLl9jaGVja1Jlc2l6ZUludGVydmFsID09PSB2YWx1ZSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuX2NoZWNrUmVzaXplSW50ZXJ2YWwgPSB2YWx1ZTtcblx0XHR0aGlzLmFkZFNjcm9sbEV2ZW50SGFuZGxlcnMoKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfaXRlbXM6IGFueVtdID0gW107XG5cdEBJbnB1dCgpXG5cdHB1YmxpYyBnZXQgaXRlbXMoKTogYW55W10ge1xuXHRcdHJldHVybiB0aGlzLl9pdGVtcztcblx0fVxuXHRwdWJsaWMgc2V0IGl0ZW1zKHZhbHVlOiBhbnlbXSkge1xuXHRcdGlmICh2YWx1ZSA9PT0gdGhpcy5faXRlbXMpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLl9pdGVtcyA9IHZhbHVlIHx8IFtdO1xuXHRcdHRoaXMucmVmcmVzaF9pbnRlcm5hbCh0cnVlKTtcblx0fVxuXG5cdEBJbnB1dCgpXG5cdHB1YmxpYyBjb21wYXJlSXRlbXM6IChpdGVtMTogYW55LCBpdGVtMjogYW55KSA9PiBib29sZWFuID0gKGl0ZW0xOiBhbnksIGl0ZW0yOiBhbnkpID0+IGl0ZW0xID09PSBpdGVtMjtcblxuXHRwcm90ZWN0ZWQgX2hvcml6b250YWw6IGJvb2xlYW47XG5cdEBJbnB1dCgpXG5cdHB1YmxpYyBnZXQgaG9yaXpvbnRhbCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5faG9yaXpvbnRhbDtcblx0fVxuXHRwdWJsaWMgc2V0IGhvcml6b250YWwodmFsdWU6IGJvb2xlYW4pIHtcblx0XHR0aGlzLl9ob3Jpem9udGFsID0gdmFsdWU7XG5cdFx0dGhpcy51cGRhdGVEaXJlY3Rpb24oKTtcblx0fVxuXG5cdHByb3RlY3RlZCByZXZlcnRQYXJlbnRPdmVyc2Nyb2xsKCk6IHZvaWQge1xuXHRcdGNvbnN0IHNjcm9sbEVsZW1lbnQ6IGFueSA9IHRoaXMuZ2V0U2Nyb2xsRWxlbWVudCgpO1xuXHRcdGlmIChzY3JvbGxFbGVtZW50ICYmIHRoaXMub2xkUGFyZW50U2Nyb2xsT3ZlcmZsb3cpIHtcblx0XHRcdHNjcm9sbEVsZW1lbnQuc3R5bGVbJ292ZXJmbG93LXknXSA9IHRoaXMub2xkUGFyZW50U2Nyb2xsT3ZlcmZsb3cueTtcblx0XHRcdHNjcm9sbEVsZW1lbnQuc3R5bGVbJ292ZXJmbG93LXgnXSA9IHRoaXMub2xkUGFyZW50U2Nyb2xsT3ZlcmZsb3cueDtcblx0XHR9XG5cblx0XHR0aGlzLm9sZFBhcmVudFNjcm9sbE92ZXJmbG93ID0gdW5kZWZpbmVkO1xuXHR9XG5cblx0cHJvdGVjdGVkIG9sZFBhcmVudFNjcm9sbE92ZXJmbG93OiB7IHg6IHN0cmluZywgeTogc3RyaW5nIH07XG5cdHByb3RlY3RlZCBfcGFyZW50U2Nyb2xsOiBFbGVtZW50IHwgV2luZG93O1xuXHRASW5wdXQoKVxuXHRwdWJsaWMgZ2V0IHBhcmVudFNjcm9sbCgpOiBFbGVtZW50IHwgV2luZG93IHtcblx0XHRyZXR1cm4gdGhpcy5fcGFyZW50U2Nyb2xsO1xuXHR9XG5cdHB1YmxpYyBzZXQgcGFyZW50U2Nyb2xsKHZhbHVlOiBFbGVtZW50IHwgV2luZG93KSB7XG5cdFx0aWYgKHRoaXMuX3BhcmVudFNjcm9sbCA9PT0gdmFsdWUpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLnJldmVydFBhcmVudE92ZXJzY3JvbGwoKTtcblx0XHR0aGlzLl9wYXJlbnRTY3JvbGwgPSB2YWx1ZTtcblx0XHR0aGlzLmFkZFNjcm9sbEV2ZW50SGFuZGxlcnMoKTtcblxuXHRcdGNvbnN0IHNjcm9sbEVsZW1lbnQ6YW55ID0gdGhpcy5nZXRTY3JvbGxFbGVtZW50KCk7XG5cdFx0aWYgKHNjcm9sbEVsZW1lbnQgIT09IHRoaXMuZWxlbWVudC5uYXRpdmVFbGVtZW50KSB7XG5cdFx0XHR0aGlzLm9sZFBhcmVudFNjcm9sbE92ZXJmbG93ID0geyB4OiBzY3JvbGxFbGVtZW50LnN0eWxlWydvdmVyZmxvdy14J10sIHk6IHNjcm9sbEVsZW1lbnQuc3R5bGVbJ292ZXJmbG93LXknXSB9O1xuXHRcdFx0c2Nyb2xsRWxlbWVudC5zdHlsZVsnb3ZlcmZsb3cteSddID0gdGhpcy5ob3Jpem9udGFsID8gJ3Zpc2libGUnIDogJ2F1dG8nO1xuXHRcdFx0c2Nyb2xsRWxlbWVudC5zdHlsZVsnb3ZlcmZsb3cteCddID0gdGhpcy5ob3Jpem9udGFsID8gJ2F1dG8nIDogJ3Zpc2libGUnO1xuXHRcdH1cblx0fVxuXG5cdEBPdXRwdXQoKVxuXHRwdWJsaWMgdXBkYXRlOiBFdmVudEVtaXR0ZXI8YW55W10+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnlbXT4oKTtcblx0QE91dHB1dCgpXG5cdHB1YmxpYyB2c1VwZGF0ZTogRXZlbnRFbWl0dGVyPGFueVtdPiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55W10+KCk7XG5cblx0QE91dHB1dCgpXG5cdHB1YmxpYyBjaGFuZ2U6IEV2ZW50RW1pdHRlcjxDaGFuZ2VFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENoYW5nZUV2ZW50PigpO1xuXHRAT3V0cHV0KClcblx0cHVibGljIHZzQ2hhbmdlOiBFdmVudEVtaXR0ZXI8Q2hhbmdlRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDaGFuZ2VFdmVudD4oKTtcblxuXHRAT3V0cHV0KClcblx0cHVibGljIHN0YXJ0OiBFdmVudEVtaXR0ZXI8Q2hhbmdlRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDaGFuZ2VFdmVudD4oKTtcblx0QE91dHB1dCgpXG5cdHB1YmxpYyB2c1N0YXJ0OiBFdmVudEVtaXR0ZXI8Q2hhbmdlRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDaGFuZ2VFdmVudD4oKTtcblxuXHRAT3V0cHV0KClcblx0cHVibGljIGVuZDogRXZlbnRFbWl0dGVyPENoYW5nZUV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hhbmdlRXZlbnQ+KCk7XG5cdEBPdXRwdXQoKVxuXHRwdWJsaWMgdnNFbmQ6IEV2ZW50RW1pdHRlcjxDaGFuZ2VFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENoYW5nZUV2ZW50PigpO1xuXG5cdEBWaWV3Q2hpbGQoJ2NvbnRlbnQnLCB7IHJlYWQ6IEVsZW1lbnRSZWYgfSlcblx0cHVibGljIGNvbnRlbnRFbGVtZW50UmVmOiBFbGVtZW50UmVmO1xuXG5cdEBWaWV3Q2hpbGQoJ2ludmlzaWJsZVBhZGRpbmcnLCB7IHJlYWQ6IEVsZW1lbnRSZWYgfSlcblx0cHVibGljIGludmlzaWJsZVBhZGRpbmdFbGVtZW50UmVmOiBFbGVtZW50UmVmO1xuXG5cdEBDb250ZW50Q2hpbGQoJ2NvbnRhaW5lcicsIHsgcmVhZDogRWxlbWVudFJlZiB9KVxuXHRwdWJsaWMgY29udGFpbmVyRWxlbWVudFJlZjogRWxlbWVudFJlZjtcblxuXHRwdWJsaWMgbmdPbkluaXQoKSB7XG5cdFx0dGhpcy5hZGRTY3JvbGxFdmVudEhhbmRsZXJzKCk7XG5cdH1cblxuXHRwdWJsaWMgbmdPbkRlc3Ryb3koKSB7XG5cdFx0dGhpcy5yZW1vdmVTY3JvbGxFdmVudEhhbmRsZXJzKCk7XG5cdFx0dGhpcy5yZXZlcnRQYXJlbnRPdmVyc2Nyb2xsKCk7XG5cdH1cblxuXHRwdWJsaWMgbmdPbkNoYW5nZXMoY2hhbmdlczogYW55KSB7XG5cdFx0bGV0IGluZGV4TGVuZ3RoQ2hhbmdlZDogYW55ID0gdGhpcy5jYWNoZWRJdGVtc0xlbmd0aCAhPT0gdGhpcy5pdGVtcy5sZW5ndGg7XG5cdFx0dGhpcy5jYWNoZWRJdGVtc0xlbmd0aCA9IHRoaXMuaXRlbXMubGVuZ3RoO1xuXG5cdFx0Y29uc3QgZmlyc3RSdW46IGJvb2xlYW4gPSAhY2hhbmdlcy5pdGVtcyB8fCAhY2hhbmdlcy5pdGVtcy5wcmV2aW91c1ZhbHVlIHx8IGNoYW5nZXMuaXRlbXMucHJldmlvdXNWYWx1ZS5sZW5ndGggPT09IDA7XG5cdFx0dGhpcy5yZWZyZXNoX2ludGVybmFsKGluZGV4TGVuZ3RoQ2hhbmdlZCB8fCBmaXJzdFJ1bik7XG5cdH1cblxuXHRwdWJsaWMgbmdEb0NoZWNrKCkge1xuXHRcdGlmICh0aGlzLmNhY2hlZEl0ZW1zTGVuZ3RoICE9PSB0aGlzLml0ZW1zLmxlbmd0aCkge1xuXHRcdFx0dGhpcy5jYWNoZWRJdGVtc0xlbmd0aCA9IHRoaXMuaXRlbXMubGVuZ3RoO1xuXHRcdFx0dGhpcy5yZWZyZXNoX2ludGVybmFsKHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdHB1YmxpYyByZWZyZXNoKCkge1xuXHRcdHRoaXMucmVmcmVzaF9pbnRlcm5hbCh0cnVlKTtcblx0fVxuXG5cdHB1YmxpYyBzY3JvbGxJbnRvKGl0ZW06IGFueSwgYWxpZ25Ub0JlZ2lubmluZzogYm9vbGVhbiA9IHRydWUsIGFkZGl0aW9uYWxPZmZzZXQ6IG51bWJlciA9IDAsIGFuaW1hdGlvbk1pbGxpc2Vjb25kczogbnVtYmVyID0gdW5kZWZpbmVkLCBhbmltYXRpb25Db21wbGV0ZWRDYWxsYmFjazogKCkgPT4gdm9pZCA9IHVuZGVmaW5lZCkge1xuXHRcdGxldCBpbmRleDogbnVtYmVyID0gdGhpcy5pdGVtcy5pbmRleE9mKGl0ZW0pO1xuXHRcdGlmIChpbmRleCA9PT0gLTEpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLnNjcm9sbFRvSW5kZXgoaW5kZXgsIGFsaWduVG9CZWdpbm5pbmcsIGFkZGl0aW9uYWxPZmZzZXQsIGFuaW1hdGlvbk1pbGxpc2Vjb25kcywgYW5pbWF0aW9uQ29tcGxldGVkQ2FsbGJhY2spO1xuXHR9XG5cblx0cHVibGljIHNjcm9sbFRvSW5kZXgoaW5kZXg6IG51bWJlciwgYWxpZ25Ub0JlZ2lubmluZzogYm9vbGVhbiA9IHRydWUsIGFkZGl0aW9uYWxPZmZzZXQ6IG51bWJlciA9IDAsIGFuaW1hdGlvbk1pbGxpc2Vjb25kczogbnVtYmVyID0gdW5kZWZpbmVkLCBhbmltYXRpb25Db21wbGV0ZWRDYWxsYmFjazogKCkgPT4gdm9pZCA9IHVuZGVmaW5lZCkge1xuXHRcdGxldCBtYXhSZXRyaWVzOiBudW1iZXIgPSA1O1xuXG5cdFx0bGV0IHJldHJ5SWZOZWVkZWQgPSAoKSA9PiB7XG5cdFx0XHQtLW1heFJldHJpZXM7XG5cdFx0XHRpZiAobWF4UmV0cmllcyA8PSAwKSB7XG5cdFx0XHRcdGlmIChhbmltYXRpb25Db21wbGV0ZWRDYWxsYmFjaykge1xuXHRcdFx0XHRcdGFuaW1hdGlvbkNvbXBsZXRlZENhbGxiYWNrKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgZGltZW5zaW9uczogYW55ID0gdGhpcy5jYWxjdWxhdGVEaW1lbnNpb25zKCk7XG5cdFx0XHRsZXQgZGVzaXJlZFN0YXJ0SW5kZXg6IGFueSA9IE1hdGgubWluKE1hdGgubWF4KGluZGV4LCAwKSwgZGltZW5zaW9ucy5pdGVtQ291bnQgLSAxKTtcblx0XHRcdGlmICh0aGlzLnByZXZpb3VzVmlld1BvcnQuc3RhcnRJbmRleCA9PT0gZGVzaXJlZFN0YXJ0SW5kZXgpIHtcblx0XHRcdFx0aWYgKGFuaW1hdGlvbkNvbXBsZXRlZENhbGxiYWNrKSB7XG5cdFx0XHRcdFx0YW5pbWF0aW9uQ29tcGxldGVkQ2FsbGJhY2soKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuc2Nyb2xsVG9JbmRleF9pbnRlcm5hbChpbmRleCwgYWxpZ25Ub0JlZ2lubmluZywgYWRkaXRpb25hbE9mZnNldCwgMCwgcmV0cnlJZk5lZWRlZCk7XG5cdFx0fTtcblxuXHRcdHRoaXMuc2Nyb2xsVG9JbmRleF9pbnRlcm5hbChpbmRleCwgYWxpZ25Ub0JlZ2lubmluZywgYWRkaXRpb25hbE9mZnNldCwgYW5pbWF0aW9uTWlsbGlzZWNvbmRzLCByZXRyeUlmTmVlZGVkKTtcblx0fVxuXG5cdHByb3RlY3RlZCBzY3JvbGxUb0luZGV4X2ludGVybmFsKGluZGV4OiBudW1iZXIsIGFsaWduVG9CZWdpbm5pbmc6IGJvb2xlYW4gPSB0cnVlLCBhZGRpdGlvbmFsT2Zmc2V0OiBudW1iZXIgPSAwLCBhbmltYXRpb25NaWxsaXNlY29uZHM6IG51bWJlciA9IHVuZGVmaW5lZCwgYW5pbWF0aW9uQ29tcGxldGVkQ2FsbGJhY2s6ICgpID0+IHZvaWQgPSB1bmRlZmluZWQpIHtcblx0XHRhbmltYXRpb25NaWxsaXNlY29uZHMgPSBhbmltYXRpb25NaWxsaXNlY29uZHMgPT09IHVuZGVmaW5lZCA/IHRoaXMuc2Nyb2xsQW5pbWF0aW9uVGltZSA6IGFuaW1hdGlvbk1pbGxpc2Vjb25kcztcblxuXHRcdGxldCBzY3JvbGxFbGVtZW50OiBhbnkgPSB0aGlzLmdldFNjcm9sbEVsZW1lbnQoKTtcblx0XHRsZXQgb2Zmc2V0OiBhbnkgPSB0aGlzLmdldEVsZW1lbnRzT2Zmc2V0KCk7XG5cblx0XHRsZXQgZGltZW5zaW9uczogYW55ID0gdGhpcy5jYWxjdWxhdGVEaW1lbnNpb25zKCk7XG5cdFx0bGV0IHNjcm9sbDogYW55ID0gdGhpcy5jYWxjdWxhdGVQYWRkaW5nKGluZGV4LCBkaW1lbnNpb25zLCBmYWxzZSkgKyBvZmZzZXQgKyBhZGRpdGlvbmFsT2Zmc2V0O1xuXHRcdGlmICghYWxpZ25Ub0JlZ2lubmluZykge1xuXHRcdFx0c2Nyb2xsIC09IGRpbWVuc2lvbnMud3JhcEdyb3Vwc1BlclBhZ2UgKiBkaW1lbnNpb25zW3RoaXMuX2NoaWxkU2Nyb2xsRGltXTtcblx0XHR9XG5cblx0XHRsZXQgYW5pbWF0aW9uUmVxdWVzdDogbnVtYmVyO1xuXG5cblx0XHRpZiAoIWFuaW1hdGlvbk1pbGxpc2Vjb25kcykge1xuXHRcdFx0dGhpcy5yZW5kZXJlci5zZXRQcm9wZXJ0eShzY3JvbGxFbGVtZW50LCB0aGlzLl9zY3JvbGxUeXBlLCBzY3JvbGwpO1xuXHRcdFx0dGhpcy5yZWZyZXNoX2ludGVybmFsKGZhbHNlLCBhbmltYXRpb25Db21wbGV0ZWRDYWxsYmFjayk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFxuXHR9XG5cblx0Y29uc3RydWN0b3IocHJvdGVjdGVkIHJlYWRvbmx5IGVsZW1lbnQ6IEVsZW1lbnRSZWYsIHByb3RlY3RlZCByZWFkb25seSByZW5kZXJlcjogUmVuZGVyZXIyLCBwcm90ZWN0ZWQgcmVhZG9ubHkgem9uZTogTmdab25lKSB7XG5cdFx0dGhpcy5ob3Jpem9udGFsID0gZmFsc2U7XG5cdFx0dGhpcy5zY3JvbGxUaHJvdHRsaW5nVGltZSA9IDA7XG5cdFx0dGhpcy5yZXNldFdyYXBHcm91cERpbWVuc2lvbnMoKTtcblx0fVxuXG5cdHByb3RlY3RlZCBwcmV2aW91c1Njcm9sbEJvdW5kaW5nUmVjdDogQ2xpZW50UmVjdDtcblx0cHJvdGVjdGVkIGNoZWNrU2Nyb2xsRWxlbWVudFJlc2l6ZWQoKTogdm9pZCB7XG5cdFx0bGV0IGJvdW5kaW5nUmVjdDogYW55ID0gdGhpcy5nZXRTY3JvbGxFbGVtZW50KCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cblx0XHRsZXQgc2l6ZUNoYW5nZWQ6IGJvb2xlYW47XG5cdFx0aWYgKCF0aGlzLnByZXZpb3VzU2Nyb2xsQm91bmRpbmdSZWN0KSB7XG5cdFx0XHRzaXplQ2hhbmdlZCA9IHRydWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxldCB3aWR0aENoYW5nZTogYW55ID0gTWF0aC5hYnMoYm91bmRpbmdSZWN0LndpZHRoIC0gdGhpcy5wcmV2aW91c1Njcm9sbEJvdW5kaW5nUmVjdC53aWR0aCk7XG5cdFx0XHRsZXQgaGVpZ2h0Q2hhbmdlOiBhbnkgPSBNYXRoLmFicyhib3VuZGluZ1JlY3QuaGVpZ2h0IC0gdGhpcy5wcmV2aW91c1Njcm9sbEJvdW5kaW5nUmVjdC5oZWlnaHQpO1xuXHRcdFx0c2l6ZUNoYW5nZWQgPSB3aWR0aENoYW5nZSA+IHRoaXMucmVzaXplQnlwYXNzUmVmcmVzaFRoZXNob2xkIHx8IGhlaWdodENoYW5nZSA+IHRoaXMucmVzaXplQnlwYXNzUmVmcmVzaFRoZXNob2xkO1xuXHRcdH1cblxuXHRcdGlmIChzaXplQ2hhbmdlZCkge1xuXHRcdFx0dGhpcy5wcmV2aW91c1Njcm9sbEJvdW5kaW5nUmVjdCA9IGJvdW5kaW5nUmVjdDtcblx0XHRcdGlmIChib3VuZGluZ1JlY3Qud2lkdGggPiAwICYmIGJvdW5kaW5nUmVjdC5oZWlnaHQgPiAwKSB7XG5cdFx0XHRcdHRoaXMucmVmcmVzaF9pbnRlcm5hbChmYWxzZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cHJvdGVjdGVkIF9pbnZpc2libGVQYWRkaW5nUHJvcGVydHk6IGFueTtcblx0cHJvdGVjdGVkIF9vZmZzZXRUeXBlOiBhbnk7XG5cdHByb3RlY3RlZCBfc2Nyb2xsVHlwZTogYW55O1xuXHRwcm90ZWN0ZWQgX3BhZ2VPZmZzZXRUeXBlOiBhbnk7XG5cdHByb3RlY3RlZCBfY2hpbGRTY3JvbGxEaW06IGFueTtcblx0cHJvdGVjdGVkIF90cmFuc2xhdGVEaXI6IGFueTtcblx0cHJvdGVjdGVkIF9tYXJnaW5EaXI6IGFueTtcblx0cHJvdGVjdGVkIHVwZGF0ZURpcmVjdGlvbigpOiB2b2lkIHtcblx0XHRpZiAodGhpcy5ob3Jpem9udGFsKSB7XG5cdFx0XHR0aGlzLl9pbnZpc2libGVQYWRkaW5nUHJvcGVydHkgPSAnd2lkdGgnO1xuXHRcdFx0dGhpcy5fb2Zmc2V0VHlwZSA9ICdvZmZzZXRMZWZ0Jztcblx0XHRcdHRoaXMuX3BhZ2VPZmZzZXRUeXBlID0gJ3BhZ2VYT2Zmc2V0Jztcblx0XHRcdHRoaXMuX2NoaWxkU2Nyb2xsRGltID0gJ2NoaWxkV2lkdGgnO1xuXHRcdFx0dGhpcy5fbWFyZ2luRGlyID0gJ21hcmdpbi1sZWZ0Jztcblx0XHRcdHRoaXMuX3RyYW5zbGF0ZURpciA9ICd0cmFuc2xhdGVYJztcblx0XHRcdHRoaXMuX3Njcm9sbFR5cGUgPSAnc2Nyb2xsTGVmdCc7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dGhpcy5faW52aXNpYmxlUGFkZGluZ1Byb3BlcnR5ID0gJ2hlaWdodCc7XG5cdFx0XHR0aGlzLl9vZmZzZXRUeXBlID0gJ29mZnNldFRvcCc7XG5cdFx0XHR0aGlzLl9wYWdlT2Zmc2V0VHlwZSA9ICdwYWdlWU9mZnNldCc7XG5cdFx0XHR0aGlzLl9jaGlsZFNjcm9sbERpbSA9ICdjaGlsZEhlaWdodCc7XG5cdFx0XHR0aGlzLl9tYXJnaW5EaXIgPSAnbWFyZ2luLXRvcCc7XG5cdFx0XHR0aGlzLl90cmFuc2xhdGVEaXIgPSAndHJhbnNsYXRlWSc7XG5cdFx0XHR0aGlzLl9zY3JvbGxUeXBlID0gJ3Njcm9sbFRvcCc7XG5cdFx0fVxuXHR9XG5cblx0cHJvdGVjdGVkIHJlZnJlc2hfdGhyb3R0bGVkOiAoKSA9PiB2b2lkO1xuXG5cdHByb3RlY3RlZCB0aHJvdHRsZVRyYWlsaW5nKGZ1bmM6IEZ1bmN0aW9uLCB3YWl0OiBudW1iZXIpOiBGdW5jdGlvbiB7XG5cdFx0bGV0IHRpbWVvdXQ6IGFueSA9IHVuZGVmaW5lZDtcblx0XHRjb25zdCByZXN1bHQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRjb25zdCBfdGhpcyA9IHRoaXM7XG5cdFx0XHRjb25zdCBfYXJndW1lbnRzID0gYXJndW1lbnRzO1xuXG5cdFx0XHRpZiAodGltZW91dCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGlmICh3YWl0IDw9IDApIHtcblx0XHRcdFx0ZnVuYy5hcHBseShfdGhpcywgX2FyZ3VtZW50cyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0dGltZW91dCA9IHVuZGVmaW5lZDtcblx0XHRcdFx0XHRmdW5jLmFwcGx5KF90aGlzLCBfYXJndW1lbnRzKTtcblx0XHRcdFx0fSwgd2FpdCk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgY2FsY3VsYXRlZFNjcm9sbGJhcldpZHRoOiBudW1iZXIgPSAwO1xuXHRwcm90ZWN0ZWQgY2FsY3VsYXRlZFNjcm9sbGJhckhlaWdodDogbnVtYmVyID0gMDtcblxuXHRwcm90ZWN0ZWQgcGFkZGluZzogbnVtYmVyID0gMDtcblx0cHJvdGVjdGVkIHByZXZpb3VzVmlld1BvcnQ6IElWaWV3cG9ydCA9IDxhbnk+e307XG5cdHByb3RlY3RlZCBjYWNoZWRJdGVtc0xlbmd0aDogbnVtYmVyO1xuXG5cdHByb3RlY3RlZCBkaXNwb3NlU2Nyb2xsSGFuZGxlcjogKCkgPT4gdm9pZCB8IHVuZGVmaW5lZDtcblx0cHJvdGVjdGVkIGRpc3Bvc2VSZXNpemVIYW5kbGVyOiAoKSA9PiB2b2lkIHwgdW5kZWZpbmVkO1xuXG5cdHByb3RlY3RlZCByZWZyZXNoX2ludGVybmFsKGl0ZW1zQXJyYXlNb2RpZmllZDogYm9vbGVhbiwgcmVmcmVzaENvbXBsZXRlZENhbGxiYWNrOiAoKSA9PiB2b2lkID0gdW5kZWZpbmVkLCBtYXhSdW5UaW1lczogbnVtYmVyID0gMikge1xuXHRcdC8vbm90ZTogbWF4UnVuVGltZXMgaXMgdG8gZm9yY2UgaXQgdG8ga2VlcCByZWNhbGN1bGF0aW5nIGlmIHRoZSBwcmV2aW91cyBpdGVyYXRpb24gY2F1c2VkIGEgcmUtcmVuZGVyIChkaWZmZXJlbnQgc2xpY2VkIGl0ZW1zIGluIHZpZXdwb3J0IG9yIHNjcm9sbFBvc2l0aW9uIGNoYW5nZWQpLlxuXHRcdC8vVGhlIGRlZmF1bHQgb2YgMnggbWF4IHdpbGwgcHJvYmFibHkgYmUgYWNjdXJhdGUgZW5vdWdoIHdpdGhvdXQgY2F1c2luZyB0b28gbGFyZ2UgYSBwZXJmb3JtYW5jZSBib3R0bGVuZWNrXG5cdFx0Ly9UaGUgY29kZSB3b3VsZCB0eXBpY2FsbHkgcXVpdCBvdXQgb24gdGhlIDJuZCBpdGVyYXRpb24gYW55d2F5cy4gVGhlIG1haW4gdGltZSBpdCdkIHRoaW5rIG1vcmUgdGhhbiAyIHJ1bnMgd291bGQgYmUgbmVjZXNzYXJ5IHdvdWxkIGJlIGZvciB2YXN0bHkgZGlmZmVyZW50IHNpemVkIGNoaWxkIGl0ZW1zIG9yIGlmIHRoaXMgaXMgdGhlIDFzdCB0aW1lIHRoZSBpdGVtcyBhcnJheSB3YXMgaW5pdGlhbGl6ZWQuXG5cdFx0Ly9XaXRob3V0IG1heFJ1blRpbWVzLCBJZiB0aGUgdXNlciBpcyBhY3RpdmVseSBzY3JvbGxpbmcgdGhpcyBjb2RlIHdvdWxkIGJlY29tZSBhbiBpbmZpbml0ZSBsb29wIHVudGlsIHRoZXkgc3RvcHBlZCBzY3JvbGxpbmcuIFRoaXMgd291bGQgYmUgb2theSwgZXhjZXB0IGVhY2ggc2Nyb2xsIGV2ZW50IHdvdWxkIHN0YXJ0IGFuIGFkZGl0aW9uYWwgaW5maW50ZSBsb29wLiBXZSB3YW50IHRvIHNob3J0LWNpcmN1aXQgaXQgdG8gcHJldmVudCBoaXMuXG5cblx0XHR0aGlzLnpvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuXHRcdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcblxuXHRcdFx0XHRpZiAoaXRlbXNBcnJheU1vZGlmaWVkKSB7XG5cdFx0XHRcdFx0dGhpcy5yZXNldFdyYXBHcm91cERpbWVuc2lvbnMoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRsZXQgdmlld3BvcnQ6IGFueSA9IHRoaXMuY2FsY3VsYXRlVmlld3BvcnQoKTtcblxuXHRcdFx0XHRsZXQgc3RhcnRDaGFuZ2VkOiBhbnkgPSBpdGVtc0FycmF5TW9kaWZpZWQgfHwgdmlld3BvcnQuc3RhcnRJbmRleCAhPT0gdGhpcy5wcmV2aW91c1ZpZXdQb3J0LnN0YXJ0SW5kZXg7XG5cdFx0XHRcdGxldCBlbmRDaGFuZ2VkOiBhbnkgPSBpdGVtc0FycmF5TW9kaWZpZWQgfHwgdmlld3BvcnQuZW5kSW5kZXggIT09IHRoaXMucHJldmlvdXNWaWV3UG9ydC5lbmRJbmRleDtcblx0XHRcdFx0bGV0IHNjcm9sbExlbmd0aENoYW5nZWQ6IGFueSA9IHZpZXdwb3J0LnNjcm9sbExlbmd0aCAhPT0gdGhpcy5wcmV2aW91c1ZpZXdQb3J0LnNjcm9sbExlbmd0aDtcblx0XHRcdFx0bGV0IHBhZGRpbmdDaGFuZ2VkOiBhbnkgPSB2aWV3cG9ydC5wYWRkaW5nICE9PSB0aGlzLnByZXZpb3VzVmlld1BvcnQucGFkZGluZztcblxuXHRcdFx0XHR0aGlzLnByZXZpb3VzVmlld1BvcnQgPSB2aWV3cG9ydDtcblxuXHRcdFx0XHRpZiAoc2Nyb2xsTGVuZ3RoQ2hhbmdlZCkge1xuXHRcdFx0XHRcdHRoaXMucmVuZGVyZXIuc2V0U3R5bGUodGhpcy5pbnZpc2libGVQYWRkaW5nRWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCB0aGlzLl9pbnZpc2libGVQYWRkaW5nUHJvcGVydHksIGAke3ZpZXdwb3J0LnNjcm9sbExlbmd0aH1weGApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHBhZGRpbmdDaGFuZ2VkKSB7XG5cdFx0XHRcdFx0aWYgKHRoaXMudXNlTWFyZ2luSW5zdGVhZE9mVHJhbnNsYXRlKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHRoaXMuY29udGVudEVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgdGhpcy5fbWFyZ2luRGlyLCBgJHt2aWV3cG9ydC5wYWRkaW5nfXB4YCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0dGhpcy5yZW5kZXJlci5zZXRTdHlsZSh0aGlzLmNvbnRlbnRFbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsICd0cmFuc2Zvcm0nLCBgJHt0aGlzLl90cmFuc2xhdGVEaXJ9KCR7dmlld3BvcnQucGFkZGluZ31weClgKTtcblx0XHRcdFx0XHRcdHRoaXMucmVuZGVyZXIuc2V0U3R5bGUodGhpcy5jb250ZW50RWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCAnd2Via2l0VHJhbnNmb3JtJywgYCR7dGhpcy5fdHJhbnNsYXRlRGlyfSgke3ZpZXdwb3J0LnBhZGRpbmd9cHgpYCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IGVtaXRJbmRleENoYW5nZWRFdmVudHM6IGFueSA9IHRydWU7IC8vIG1heFJlUnVuVGltZXMgPT09IDEgKHdvdWxkIG5lZWQgdG8gc3RpbGwgcnVuIGlmIGRpZG4ndCB1cGRhdGUgaWYgcHJldmlvdXMgaXRlcmF0aW9uIGhhZCB1cGRhdGVkKVxuXG5cdFx0XHRcdGlmIChzdGFydENoYW5nZWQgfHwgZW5kQ2hhbmdlZCkge1xuXHRcdFx0XHRcdHRoaXMuem9uZS5ydW4oKCkgPT4ge1xuXG5cdFx0XHRcdFx0XHQvLyB1cGRhdGUgdGhlIHNjcm9sbCBsaXN0IHRvIHRyaWdnZXIgcmUtcmVuZGVyIG9mIGNvbXBvbmVudHMgaW4gdmlld3BvcnRcblx0XHRcdFx0XHRcdHRoaXMudmlld1BvcnRJdGVtcyA9IHZpZXdwb3J0LnN0YXJ0SW5kZXhXaXRoQnVmZmVyID49IDAgJiYgdmlld3BvcnQuZW5kSW5kZXhXaXRoQnVmZmVyID49IDAgPyB0aGlzLml0ZW1zLnNsaWNlKHZpZXdwb3J0LnN0YXJ0SW5kZXhXaXRoQnVmZmVyLCB2aWV3cG9ydC5lbmRJbmRleFdpdGhCdWZmZXIgKyAxKSA6IFtdO1xuXHRcdFx0XHRcdFx0dGhpcy51cGRhdGUuZW1pdCh0aGlzLnZpZXdQb3J0SXRlbXMpO1xuXHRcdFx0XHRcdFx0dGhpcy52c1VwZGF0ZS5lbWl0KHRoaXMudmlld1BvcnRJdGVtcyk7XG5cblx0XHRcdFx0XHRcdGlmIChlbWl0SW5kZXhDaGFuZ2VkRXZlbnRzKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChzdGFydENoYW5nZWQpIHtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnN0YXJ0LmVtaXQoeyBzdGFydDogdmlld3BvcnQuc3RhcnRJbmRleCwgZW5kOiB2aWV3cG9ydC5lbmRJbmRleCB9KTtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnZzU3RhcnQuZW1pdCh7IHN0YXJ0OiB2aWV3cG9ydC5zdGFydEluZGV4LCBlbmQ6IHZpZXdwb3J0LmVuZEluZGV4IH0pO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKGVuZENoYW5nZWQpIHtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLmVuZC5lbWl0KHsgc3RhcnQ6IHZpZXdwb3J0LnN0YXJ0SW5kZXgsIGVuZDogdmlld3BvcnQuZW5kSW5kZXggfSk7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy52c0VuZC5lbWl0KHsgc3RhcnQ6IHZpZXdwb3J0LnN0YXJ0SW5kZXgsIGVuZDogdmlld3BvcnQuZW5kSW5kZXggfSk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAoc3RhcnRDaGFuZ2VkIHx8IGVuZENoYW5nZWQpIHtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLmNoYW5nZS5lbWl0KHsgc3RhcnQ6IHZpZXdwb3J0LnN0YXJ0SW5kZXgsIGVuZDogdmlld3BvcnQuZW5kSW5kZXggfSk7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy52c0NoYW5nZS5lbWl0KHsgc3RhcnQ6IHZpZXdwb3J0LnN0YXJ0SW5kZXgsIGVuZDogdmlld3BvcnQuZW5kSW5kZXggfSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYgKG1heFJ1blRpbWVzID4gMCkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLnJlZnJlc2hfaW50ZXJuYWwoZmFsc2UsIHJlZnJlc2hDb21wbGV0ZWRDYWxsYmFjaywgbWF4UnVuVGltZXMgLSAxKTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAocmVmcmVzaENvbXBsZXRlZENhbGxiYWNrKSB7XG5cdFx0XHRcdFx0XHRcdHJlZnJlc2hDb21wbGV0ZWRDYWxsYmFjaygpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGlmIChtYXhSdW5UaW1lcyA+IDAgJiYgKHNjcm9sbExlbmd0aENoYW5nZWQgfHwgcGFkZGluZ0NoYW5nZWQpKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnJlZnJlc2hfaW50ZXJuYWwoZmFsc2UsIHJlZnJlc2hDb21wbGV0ZWRDYWxsYmFjaywgbWF4UnVuVGltZXMgLSAxKTtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAocmVmcmVzaENvbXBsZXRlZENhbGxiYWNrKSB7XG5cdFx0XHRcdFx0XHRyZWZyZXNoQ29tcGxldGVkQ2FsbGJhY2soKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0cHJvdGVjdGVkIGdldFNjcm9sbEVsZW1lbnQoKTogYW55IHtcblx0XHRyZXR1cm4gdGhpcy5wYXJlbnRTY3JvbGwgaW5zdGFuY2VvZiBXaW5kb3cgPyBkb2N1bWVudC5zY3JvbGxpbmdFbGVtZW50IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5IDogdGhpcy5wYXJlbnRTY3JvbGwgfHwgdGhpcy5lbGVtZW50Lm5hdGl2ZUVsZW1lbnQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgYWRkU2Nyb2xsRXZlbnRIYW5kbGVycygpIHtcblx0XHRsZXQgc2Nyb2xsRWxlbWVudDogYW55ID0gdGhpcy5nZXRTY3JvbGxFbGVtZW50KCk7XG5cblx0XHR0aGlzLnJlbW92ZVNjcm9sbEV2ZW50SGFuZGxlcnMoKTtcblxuXHRcdHRoaXMuem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG5cdFx0XHRpZiAodGhpcy5wYXJlbnRTY3JvbGwgaW5zdGFuY2VvZiBXaW5kb3cpIHtcblx0XHRcdFx0dGhpcy5kaXNwb3NlU2Nyb2xsSGFuZGxlciA9IHRoaXMucmVuZGVyZXIubGlzdGVuKCd3aW5kb3cnLCAnc2Nyb2xsJywgdGhpcy5yZWZyZXNoX3Rocm90dGxlZCk7XG5cdFx0XHRcdHRoaXMuZGlzcG9zZVJlc2l6ZUhhbmRsZXIgPSB0aGlzLnJlbmRlcmVyLmxpc3Rlbignd2luZG93JywgJ3Jlc2l6ZScsIHRoaXMucmVmcmVzaF90aHJvdHRsZWQpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHRoaXMuZGlzcG9zZVNjcm9sbEhhbmRsZXIgPSB0aGlzLnJlbmRlcmVyLmxpc3RlbihzY3JvbGxFbGVtZW50LCAnc2Nyb2xsJywgdGhpcy5yZWZyZXNoX3Rocm90dGxlZCk7XG5cdFx0XHRcdGlmICh0aGlzLl9jaGVja1Jlc2l6ZUludGVydmFsID4gMCkge1xuXHRcdFx0XHRcdHRoaXMuY2hlY2tTY3JvbGxFbGVtZW50UmVzaXplZFRpbWVyID0gPGFueT5zZXRJbnRlcnZhbCgoKSA9PiB7IHRoaXMuY2hlY2tTY3JvbGxFbGVtZW50UmVzaXplZCgpOyB9LCB0aGlzLl9jaGVja1Jlc2l6ZUludGVydmFsKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cHJvdGVjdGVkIHJlbW92ZVNjcm9sbEV2ZW50SGFuZGxlcnMoKSB7XG5cdFx0aWYgKHRoaXMuY2hlY2tTY3JvbGxFbGVtZW50UmVzaXplZFRpbWVyKSB7XG5cdFx0XHRjbGVhckludGVydmFsKHRoaXMuY2hlY2tTY3JvbGxFbGVtZW50UmVzaXplZFRpbWVyKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5kaXNwb3NlU2Nyb2xsSGFuZGxlcikge1xuXHRcdFx0dGhpcy5kaXNwb3NlU2Nyb2xsSGFuZGxlcigpO1xuXHRcdFx0dGhpcy5kaXNwb3NlU2Nyb2xsSGFuZGxlciA9IHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5kaXNwb3NlUmVzaXplSGFuZGxlcikge1xuXHRcdFx0dGhpcy5kaXNwb3NlUmVzaXplSGFuZGxlcigpO1xuXHRcdFx0dGhpcy5kaXNwb3NlUmVzaXplSGFuZGxlciA9IHVuZGVmaW5lZDtcblx0XHR9XG5cdH1cblxuXHRwcm90ZWN0ZWQgZ2V0RWxlbWVudHNPZmZzZXQoKTogbnVtYmVyIHtcblx0XHRsZXQgb2Zmc2V0OiBhbnkgPSAwO1xuXG5cdFx0aWYgKHRoaXMuY29udGFpbmVyRWxlbWVudFJlZiAmJiB0aGlzLmNvbnRhaW5lckVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkge1xuXHRcdFx0b2Zmc2V0ICs9IHRoaXMuY29udGFpbmVyRWxlbWVudFJlZi5uYXRpdmVFbGVtZW50W3RoaXMuX29mZnNldFR5cGVdO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLnBhcmVudFNjcm9sbCkge1xuXHRcdFx0bGV0IHNjcm9sbEVsZW1lbnQ6IGFueSA9IHRoaXMuZ2V0U2Nyb2xsRWxlbWVudCgpO1xuXHRcdFx0bGV0IGVsZW1lbnRDbGllbnRSZWN0OiBhbnkgPSB0aGlzLmVsZW1lbnQubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0XHRcdGxldCBzY3JvbGxDbGllbnRSZWN0OiBhbnkgPSBzY3JvbGxFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0aWYgKHRoaXMuaG9yaXpvbnRhbCkge1xuXHRcdFx0XHRvZmZzZXQgKz0gZWxlbWVudENsaWVudFJlY3QubGVmdCAtIHNjcm9sbENsaWVudFJlY3QubGVmdDtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRvZmZzZXQgKz0gZWxlbWVudENsaWVudFJlY3QudG9wIC0gc2Nyb2xsQ2xpZW50UmVjdC50b3A7XG5cdFx0XHR9XG5cblx0XHRcdGlmICghKHRoaXMucGFyZW50U2Nyb2xsIGluc3RhbmNlb2YgV2luZG93KSkge1xuXHRcdFx0XHRvZmZzZXQgKz0gc2Nyb2xsRWxlbWVudFt0aGlzLl9zY3JvbGxUeXBlXTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gb2Zmc2V0O1xuXHR9XG5cblx0cHJvdGVjdGVkIGNvdW50SXRlbXNQZXJXcmFwR3JvdXAoKSB7XG5cdFx0bGV0IHByb3BlcnR5TmFtZTogYW55ID0gdGhpcy5ob3Jpem9udGFsID8gJ29mZnNldExlZnQnIDogJ29mZnNldFRvcCc7XG5cdFx0bGV0IGNoaWxkcmVuOiBhbnkgPSAoKHRoaXMuY29udGFpbmVyRWxlbWVudFJlZiAmJiB0aGlzLmNvbnRhaW5lckVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkgfHwgdGhpcy5jb250ZW50RWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KS5jaGlsZHJlbjtcblxuXHRcdGxldCBjaGlsZHJlbkxlbmd0aDogYW55ID0gY2hpbGRyZW4gPyBjaGlsZHJlbi5sZW5ndGggOiAwO1xuXHRcdGlmIChjaGlsZHJlbkxlbmd0aCA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIDE7XG5cdFx0fVxuXG5cdFx0bGV0IGZpcnN0T2Zmc2V0OiBhbnkgPSBjaGlsZHJlblswXVtwcm9wZXJ0eU5hbWVdO1xuXHRcdGxldCByZXN1bHQ6IGFueSA9IDE7XG5cdFx0d2hpbGUgKHJlc3VsdCA8IGNoaWxkcmVuTGVuZ3RoICYmIGZpcnN0T2Zmc2V0ID09PSBjaGlsZHJlbltyZXN1bHRdW3Byb3BlcnR5TmFtZV0pIHtcblx0XHRcdCsrcmVzdWx0O1xuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgZ2V0U2Nyb2xsUG9zaXRpb24oKTogbnVtYmVyIHtcblx0XHRsZXQgd2luZG93U2Nyb2xsVmFsdWU6IG51bWJlciA9IHVuZGVmaW5lZDtcblx0XHRpZiAodGhpcy5wYXJlbnRTY3JvbGwgaW5zdGFuY2VvZiBXaW5kb3cpIHtcblx0XHRcdHZhciB3aW5kb3c6IGFueTtcblx0XHRcdHdpbmRvd1Njcm9sbFZhbHVlID0gd2luZG93W3RoaXMuX3BhZ2VPZmZzZXRUeXBlXTtcblx0XHR9XG5cblx0XHRyZXR1cm4gd2luZG93U2Nyb2xsVmFsdWUgfHwgdGhpcy5nZXRTY3JvbGxFbGVtZW50KClbdGhpcy5fc2Nyb2xsVHlwZV0gfHwgMDtcblx0fVxuXG5cdHByb3RlY3RlZCBtaW5NZWFzdXJlZENoaWxkV2lkdGg6IG51bWJlcjtcblx0cHJvdGVjdGVkIG1pbk1lYXN1cmVkQ2hpbGRIZWlnaHQ6IG51bWJlcjtcblxuXHRwcm90ZWN0ZWQgd3JhcEdyb3VwRGltZW5zaW9uczogYW55O1xuXG5cdHByb3RlY3RlZCByZXNldFdyYXBHcm91cERpbWVuc2lvbnMoKTogdm9pZCB7XG5cdFx0Y29uc3Qgb2xkV3JhcEdyb3VwRGltZW5zaW9ucyA9IHRoaXMud3JhcEdyb3VwRGltZW5zaW9ucztcblx0XHR0aGlzLndyYXBHcm91cERpbWVuc2lvbnMgPSB7XG5cdFx0XHRtYXhDaGlsZFNpemVQZXJXcmFwR3JvdXA6IFtdLFxuXHRcdFx0bnVtYmVyT2ZLbm93bldyYXBHcm91cENoaWxkU2l6ZXM6IDAsXG5cdFx0XHRzdW1PZktub3duV3JhcEdyb3VwQ2hpbGRXaWR0aHM6IDAsXG5cdFx0XHRzdW1PZktub3duV3JhcEdyb3VwQ2hpbGRIZWlnaHRzOiAwXG5cdFx0fTtcblxuXHRcdGlmICghdGhpcy5lbmFibGVVbmVxdWFsQ2hpbGRyZW5TaXplcyB8fCAhb2xkV3JhcEdyb3VwRGltZW5zaW9ucyB8fCBvbGRXcmFwR3JvdXBEaW1lbnNpb25zLm51bWJlck9mS25vd25XcmFwR3JvdXBDaGlsZFNpemVzID09PSAwKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y29uc3QgaXRlbXNQZXJXcmFwR3JvdXA6IG51bWJlciA9IHRoaXMuY291bnRJdGVtc1BlcldyYXBHcm91cCgpO1xuXHRcdGZvciAobGV0IHdyYXBHcm91cEluZGV4OiBhbnkgPSAwOyB3cmFwR3JvdXBJbmRleCA8IG9sZFdyYXBHcm91cERpbWVuc2lvbnMubWF4Q2hpbGRTaXplUGVyV3JhcEdyb3VwLmxlbmd0aDsgKyt3cmFwR3JvdXBJbmRleCkge1xuXHRcdFx0Y29uc3Qgb2xkV3JhcEdyb3VwRGltZW5zaW9uOiBXcmFwR3JvdXBEaW1lbnNpb24gPSBvbGRXcmFwR3JvdXBEaW1lbnNpb25zLm1heENoaWxkU2l6ZVBlcldyYXBHcm91cFt3cmFwR3JvdXBJbmRleF07XG5cdFx0XHRpZiAoIW9sZFdyYXBHcm91cERpbWVuc2lvbiB8fCAhb2xkV3JhcEdyb3VwRGltZW5zaW9uLml0ZW1zIHx8ICFvbGRXcmFwR3JvdXBEaW1lbnNpb24uaXRlbXMubGVuZ3RoKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAob2xkV3JhcEdyb3VwRGltZW5zaW9uLml0ZW1zLmxlbmd0aCAhPT0gaXRlbXNQZXJXcmFwR3JvdXApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgaXRlbXNDaGFuZ2VkOiBhbnkgPSBmYWxzZTtcblx0XHRcdGxldCBhcnJheVN0YXJ0SW5kZXg6IGFueSA9IGl0ZW1zUGVyV3JhcEdyb3VwICogd3JhcEdyb3VwSW5kZXg7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGl0ZW1zUGVyV3JhcEdyb3VwOyArK2kpIHtcblx0XHRcdFx0aWYgKCF0aGlzLmNvbXBhcmVJdGVtcyhvbGRXcmFwR3JvdXBEaW1lbnNpb24uaXRlbXNbaV0sIHRoaXMuaXRlbXNbYXJyYXlTdGFydEluZGV4ICsgaV0pKSB7XG5cdFx0XHRcdFx0aXRlbXNDaGFuZ2VkID0gdHJ1ZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIWl0ZW1zQ2hhbmdlZCkge1xuXHRcdFx0XHQrK3RoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5udW1iZXJPZktub3duV3JhcEdyb3VwQ2hpbGRTaXplcztcblx0XHRcdFx0dGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLnN1bU9mS25vd25XcmFwR3JvdXBDaGlsZFdpZHRocyArPSBvbGRXcmFwR3JvdXBEaW1lbnNpb24uY2hpbGRXaWR0aCB8fCAwO1xuXHRcdFx0XHR0aGlzLndyYXBHcm91cERpbWVuc2lvbnMuc3VtT2ZLbm93bldyYXBHcm91cENoaWxkSGVpZ2h0cyArPSBvbGRXcmFwR3JvdXBEaW1lbnNpb24uY2hpbGRIZWlnaHQgfHwgMDtcblx0XHRcdFx0dGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLm1heENoaWxkU2l6ZVBlcldyYXBHcm91cFt3cmFwR3JvdXBJbmRleF0gPSBvbGRXcmFwR3JvdXBEaW1lbnNpb247XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cHJvdGVjdGVkIGNhbGN1bGF0ZURpbWVuc2lvbnMoKTogSURpbWVuc2lvbnMge1xuXHRcdGxldCBzY3JvbGxFbGVtZW50OiBhbnkgPSB0aGlzLmdldFNjcm9sbEVsZW1lbnQoKTtcblx0XHRsZXQgaXRlbUNvdW50OiBhbnkgPSB0aGlzLml0ZW1zLmxlbmd0aDtcblxuXHRcdGNvbnN0IG1heENhbGN1bGF0ZWRTY3JvbGxCYXJTaXplOiBudW1iZXIgPSAyNTsgLy8gTm90ZTogRm9ybXVsYSB0byBhdXRvLWNhbGN1bGF0ZSBkb2Vzbid0IHdvcmsgZm9yIFBhcmVudFNjcm9sbCwgc28gd2UgZGVmYXVsdCB0byB0aGlzIGlmIG5vdCBzZXQgYnkgY29uc3VtaW5nIGFwcGxpY2F0aW9uXG5cdFx0dGhpcy5jYWxjdWxhdGVkU2Nyb2xsYmFySGVpZ2h0ID0gTWF0aC5tYXgoTWF0aC5taW4oc2Nyb2xsRWxlbWVudC5vZmZzZXRIZWlnaHQgLSBzY3JvbGxFbGVtZW50LmNsaWVudEhlaWdodCwgbWF4Q2FsY3VsYXRlZFNjcm9sbEJhclNpemUpLCB0aGlzLmNhbGN1bGF0ZWRTY3JvbGxiYXJIZWlnaHQpO1xuXHRcdHRoaXMuY2FsY3VsYXRlZFNjcm9sbGJhcldpZHRoID0gTWF0aC5tYXgoTWF0aC5taW4oc2Nyb2xsRWxlbWVudC5vZmZzZXRXaWR0aCAtIHNjcm9sbEVsZW1lbnQuY2xpZW50V2lkdGgsIG1heENhbGN1bGF0ZWRTY3JvbGxCYXJTaXplKSwgdGhpcy5jYWxjdWxhdGVkU2Nyb2xsYmFyV2lkdGgpO1xuXG5cdFx0bGV0IHZpZXdXaWR0aDogYW55ID0gc2Nyb2xsRWxlbWVudC5vZmZzZXRXaWR0aCAtICh0aGlzLnNjcm9sbGJhcldpZHRoIHx8IHRoaXMuY2FsY3VsYXRlZFNjcm9sbGJhcldpZHRoIHx8ICh0aGlzLmhvcml6b250YWwgPyAwIDogbWF4Q2FsY3VsYXRlZFNjcm9sbEJhclNpemUpKTtcblx0XHRsZXQgdmlld0hlaWdodDogYW55ID0gc2Nyb2xsRWxlbWVudC5vZmZzZXRIZWlnaHQgLSAodGhpcy5zY3JvbGxiYXJIZWlnaHQgfHwgdGhpcy5jYWxjdWxhdGVkU2Nyb2xsYmFySGVpZ2h0IHx8ICh0aGlzLmhvcml6b250YWwgPyBtYXhDYWxjdWxhdGVkU2Nyb2xsQmFyU2l6ZSA6IDApKTtcblxuXHRcdGxldCBjb250ZW50OiBhbnkgPSAodGhpcy5jb250YWluZXJFbGVtZW50UmVmICYmIHRoaXMuY29udGFpbmVyRWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KSB8fCB0aGlzLmNvbnRlbnRFbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG5cblx0XHRsZXQgaXRlbXNQZXJXcmFwR3JvdXA6IGFueSA9IHRoaXMuY291bnRJdGVtc1BlcldyYXBHcm91cCgpO1xuXHRcdGxldCB3cmFwR3JvdXBzUGVyUGFnZTogYW55O1xuXG5cdFx0bGV0IGRlZmF1bHRDaGlsZFdpZHRoOiBhbnk7XG5cdFx0bGV0IGRlZmF1bHRDaGlsZEhlaWdodDogYW55O1xuXG5cdFx0aWYgKCF0aGlzLmVuYWJsZVVuZXF1YWxDaGlsZHJlblNpemVzKSB7XG5cdFx0XHRpZiAoY29udGVudC5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGlmICghdGhpcy5jaGlsZFdpZHRoIHx8ICF0aGlzLmNoaWxkSGVpZ2h0KSB7XG5cdFx0XHRcdFx0aWYgKCF0aGlzLm1pbk1lYXN1cmVkQ2hpbGRXaWR0aCAmJiB2aWV3V2lkdGggPiAwKSB7XG5cdFx0XHRcdFx0XHR0aGlzLm1pbk1lYXN1cmVkQ2hpbGRXaWR0aCA9IHZpZXdXaWR0aDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKCF0aGlzLm1pbk1lYXN1cmVkQ2hpbGRIZWlnaHQgJiYgdmlld0hlaWdodCA+IDApIHtcblx0XHRcdFx0XHRcdHRoaXMubWluTWVhc3VyZWRDaGlsZEhlaWdodCA9IHZpZXdIZWlnaHQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IGNoaWxkOiBhbnkgPSBjb250ZW50LmNoaWxkcmVuWzBdO1xuXHRcdFx0XHRsZXQgY2xpZW50UmVjdDogYW55ID0gY2hpbGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdFx0XHRcdHRoaXMubWluTWVhc3VyZWRDaGlsZFdpZHRoID0gTWF0aC5taW4odGhpcy5taW5NZWFzdXJlZENoaWxkV2lkdGgsIGNsaWVudFJlY3Qud2lkdGgpO1xuXHRcdFx0XHR0aGlzLm1pbk1lYXN1cmVkQ2hpbGRIZWlnaHQgPSBNYXRoLm1pbih0aGlzLm1pbk1lYXN1cmVkQ2hpbGRIZWlnaHQsIGNsaWVudFJlY3QuaGVpZ2h0KTtcblx0XHRcdH1cblxuXHRcdFx0ZGVmYXVsdENoaWxkV2lkdGggPSB0aGlzLmNoaWxkV2lkdGggfHwgdGhpcy5taW5NZWFzdXJlZENoaWxkV2lkdGggfHwgdmlld1dpZHRoO1xuXHRcdFx0ZGVmYXVsdENoaWxkSGVpZ2h0ID0gdGhpcy5jaGlsZEhlaWdodCB8fCB0aGlzLm1pbk1lYXN1cmVkQ2hpbGRIZWlnaHQgfHwgdmlld0hlaWdodDtcblx0XHRcdGxldCBpdGVtc1BlclJvdzogYW55ID0gTWF0aC5tYXgoTWF0aC5jZWlsKHZpZXdXaWR0aCAvIGRlZmF1bHRDaGlsZFdpZHRoKSwgMSk7XG5cdFx0XHRsZXQgaXRlbXNQZXJDb2w6IGFueSA9IE1hdGgubWF4KE1hdGguY2VpbCh2aWV3SGVpZ2h0IC8gZGVmYXVsdENoaWxkSGVpZ2h0KSwgMSk7XG5cdFx0XHR3cmFwR3JvdXBzUGVyUGFnZSA9IHRoaXMuaG9yaXpvbnRhbCA/IGl0ZW1zUGVyUm93IDogaXRlbXNQZXJDb2w7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxldCBzY3JvbGxPZmZzZXQ6IGFueSA9IHNjcm9sbEVsZW1lbnRbdGhpcy5fc2Nyb2xsVHlwZV0gLSAodGhpcy5wcmV2aW91c1ZpZXdQb3J0ID8gdGhpcy5wcmV2aW91c1ZpZXdQb3J0LnBhZGRpbmcgOiAwKTtcblx0XHRcdFxuXHRcdFx0bGV0IGFycmF5U3RhcnRJbmRleDogYW55ID0gdGhpcy5wcmV2aW91c1ZpZXdQb3J0LnN0YXJ0SW5kZXhXaXRoQnVmZmVyIHx8IDA7XG5cdFx0XHRsZXQgd3JhcEdyb3VwSW5kZXg6IGFueSA9IE1hdGguY2VpbChhcnJheVN0YXJ0SW5kZXggLyBpdGVtc1BlcldyYXBHcm91cCk7XG5cblx0XHRcdGxldCBtYXhXaWR0aEZvcldyYXBHcm91cDogYW55ID0gMDtcblx0XHRcdGxldCBtYXhIZWlnaHRGb3JXcmFwR3JvdXA6IGFueSA9IDA7XG5cdFx0XHRsZXQgc3VtT2ZWaXNpYmxlTWF4V2lkdGhzOiBhbnkgPSAwO1xuXHRcdFx0bGV0IHN1bU9mVmlzaWJsZU1heEhlaWdodHM6IGFueSA9IDA7XG5cdFx0XHR3cmFwR3JvdXBzUGVyUGFnZSA9IDA7XG5cblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgY29udGVudC5jaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuXHRcdFx0XHQrK2FycmF5U3RhcnRJbmRleDtcblx0XHRcdFx0bGV0IGNoaWxkOiBhbnkgPSBjb250ZW50LmNoaWxkcmVuW2ldO1xuXHRcdFx0XHRsZXQgY2xpZW50UmVjdDogYW55ID0gY2hpbGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cblx0XHRcdFx0bWF4V2lkdGhGb3JXcmFwR3JvdXAgPSBNYXRoLm1heChtYXhXaWR0aEZvcldyYXBHcm91cCwgY2xpZW50UmVjdC53aWR0aCk7XG5cdFx0XHRcdG1heEhlaWdodEZvcldyYXBHcm91cCA9IE1hdGgubWF4KG1heEhlaWdodEZvcldyYXBHcm91cCwgY2xpZW50UmVjdC5oZWlnaHQpO1xuXG5cdFx0XHRcdGlmIChhcnJheVN0YXJ0SW5kZXggJSBpdGVtc1BlcldyYXBHcm91cCA9PT0gMCkge1xuXHRcdFx0XHRcdGxldCBvbGRWYWx1ZTogYW55ID0gdGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLm1heENoaWxkU2l6ZVBlcldyYXBHcm91cFt3cmFwR3JvdXBJbmRleF07XG5cdFx0XHRcdFx0aWYgKG9sZFZhbHVlKSB7XG5cdFx0XHRcdFx0XHQtLXRoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5udW1iZXJPZktub3duV3JhcEdyb3VwQ2hpbGRTaXplcztcblx0XHRcdFx0XHRcdHRoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5zdW1PZktub3duV3JhcEdyb3VwQ2hpbGRXaWR0aHMgLT0gb2xkVmFsdWUuY2hpbGRXaWR0aCB8fCAwO1xuXHRcdFx0XHRcdFx0dGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLnN1bU9mS25vd25XcmFwR3JvdXBDaGlsZEhlaWdodHMgLT0gb2xkVmFsdWUuY2hpbGRIZWlnaHQgfHwgMDtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQrK3RoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5udW1iZXJPZktub3duV3JhcEdyb3VwQ2hpbGRTaXplcztcblx0XHRcdFx0XHRjb25zdCBpdGVtcyA9IHRoaXMuaXRlbXMuc2xpY2UoYXJyYXlTdGFydEluZGV4IC0gaXRlbXNQZXJXcmFwR3JvdXAsIGFycmF5U3RhcnRJbmRleCk7XG5cdFx0XHRcdFx0dGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLm1heENoaWxkU2l6ZVBlcldyYXBHcm91cFt3cmFwR3JvdXBJbmRleF0gPSB7XG5cdFx0XHRcdFx0XHRjaGlsZFdpZHRoOiBtYXhXaWR0aEZvcldyYXBHcm91cCxcblx0XHRcdFx0XHRcdGNoaWxkSGVpZ2h0OiBtYXhIZWlnaHRGb3JXcmFwR3JvdXAsXG5cdFx0XHRcdFx0XHRpdGVtczogaXRlbXNcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdHRoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5zdW1PZktub3duV3JhcEdyb3VwQ2hpbGRXaWR0aHMgKz0gbWF4V2lkdGhGb3JXcmFwR3JvdXA7XG5cdFx0XHRcdFx0dGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLnN1bU9mS25vd25XcmFwR3JvdXBDaGlsZEhlaWdodHMgKz0gbWF4SGVpZ2h0Rm9yV3JhcEdyb3VwO1xuXG5cdFx0XHRcdFx0aWYgKHRoaXMuaG9yaXpvbnRhbCkge1xuXHRcdFx0XHRcdFx0bGV0IG1heFZpc2libGVXaWR0aEZvcldyYXBHcm91cDogYW55ID0gTWF0aC5taW4obWF4V2lkdGhGb3JXcmFwR3JvdXAsIE1hdGgubWF4KHZpZXdXaWR0aCAtIHN1bU9mVmlzaWJsZU1heFdpZHRocywgMCkpO1xuXHRcdFx0XHRcdFx0aWYgKHNjcm9sbE9mZnNldCA+IDApIHtcblx0XHRcdFx0XHRcdFx0bGV0IHNjcm9sbE9mZnNldFRvUmVtb3ZlOiBhbnkgPSBNYXRoLm1pbihzY3JvbGxPZmZzZXQsIG1heFZpc2libGVXaWR0aEZvcldyYXBHcm91cCk7XG5cdFx0XHRcdFx0XHRcdG1heFZpc2libGVXaWR0aEZvcldyYXBHcm91cCAtPSBzY3JvbGxPZmZzZXRUb1JlbW92ZTtcblx0XHRcdFx0XHRcdFx0c2Nyb2xsT2Zmc2V0IC09IHNjcm9sbE9mZnNldFRvUmVtb3ZlO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRzdW1PZlZpc2libGVNYXhXaWR0aHMgKz0gbWF4VmlzaWJsZVdpZHRoRm9yV3JhcEdyb3VwO1xuXHRcdFx0XHRcdFx0aWYgKG1heFZpc2libGVXaWR0aEZvcldyYXBHcm91cCA+IDAgJiYgdmlld1dpZHRoID49IHN1bU9mVmlzaWJsZU1heFdpZHRocykge1xuXHRcdFx0XHRcdFx0XHQrK3dyYXBHcm91cHNQZXJQYWdlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRsZXQgbWF4VmlzaWJsZUhlaWdodEZvcldyYXBHcm91cDogYW55ID0gTWF0aC5taW4obWF4SGVpZ2h0Rm9yV3JhcEdyb3VwLCBNYXRoLm1heCh2aWV3SGVpZ2h0IC0gc3VtT2ZWaXNpYmxlTWF4SGVpZ2h0cywgMCkpO1xuXHRcdFx0XHRcdFx0aWYgKHNjcm9sbE9mZnNldCA+IDApIHtcblx0XHRcdFx0XHRcdFx0bGV0IHNjcm9sbE9mZnNldFRvUmVtb3ZlOiBhbnkgPSBNYXRoLm1pbihzY3JvbGxPZmZzZXQsIG1heFZpc2libGVIZWlnaHRGb3JXcmFwR3JvdXApO1xuXHRcdFx0XHRcdFx0XHRtYXhWaXNpYmxlSGVpZ2h0Rm9yV3JhcEdyb3VwIC09IHNjcm9sbE9mZnNldFRvUmVtb3ZlO1xuXHRcdFx0XHRcdFx0XHRzY3JvbGxPZmZzZXQgLT0gc2Nyb2xsT2Zmc2V0VG9SZW1vdmU7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHN1bU9mVmlzaWJsZU1heEhlaWdodHMgKz0gbWF4VmlzaWJsZUhlaWdodEZvcldyYXBHcm91cDtcblx0XHRcdFx0XHRcdGlmIChtYXhWaXNpYmxlSGVpZ2h0Rm9yV3JhcEdyb3VwID4gMCAmJiB2aWV3SGVpZ2h0ID49IHN1bU9mVmlzaWJsZU1heEhlaWdodHMpIHtcblx0XHRcdFx0XHRcdFx0Kyt3cmFwR3JvdXBzUGVyUGFnZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQrK3dyYXBHcm91cEluZGV4O1xuXG5cdFx0XHRcdFx0bWF4V2lkdGhGb3JXcmFwR3JvdXAgPSAwO1xuXHRcdFx0XHRcdG1heEhlaWdodEZvcldyYXBHcm91cCA9IDA7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0bGV0IGF2ZXJhZ2VDaGlsZFdpZHRoOiBhbnkgPSB0aGlzLndyYXBHcm91cERpbWVuc2lvbnMuc3VtT2ZLbm93bldyYXBHcm91cENoaWxkV2lkdGhzIC8gdGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLm51bWJlck9mS25vd25XcmFwR3JvdXBDaGlsZFNpemVzO1xuXHRcdFx0bGV0IGF2ZXJhZ2VDaGlsZEhlaWdodDogYW55ID0gdGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLnN1bU9mS25vd25XcmFwR3JvdXBDaGlsZEhlaWdodHMgLyB0aGlzLndyYXBHcm91cERpbWVuc2lvbnMubnVtYmVyT2ZLbm93bldyYXBHcm91cENoaWxkU2l6ZXM7XG5cdFx0XHRkZWZhdWx0Q2hpbGRXaWR0aCA9IHRoaXMuY2hpbGRXaWR0aCB8fCBhdmVyYWdlQ2hpbGRXaWR0aCB8fCB2aWV3V2lkdGg7XG5cdFx0XHRkZWZhdWx0Q2hpbGRIZWlnaHQgPSB0aGlzLmNoaWxkSGVpZ2h0IHx8IGF2ZXJhZ2VDaGlsZEhlaWdodCB8fCB2aWV3SGVpZ2h0O1xuXG5cdFx0XHRpZiAodGhpcy5ob3Jpem9udGFsKSB7XG5cdFx0XHRcdGlmICh2aWV3V2lkdGggPiBzdW1PZlZpc2libGVNYXhXaWR0aHMpIHtcblx0XHRcdFx0XHR3cmFwR3JvdXBzUGVyUGFnZSArPSBNYXRoLmNlaWwoKHZpZXdXaWR0aCAtIHN1bU9mVmlzaWJsZU1heFdpZHRocykgLyBkZWZhdWx0Q2hpbGRXaWR0aCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmICh2aWV3SGVpZ2h0ID4gc3VtT2ZWaXNpYmxlTWF4SGVpZ2h0cykge1xuXHRcdFx0XHRcdHdyYXBHcm91cHNQZXJQYWdlICs9IE1hdGguY2VpbCgodmlld0hlaWdodCAtIHN1bU9mVmlzaWJsZU1heEhlaWdodHMpIC8gZGVmYXVsdENoaWxkSGVpZ2h0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGxldCBpdGVtc1BlclBhZ2U6IGFueSA9IGl0ZW1zUGVyV3JhcEdyb3VwICogd3JhcEdyb3Vwc1BlclBhZ2U7XG5cdFx0bGV0IHBhZ2VDb3VudF9mcmFjdGlvbmFsOiBhbnkgPSBpdGVtQ291bnQgLyBpdGVtc1BlclBhZ2U7XG5cdFx0bGV0IG51bWJlck9mV3JhcEdyb3VwczogYW55ID0gTWF0aC5jZWlsKGl0ZW1Db3VudCAvIGl0ZW1zUGVyV3JhcEdyb3VwKTtcblxuXHRcdGxldCBzY3JvbGxMZW5ndGg6IGFueSA9IDA7XG5cblx0XHRsZXQgZGVmYXVsdFNjcm9sbExlbmd0aFBlcldyYXBHcm91cDogYW55ID0gdGhpcy5ob3Jpem9udGFsID8gZGVmYXVsdENoaWxkV2lkdGggOiBkZWZhdWx0Q2hpbGRIZWlnaHQ7XG5cdFx0aWYgKHRoaXMuZW5hYmxlVW5lcXVhbENoaWxkcmVuU2l6ZXMpIHtcblx0XHRcdGxldCBudW1Vbmtub3duQ2hpbGRTaXplczphbnkgPSAwO1xuXHRcdFx0Zm9yIChsZXQgaTphbnkgPSAwOyBpIDwgbnVtYmVyT2ZXcmFwR3JvdXBzOyArK2kpIHtcblx0XHRcdFx0bGV0IGNoaWxkU2l6ZTogYW55ID0gdGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLm1heENoaWxkU2l6ZVBlcldyYXBHcm91cFtpXSAmJiB0aGlzLndyYXBHcm91cERpbWVuc2lvbnMubWF4Q2hpbGRTaXplUGVyV3JhcEdyb3VwW2ldW3RoaXMuX2NoaWxkU2Nyb2xsRGltXTtcblx0XHRcdFx0aWYgKGNoaWxkU2l6ZSkge1xuXHRcdFx0XHRcdHNjcm9sbExlbmd0aCArPSBjaGlsZFNpemU7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0KytudW1Vbmtub3duQ2hpbGRTaXplcztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRzY3JvbGxMZW5ndGggKz0gTWF0aC5yb3VuZChudW1Vbmtub3duQ2hpbGRTaXplcyAqIGRlZmF1bHRTY3JvbGxMZW5ndGhQZXJXcmFwR3JvdXApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzY3JvbGxMZW5ndGggPSBudW1iZXJPZldyYXBHcm91cHMgKiBkZWZhdWx0U2Nyb2xsTGVuZ3RoUGVyV3JhcEdyb3VwO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRpdGVtQ291bnQ6IGl0ZW1Db3VudCxcblx0XHRcdGl0ZW1zUGVyV3JhcEdyb3VwOiBpdGVtc1BlcldyYXBHcm91cCxcblx0XHRcdHdyYXBHcm91cHNQZXJQYWdlOiB3cmFwR3JvdXBzUGVyUGFnZSxcblx0XHRcdGl0ZW1zUGVyUGFnZTogaXRlbXNQZXJQYWdlLFxuXHRcdFx0cGFnZUNvdW50X2ZyYWN0aW9uYWw6IHBhZ2VDb3VudF9mcmFjdGlvbmFsLFxuXHRcdFx0Y2hpbGRXaWR0aDogZGVmYXVsdENoaWxkV2lkdGgsXG5cdFx0XHRjaGlsZEhlaWdodDogZGVmYXVsdENoaWxkSGVpZ2h0LFxuXHRcdFx0c2Nyb2xsTGVuZ3RoOiBzY3JvbGxMZW5ndGhcblx0XHR9O1xuXHR9XG5cblx0cHJvdGVjdGVkIGNhY2hlZFBhZ2VTaXplOiBudW1iZXIgPSAwO1xuXHRwcm90ZWN0ZWQgcHJldmlvdXNTY3JvbGxOdW1iZXJFbGVtZW50czogbnVtYmVyID0gMDtcblxuXHRwcm90ZWN0ZWQgY2FsY3VsYXRlUGFkZGluZyhhcnJheVN0YXJ0SW5kZXhXaXRoQnVmZmVyOiBudW1iZXIsIGRpbWVuc2lvbnM6IGFueSwgYWxsb3dVbmVxdWFsQ2hpbGRyZW5TaXplc19FeHBlcmltZW50YWw6IGJvb2xlYW4pOiBudW1iZXIge1xuXHRcdGlmIChkaW1lbnNpb25zLml0ZW1Db3VudCA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIDA7XG5cdFx0fVxuXG5cdFx0bGV0IGRlZmF1bHRTY3JvbGxMZW5ndGhQZXJXcmFwR3JvdXA6IG51bWJlciA9IGRpbWVuc2lvbnNbdGhpcy5fY2hpbGRTY3JvbGxEaW1dO1xuXHRcdGxldCBzdGFydGluZ1dyYXBHcm91cEluZGV4OiBudW1iZXIgPSBNYXRoLmNlaWwoYXJyYXlTdGFydEluZGV4V2l0aEJ1ZmZlciAvIGRpbWVuc2lvbnMuaXRlbXNQZXJXcmFwR3JvdXApIHx8IDA7XG5cblx0XHRpZiAoIXRoaXMuZW5hYmxlVW5lcXVhbENoaWxkcmVuU2l6ZXMpIHtcblx0XHRcdHJldHVybiBkZWZhdWx0U2Nyb2xsTGVuZ3RoUGVyV3JhcEdyb3VwICogc3RhcnRpbmdXcmFwR3JvdXBJbmRleDtcblx0XHR9XG5cblx0XHRsZXQgbnVtVW5rbm93bkNoaWxkU2l6ZXM6IGFueSA9IDA7XG5cdFx0bGV0IHJlc3VsdDogYW55ID0gMDtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHN0YXJ0aW5nV3JhcEdyb3VwSW5kZXg7ICsraSkge1xuXHRcdFx0bGV0IGNoaWxkU2l6ZTogV3JhcEdyb3VwRGltZW5zaW9uID0gdGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLm1heENoaWxkU2l6ZVBlcldyYXBHcm91cFtpXSAmJiB0aGlzLndyYXBHcm91cERpbWVuc2lvbnMubWF4Q2hpbGRTaXplUGVyV3JhcEdyb3VwW2ldW3RoaXMuX2NoaWxkU2Nyb2xsRGltXTtcblx0XHRcdGlmIChjaGlsZFNpemUpIHtcblx0XHRcdFx0cmVzdWx0ICs9IGNoaWxkU2l6ZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCsrbnVtVW5rbm93bkNoaWxkU2l6ZXM7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJlc3VsdCArPSBNYXRoLnJvdW5kKG51bVVua25vd25DaGlsZFNpemVzICogZGVmYXVsdFNjcm9sbExlbmd0aFBlcldyYXBHcm91cCk7XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIGNhbGN1bGF0ZVBhZ2VJbmZvKHNjcm9sbFBvc2l0aW9uOiBudW1iZXIsIGRpbWVuc2lvbnM6IGFueSk6IElQYWdlSW5mb1dpdGhCdWZmZXIge1xuXHRcdGxldCBzY3JvbGxQZXJjZW50YWdlOiBhbnkgPSAwO1xuXHRcdGlmICh0aGlzLmVuYWJsZVVuZXF1YWxDaGlsZHJlblNpemVzKSB7XG5cdFx0XHRjb25zdCBudW1iZXJPZldyYXBHcm91cHM6YW55ID0gTWF0aC5jZWlsKGRpbWVuc2lvbnMuaXRlbUNvdW50IC8gZGltZW5zaW9ucy5pdGVtc1BlcldyYXBHcm91cCk7XG5cdFx0XHRsZXQgdG90YWxTY3JvbGxlZExlbmd0aDogYW55ID0gMDtcblx0XHRcdGxldCBkZWZhdWx0U2Nyb2xsTGVuZ3RoUGVyV3JhcEdyb3VwOiBhbnkgPSBkaW1lbnNpb25zW3RoaXMuX2NoaWxkU2Nyb2xsRGltXTtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZXcmFwR3JvdXBzOyArK2kpIHtcblx0XHRcdFx0bGV0IGNoaWxkU2l6ZTogYW55ID0gdGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLm1heENoaWxkU2l6ZVBlcldyYXBHcm91cFtpXSAmJiB0aGlzLndyYXBHcm91cERpbWVuc2lvbnMubWF4Q2hpbGRTaXplUGVyV3JhcEdyb3VwW2ldW3RoaXMuX2NoaWxkU2Nyb2xsRGltXTtcblx0XHRcdFx0aWYgKGNoaWxkU2l6ZSkge1xuXHRcdFx0XHRcdHRvdGFsU2Nyb2xsZWRMZW5ndGggKz0gY2hpbGRTaXplO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRvdGFsU2Nyb2xsZWRMZW5ndGggKz0gZGVmYXVsdFNjcm9sbExlbmd0aFBlcldyYXBHcm91cDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChzY3JvbGxQb3NpdGlvbiA8IHRvdGFsU2Nyb2xsZWRMZW5ndGgpIHtcblx0XHRcdFx0XHRzY3JvbGxQZXJjZW50YWdlID0gaSAvIG51bWJlck9mV3JhcEdyb3Vwcztcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRzY3JvbGxQZXJjZW50YWdlID0gc2Nyb2xsUG9zaXRpb24gLyBkaW1lbnNpb25zLnNjcm9sbExlbmd0aDtcblx0XHR9XG5cblx0XHRsZXQgc3RhcnRpbmdBcnJheUluZGV4X2ZyYWN0aW9uYWw6IGFueSA9IE1hdGgubWluKE1hdGgubWF4KHNjcm9sbFBlcmNlbnRhZ2UgKiBkaW1lbnNpb25zLnBhZ2VDb3VudF9mcmFjdGlvbmFsLCAwKSwgZGltZW5zaW9ucy5wYWdlQ291bnRfZnJhY3Rpb25hbCkgKiBkaW1lbnNpb25zLml0ZW1zUGVyUGFnZTtcblxuXHRcdGxldCBtYXhTdGFydDogYW55ID0gZGltZW5zaW9ucy5pdGVtQ291bnQgLSBkaW1lbnNpb25zLml0ZW1zUGVyUGFnZSAtIDE7XG5cdFx0bGV0IGFycmF5U3RhcnRJbmRleDogYW55ID0gTWF0aC5taW4oTWF0aC5mbG9vcihzdGFydGluZ0FycmF5SW5kZXhfZnJhY3Rpb25hbCksIG1heFN0YXJ0KTtcblx0XHRhcnJheVN0YXJ0SW5kZXggLT0gYXJyYXlTdGFydEluZGV4ICUgZGltZW5zaW9ucy5pdGVtc1BlcldyYXBHcm91cDsgLy8gcm91bmQgZG93biB0byBzdGFydCBvZiB3cmFwR3JvdXBcblxuXHRcdGxldCBhcnJheUVuZEluZGV4OiBhbnkgPSBNYXRoLmNlaWwoc3RhcnRpbmdBcnJheUluZGV4X2ZyYWN0aW9uYWwpICsgZGltZW5zaW9ucy5pdGVtc1BlclBhZ2UgLSAxO1xuXHRcdGFycmF5RW5kSW5kZXggKz0gKGRpbWVuc2lvbnMuaXRlbXNQZXJXcmFwR3JvdXAgLSAoKGFycmF5RW5kSW5kZXggKyAxKSAlIGRpbWVuc2lvbnMuaXRlbXNQZXJXcmFwR3JvdXApKTsgLy8gcm91bmQgdXAgdG8gZW5kIG9mIHdyYXBHcm91cFxuXG5cdFx0aWYgKGlzTmFOKGFycmF5U3RhcnRJbmRleCkpIHtcblx0XHRcdGFycmF5U3RhcnRJbmRleCA9IDA7XG5cdFx0fVxuXHRcdGlmIChpc05hTihhcnJheUVuZEluZGV4KSkge1xuXHRcdFx0YXJyYXlFbmRJbmRleCA9IDA7XG5cdFx0fVxuXG5cdFx0YXJyYXlTdGFydEluZGV4ID0gTWF0aC5taW4oTWF0aC5tYXgoYXJyYXlTdGFydEluZGV4LCAwKSwgZGltZW5zaW9ucy5pdGVtQ291bnQgLSAxKTtcblx0XHRhcnJheUVuZEluZGV4ID0gTWF0aC5taW4oTWF0aC5tYXgoYXJyYXlFbmRJbmRleCwgMCksIGRpbWVuc2lvbnMuaXRlbUNvdW50IC0gMSk7XG5cblx0XHRsZXQgYnVmZmVyU2l6ZTogYW55ID0gdGhpcy5idWZmZXJBbW91bnQgKiBkaW1lbnNpb25zLml0ZW1zUGVyV3JhcEdyb3VwO1xuXHRcdGxldCBzdGFydEluZGV4V2l0aEJ1ZmZlcjogYW55ID0gTWF0aC5taW4oTWF0aC5tYXgoYXJyYXlTdGFydEluZGV4IC0gYnVmZmVyU2l6ZSwgMCksIGRpbWVuc2lvbnMuaXRlbUNvdW50IC0gMSk7XG5cdFx0bGV0IGVuZEluZGV4V2l0aEJ1ZmZlcjogYW55ID0gTWF0aC5taW4oTWF0aC5tYXgoYXJyYXlFbmRJbmRleCArIGJ1ZmZlclNpemUsIDApLCBkaW1lbnNpb25zLml0ZW1Db3VudCAtIDEpO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHN0YXJ0SW5kZXg6IGFycmF5U3RhcnRJbmRleCxcblx0XHRcdGVuZEluZGV4OiBhcnJheUVuZEluZGV4LFxuXHRcdFx0c3RhcnRJbmRleFdpdGhCdWZmZXI6IHN0YXJ0SW5kZXhXaXRoQnVmZmVyLFxuXHRcdFx0ZW5kSW5kZXhXaXRoQnVmZmVyOiBlbmRJbmRleFdpdGhCdWZmZXJcblx0XHR9O1xuXHR9XG5cblx0cHJvdGVjdGVkIGNhbGN1bGF0ZVZpZXdwb3J0KCk6IElWaWV3cG9ydCB7XG5cdFx0bGV0IGRpbWVuc2lvbnM6IElEaW1lbnNpb25zID0gdGhpcy5jYWxjdWxhdGVEaW1lbnNpb25zKCk7XG5cdFx0bGV0IG9mZnNldDogYW55ID0gdGhpcy5nZXRFbGVtZW50c09mZnNldCgpO1xuXG5cdFx0bGV0IHNjcm9sbFBvc2l0aW9uOiBhbnkgPSB0aGlzLmdldFNjcm9sbFBvc2l0aW9uKCk7XG5cdFx0aWYgKHNjcm9sbFBvc2l0aW9uID4gZGltZW5zaW9ucy5zY3JvbGxMZW5ndGggJiYgISh0aGlzLnBhcmVudFNjcm9sbCBpbnN0YW5jZW9mIFdpbmRvdykpIHtcblx0XHRcdHNjcm9sbFBvc2l0aW9uID0gZGltZW5zaW9ucy5zY3JvbGxMZW5ndGg7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNjcm9sbFBvc2l0aW9uIC09IG9mZnNldDtcblx0XHR9XG5cdFx0c2Nyb2xsUG9zaXRpb24gPSBNYXRoLm1heCgwLCBzY3JvbGxQb3NpdGlvbik7XG5cblx0XHRsZXQgcGFnZUluZm86IGFueSA9IHRoaXMuY2FsY3VsYXRlUGFnZUluZm8oc2Nyb2xsUG9zaXRpb24sIGRpbWVuc2lvbnMpO1xuXHRcdGxldCBuZXdQYWRkaW5nOiBhbnkgPSB0aGlzLmNhbGN1bGF0ZVBhZGRpbmcocGFnZUluZm8uc3RhcnRJbmRleFdpdGhCdWZmZXIsIGRpbWVuc2lvbnMsIHRydWUpO1xuXHRcdGxldCBuZXdTY3JvbGxMZW5ndGg6IGFueSA9IGRpbWVuc2lvbnMuc2Nyb2xsTGVuZ3RoO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHN0YXJ0SW5kZXg6IHBhZ2VJbmZvLnN0YXJ0SW5kZXgsXG5cdFx0XHRlbmRJbmRleDogcGFnZUluZm8uZW5kSW5kZXgsXG5cdFx0XHRzdGFydEluZGV4V2l0aEJ1ZmZlcjogcGFnZUluZm8uc3RhcnRJbmRleFdpdGhCdWZmZXIsXG5cdFx0XHRlbmRJbmRleFdpdGhCdWZmZXI6IHBhZ2VJbmZvLmVuZEluZGV4V2l0aEJ1ZmZlcixcblx0XHRcdHBhZGRpbmc6IE1hdGgucm91bmQobmV3UGFkZGluZyksXG5cdFx0XHRzY3JvbGxMZW5ndGg6IE1hdGgucm91bmQobmV3U2Nyb2xsTGVuZ3RoKVxuXHRcdH07XG5cdH1cbn1cbiIsImltcG9ydCB7IENvbXBvbmVudCwgT25Jbml0LCBIb3N0TGlzdGVuZXIsIE9uRGVzdHJveSwgTmdNb2R1bGUsIFNpbXBsZUNoYW5nZXMsIE9uQ2hhbmdlcywgQ2hhbmdlRGV0ZWN0b3JSZWYsIEFmdGVyVmlld0NoZWNrZWQsIFZpZXdFbmNhcHN1bGF0aW9uLCBDb250ZW50Q2hpbGQsIFZpZXdDaGlsZCwgZm9yd2FyZFJlZiwgSW5wdXQsIE91dHB1dCwgRXZlbnRFbWl0dGVyLCBFbGVtZW50UmVmLCBBZnRlclZpZXdJbml0LCBQaXBlLCBQaXBlVHJhbnNmb3JtIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBGb3Jtc01vZHVsZSwgTkdfVkFMVUVfQUNDRVNTT1IsIENvbnRyb2xWYWx1ZUFjY2Vzc29yLCBOR19WQUxJREFUT1JTLCBWYWxpZGF0b3IsIEZvcm1Db250cm9sIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7IE15RXhjZXB0aW9uIH0gZnJvbSAnLi9tdWx0aXNlbGVjdC5tb2RlbCc7XG5pbXBvcnQgeyBEcm9wZG93blNldHRpbmdzIH0gZnJvbSAnLi9tdWx0aXNlbGVjdC5pbnRlcmZhY2UnO1xuaW1wb3J0IHsgQ2xpY2tPdXRzaWRlRGlyZWN0aXZlLCBTY3JvbGxEaXJlY3RpdmUsIHN0eWxlRGlyZWN0aXZlLCBzZXRQb3NpdGlvbiB9IGZyb20gJy4vY2xpY2tPdXRzaWRlJztcbmltcG9ydCB7IExpc3RGaWx0ZXJQaXBlIH0gZnJvbSAnLi9saXN0LWZpbHRlcic7XG5pbXBvcnQgeyBJdGVtLCBCYWRnZSwgU2VhcmNoLCBUZW1wbGF0ZVJlbmRlcmVyLCBDSWNvbiB9IGZyb20gJy4vbWVudS1pdGVtJztcbmltcG9ydCB7IERhdGFTZXJ2aWNlIH0gZnJvbSAnLi9tdWx0aXNlbGVjdC5zZXJ2aWNlJztcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgVmlydHVhbFNjcm9sbENvbXBvbmVudCwgQ2hhbmdlRXZlbnQgfSBmcm9tICcuL3ZpcnR1YWwtc2Nyb2xsJztcblxuZXhwb3J0IGNvbnN0IERST1BET1dOX0NPTlRST0xfVkFMVUVfQUNDRVNTT1I6IGFueSA9IHtcbiAgICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcbiAgICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBBbmd1bGFyTXVsdGlTZWxlY3QpLFxuICAgIG11bHRpOiB0cnVlXG59O1xuZXhwb3J0IGNvbnN0IERST1BET1dOX0NPTlRST0xfVkFMSURBVElPTjogYW55ID0ge1xuICAgIHByb3ZpZGU6IE5HX1ZBTElEQVRPUlMsXG4gICAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gQW5ndWxhck11bHRpU2VsZWN0KSxcbiAgICBtdWx0aTogdHJ1ZSxcbn1cbmNvbnN0IG5vb3AgPSAoKSA9PiB7XG59O1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2FuZ3VsYXIyLW11bHRpc2VsZWN0JyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vbXVsdGlzZWxlY3QuY29tcG9uZW50Lmh0bWwnLFxuICAgIGhvc3Q6IHsgJ1tjbGFzc10nOiAnZGVmYXVsdFNldHRpbmdzLmNsYXNzZXMnIH0sXG4gICAgc3R5bGVVcmxzOiBbJy4vbXVsdGlzZWxlY3QuY29tcG9uZW50LnNjc3MnXSxcbiAgICBwcm92aWRlcnM6IFtEUk9QRE9XTl9DT05UUk9MX1ZBTFVFX0FDQ0VTU09SLCBEUk9QRE9XTl9DT05UUk9MX1ZBTElEQVRJT05dLFxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG59KVxuXG5leHBvcnQgY2xhc3MgQW5ndWxhck11bHRpU2VsZWN0IGltcGxlbWVudHMgT25Jbml0LCBDb250cm9sVmFsdWVBY2Nlc3NvciwgT25DaGFuZ2VzLCBWYWxpZGF0b3IsIEFmdGVyVmlld0NoZWNrZWQsIE9uRGVzdHJveSB7XG5cbiAgICBASW5wdXQoKVxuICAgIGRhdGE6IEFycmF5PGFueT47XG5cbiAgICBASW5wdXQoKVxuICAgIHNldHRpbmdzOiBEcm9wZG93blNldHRpbmdzO1xuXG4gICAgQElucHV0KClcbiAgICBsb2FkaW5nOiBib29sZWFuO1xuXG4gICAgQE91dHB1dCgnb25TZWxlY3QnKVxuICAgIG9uU2VsZWN0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuXG4gICAgQE91dHB1dCgnb25EZVNlbGVjdCcpXG4gICAgb25EZVNlbGVjdDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcblxuICAgIEBPdXRwdXQoJ29uU2VsZWN0QWxsJylcbiAgICBvblNlbGVjdEFsbDogRXZlbnRFbWl0dGVyPEFycmF5PGFueT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxBcnJheTxhbnk+PigpO1xuXG4gICAgQE91dHB1dCgnb25EZVNlbGVjdEFsbCcpXG4gICAgb25EZVNlbGVjdEFsbDogRXZlbnRFbWl0dGVyPEFycmF5PGFueT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxBcnJheTxhbnk+PigpO1xuXG4gICAgQE91dHB1dCgnb25PcGVuJylcbiAgICBvbk9wZW46IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG5cbiAgICBAT3V0cHV0KCdvbkNsb3NlJylcbiAgICBvbkNsb3NlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuXG4gICAgQE91dHB1dCgnb25TY3JvbGxUb0VuZCcpXG4gICAgb25TY3JvbGxUb0VuZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcblxuICAgIEBPdXRwdXQoJ29uRmlsdGVyU2VsZWN0QWxsJylcbiAgICBvbkZpbHRlclNlbGVjdEFsbDogRXZlbnRFbWl0dGVyPEFycmF5PGFueT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxBcnJheTxhbnk+PigpO1xuXG4gICAgQE91dHB1dCgnb25GaWx0ZXJEZVNlbGVjdEFsbCcpXG4gICAgb25GaWx0ZXJEZVNlbGVjdEFsbDogRXZlbnRFbWl0dGVyPEFycmF5PGFueT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxBcnJheTxhbnk+PigpO1xuXG4gICAgQE91dHB1dCgnb25BZGRGaWx0ZXJOZXdJdGVtJylcbiAgICBvbkFkZEZpbHRlck5ld0l0ZW06IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG5cbiAgICBAQ29udGVudENoaWxkKEl0ZW0pIGl0ZW1UZW1wbDogSXRlbTtcbiAgICBAQ29udGVudENoaWxkKEJhZGdlKSBiYWRnZVRlbXBsOiBCYWRnZTtcbiAgICBAQ29udGVudENoaWxkKFNlYXJjaCkgc2VhcmNoVGVtcGw6IFNlYXJjaDtcblxuXG4gICAgQFZpZXdDaGlsZCgnc2VhcmNoSW5wdXQnKSBzZWFyY2hJbnB1dDogRWxlbWVudFJlZjtcbiAgICBAVmlld0NoaWxkKCdzZWxlY3RlZExpc3QnKSBzZWxlY3RlZExpc3RFbGVtOiBFbGVtZW50UmVmO1xuICAgIEBWaWV3Q2hpbGQoJ2Ryb3Bkb3duTGlzdCcpIGRyb3Bkb3duTGlzdEVsZW06IEVsZW1lbnRSZWY7XG5cbiAgICBASG9zdExpc3RlbmVyKCdkb2N1bWVudDprZXl1cC5lc2NhcGUnLCBbJyRldmVudCddKVxuICAgIG9uRXNjYXBlRG93bihldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5lc2NhcGVUb0Nsb3NlKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlRHJvcGRvd24oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZpbHRlclBpcGU6IExpc3RGaWx0ZXJQaXBlO1xuICAgIHB1YmxpYyBzZWxlY3RlZEl0ZW1zOiBBcnJheTxhbnk+O1xuICAgIHB1YmxpYyBpc0FjdGl2ZTogYm9vbGVhbiA9IGZhbHNlO1xuICAgIHB1YmxpYyBpc1NlbGVjdEFsbDogYm9vbGVhbiA9IGZhbHNlO1xuICAgIHB1YmxpYyBpc0ZpbHRlclNlbGVjdEFsbDogYm9vbGVhbiA9IGZhbHNlO1xuICAgIHB1YmxpYyBpc0luZmluaXRlRmlsdGVyU2VsZWN0QWxsOiBib29sZWFuID0gZmFsc2U7XG4gICAgcHVibGljIGdyb3VwZWREYXRhOiBBcnJheTxhbnk+O1xuICAgIGZpbHRlcjogYW55O1xuICAgIHB1YmxpYyBjaHVua0FycmF5OiBhbnlbXTtcbiAgICBwdWJsaWMgc2Nyb2xsVG9wOiBhbnk7XG4gICAgcHVibGljIGNodW5rSW5kZXg6IGFueVtdID0gW107XG4gICAgcHVibGljIGNhY2hlZEl0ZW1zOiBhbnlbXSA9IFtdO1xuICAgIHB1YmxpYyBncm91cENhY2hlZEl0ZW1zOiBhbnlbXSA9IFtdO1xuICAgIHB1YmxpYyB0b3RhbFJvd3M6IGFueTtcbiAgICBwdWJsaWMgaXRlbUhlaWdodDogYW55ID0gNDEuNjtcbiAgICBwdWJsaWMgc2NyZWVuSXRlbXNMZW46IGFueTtcbiAgICBwdWJsaWMgY2FjaGVkSXRlbXNMZW46IGFueTtcbiAgICBwdWJsaWMgdG90YWxIZWlnaHQ6IGFueTtcbiAgICBwdWJsaWMgc2Nyb2xsZXI6IGFueTtcbiAgICBwdWJsaWMgbWF4QnVmZmVyOiBhbnk7XG4gICAgcHVibGljIGxhc3RTY3JvbGxlZDogYW55O1xuICAgIHB1YmxpYyBsYXN0UmVwYWludFk6IGFueTtcbiAgICBwdWJsaWMgc2VsZWN0ZWRMaXN0SGVpZ2h0OiBhbnk7XG4gICAgcHVibGljIGZpbHRlckxlbmd0aDogYW55ID0gMDtcbiAgICBwdWJsaWMgaW5maW5pdGVGaWx0ZXJMZW5ndGg6IGFueSA9IDA7XG4gICAgcHVibGljIHZpZXdQb3J0SXRlbXM6IGFueTtcbiAgICBwdWJsaWMgaXRlbTogYW55O1xuICAgIHB1YmxpYyBkcm9wZG93bkxpc3RZT2Zmc2V0OiBudW1iZXIgPSAwO1xuICAgIHN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uO1xuICAgIGRlZmF1bHRTZXR0aW5nczogRHJvcGRvd25TZXR0aW5ncyA9IHtcbiAgICAgICAgc2luZ2xlU2VsZWN0aW9uOiBmYWxzZSxcbiAgICAgICAgdGV4dDogJ1NlbGVjdCcsXG4gICAgICAgIGVuYWJsZUNoZWNrQWxsOiB0cnVlLFxuICAgICAgICBzZWxlY3RBbGxUZXh0OiAnU2VsZWN0IEFsbCcsXG4gICAgICAgIHVuU2VsZWN0QWxsVGV4dDogJ1VuU2VsZWN0IEFsbCcsXG4gICAgICAgIGZpbHRlclNlbGVjdEFsbFRleHQ6ICdTZWxlY3QgYWxsIGZpbHRlcmVkIHJlc3VsdHMnLFxuICAgICAgICBmaWx0ZXJVblNlbGVjdEFsbFRleHQ6ICdVblNlbGVjdCBhbGwgZmlsdGVyZWQgcmVzdWx0cycsXG4gICAgICAgIGVuYWJsZVNlYXJjaEZpbHRlcjogZmFsc2UsXG4gICAgICAgIHNlYXJjaEJ5OiBbXSxcbiAgICAgICAgbWF4SGVpZ2h0OiAzMDAsXG4gICAgICAgIGJhZGdlU2hvd0xpbWl0OiA5OTk5OTk5OTk5OTksXG4gICAgICAgIGNsYXNzZXM6ICcnLFxuICAgICAgICBkaXNhYmxlZDogZmFsc2UsXG4gICAgICAgIHNlYXJjaFBsYWNlaG9sZGVyVGV4dDogJ1NlYXJjaCcsXG4gICAgICAgIHNob3dDaGVja2JveDogdHJ1ZSxcbiAgICAgICAgbm9EYXRhTGFiZWw6ICdObyBEYXRhIEF2YWlsYWJsZScsXG4gICAgICAgIHNlYXJjaEF1dG9mb2N1czogdHJ1ZSxcbiAgICAgICAgbGF6eUxvYWRpbmc6IGZhbHNlLFxuICAgICAgICBsYWJlbEtleTogJ2l0ZW1OYW1lJyxcbiAgICAgICAgcHJpbWFyeUtleTogJ2lkJyxcbiAgICAgICAgcG9zaXRpb246ICdib3R0b20nLFxuICAgICAgICBhdXRvUG9zaXRpb246IHRydWUsXG4gICAgICAgIGVuYWJsZUZpbHRlclNlbGVjdEFsbDogdHJ1ZSxcbiAgICAgICAgc2VsZWN0R3JvdXA6IGZhbHNlLFxuICAgICAgICBhZGROZXdJdGVtT25GaWx0ZXI6IGZhbHNlLFxuICAgICAgICBhZGROZXdCdXR0b25UZXh0OiBcIkFkZFwiLFxuICAgICAgICBlc2NhcGVUb0Nsb3NlOiB0cnVlXG4gICAgfVxuICAgIHB1YmxpYyBwYXJzZUVycm9yOiBib29sZWFuO1xuICAgIHB1YmxpYyBmaWx0ZXJlZExpc3Q6IGFueSA9IFtdO1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBfZWxlbWVudFJlZjogRWxlbWVudFJlZiwgcHJpdmF0ZSBjZHI6IENoYW5nZURldGVjdG9yUmVmLCBwcml2YXRlIGRzOiBEYXRhU2VydmljZSkge1xuXG4gICAgfVxuICAgIG5nT25Jbml0KCkge1xuICAgICAgICB0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih0aGlzLmRlZmF1bHRTZXR0aW5ncywgdGhpcy5zZXR0aW5ncyk7XG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmdyb3VwQnkpIHtcbiAgICAgICAgICAgIHRoaXMuZ3JvdXBlZERhdGEgPSB0aGlzLnRyYW5zZm9ybURhdGEodGhpcy5kYXRhLCB0aGlzLnNldHRpbmdzLmdyb3VwQnkpO1xuICAgICAgICAgICAgdGhpcy5ncm91cENhY2hlZEl0ZW1zID0gdGhpcy5jbG9uZUFycmF5KHRoaXMuZ3JvdXBlZERhdGEpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2FjaGVkSXRlbXMgPSB0aGlzLmNsb25lQXJyYXkodGhpcy5kYXRhKTtcbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MucG9zaXRpb24gPT0gJ3RvcCcpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRMaXN0SGVpZ2h0ID0geyB2YWw6IDAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkTGlzdEhlaWdodC52YWwgPSB0aGlzLnNlbGVjdGVkTGlzdEVsZW0ubmF0aXZlRWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbiA9IHRoaXMuZHMuZ2V0RGF0YSgpLnN1YnNjcmliZShkYXRhID0+IHtcbiAgICAgICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxlbiA9IDA7XG4gICAgICAgICAgICAgICAgZGF0YS5mb3JFYWNoKChvYmo6IGFueSwgaTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghb2JqLmhhc093blByb3BlcnR5KCdncnBUaXRsZScpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZW4rKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuZmlsdGVyTGVuZ3RoID0gbGVuO1xuICAgICAgICAgICAgICAgIHRoaXMub25GaWx0ZXJDaGFuZ2UoZGF0YSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGVEcm9wZG93bkRpcmVjdGlvbigpO1xuICAgICAgICB9KTtcblxuICAgIH1cbiAgICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgICAgIGlmIChjaGFuZ2VzLmRhdGEgJiYgIWNoYW5nZXMuZGF0YS5maXJzdENoYW5nZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuZ3JvdXBCeSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXBlZERhdGEgPSB0aGlzLnRyYW5zZm9ybURhdGEodGhpcy5kYXRhLCB0aGlzLnNldHRpbmdzLmdyb3VwQnkpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRhdGEubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zID0gW107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jYWNoZWRJdGVtcyA9IHRoaXMuY2xvbmVBcnJheSh0aGlzLmRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGFuZ2VzLnNldHRpbmdzICYmICFjaGFuZ2VzLnNldHRpbmdzLmZpcnN0Q2hhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih0aGlzLmRlZmF1bHRTZXR0aW5ncywgdGhpcy5zZXR0aW5ncyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoYW5nZXMubG9hZGluZykge1xuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5sb2FkaW5nKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBuZ0RvQ2hlY2soKSB7XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkSXRlbXMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkSXRlbXMubGVuZ3RoID09IDAgfHwgdGhpcy5kYXRhLmxlbmd0aCA9PSAwIHx8IHRoaXMuc2VsZWN0ZWRJdGVtcy5sZW5ndGggPCB0aGlzLmRhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc1NlbGVjdEFsbCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MubGF6eUxvYWRpbmcpIHtcbiAgICAgICAgICAgIC8vIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwibGF6eUNvbnRhaW5lclwiKVswXS5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB0aGlzLm9uU2Nyb2xsLmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgfVxuICAgIG5nQWZ0ZXJWaWV3Q2hlY2tlZCgpIHtcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRMaXN0RWxlbS5uYXRpdmVFbGVtZW50LmNsaWVudEhlaWdodCAmJiB0aGlzLnNldHRpbmdzLnBvc2l0aW9uID09ICd0b3AnICYmIHRoaXMuc2VsZWN0ZWRMaXN0SGVpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkTGlzdEhlaWdodC52YWwgPSB0aGlzLnNlbGVjdGVkTGlzdEVsZW0ubmF0aXZlRWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICAgICAgICB0aGlzLmNkci5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgb25JdGVtQ2xpY2soaXRlbTogYW55LCBpbmRleDogbnVtYmVyLCBldnQ6IEV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmRpc2FibGVkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZm91bmQgPSB0aGlzLmlzU2VsZWN0ZWQoaXRlbSk7XG4gICAgICAgIGxldCBsaW1pdCA9IHRoaXMuc2VsZWN0ZWRJdGVtcy5sZW5ndGggPCB0aGlzLnNldHRpbmdzLmxpbWl0U2VsZWN0aW9uID8gdHJ1ZSA6IGZhbHNlO1xuXG4gICAgICAgIGlmICghZm91bmQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmxpbWl0U2VsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxpbWl0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkU2VsZWN0ZWQoaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25TZWxlY3QuZW1pdChpdGVtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZFNlbGVjdGVkKGl0ZW0pO1xuICAgICAgICAgICAgICAgIHRoaXMub25TZWxlY3QuZW1pdChpdGVtKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVTZWxlY3RlZChpdGVtKTtcbiAgICAgICAgICAgIHRoaXMub25EZVNlbGVjdC5lbWl0KGl0ZW0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmlzU2VsZWN0QWxsIHx8IHRoaXMuZGF0YS5sZW5ndGggPiB0aGlzLnNlbGVjdGVkSXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLmlzU2VsZWN0QWxsID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuZGF0YS5sZW5ndGggPT0gdGhpcy5zZWxlY3RlZEl0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5pc1NlbGVjdEFsbCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuZ3JvdXBCeSkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVHcm91cEluZm8oaXRlbSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIHZhbGlkYXRlKGM6IEZvcm1Db250cm9sKTogYW55IHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHByaXZhdGUgb25Ub3VjaGVkQ2FsbGJhY2s6IChfOiBhbnkpID0+IHZvaWQgPSBub29wO1xuICAgIHByaXZhdGUgb25DaGFuZ2VDYWxsYmFjazogKF86IGFueSkgPT4gdm9pZCA9IG5vb3A7XG5cbiAgICB3cml0ZVZhbHVlKHZhbHVlOiBhbnkpIHtcbiAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09ICcnKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5zaW5nbGVTZWxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbXMgPSBbdmFsdWVbMF1dO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IE15RXhjZXB0aW9uKDQwNCwgeyBcIm1zZ1wiOiBcIlNpbmdsZSBTZWxlY3Rpb24gTW9kZSwgU2VsZWN0ZWQgSXRlbXMgY2Fubm90IGhhdmUgbW9yZSB0aGFuIG9uZSBpdGVtLlwiIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlLmJvZHkubXNnKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmxpbWl0U2VsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtcyA9IHZhbHVlLnNsaWNlKDAsIHRoaXMuc2V0dGluZ3MubGltaXRTZWxlY3Rpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkSXRlbXMubGVuZ3RoID09PSB0aGlzLmRhdGEubGVuZ3RoICYmIHRoaXMuZGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNTZWxlY3RBbGwgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtcyA9IFtdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy9Gcm9tIENvbnRyb2xWYWx1ZUFjY2Vzc29yIGludGVyZmFjZVxuICAgIHJlZ2lzdGVyT25DaGFuZ2UoZm46IGFueSkge1xuICAgICAgICB0aGlzLm9uQ2hhbmdlQ2FsbGJhY2sgPSBmbjtcbiAgICB9XG5cbiAgICAvL0Zyb20gQ29udHJvbFZhbHVlQWNjZXNzb3IgaW50ZXJmYWNlXG4gICAgcmVnaXN0ZXJPblRvdWNoZWQoZm46IGFueSkge1xuICAgICAgICB0aGlzLm9uVG91Y2hlZENhbGxiYWNrID0gZm47XG4gICAgfVxuICAgIHRyYWNrQnlGbihpbmRleDogbnVtYmVyLCBpdGVtOiBhbnkpIHtcbiAgICAgICAgcmV0dXJuIGl0ZW1bdGhpcy5zZXR0aW5ncy5wcmltYXJ5S2V5XTtcbiAgICB9XG4gICAgaXNTZWxlY3RlZChjbGlja2VkSXRlbTogYW55KSB7XG4gICAgICAgIGxldCBmb3VuZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbXMgJiYgdGhpcy5zZWxlY3RlZEl0ZW1zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgICBpZiAoY2xpY2tlZEl0ZW1bdGhpcy5zZXR0aW5ncy5wcmltYXJ5S2V5XSA9PT0gaXRlbVt0aGlzLnNldHRpbmdzLnByaW1hcnlLZXldKSB7XG4gICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGZvdW5kO1xuICAgIH1cbiAgICBhZGRTZWxlY3RlZChpdGVtOiBhbnkpIHtcbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3Muc2luZ2xlU2VsZWN0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbXMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtcy5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgdGhpcy5jbG9zZURyb3Bkb3duKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zLnB1c2goaXRlbSk7XG4gICAgICAgIHRoaXMub25DaGFuZ2VDYWxsYmFjayh0aGlzLnNlbGVjdGVkSXRlbXMpO1xuICAgICAgICB0aGlzLm9uVG91Y2hlZENhbGxiYWNrKHRoaXMuc2VsZWN0ZWRJdGVtcyk7XG4gICAgfVxuICAgIHJlbW92ZVNlbGVjdGVkKGNsaWNrZWRJdGVtOiBhbnkpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zICYmIHRoaXMuc2VsZWN0ZWRJdGVtcy5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgICAgaWYgKGNsaWNrZWRJdGVtW3RoaXMuc2V0dGluZ3MucHJpbWFyeUtleV0gPT09IGl0ZW1bdGhpcy5zZXR0aW5ncy5wcmltYXJ5S2V5XSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtcy5zcGxpY2UodGhpcy5zZWxlY3RlZEl0ZW1zLmluZGV4T2YoaXRlbSksIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5vbkNoYW5nZUNhbGxiYWNrKHRoaXMuc2VsZWN0ZWRJdGVtcyk7XG4gICAgICAgIHRoaXMub25Ub3VjaGVkQ2FsbGJhY2sodGhpcy5zZWxlY3RlZEl0ZW1zKTtcbiAgICB9XG4gICAgdG9nZ2xlRHJvcGRvd24oZXZ0OiBhbnkpIHtcbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuZGlzYWJsZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmlzQWN0aXZlID0gIXRoaXMuaXNBY3RpdmU7XG4gICAgICAgIGlmICh0aGlzLmlzQWN0aXZlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5zZWFyY2hBdXRvZm9jdXMgJiYgdGhpcy5zZWFyY2hJbnB1dCAmJiB0aGlzLnNldHRpbmdzLmVuYWJsZVNlYXJjaEZpbHRlciAmJiAhdGhpcy5zZWFyY2hUZW1wbCkge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlYXJjaElucHV0Lm5hdGl2ZUVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMub25PcGVuLmVtaXQodHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm9uQ2xvc2UuZW1pdChmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNhbGN1bGF0ZURyb3Bkb3duRGlyZWN0aW9uKCk7XG4gICAgICAgIH0sIDApO1xuXG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgICBwdWJsaWMgb3BlbkRyb3Bkb3duKCkge1xuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5kaXNhYmxlZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaXNBY3RpdmUgPSB0cnVlO1xuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5zZWFyY2hBdXRvZm9jdXMgJiYgdGhpcy5zZWFyY2hJbnB1dCAmJiB0aGlzLnNldHRpbmdzLmVuYWJsZVNlYXJjaEZpbHRlciAmJiAhdGhpcy5zZWFyY2hUZW1wbCkge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWFyY2hJbnB1dC5uYXRpdmVFbGVtZW50LmZvY3VzKCk7XG4gICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9uT3Blbi5lbWl0KHRydWUpO1xuICAgIH1cbiAgICBwdWJsaWMgY2xvc2VEcm9wZG93bigpIHtcbiAgICAgICAgaWYgKHRoaXMuc2VhcmNoSW5wdXQgJiYgdGhpcy5zZXR0aW5ncy5sYXp5TG9hZGluZykge1xuICAgICAgICAgICAgdGhpcy5zZWFyY2hJbnB1dC5uYXRpdmVFbGVtZW50LnZhbHVlID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5zZWFyY2hJbnB1dCkge1xuICAgICAgICAgICAgdGhpcy5zZWFyY2hJbnB1dC5uYXRpdmVFbGVtZW50LnZhbHVlID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZpbHRlciA9IFwiXCI7XG4gICAgICAgIHRoaXMuaXNBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5vbkNsb3NlLmVtaXQoZmFsc2UpO1xuICAgIH1cbiAgICBwdWJsaWMgY2xvc2VEcm9wZG93bk9uQ2xpY2tPdXQoKSB7XG4gICAgICAgIGlmICh0aGlzLnNlYXJjaElucHV0ICYmIHRoaXMuc2V0dGluZ3MubGF6eUxvYWRpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoSW5wdXQubmF0aXZlRWxlbWVudC52YWx1ZSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc2VhcmNoSW5wdXQpIHtcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoSW5wdXQubmF0aXZlRWxlbWVudC52YWx1ZSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5maWx0ZXIgPSBcIlwiO1xuICAgICAgICB0aGlzLmlzQWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHRoaXMub25DbG9zZS5lbWl0KGZhbHNlKTtcbiAgICB9XG4gICAgdG9nZ2xlU2VsZWN0QWxsKCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNTZWxlY3RBbGwpIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtcyA9IFtdO1xuICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuZ3JvdXBCeSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXBlZERhdGEuZm9yRWFjaCgob2JqKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3VwQ2FjaGVkSXRlbXMuZm9yRWFjaCgob2JqKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtcyA9IHRoaXMuZGF0YS5zbGljZSgpO1xuICAgICAgICAgICAgdGhpcy5pc1NlbGVjdEFsbCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLm9uQ2hhbmdlQ2FsbGJhY2sodGhpcy5zZWxlY3RlZEl0ZW1zKTtcbiAgICAgICAgICAgIHRoaXMub25Ub3VjaGVkQ2FsbGJhY2sodGhpcy5zZWxlY3RlZEl0ZW1zKTtcblxuICAgICAgICAgICAgdGhpcy5vblNlbGVjdEFsbC5lbWl0KHRoaXMuc2VsZWN0ZWRJdGVtcyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5ncm91cEJ5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ncm91cGVkRGF0YS5mb3JFYWNoKChvYmopID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb2JqLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5ncm91cENhY2hlZEl0ZW1zLmZvckVhY2goKG9iaikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBvYmouc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zID0gW107XG4gICAgICAgICAgICB0aGlzLmlzU2VsZWN0QWxsID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLm9uQ2hhbmdlQ2FsbGJhY2sodGhpcy5zZWxlY3RlZEl0ZW1zKTtcbiAgICAgICAgICAgIHRoaXMub25Ub3VjaGVkQ2FsbGJhY2sodGhpcy5zZWxlY3RlZEl0ZW1zKTtcblxuICAgICAgICAgICAgdGhpcy5vbkRlU2VsZWN0QWxsLmVtaXQodGhpcy5zZWxlY3RlZEl0ZW1zKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmaWx0ZXJHcm91cGVkTGlzdCgpIHtcbiAgICAgICAgaWYgKHRoaXMuZmlsdGVyID09IFwiXCIgfHwgdGhpcy5maWx0ZXIgPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5jbGVhclNlYXJjaCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ3JvdXBlZERhdGEgPSB0aGlzLmNsb25lQXJyYXkodGhpcy5ncm91cENhY2hlZEl0ZW1zKTtcbiAgICAgICAgdGhpcy5ncm91cGVkRGF0YSA9IHRoaXMuZ3JvdXBlZERhdGEuZmlsdGVyKG9iaiA9PiB7XG4gICAgICAgICAgICB2YXIgYXJyID0gb2JqLmxpc3QuZmlsdGVyKHQgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB0Lml0ZW1OYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZih0aGlzLmZpbHRlci50b0xvd2VyQ2FzZSgpKSA+IC0xO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBvYmoubGlzdCA9IGFycjtcbiAgICAgICAgICAgIHJldHVybiBhcnIuc29tZShjYXQgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYXQuaXRlbU5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHRoaXMuZmlsdGVyLnRvTG93ZXJDYXNlKCkpID4gLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICApXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmdyb3VwZWREYXRhKTtcbiAgICB9XG4gICAgdG9nZ2xlRmlsdGVyU2VsZWN0QWxsKCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNGaWx0ZXJTZWxlY3RBbGwpIHtcbiAgICAgICAgICAgIGxldCBhZGRlZCA9IFtdO1xuICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuZ3JvdXBCeSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXBlZERhdGEuZm9yRWFjaCgoaXRlbTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ubGlzdC5mb3JFYWNoKChlbDogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmlzU2VsZWN0ZWQoZWwpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkU2VsZWN0ZWQoZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRlZC5wdXNoKGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUdyb3VwSW5mbyhpdGVtKTtcblxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kcy5nZXRGaWx0ZXJlZERhdGEoKS5mb3JFYWNoKChpdGVtOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmlzU2VsZWN0ZWQoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkU2VsZWN0ZWQoaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRlZC5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5pc0ZpbHRlclNlbGVjdEFsbCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLm9uRmlsdGVyU2VsZWN0QWxsLmVtaXQoYWRkZWQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV0IHJlbW92ZWQgPSBbXTtcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmdyb3VwQnkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3VwZWREYXRhLmZvckVhY2goKGl0ZW06IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5saXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmxpc3QuZm9yRWFjaCgoZWw6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzU2VsZWN0ZWQoZWwpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlU2VsZWN0ZWQoZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVkLnB1c2goZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRzLmdldEZpbHRlcmVkRGF0YSgpLmZvckVhY2goKGl0ZW06IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pc1NlbGVjdGVkKGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZVNlbGVjdGVkKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlZC5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuaXNGaWx0ZXJTZWxlY3RBbGwgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMub25GaWx0ZXJEZVNlbGVjdEFsbC5lbWl0KHJlbW92ZWQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRvZ2dsZUluZmluaXRlRmlsdGVyU2VsZWN0QWxsKCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNJbmZpbml0ZUZpbHRlclNlbGVjdEFsbCkge1xuICAgICAgICAgICAgdGhpcy5kYXRhLmZvckVhY2goKGl0ZW06IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5pc1NlbGVjdGVkKGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkU2VsZWN0ZWQoaXRlbSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuaXNJbmZpbml0ZUZpbHRlclNlbGVjdEFsbCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRhdGEuZm9yRWFjaCgoaXRlbTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNTZWxlY3RlZChpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZVNlbGVjdGVkKGl0ZW0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmlzSW5maW5pdGVGaWx0ZXJTZWxlY3RBbGwgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjbGVhclNlYXJjaCgpIHtcbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuZ3JvdXBCeSkge1xuICAgICAgICAgICAgdGhpcy5ncm91cGVkRGF0YSA9IFtdO1xuICAgICAgICAgICAgdGhpcy5ncm91cGVkRGF0YSA9IHRoaXMuY2xvbmVBcnJheSh0aGlzLmdyb3VwQ2FjaGVkSXRlbXMpO1xuICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmZpbHRlciA9IFwiXCI7XG4gICAgICAgICAgICB0aGlzLmlzRmlsdGVyU2VsZWN0QWxsID0gZmFsc2U7XG5cbiAgICB9XG4gICAgb25GaWx0ZXJDaGFuZ2UoZGF0YTogYW55KSB7XG4gICAgICAgIGlmICh0aGlzLmZpbHRlciAmJiB0aGlzLmZpbHRlciA9PSBcIlwiIHx8IGRhdGEubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIHRoaXMuaXNGaWx0ZXJTZWxlY3RBbGwgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgY250ID0gMDtcbiAgICAgICAgZGF0YS5mb3JFYWNoKChpdGVtOiBhbnkpID0+IHtcblxuICAgICAgICAgICAgaWYgKCFpdGVtLmhhc093blByb3BlcnR5KCdncnBUaXRsZScpICYmIHRoaXMuaXNTZWxlY3RlZChpdGVtKSkge1xuICAgICAgICAgICAgICAgIGNudCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoY250ID4gMCAmJiB0aGlzLmZpbHRlckxlbmd0aCA9PSBjbnQpIHtcbiAgICAgICAgICAgIHRoaXMuaXNGaWx0ZXJTZWxlY3RBbGwgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNudCA+IDAgJiYgdGhpcy5maWx0ZXJMZW5ndGggIT0gY250KSB7XG4gICAgICAgICAgICB0aGlzLmlzRmlsdGVyU2VsZWN0QWxsID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jZHIuZGV0ZWN0Q2hhbmdlcygpO1xuICAgIH1cbiAgICBjbG9uZUFycmF5KGFycjogYW55KSB7XG4gICAgICAgIHZhciBpLCBjb3B5O1xuXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGFycikpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBhcnIgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICB0aHJvdyAnQ2Fubm90IGNsb25lIGFycmF5IGNvbnRhaW5pbmcgYW4gb2JqZWN0ISc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gYXJyO1xuICAgICAgICB9XG4gICAgfVxuICAgIHVwZGF0ZUdyb3VwSW5mbyhpdGVtOiBhbnkpIHtcbiAgICAgICAgdmFyIGtleSA9IHRoaXMuc2V0dGluZ3MuZ3JvdXBCeTtcbiAgICAgICAgdGhpcy5ncm91cGVkRGF0YS5mb3JFYWNoKChvYmo6IGFueSkgPT4ge1xuICAgICAgICAgICAgdmFyIGNudCA9IDA7XG4gICAgICAgICAgICBpZiAob2JqLmdycFRpdGxlICYmIChpdGVtW2tleV0gPT0gb2JqW2tleV0pKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9iai5saXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5saXN0LmZvckVhY2goKGVsOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzU2VsZWN0ZWQoZWwpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY250Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvYmoubGlzdCAmJiAoY250ID09PSBvYmoubGlzdC5sZW5ndGgpICYmIChpdGVtW2tleV0gPT0gb2JqW2tleV0pKSB7XG4gICAgICAgICAgICAgICAgb2JqLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG9iai5saXN0ICYmIChjbnQgIT0gb2JqLmxpc3QubGVuZ3RoKSAmJiAoaXRlbVtrZXldID09IG9ialtrZXldKSkge1xuICAgICAgICAgICAgICAgIG9iai5zZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5ncm91cENhY2hlZEl0ZW1zLmZvckVhY2goKG9iajogYW55KSA9PiB7XG4gICAgICAgICAgICB2YXIgY250ID0gMDtcbiAgICAgICAgICAgIGlmIChvYmouZ3JwVGl0bGUgJiYgKGl0ZW1ba2V5XSA9PSBvYmpba2V5XSkpIHtcbiAgICAgICAgICAgICAgICBpZiAob2JqLmxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqLmxpc3QuZm9yRWFjaCgoZWw6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNTZWxlY3RlZChlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbnQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG9iai5saXN0ICYmIChjbnQgPT09IG9iai5saXN0Lmxlbmd0aCkgJiYgKGl0ZW1ba2V5XSA9PSBvYmpba2V5XSkpIHtcbiAgICAgICAgICAgICAgICBvYmouc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAob2JqLmxpc3QgJiYgKGNudCAhPSBvYmoubGlzdC5sZW5ndGgpICYmIChpdGVtW2tleV0gPT0gb2JqW2tleV0pKSB7XG4gICAgICAgICAgICAgICAgb2JqLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICB0cmFuc2Zvcm1EYXRhKGFycjogQXJyYXk8YW55PiwgZmllbGQ6IGFueSk6IEFycmF5PGFueT4ge1xuICAgICAgICBjb25zdCBncm91cGVkT2JqOiBhbnkgPSBhcnIucmVkdWNlKChwcmV2OiBhbnksIGN1cjogYW55KSA9PiB7XG4gICAgICAgICAgICBpZiAoIXByZXZbY3VyW2ZpZWxkXV0pIHtcbiAgICAgICAgICAgICAgICBwcmV2W2N1cltmaWVsZF1dID0gW2N1cl07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHByZXZbY3VyW2ZpZWxkXV0ucHVzaChjdXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByZXY7XG4gICAgICAgIH0sIHt9KTtcbiAgICAgICAgY29uc3QgdGVtcEFycjogYW55ID0gW107XG4gICAgICAgIE9iamVjdC5rZXlzKGdyb3VwZWRPYmopLm1hcCgoeDogYW55KSA9PiB7XG4gICAgICAgICAgICB2YXIgb2JqOiBhbnkgPSB7fTtcbiAgICAgICAgICAgIG9ialtcImdycFRpdGxlXCJdID0gdHJ1ZTtcbiAgICAgICAgICAgIG9ialt0aGlzLnNldHRpbmdzLmxhYmVsS2V5XSA9IHg7XG4gICAgICAgICAgICBvYmpbdGhpcy5zZXR0aW5ncy5ncm91cEJ5XSA9IHg7XG4gICAgICAgICAgICBvYmpbJ3NlbGVjdGVkJ10gPSBmYWxzZTtcbiAgICAgICAgICAgIG9ialsnbGlzdCddID0gW107XG4gICAgICAgICAgICBncm91cGVkT2JqW3hdLmZvckVhY2goKGl0ZW06IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIGl0ZW1bJ2xpc3QnXSA9IFtdO1xuICAgICAgICAgICAgICAgIG9iai5saXN0LnB1c2goaXRlbSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRlbXBBcnIucHVzaChvYmopO1xuICAgICAgICAgICAgLy8gb2JqLmxpc3QuZm9yRWFjaCgoaXRlbTogYW55KSA9PiB7XG4gICAgICAgICAgICAvLyAgICAgdGVtcEFyci5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGVtcEFycjtcbiAgICB9XG4gICAgcHVibGljIGZpbHRlckluZmluaXRlTGlzdChldnQ6IGFueSkge1xuICAgICAgICB2YXIgZmlsdGVyZWRFbGVtczogQXJyYXk8YW55PiA9IFtdO1xuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5ncm91cEJ5KSB7XG4gICAgICAgICAgICB0aGlzLmdyb3VwZWREYXRhID0gdGhpcy5ncm91cENhY2hlZEl0ZW1zLnNsaWNlKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSB0aGlzLmNhY2hlZEl0ZW1zLnNsaWNlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoKGV2dC50YXJnZXQudmFsdWUgIT0gbnVsbCB8fCBldnQudGFyZ2V0LnZhbHVlICE9ICcnKSAmJiAhdGhpcy5zZXR0aW5ncy5ncm91cEJ5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5zZWFyY2hCeS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgdCA9IDA7IHQgPCB0aGlzLnNldHRpbmdzLnNlYXJjaEJ5Lmxlbmd0aDsgdCsrKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRhLmZpbHRlcigoZWw6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsW3RoaXMuc2V0dGluZ3Muc2VhcmNoQnlbdF0udG9TdHJpbmcoKV0udG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoZXZ0LnRhcmdldC52YWx1ZS50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZEVsZW1zLnB1c2goZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgLyogICAgICAgICAgICAgICAgICAgIGlmIChmaWx0ZXIgJiYgaXRlbVtzZWFyY2hCeVt0XV0gJiYgaXRlbVtzZWFyY2hCeVt0XV0gIT0gXCJcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbVtzZWFyY2hCeVt0XV0udG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoZmlsdGVyLnRvTG93ZXJDYXNlKCkpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0qL1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhLmZpbHRlcihmdW5jdGlvbiAoZWw6IGFueSkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBwcm9wIGluIGVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZWxbcHJvcF0udG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoZXZ0LnRhcmdldC52YWx1ZS50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZEVsZW1zLnB1c2goZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IGZpbHRlcmVkRWxlbXM7XG4gICAgICAgICAgICB0aGlzLmluZmluaXRlRmlsdGVyTGVuZ3RoID0gdGhpcy5kYXRhLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXZ0LnRhcmdldC52YWx1ZS50b1N0cmluZygpICE9ICcnICYmIHRoaXMuc2V0dGluZ3MuZ3JvdXBCeSkge1xuICAgICAgICAgICAgdGhpcy5ncm91cGVkRGF0YS5maWx0ZXIoZnVuY3Rpb24gKGVsOiBhbnkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZWwuaGFzT3duUHJvcGVydHkoJ2dycFRpdGxlJykpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyZWRFbGVtcy5wdXNoKGVsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIHByb3AgaW4gZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbFtwcm9wXS50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihldnQudGFyZ2V0LnZhbHVlLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSkgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkRWxlbXMucHVzaChlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuZ3JvdXBlZERhdGEgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuZ3JvdXBlZERhdGEgPSBmaWx0ZXJlZEVsZW1zO1xuICAgICAgICAgICAgdGhpcy5pbmZpbml0ZUZpbHRlckxlbmd0aCA9IHRoaXMuZ3JvdXBlZERhdGEubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGV2dC50YXJnZXQudmFsdWUudG9TdHJpbmcoKSA9PSAnJyAmJiB0aGlzLmNhY2hlZEl0ZW1zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IFtdO1xuICAgICAgICAgICAgdGhpcy5kYXRhID0gdGhpcy5jYWNoZWRJdGVtcztcbiAgICAgICAgICAgIHRoaXMuaW5maW5pdGVGaWx0ZXJMZW5ndGggPSAwO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJlc2V0SW5maW5pdGVTZWFyY2goKSB7XG4gICAgICAgIHRoaXMuZmlsdGVyID0gXCJcIjtcbiAgICAgICAgdGhpcy5pc0luZmluaXRlRmlsdGVyU2VsZWN0QWxsID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZGF0YSA9IFtdO1xuICAgICAgICB0aGlzLmRhdGEgPSB0aGlzLmNhY2hlZEl0ZW1zO1xuICAgICAgICB0aGlzLmdyb3VwZWREYXRhID0gdGhpcy5ncm91cENhY2hlZEl0ZW1zO1xuICAgICAgICB0aGlzLmluZmluaXRlRmlsdGVyTGVuZ3RoID0gMDtcbiAgICB9XG4gICAgb25TY3JvbGxFbmQoZTogQ2hhbmdlRXZlbnQpIHtcbiAgICAgICAgdGhpcy5vblNjcm9sbFRvRW5kLmVtaXQoZSk7XG4gICAgfVxuICAgIG5nT25EZXN0cm95KCkge1xuICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIH1cbiAgICBzZWxlY3RHcm91cChpdGVtOiBhbnkpIHtcbiAgICAgICAgaWYgKGl0ZW0uc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIGl0ZW0uc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGl0ZW0ubGlzdC5mb3JFYWNoKChvYmo6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlU2VsZWN0ZWQob2JqKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaXRlbS5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICBpdGVtLmxpc3QuZm9yRWFjaCgob2JqOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaXNTZWxlY3RlZChvYmopKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkU2VsZWN0ZWQob2JqKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudXBkYXRlR3JvdXBJbmZvKGl0ZW0pO1xuXG4gICAgfVxuICAgIGFkZEZpbHRlck5ld0l0ZW0oKSB7XG4gICAgICAgIHRoaXMub25BZGRGaWx0ZXJOZXdJdGVtLmVtaXQodGhpcy5maWx0ZXIpO1xuICAgICAgICB0aGlzLmZpbHRlclBpcGUgPSBuZXcgTGlzdEZpbHRlclBpcGUodGhpcy5kcyk7XG4gICAgICAgIHRoaXMuZmlsdGVyUGlwZS50cmFuc2Zvcm0odGhpcy5kYXRhLCB0aGlzLmZpbHRlciwgdGhpcy5zZXR0aW5ncy5zZWFyY2hCeSk7XG4gICAgfVxuICAgIGNhbGN1bGF0ZURyb3Bkb3duRGlyZWN0aW9uKCkge1xuICAgICAgICBsZXQgc2hvdWxkT3BlblRvd2FyZHNUb3AgPSB0aGlzLnNldHRpbmdzLnBvc2l0aW9uID09ICd0b3AnO1xuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5hdXRvUG9zaXRpb24pIHtcbiAgICAgICAgICAgIGNvbnN0IGRyb3Bkb3duSGVpZ2h0ID0gdGhpcy5kcm9wZG93bkxpc3RFbGVtLm5hdGl2ZUVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgICAgICAgICAgY29uc3Qgdmlld3BvcnRIZWlnaHQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRMaXN0Qm91bmRzID0gdGhpcy5zZWxlY3RlZExpc3RFbGVtLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHNwYWNlT25Ub3A6IG51bWJlciA9IHNlbGVjdGVkTGlzdEJvdW5kcy50b3A7XG4gICAgICAgICAgICBjb25zdCBzcGFjZU9uQm90dG9tOiBudW1iZXIgPSB2aWV3cG9ydEhlaWdodCAtIHNlbGVjdGVkTGlzdEJvdW5kcy50b3A7XG4gICAgICAgICAgICBpZiAoc3BhY2VPbkJvdHRvbSA8IHNwYWNlT25Ub3AgJiYgZHJvcGRvd25IZWlnaHQgPCBzcGFjZU9uVG9wKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuVG93YXJkc1RvcCh0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMub3BlblRvd2FyZHNUb3AoZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gS2VlcCBwcmVmZXJlbmNlIGlmIHRoZXJlIGlzIG5vdCBlbm91Z2ggc3BhY2Ugb24gZWl0aGVyIHRoZSB0b3Agb3IgYm90dG9tXG4gICAgICAgICAgICAvKiBcdFx0XHRpZiAoc3BhY2VPblRvcCB8fCBzcGFjZU9uQm90dG9tKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNob3VsZE9wZW5Ub3dhcmRzVG9wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3VsZE9wZW5Ub3dhcmRzVG9wID0gc3BhY2VPblRvcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG91bGRPcGVuVG93YXJkc1RvcCA9ICFzcGFjZU9uQm90dG9tO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKi9cbiAgICAgICAgfVxuXG4gICAgfVxuICAgIG9wZW5Ub3dhcmRzVG9wKHZhbHVlOiBib29sZWFuKSB7XG4gICAgICAgIGlmICh2YWx1ZSAmJiB0aGlzLnNlbGVjdGVkTGlzdEVsZW0ubmF0aXZlRWxlbWVudC5jbGllbnRIZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuZHJvcGRvd25MaXN0WU9mZnNldCA9IDE1ICsgdGhpcy5zZWxlY3RlZExpc3RFbGVtLm5hdGl2ZUVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kcm9wZG93bkxpc3RZT2Zmc2V0ID0gMDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuQE5nTW9kdWxlKHtcbiAgICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlLCBGb3Jtc01vZHVsZV0sXG4gICAgZGVjbGFyYXRpb25zOiBbQW5ndWxhck11bHRpU2VsZWN0LCBDbGlja091dHNpZGVEaXJlY3RpdmUsIFNjcm9sbERpcmVjdGl2ZSwgc3R5bGVEaXJlY3RpdmUsIExpc3RGaWx0ZXJQaXBlLCBJdGVtLCBUZW1wbGF0ZVJlbmRlcmVyLCBCYWRnZSwgU2VhcmNoLCBzZXRQb3NpdGlvbiwgVmlydHVhbFNjcm9sbENvbXBvbmVudCwgQ0ljb25dLFxuICAgIGV4cG9ydHM6IFtBbmd1bGFyTXVsdGlTZWxlY3QsIENsaWNrT3V0c2lkZURpcmVjdGl2ZSwgU2Nyb2xsRGlyZWN0aXZlLCBzdHlsZURpcmVjdGl2ZSwgTGlzdEZpbHRlclBpcGUsIEl0ZW0sIFRlbXBsYXRlUmVuZGVyZXIsIEJhZGdlLCBTZWFyY2gsIHNldFBvc2l0aW9uLCBWaXJ0dWFsU2Nyb2xsQ29tcG9uZW50LCBDSWNvbl0sXG4gICAgcHJvdmlkZXJzOiBbRGF0YVNlcnZpY2VdXG59KVxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJNdWx0aVNlbGVjdE1vZHVsZSB7IH1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQTs7Ozs7SUFHQyxZQUFZLE1BQWUsRUFBRSxJQUFVO1FBQ3RDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0tBQ2pCO0NBRUQ7Ozs7OztBQ1JEOzs7O0lBTUksWUFBb0IsV0FBdUI7UUFBdkIsZ0JBQVcsR0FBWCxXQUFXLENBQVk7NEJBSXJCLElBQUksWUFBWSxFQUFjO0tBSG5EOzs7Ozs7SUFPTSxPQUFPLENBQUMsS0FBaUIsRUFBRSxhQUEwQjtR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