/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
import { Component, ContentChild, ElementRef, EventEmitter, Input, NgZone, Output, Renderer2, ViewChild, } from '@angular/core';
/**
 * @record
 */
export function ChangeEvent() { }
/** @type {?|undefined} */
ChangeEvent.prototype.start;
/** @type {?|undefined} */
ChangeEvent.prototype.end;
/**
 * @record
 */
export function WrapGroupDimensions() { }
/** @type {?} */
WrapGroupDimensions.prototype.numberOfKnownWrapGroupChildSizes;
/** @type {?} */
WrapGroupDimensions.prototype.sumOfKnownWrapGroupChildWidths;
/** @type {?} */
WrapGroupDimensions.prototype.sumOfKnownWrapGroupChildHeights;
/** @type {?} */
WrapGroupDimensions.prototype.maxChildSizePerWrapGroup;
/**
 * @record
 */
export function WrapGroupDimension() { }
/** @type {?} */
WrapGroupDimension.prototype.childWidth;
/** @type {?} */
WrapGroupDimension.prototype.childHeight;
/** @type {?} */
WrapGroupDimension.prototype.items;
/**
 * @record
 */
export function IDimensions() { }
/** @type {?} */
IDimensions.prototype.itemCount;
/** @type {?} */
IDimensions.prototype.itemsPerWrapGroup;
/** @type {?} */
IDimensions.prototype.wrapGroupsPerPage;
/** @type {?} */
IDimensions.prototype.itemsPerPage;
/** @type {?} */
IDimensions.prototype.pageCount_fractional;
/** @type {?} */
IDimensions.prototype.childWidth;
/** @type {?} */
IDimensions.prototype.childHeight;
/** @type {?} */
IDimensions.prototype.scrollLength;
/**
 * @record
 */
export function IPageInfo() { }
/** @type {?} */
IPageInfo.prototype.startIndex;
/** @type {?} */
IPageInfo.prototype.endIndex;
/**
 * @record
 */
export function IPageInfoWithBuffer() { }
/** @type {?} */
IPageInfoWithBuffer.prototype.startIndexWithBuffer;
/** @type {?} */
IPageInfoWithBuffer.prototype.endIndexWithBuffer;
/**
 * @record
 */
export function IViewport() { }
/** @type {?} */
IViewport.prototype.padding;
/** @type {?} */
IViewport.prototype.scrollLength;
export class VirtualScrollComponent {
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
        /** @type {?} */
        let animationRequest;
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
                /** @type {?} */
                let emitIndexChangedEvents = true; // maxReRunTimes === 1 (would need to still run if didn't update if previous iteration had updated)
                if (startChanged || endChanged) {
                    this.zone.run(() => {
                        // update the scroll list to trigger re-render of components in viewport
                        this.viewPortItems = viewport.startIndexWithBuffer >= 0 && viewport.endIndexWithBuffer >= 0 ? this.items.slice(viewport.startIndexWithBuffer, viewport.endIndexWithBuffer + 1) : [];
                        this.update.emit(this.viewPortItems);
                        this.vsUpdate.emit(this.viewPortItems);
                        if (emitIndexChangedEvents) {
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
if (false) {
    /** @type {?} */
    VirtualScrollComponent.prototype.viewPortItems;
    /** @type {?} */
    VirtualScrollComponent.prototype.window;
    /** @type {?} */
    VirtualScrollComponent.prototype._enableUnequalChildrenSizes;
    /** @type {?} */
    VirtualScrollComponent.prototype.useMarginInsteadOfTranslate;
    /** @type {?} */
    VirtualScrollComponent.prototype.scrollbarWidth;
    /** @type {?} */
    VirtualScrollComponent.prototype.scrollbarHeight;
    /** @type {?} */
    VirtualScrollComponent.prototype.childWidth;
    /** @type {?} */
    VirtualScrollComponent.prototype.childHeight;
    /** @type {?} */
    VirtualScrollComponent.prototype._bufferAmount;
    /** @type {?} */
    VirtualScrollComponent.prototype.scrollAnimationTime;
    /** @type {?} */
    VirtualScrollComponent.prototype.resizeBypassRefreshTheshold;
    /** @type {?} */
    VirtualScrollComponent.prototype._scrollThrottlingTime;
    /** @type {?} */
    VirtualScrollComponent.prototype.checkScrollElementResizedTimer;
    /** @type {?} */
    VirtualScrollComponent.prototype._checkResizeInterval;
    /** @type {?} */
    VirtualScrollComponent.prototype._items;
    /** @type {?} */
    VirtualScrollComponent.prototype.compareItems;
    /** @type {?} */
    VirtualScrollComponent.prototype._horizontal;
    /** @type {?} */
    VirtualScrollComponent.prototype.oldParentScrollOverflow;
    /** @type {?} */
    VirtualScrollComponent.prototype._parentScroll;
    /** @type {?} */
    VirtualScrollComponent.prototype.update;
    /** @type {?} */
    VirtualScrollComponent.prototype.vsUpdate;
    /** @type {?} */
    VirtualScrollComponent.prototype.change;
    /** @type {?} */
    VirtualScrollComponent.prototype.vsChange;
    /** @type {?} */
    VirtualScrollComponent.prototype.start;
    /** @type {?} */
    VirtualScrollComponent.prototype.vsStart;
    /** @type {?} */
    VirtualScrollComponent.prototype.end;
    /** @type {?} */
    VirtualScrollComponent.prototype.vsEnd;
    /** @type {?} */
    VirtualScrollComponent.prototype.contentElementRef;
    /** @type {?} */
    VirtualScrollComponent.prototype.invisiblePaddingElementRef;
    /** @type {?} */
    VirtualScrollComponent.prototype.containerElementRef;
    /** @type {?} */
    VirtualScrollComponent.prototype.previousScrollBoundingRect;
    /** @type {?} */
    VirtualScrollComponent.prototype._invisiblePaddingProperty;
    /** @type {?} */
    VirtualScrollComponent.prototype._offsetType;
    /** @type {?} */
    VirtualScrollComponent.prototype._scrollType;
    /** @type {?} */
    VirtualScrollComponent.prototype._pageOffsetType;
    /** @type {?} */
    VirtualScrollComponent.prototype._childScrollDim;
    /** @type {?} */
    VirtualScrollComponent.prototype._translateDir;
    /** @type {?} */
    VirtualScrollComponent.prototype._marginDir;
    /** @type {?} */
    VirtualScrollComponent.prototype.refresh_throttled;
    /** @type {?} */
    VirtualScrollComponent.prototype.calculatedScrollbarWidth;
    /** @type {?} */
    VirtualScrollComponent.prototype.calculatedScrollbarHeight;
    /** @type {?} */
    VirtualScrollComponent.prototype.padding;
    /** @type {?} */
    VirtualScrollComponent.prototype.previousViewPort;
    /** @type {?} */
    VirtualScrollComponent.prototype.cachedItemsLength;
    /** @type {?} */
    VirtualScrollComponent.prototype.disposeScrollHandler;
    /** @type {?} */
    VirtualScrollComponent.prototype.disposeResizeHandler;
    /** @type {?} */
    VirtualScrollComponent.prototype.minMeasuredChildWidth;
    /** @type {?} */
    VirtualScrollComponent.prototype.minMeasuredChildHeight;
    /** @type {?} */
    VirtualScrollComponent.prototype.wrapGroupDimensions;
    /** @type {?} */
    VirtualScrollComponent.prototype.cachedPageSize;
    /** @type {?} */
    VirtualScrollComponent.prototype.previousScrollNumberElements;
    /** @type {?} */
    VirtualScrollComponent.prototype.element;
    /** @type {?} */
    VirtualScrollComponent.prototype.renderer;
    /** @type {?} */
    VirtualScrollComponent.prototype.zone;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1zY3JvbGwuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyMi1tdWx0aXNlbGVjdC1kcm9wZG93bi8iLCJzb3VyY2VzIjpbImxpYi92aXJ0dWFsLXNjcm9sbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUNOLFNBQVMsRUFDVCxZQUFZLEVBQ1osVUFBVSxFQUNWLFlBQVksRUFDWixLQUFLLEVBRUwsTUFBTSxFQUlOLE1BQU0sRUFDTixTQUFTLEVBQ1QsU0FBUyxHQUNULE1BQU0sZUFBZSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFxSHZCLE1BQU07Ozs7OztJQXFRTCxZQUErQixPQUFtQixFQUFxQixRQUFtQixFQUFxQixJQUFZO1FBQTVGLFlBQU8sR0FBUCxPQUFPLENBQVk7UUFBcUIsYUFBUSxHQUFSLFFBQVEsQ0FBVztRQUFxQixTQUFJLEdBQUosSUFBSSxDQUFRO3NCQW5RM0csTUFBTTsyQ0FVMkIsS0FBSzsyQ0FnQlIsS0FBSzs2QkFjakIsQ0FBQzttQ0FVRSxHQUFHOzJDQUdLLENBQUM7b0NBZUwsSUFBSTtzQkFjbkIsRUFBRTs0QkFlK0IsQ0FBQyxLQUFVLEVBQUUsS0FBVSxFQUFFLEVBQUUsQ0FBQyxLQUFLLEtBQUssS0FBSztzQkE4Q2pFLElBQUksWUFBWSxFQUFTO3dCQUV2QixJQUFJLFlBQVksRUFBUztzQkFHckIsSUFBSSxZQUFZLEVBQWU7d0JBRTdCLElBQUksWUFBWSxFQUFlO3FCQUdsQyxJQUFJLFlBQVksRUFBZTt1QkFFN0IsSUFBSSxZQUFZLEVBQWU7bUJBR25DLElBQUksWUFBWSxFQUFlO3FCQUU3QixJQUFJLFlBQVksRUFBZTt3Q0FtTDVCLENBQUM7eUNBQ0EsQ0FBQzt1QkFFbkIsQ0FBQztrREFDZ0IsRUFBRTs4QkEwWVosQ0FBQzs0Q0FDYSxDQUFDO1FBOWRqRCxJQUFJLENBQUMs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QkFjTCxLQUFLOzJCQWFMLEtBQUs7eUJBSUwsS0FBSzsyQkFxQkwsS0FBSztxQkFxQkwsTUFBTTt1QkFFTixNQUFNO3FCQUdOLE1BQU07dUJBRU4sTUFBTTtvQkFHTixNQUFNO3NCQUVOLE1BQU07a0JBR04sTUFBTTtvQkFFTixNQUFNO2dDQUdOLFNBQVMsU0FBQyxTQUFTLEVBQUUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFO3lDQUd6QyxTQUFTLFNBQUMsa0JBQWtCLEVBQUUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFO2tDQUdsRCxZQUFZLFNBQUMsV0FBVyxFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG5cdENvbXBvbmVudCxcblx0Q29udGVudENoaWxkLFxuXHRFbGVtZW50UmVmLFxuXHRFdmVudEVtaXR0ZXIsXG5cdElucHV0LFxuXHROZ01vZHVsZSxcblx0Tmdab25lLFxuXHRPbkNoYW5nZXMsXG5cdE9uRGVzdHJveSxcblx0T25Jbml0LFxuXHRPdXRwdXQsXG5cdFJlbmRlcmVyMixcblx0Vmlld0NoaWxkLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcblxuXG5leHBvcnQgaW50ZXJmYWNlIENoYW5nZUV2ZW50IHtcblx0c3RhcnQ/OiBudW1iZXI7XG5cdGVuZD86IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBXcmFwR3JvdXBEaW1lbnNpb25zIHtcblx0bnVtYmVyT2ZLbm93bldyYXBHcm91cENoaWxkU2l6ZXM6IG51bWJlcjtcblx0c3VtT2ZLbm93bldyYXBHcm91cENoaWxkV2lkdGhzOiBudW1iZXI7XG5cdHN1bU9mS25vd25XcmFwR3JvdXBDaGlsZEhlaWdodHM6IG51bWJlcjtcblx0bWF4Q2hpbGRTaXplUGVyV3JhcEdyb3VwOiBXcmFwR3JvdXBEaW1lbnNpb25bXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBXcmFwR3JvdXBEaW1lbnNpb24ge1xuXHRjaGlsZFdpZHRoOiBudW1iZXI7XG5cdGNoaWxkSGVpZ2h0OiBudW1iZXI7XG5cdGl0ZW1zOiBhbnlbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJRGltZW5zaW9ucyB7XG5cdGl0ZW1Db3VudDogbnVtYmVyO1xuXHRpdGVtc1BlcldyYXBHcm91cDogbnVtYmVyO1xuXHR3cmFwR3JvdXBzUGVyUGFnZTogbnVtYmVyO1xuXHRpdGVtc1BlclBhZ2U6IG51bWJlcjtcblx0cGFnZUNvdW50X2ZyYWN0aW9uYWw6IG51bWJlcjtcblx0Y2hpbGRXaWR0aDogbnVtYmVyO1xuXHRjaGlsZEhlaWdodDogbnVtYmVyO1xuXHRzY3JvbGxMZW5ndGg6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJUGFnZUluZm8ge1xuXHRzdGFydEluZGV4OiBudW1iZXI7XG5cdGVuZEluZGV4OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVBhZ2VJbmZvV2l0aEJ1ZmZlciBleHRlbmRzIElQYWdlSW5mbyB7XG5cdHN0YXJ0SW5kZXhXaXRoQnVmZmVyOiBudW1iZXI7XG5cdGVuZEluZGV4V2l0aEJ1ZmZlcjogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElWaWV3cG9ydCBleHRlbmRzIElQYWdlSW5mb1dpdGhCdWZmZXIge1xuXHRwYWRkaW5nOiBudW1iZXI7XG5cdHNjcm9sbExlbmd0aDogbnVtYmVyO1xufVxuXG5AQ29tcG9uZW50KHtcblx0c2VsZWN0b3I6ICd2aXJ0dWFsLXNjcm9sbCxbdmlydHVhbFNjcm9sbF0nLFxuXHRleHBvcnRBczogJ3ZpcnR1YWxTY3JvbGwnLFxuXHR0ZW1wbGF0ZTogYFxuICAgIDxkaXYgY2xhc3M9XCJ0b3RhbC1wYWRkaW5nXCIgI2ludmlzaWJsZVBhZGRpbmc+PC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInNjcm9sbGFibGUtY29udGVudFwiICNjb250ZW50PlxuICAgICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxuICAgIDwvZGl2PlxuICBgLFxuXHRob3N0OiB7XG5cdFx0J1tjbGFzcy5ob3Jpem9udGFsXSc6IFwiaG9yaXpvbnRhbFwiLFxuXHRcdCdbY2xhc3MudmVydGljYWxdJzogXCIhaG9yaXpvbnRhbFwiLFxuXHRcdCdbY2xhc3Muc2VsZlNjcm9sbF0nOiBcIiFwYXJlbnRTY3JvbGxcIlxuXHR9LFxuXHRzdHlsZXM6IFtgXG4gICAgOmhvc3Qge1xuICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuXHQgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgLXdlYmtpdC1vdmVyZmxvdy1zY3JvbGxpbmc6IHRvdWNoO1xuICAgIH1cblx0XG5cdDpob3N0Lmhvcml6b250YWwuc2VsZlNjcm9sbCB7XG4gICAgICBvdmVyZmxvdy15OiB2aXNpYmxlO1xuICAgICAgb3ZlcmZsb3cteDogYXV0bztcblx0fVxuXHQ6aG9zdC52ZXJ0aWNhbC5zZWxmU2Nyb2xsIHtcbiAgICAgIG92ZXJmbG93LXk6IGF1dG87XG4gICAgICBvdmVyZmxvdy14OiB2aXNpYmxlO1xuXHR9XG5cdFxuICAgIC5zY3JvbGxhYmxlLWNvbnRlbnQge1xuICAgICAgdG9wOiAwO1xuICAgICAgbGVmdDogMDtcbiAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgaGVpZ2h0OiAxMDAlO1xuICAgICAgbWF4LXdpZHRoOiAxMDB2dztcbiAgICAgIG1heC1oZWlnaHQ6IDEwMHZoO1xuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIH1cblxuXHQuc2Nyb2xsYWJsZS1jb250ZW50IDo6bmctZGVlcCA+ICoge1xuXHRcdGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG5cdH1cblx0XG5cdDpob3N0Lmhvcml6b250YWwge1xuXHRcdHdoaXRlLXNwYWNlOiBub3dyYXA7XG5cdH1cblx0XG5cdDpob3N0Lmhvcml6b250YWwgLnNjcm9sbGFibGUtY29udGVudCB7XG5cdFx0ZGlzcGxheTogZmxleDtcblx0fVxuXHRcblx0Omhvc3QuaG9yaXpvbnRhbCAuc2Nyb2xsYWJsZS1jb250ZW50IDo6bmctZGVlcCA+ICoge1xuXHRcdGZsZXgtc2hyaW5rOiAwO1xuXHRcdGZsZXgtZ3JvdzogMDtcblx0XHR3aGl0ZS1zcGFjZTogaW5pdGlhbDtcblx0fVxuXHRcbiAgICAudG90YWwtcGFkZGluZyB7XG4gICAgICB3aWR0aDogMXB4O1xuICAgICAgb3BhY2l0eTogMDtcbiAgICB9XG4gICAgXG4gICAgOmhvc3QuaG9yaXpvbnRhbCAudG90YWwtcGFkZGluZyB7XG4gICAgICBoZWlnaHQ6IDEwMCU7XG4gICAgfVxuICBgXVxufSlcbmV4cG9ydCBjbGFzcyBWaXJ0dWFsU2Nyb2xsQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkNoYW5nZXMsIE9uRGVzdHJveSB7XG5cdHB1YmxpYyB2aWV3UG9ydEl0ZW1zOiBhbnlbXTtcblx0cHVibGljIHdpbmRvdyA9IHdpbmRvdztcblxuXHRwdWJsaWMgZ2V0IHZpZXdQb3J0SW5kaWNlcygpOiBJUGFnZUluZm8ge1xuXHRcdGxldCBwYWdlSW5mbzogSVBhZ2VJbmZvID0gdGhpcy5wcmV2aW91c1ZpZXdQb3J0IHx8IDxhbnk+e307XG5cdFx0cmV0dXJuIHtcblx0XHRcdHN0YXJ0SW5kZXg6IHBhZ2VJbmZvLnN0YXJ0SW5kZXggfHwgMCxcblx0XHRcdGVuZEluZGV4OiBwYWdlSW5mby5lbmRJbmRleCB8fCAwXG5cdFx0fTtcblx0fVxuXG5cdHByb3RlY3RlZCBfZW5hYmxlVW5lcXVhbENoaWxkcmVuU2l6ZXM6IGJvb2xlYW4gPSBmYWxzZTtcblx0QElucHV0KClcblx0cHVibGljIGdldCBlbmFibGVVbmVxdWFsQ2hpbGRyZW5TaXplcygpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5fZW5hYmxlVW5lcXVhbENoaWxkcmVuU2l6ZXM7XG5cdH1cblx0cHVibGljIHNldCBlbmFibGVVbmVxdWFsQ2hpbGRyZW5TaXplcyh2YWx1ZTogYm9vbGVhbikge1xuXHRcdGlmICh0aGlzLl9lbmFibGVVbmVxdWFsQ2hpbGRyZW5TaXplcyA9PT0gdmFsdWUpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLl9lbmFibGVVbmVxdWFsQ2hpbGRyZW5TaXplcyA9IHZhbHVlO1xuXHRcdHRoaXMubWluTWVhc3VyZWRDaGlsZFdpZHRoID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMubWluTWVhc3VyZWRDaGlsZEhlaWdodCA9IHVuZGVmaW5lZDtcblx0fVxuXG5cdEBJbnB1dCgpXG5cdHB1YmxpYyB1c2VNYXJnaW5JbnN0ZWFkT2ZUcmFuc2xhdGU6IGJvb2xlYW4gPSBmYWxzZTtcblxuXHRASW5wdXQoKVxuXHRwdWJsaWMgc2Nyb2xsYmFyV2lkdGg6IG51bWJlcjtcblxuXHRASW5wdXQoKVxuXHRwdWJsaWMgc2Nyb2xsYmFySGVpZ2h0OiBudW1iZXI7XG5cblx0QElucHV0KClcblx0cHVibGljIGNoaWxkV2lkdGg6IG51bWJlcjtcblxuXHRASW5wdXQoKVxuXHRwdWJsaWMgY2hpbGRIZWlnaHQ6IG51bWJlcjtcblxuXHRwcm90ZWN0ZWQgX2J1ZmZlckFtb3VudDogbnVtYmVyID0gMDtcblx0QElucHV0KClcblx0cHVibGljIGdldCBidWZmZXJBbW91bnQoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gTWF0aC5tYXgodGhpcy5fYnVmZmVyQW1vdW50LCB0aGlzLmVuYWJsZVVuZXF1YWxDaGlsZHJlblNpemVzID8gNSA6IDApO1xuXHR9XG5cdHB1YmxpYyBzZXQgYnVmZmVyQW1vdW50KHZhbHVlOiBudW1iZXIpIHtcblx0XHR0aGlzLl9idWZmZXJBbW91bnQgPSB2YWx1ZTtcblx0fVxuXG5cdEBJbnB1dCgpXG5cdHB1YmxpYyBzY3JvbGxBbmltYXRpb25UaW1lOiBudW1iZXIgPSA3NTA7XG5cblx0QElucHV0KClcblx0cHVibGljIHJlc2l6ZUJ5cGFzc1JlZnJlc2hUaGVzaG9sZDogbnVtYmVyID0gNTtcblxuXHRwcm90ZWN0ZWQgX3Njcm9sbFRocm90dGxpbmdUaW1lOiBudW1iZXI7XG5cdEBJbnB1dCgpXG5cdHB1YmxpYyBnZXQgc2Nyb2xsVGhyb3R0bGluZ1RpbWUoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5fc2Nyb2xsVGhyb3R0bGluZ1RpbWU7XG5cdH1cblx0cHVibGljIHNldCBzY3JvbGxUaHJvdHRsaW5nVGltZSh2YWx1ZTogbnVtYmVyKSB7XG5cdFx0dGhpcy5fc2Nyb2xsVGhyb3R0bGluZ1RpbWUgPSB2YWx1ZTtcblx0XHR0aGlzLnJlZnJlc2hfdGhyb3R0bGVkID0gPGFueT50aGlzLnRocm90dGxlVHJhaWxpbmcoKCkgPT4ge1xuXHRcdFx0dGhpcy5yZWZyZXNoX2ludGVybmFsKGZhbHNlKTtcblx0XHR9LCB0aGlzLl9zY3JvbGxUaHJvdHRsaW5nVGltZSk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgY2hlY2tTY3JvbGxFbGVtZW50UmVzaXplZFRpbWVyOiBudW1iZXI7XG5cdHByb3RlY3RlZCBfY2hlY2tSZXNpemVJbnRlcnZhbDogbnVtYmVyID0gMTAwMDtcblx0QElucHV0KClcblx0cHVibGljIGdldCBjaGVja1Jlc2l6ZUludGVydmFsKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuX2NoZWNrUmVzaXplSW50ZXJ2YWw7XG5cdH1cblx0cHVibGljIHNldCBjaGVja1Jlc2l6ZUludGVydmFsKHZhbHVlOiBudW1iZXIpIHtcblx0XHRpZiAodGhpcy5fY2hlY2tSZXNpemVJbnRlcnZhbCA9PT0gdmFsdWUpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLl9jaGVja1Jlc2l6ZUludGVydmFsID0gdmFsdWU7XG5cdFx0dGhpcy5hZGRTY3JvbGxFdmVudEhhbmRsZXJzKCk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2l0ZW1zOiBhbnlbXSA9IFtdO1xuXHRASW5wdXQoKVxuXHRwdWJsaWMgZ2V0IGl0ZW1zKCk6IGFueVtdIHtcblx0XHRyZXR1cm4gdGhpcy5faXRlbXM7XG5cdH1cblx0cHVibGljIHNldCBpdGVtcyh2YWx1ZTogYW55W10pIHtcblx0XHRpZiAodmFsdWUgPT09IHRoaXMuX2l0ZW1zKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5faXRlbXMgPSB2YWx1ZSB8fCBbXTtcblx0XHR0aGlzLnJlZnJlc2hfaW50ZXJuYWwodHJ1ZSk7XG5cdH1cblxuXHRASW5wdXQoKVxuXHRwdWJsaWMgY29tcGFyZUl0ZW1zOiAoaXRlbTE6IGFueSwgaXRlbTI6IGFueSkgPT4gYm9vbGVhbiA9IChpdGVtMTogYW55LCBpdGVtMjogYW55KSA9PiBpdGVtMSA9PT0gaXRlbTI7XG5cblx0cHJvdGVjdGVkIF9ob3Jpem9udGFsOiBib29sZWFuO1xuXHRASW5wdXQoKVxuXHRwdWJsaWMgZ2V0IGhvcml6b250YWwoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuX2hvcml6b250YWw7XG5cdH1cblx0cHVibGljIHNldCBob3Jpem9udGFsKHZhbHVlOiBib29sZWFuKSB7XG5cdFx0dGhpcy5faG9yaXpvbnRhbCA9IHZhbHVlO1xuXHRcdHRoaXMudXBkYXRlRGlyZWN0aW9uKCk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgcmV2ZXJ0UGFyZW50T3ZlcnNjcm9sbCgpOiB2b2lkIHtcblx0XHRjb25zdCBzY3JvbGxFbGVtZW50OiBhbnkgPSB0aGlzLmdldFNjcm9sbEVsZW1lbnQoKTtcblx0XHRpZiAoc2Nyb2xsRWxlbWVudCAmJiB0aGlzLm9sZFBhcmVudFNjcm9sbE92ZXJmbG93KSB7XG5cdFx0XHRzY3JvbGxFbGVtZW50LnN0eWxlWydvdmVyZmxvdy15J10gPSB0aGlzLm9sZFBhcmVudFNjcm9sbE92ZXJmbG93Lnk7XG5cdFx0XHRzY3JvbGxFbGVtZW50LnN0eWxlWydvdmVyZmxvdy14J10gPSB0aGlzLm9sZFBhcmVudFNjcm9sbE92ZXJmbG93Lng7XG5cdFx0fVxuXG5cdFx0dGhpcy5vbGRQYXJlbnRTY3JvbGxPdmVyZmxvdyA9IHVuZGVmaW5lZDtcblx0fVxuXG5cdHByb3RlY3RlZCBvbGRQYXJlbnRTY3JvbGxPdmVyZmxvdzogeyB4OiBzdHJpbmcsIHk6IHN0cmluZyB9O1xuXHRwcm90ZWN0ZWQgX3BhcmVudFNjcm9sbDogRWxlbWVudCB8IFdpbmRvdztcblx0QElucHV0KClcblx0cHVibGljIGdldCBwYXJlbnRTY3JvbGwoKTogRWxlbWVudCB8IFdpbmRvdyB7XG5cdFx0cmV0dXJuIHRoaXMuX3BhcmVudFNjcm9sbDtcblx0fVxuXHRwdWJsaWMgc2V0IHBhcmVudFNjcm9sbCh2YWx1ZTogRWxlbWVudCB8IFdpbmRvdykge1xuXHRcdGlmICh0aGlzLl9wYXJlbnRTY3JvbGwgPT09IHZhbHVlKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5yZXZlcnRQYXJlbnRPdmVyc2Nyb2xsKCk7XG5cdFx0dGhpcy5fcGFyZW50U2Nyb2xsID0gdmFsdWU7XG5cdFx0dGhpcy5hZGRTY3JvbGxFdmVudEhhbmRsZXJzKCk7XG5cblx0XHRjb25zdCBzY3JvbGxFbGVtZW50OmFueSA9IHRoaXMuZ2V0U2Nyb2xsRWxlbWVudCgpO1xuXHRcdGlmIChzY3JvbGxFbGVtZW50ICE9PSB0aGlzLmVsZW1lbnQubmF0aXZlRWxlbWVudCkge1xuXHRcdFx0dGhpcy5vbGRQYXJlbnRTY3JvbGxPdmVyZmxvdyA9IHsgeDogc2Nyb2xsRWxlbWVudC5zdHlsZVsnb3ZlcmZsb3cteCddLCB5OiBzY3JvbGxFbGVtZW50LnN0eWxlWydvdmVyZmxvdy15J10gfTtcblx0XHRcdHNjcm9sbEVsZW1lbnQuc3R5bGVbJ292ZXJmbG93LXknXSA9IHRoaXMuaG9yaXpvbnRhbCA/ICd2aXNpYmxlJyA6ICdhdXRvJztcblx0XHRcdHNjcm9sbEVsZW1lbnQuc3R5bGVbJ292ZXJmbG93LXgnXSA9IHRoaXMuaG9yaXpvbnRhbCA/ICdhdXRvJyA6ICd2aXNpYmxlJztcblx0XHR9XG5cdH1cblxuXHRAT3V0cHV0KClcblx0cHVibGljIHVwZGF0ZTogRXZlbnRFbWl0dGVyPGFueVtdPiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55W10+KCk7XG5cdEBPdXRwdXQoKVxuXHRwdWJsaWMgdnNVcGRhdGU6IEV2ZW50RW1pdHRlcjxhbnlbXT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueVtdPigpO1xuXG5cdEBPdXRwdXQoKVxuXHRwdWJsaWMgY2hhbmdlOiBFdmVudEVtaXR0ZXI8Q2hhbmdlRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDaGFuZ2VFdmVudD4oKTtcblx0QE91dHB1dCgpXG5cdHB1YmxpYyB2c0NoYW5nZTogRXZlbnRFbWl0dGVyPENoYW5nZUV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hhbmdlRXZlbnQ+KCk7XG5cblx0QE91dHB1dCgpXG5cdHB1YmxpYyBzdGFydDogRXZlbnRFbWl0dGVyPENoYW5nZUV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hhbmdlRXZlbnQ+KCk7XG5cdEBPdXRwdXQoKVxuXHRwdWJsaWMgdnNTdGFydDogRXZlbnRFbWl0dGVyPENoYW5nZUV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hhbmdlRXZlbnQ+KCk7XG5cblx0QE91dHB1dCgpXG5cdHB1YmxpYyBlbmQ6IEV2ZW50RW1pdHRlcjxDaGFuZ2VFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENoYW5nZUV2ZW50PigpO1xuXHRAT3V0cHV0KClcblx0cHVibGljIHZzRW5kOiBFdmVudEVtaXR0ZXI8Q2hhbmdlRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDaGFuZ2VFdmVudD4oKTtcblxuXHRAVmlld0NoaWxkKCdjb250ZW50JywgeyByZWFkOiBFbGVtZW50UmVmIH0pXG5cdHB1YmxpYyBjb250ZW50RWxlbWVudFJlZjogRWxlbWVudFJlZjtcblxuXHRAVmlld0NoaWxkKCdpbnZpc2libGVQYWRkaW5nJywgeyByZWFkOiBFbGVtZW50UmVmIH0pXG5cdHB1YmxpYyBpbnZpc2libGVQYWRkaW5nRWxlbWVudFJlZjogRWxlbWVudFJlZjtcblxuXHRAQ29udGVudENoaWxkKCdjb250YWluZXInLCB7IHJlYWQ6IEVsZW1lbnRSZWYgfSlcblx0cHVibGljIGNvbnRhaW5lckVsZW1lbnRSZWY6IEVsZW1lbnRSZWY7XG5cblx0cHVibGljIG5nT25Jbml0KCkge1xuXHRcdHRoaXMuYWRkU2Nyb2xsRXZlbnRIYW5kbGVycygpO1xuXHR9XG5cblx0cHVibGljIG5nT25EZXN0cm95KCkge1xuXHRcdHRoaXMucmVtb3ZlU2Nyb2xsRXZlbnRIYW5kbGVycygpO1xuXHRcdHRoaXMucmV2ZXJ0UGFyZW50T3ZlcnNjcm9sbCgpO1xuXHR9XG5cblx0cHVibGljIG5nT25DaGFuZ2VzKGNoYW5nZXM6IGFueSkge1xuXHRcdGxldCBpbmRleExlbmd0aENoYW5nZWQ6IGFueSA9IHRoaXMuY2FjaGVkSXRlbXNMZW5ndGggIT09IHRoaXMuaXRlbXMubGVuZ3RoO1xuXHRcdHRoaXMuY2FjaGVkSXRlbXNMZW5ndGggPSB0aGlzLml0ZW1zLmxlbmd0aDtcblxuXHRcdGNvbnN0IGZpcnN0UnVuOiBib29sZWFuID0gIWNoYW5nZXMuaXRlbXMgfHwgIWNoYW5nZXMuaXRlbXMucHJldmlvdXNWYWx1ZSB8fCBjaGFuZ2VzLml0ZW1zLnByZXZpb3VzVmFsdWUubGVuZ3RoID09PSAwO1xuXHRcdHRoaXMucmVmcmVzaF9pbnRlcm5hbChpbmRleExlbmd0aENoYW5nZWQgfHwgZmlyc3RSdW4pO1xuXHR9XG5cblx0cHVibGljIG5nRG9DaGVjaygpIHtcblx0XHRpZiAodGhpcy5jYWNoZWRJdGVtc0xlbmd0aCAhPT0gdGhpcy5pdGVtcy5sZW5ndGgpIHtcblx0XHRcdHRoaXMuY2FjaGVkSXRlbXNMZW5ndGggPSB0aGlzLml0ZW1zLmxlbmd0aDtcblx0XHRcdHRoaXMucmVmcmVzaF9pbnRlcm5hbCh0cnVlKTtcblx0XHR9XG5cdH1cblxuXHRwdWJsaWMgcmVmcmVzaCgpIHtcblx0XHR0aGlzLnJlZnJlc2hfaW50ZXJuYWwodHJ1ZSk7XG5cdH1cblxuXHRwdWJsaWMgc2Nyb2xsSW50byhpdGVtOiBhbnksIGFsaWduVG9CZWdpbm5pbmc6IGJvb2xlYW4gPSB0cnVlLCBhZGRpdGlvbmFsT2Zmc2V0OiBudW1iZXIgPSAwLCBhbmltYXRpb25NaWxsaXNlY29uZHM6IG51bWJlciA9IHVuZGVmaW5lZCwgYW5pbWF0aW9uQ29tcGxldGVkQ2FsbGJhY2s6ICgpID0+IHZvaWQgPSB1bmRlZmluZWQpIHtcblx0XHRsZXQgaW5kZXg6IG51bWJlciA9IHRoaXMuaXRlbXMuaW5kZXhPZihpdGVtKTtcblx0XHRpZiAoaW5kZXggPT09IC0xKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5zY3JvbGxUb0luZGV4KGluZGV4LCBhbGlnblRvQmVnaW5uaW5nLCBhZGRpdGlvbmFsT2Zmc2V0LCBhbmltYXRpb25NaWxsaXNlY29uZHMsIGFuaW1hdGlvbkNvbXBsZXRlZENhbGxiYWNrKTtcblx0fVxuXG5cdHB1YmxpYyBzY3JvbGxUb0luZGV4KGluZGV4OiBudW1iZXIsIGFsaWduVG9CZWdpbm5pbmc6IGJvb2xlYW4gPSB0cnVlLCBhZGRpdGlvbmFsT2Zmc2V0OiBudW1iZXIgPSAwLCBhbmltYXRpb25NaWxsaXNlY29uZHM6IG51bWJlciA9IHVuZGVmaW5lZCwgYW5pbWF0aW9uQ29tcGxldGVkQ2FsbGJhY2s6ICgpID0+IHZvaWQgPSB1bmRlZmluZWQpIHtcblx0XHRsZXQgbWF4UmV0cmllczogbnVtYmVyID0gNTtcblxuXHRcdGxldCByZXRyeUlmTmVlZGVkID0gKCkgPT4ge1xuXHRcdFx0LS1tYXhSZXRyaWVzO1xuXHRcdFx0aWYgKG1heFJldHJpZXMgPD0gMCkge1xuXHRcdFx0XHRpZiAoYW5pbWF0aW9uQ29tcGxldGVkQ2FsbGJhY2spIHtcblx0XHRcdFx0XHRhbmltYXRpb25Db21wbGV0ZWRDYWxsYmFjaygpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0bGV0IGRpbWVuc2lvbnM6IGFueSA9IHRoaXMuY2FsY3VsYXRlRGltZW5zaW9ucygpO1xuXHRcdFx0bGV0IGRlc2lyZWRTdGFydEluZGV4OiBhbnkgPSBNYXRoLm1pbihNYXRoLm1heChpbmRleCwgMCksIGRpbWVuc2lvbnMuaXRlbUNvdW50IC0gMSk7XG5cdFx0XHRpZiAodGhpcy5wcmV2aW91c1ZpZXdQb3J0LnN0YXJ0SW5kZXggPT09IGRlc2lyZWRTdGFydEluZGV4KSB7XG5cdFx0XHRcdGlmIChhbmltYXRpb25Db21wbGV0ZWRDYWxsYmFjaykge1xuXHRcdFx0XHRcdGFuaW1hdGlvbkNvbXBsZXRlZENhbGxiYWNrKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnNjcm9sbFRvSW5kZXhfaW50ZXJuYWwoaW5kZXgsIGFsaWduVG9CZWdpbm5pbmcsIGFkZGl0aW9uYWxPZmZzZXQsIDAsIHJldHJ5SWZOZWVkZWQpO1xuXHRcdH07XG5cblx0XHR0aGlzLnNjcm9sbFRvSW5kZXhfaW50ZXJuYWwoaW5kZXgsIGFsaWduVG9CZWdpbm5pbmcsIGFkZGl0aW9uYWxPZmZzZXQsIGFuaW1hdGlvbk1pbGxpc2Vjb25kcywgcmV0cnlJZk5lZWRlZCk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgc2Nyb2xsVG9JbmRleF9pbnRlcm5hbChpbmRleDogbnVtYmVyLCBhbGlnblRvQmVnaW5uaW5nOiBib29sZWFuID0gdHJ1ZSwgYWRkaXRpb25hbE9mZnNldDogbnVtYmVyID0gMCwgYW5pbWF0aW9uTWlsbGlzZWNvbmRzOiBudW1iZXIgPSB1bmRlZmluZWQsIGFuaW1hdGlvbkNvbXBsZXRlZENhbGxiYWNrOiAoKSA9PiB2b2lkID0gdW5kZWZpbmVkKSB7XG5cdFx0YW5pbWF0aW9uTWlsbGlzZWNvbmRzID0gYW5pbWF0aW9uTWlsbGlzZWNvbmRzID09PSB1bmRlZmluZWQgPyB0aGlzLnNjcm9sbEFuaW1hdGlvblRpbWUgOiBhbmltYXRpb25NaWxsaXNlY29uZHM7XG5cblx0XHRsZXQgc2Nyb2xsRWxlbWVudDogYW55ID0gdGhpcy5nZXRTY3JvbGxFbGVtZW50KCk7XG5cdFx0bGV0IG9mZnNldDogYW55ID0gdGhpcy5nZXRFbGVtZW50c09mZnNldCgpO1xuXG5cdFx0bGV0IGRpbWVuc2lvbnM6IGFueSA9IHRoaXMuY2FsY3VsYXRlRGltZW5zaW9ucygpO1xuXHRcdGxldCBzY3JvbGw6IGFueSA9IHRoaXMuY2FsY3VsYXRlUGFkZGluZyhpbmRleCwgZGltZW5zaW9ucywgZmFsc2UpICsgb2Zmc2V0ICsgYWRkaXRpb25hbE9mZnNldDtcblx0XHRpZiAoIWFsaWduVG9CZWdpbm5pbmcpIHtcblx0XHRcdHNjcm9sbCAtPSBkaW1lbnNpb25zLndyYXBHcm91cHNQZXJQYWdlICogZGltZW5zaW9uc1t0aGlzLl9jaGlsZFNjcm9sbERpbV07XG5cdFx0fVxuXG5cdFx0bGV0IGFuaW1hdGlvblJlcXVlc3Q6IG51bWJlcjtcblxuXG5cdFx0aWYgKCFhbmltYXRpb25NaWxsaXNlY29uZHMpIHtcblx0XHRcdHRoaXMucmVuZGVyZXIuc2V0UHJvcGVydHkoc2Nyb2xsRWxlbWVudCwgdGhpcy5fc2Nyb2xsVHlwZSwgc2Nyb2xsKTtcblx0XHRcdHRoaXMucmVmcmVzaF9pbnRlcm5hbChmYWxzZSwgYW5pbWF0aW9uQ29tcGxldGVkQ2FsbGJhY2spO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcblx0fVxuXG5cdGNvbnN0cnVjdG9yKHByb3RlY3RlZCByZWFkb25seSBlbGVtZW50OiBFbGVtZW50UmVmLCBwcm90ZWN0ZWQgcmVhZG9ubHkgcmVuZGVyZXI6IFJlbmRlcmVyMiwgcHJvdGVjdGVkIHJlYWRvbmx5IHpvbmU6IE5nWm9uZSkge1xuXHRcdHRoaXMuaG9yaXpvbnRhbCA9IGZhbHNlO1xuXHRcdHRoaXMuc2Nyb2xsVGhyb3R0bGluZ1RpbWUgPSAwO1xuXHRcdHRoaXMucmVzZXRXcmFwR3JvdXBEaW1lbnNpb25zKCk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgcHJldmlvdXNTY3JvbGxCb3VuZGluZ1JlY3Q6IENsaWVudFJlY3Q7XG5cdHByb3RlY3RlZCBjaGVja1Njcm9sbEVsZW1lbnRSZXNpemVkKCk6IHZvaWQge1xuXHRcdGxldCBib3VuZGluZ1JlY3Q6IGFueSA9IHRoaXMuZ2V0U2Nyb2xsRWxlbWVudCgpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG5cdFx0bGV0IHNpemVDaGFuZ2VkOiBib29sZWFuO1xuXHRcdGlmICghdGhpcy5wcmV2aW91c1Njcm9sbEJvdW5kaW5nUmVjdCkge1xuXHRcdFx0c2l6ZUNoYW5nZWQgPSB0cnVlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsZXQgd2lkdGhDaGFuZ2U6IGFueSA9IE1hdGguYWJzKGJvdW5kaW5nUmVjdC53aWR0aCAtIHRoaXMucHJldmlvdXNTY3JvbGxCb3VuZGluZ1JlY3Qud2lkdGgpO1xuXHRcdFx0bGV0IGhlaWdodENoYW5nZTogYW55ID0gTWF0aC5hYnMoYm91bmRpbmdSZWN0LmhlaWdodCAtIHRoaXMucHJldmlvdXNTY3JvbGxCb3VuZGluZ1JlY3QuaGVpZ2h0KTtcblx0XHRcdHNpemVDaGFuZ2VkID0gd2lkdGhDaGFuZ2UgPiB0aGlzLnJlc2l6ZUJ5cGFzc1JlZnJlc2hUaGVzaG9sZCB8fCBoZWlnaHRDaGFuZ2UgPiB0aGlzLnJlc2l6ZUJ5cGFzc1JlZnJlc2hUaGVzaG9sZDtcblx0XHR9XG5cblx0XHRpZiAoc2l6ZUNoYW5nZWQpIHtcblx0XHRcdHRoaXMucHJldmlvdXNTY3JvbGxCb3VuZGluZ1JlY3QgPSBib3VuZGluZ1JlY3Q7XG5cdFx0XHRpZiAoYm91bmRpbmdSZWN0LndpZHRoID4gMCAmJiBib3VuZGluZ1JlY3QuaGVpZ2h0ID4gMCkge1xuXHRcdFx0XHR0aGlzLnJlZnJlc2hfaW50ZXJuYWwoZmFsc2UpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHByb3RlY3RlZCBfaW52aXNpYmxlUGFkZGluZ1Byb3BlcnR5OiBhbnk7XG5cdHByb3RlY3RlZCBfb2Zmc2V0VHlwZTogYW55O1xuXHRwcm90ZWN0ZWQgX3Njcm9sbFR5cGU6IGFueTtcblx0cHJvdGVjdGVkIF9wYWdlT2Zmc2V0VHlwZTogYW55O1xuXHRwcm90ZWN0ZWQgX2NoaWxkU2Nyb2xsRGltOiBhbnk7XG5cdHByb3RlY3RlZCBfdHJhbnNsYXRlRGlyOiBhbnk7XG5cdHByb3RlY3RlZCBfbWFyZ2luRGlyOiBhbnk7XG5cdHByb3RlY3RlZCB1cGRhdGVEaXJlY3Rpb24oKTogdm9pZCB7XG5cdFx0aWYgKHRoaXMuaG9yaXpvbnRhbCkge1xuXHRcdFx0dGhpcy5faW52aXNpYmxlUGFkZGluZ1Byb3BlcnR5ID0gJ3dpZHRoJztcblx0XHRcdHRoaXMuX29mZnNldFR5cGUgPSAnb2Zmc2V0TGVmdCc7XG5cdFx0XHR0aGlzLl9wYWdlT2Zmc2V0VHlwZSA9ICdwYWdlWE9mZnNldCc7XG5cdFx0XHR0aGlzLl9jaGlsZFNjcm9sbERpbSA9ICdjaGlsZFdpZHRoJztcblx0XHRcdHRoaXMuX21hcmdpbkRpciA9ICdtYXJnaW4tbGVmdCc7XG5cdFx0XHR0aGlzLl90cmFuc2xhdGVEaXIgPSAndHJhbnNsYXRlWCc7XG5cdFx0XHR0aGlzLl9zY3JvbGxUeXBlID0gJ3Njcm9sbExlZnQnO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHRoaXMuX2ludmlzaWJsZVBhZGRpbmdQcm9wZXJ0eSA9ICdoZWlnaHQnO1xuXHRcdFx0dGhpcy5fb2Zmc2V0VHlwZSA9ICdvZmZzZXRUb3AnO1xuXHRcdFx0dGhpcy5fcGFnZU9mZnNldFR5cGUgPSAncGFnZVlPZmZzZXQnO1xuXHRcdFx0dGhpcy5fY2hpbGRTY3JvbGxEaW0gPSAnY2hpbGRIZWlnaHQnO1xuXHRcdFx0dGhpcy5fbWFyZ2luRGlyID0gJ21hcmdpbi10b3AnO1xuXHRcdFx0dGhpcy5fdHJhbnNsYXRlRGlyID0gJ3RyYW5zbGF0ZVknO1xuXHRcdFx0dGhpcy5fc2Nyb2xsVHlwZSA9ICdzY3JvbGxUb3AnO1xuXHRcdH1cblx0fVxuXG5cdHByb3RlY3RlZCByZWZyZXNoX3Rocm90dGxlZDogKCkgPT4gdm9pZDtcblxuXHRwcm90ZWN0ZWQgdGhyb3R0bGVUcmFpbGluZyhmdW5jOiBGdW5jdGlvbiwgd2FpdDogbnVtYmVyKTogRnVuY3Rpb24ge1xuXHRcdGxldCB0aW1lb3V0OiBhbnkgPSB1bmRlZmluZWQ7XG5cdFx0Y29uc3QgcmVzdWx0ID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0Y29uc3QgX3RoaXMgPSB0aGlzO1xuXHRcdFx0Y29uc3QgX2FyZ3VtZW50cyA9IGFyZ3VtZW50cztcblxuXHRcdFx0aWYgKHRpbWVvdXQpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAod2FpdCA8PSAwKSB7XG5cdFx0XHRcdGZ1bmMuYXBwbHkoX3RoaXMsIF9hcmd1bWVudHMpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHRpbWVvdXQgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0ZnVuYy5hcHBseShfdGhpcywgX2FyZ3VtZW50cyk7XG5cdFx0XHRcdH0sIHdhaXQpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIGNhbGN1bGF0ZWRTY3JvbGxiYXJXaWR0aDogbnVtYmVyID0gMDtcblx0cHJvdGVjdGVkIGNhbGN1bGF0ZWRTY3JvbGxiYXJIZWlnaHQ6IG51bWJlciA9IDA7XG5cblx0cHJvdGVjdGVkIHBhZGRpbmc6IG51bWJlciA9IDA7XG5cdHByb3RlY3RlZCBwcmV2aW91c1ZpZXdQb3J0OiBJVmlld3BvcnQgPSA8YW55Pnt9O1xuXHRwcm90ZWN0ZWQgY2FjaGVkSXRlbXNMZW5ndGg6IG51bWJlcjtcblxuXHRwcm90ZWN0ZWQgZGlzcG9zZVNjcm9sbEhhbmRsZXI6ICgpID0+IHZvaWQgfCB1bmRlZmluZWQ7XG5cdHByb3RlY3RlZCBkaXNwb3NlUmVzaXplSGFuZGxlcjogKCkgPT4gdm9pZCB8IHVuZGVmaW5lZDtcblxuXHRwcm90ZWN0ZWQgcmVmcmVzaF9pbnRlcm5hbChpdGVtc0FycmF5TW9kaWZpZWQ6IGJvb2xlYW4sIHJlZnJlc2hDb21wbGV0ZWRDYWxsYmFjazogKCkgPT4gdm9pZCA9IHVuZGVmaW5lZCwgbWF4UnVuVGltZXM6IG51bWJlciA9IDIpIHtcblx0XHQvL25vdGU6IG1heFJ1blRpbWVzIGlzIHRvIGZvcmNlIGl0IHRvIGtlZXAgcmVjYWxjdWxhdGluZyBpZiB0aGUgcHJldmlvdXMgaXRlcmF0aW9uIGNhdXNlZCBhIHJlLXJlbmRlciAoZGlmZmVyZW50IHNsaWNlZCBpdGVtcyBpbiB2aWV3cG9ydCBvciBzY3JvbGxQb3NpdGlvbiBjaGFuZ2VkKS5cblx0XHQvL1RoZSBkZWZhdWx0IG9mIDJ4IG1heCB3aWxsIHByb2JhYmx5IGJlIGFjY3VyYXRlIGVub3VnaCB3aXRob3V0IGNhdXNpbmcgdG9vIGxhcmdlIGEgcGVyZm9ybWFuY2UgYm90dGxlbmVja1xuXHRcdC8vVGhlIGNvZGUgd291bGQgdHlwaWNhbGx5IHF1aXQgb3V0IG9uIHRoZSAybmQgaXRlcmF0aW9uIGFueXdheXMuIFRoZSBtYWluIHRpbWUgaXQnZCB0aGluayBtb3JlIHRoYW4gMiBydW5zIHdvdWxkIGJlIG5lY2Vzc2FyeSB3b3VsZCBiZSBmb3IgdmFzdGx5IGRpZmZlcmVudCBzaXplZCBjaGlsZCBpdGVtcyBvciBpZiB0aGlzIGlzIHRoZSAxc3QgdGltZSB0aGUgaXRlbXMgYXJyYXkgd2FzIGluaXRpYWxpemVkLlxuXHRcdC8vV2l0aG91dCBtYXhSdW5UaW1lcywgSWYgdGhlIHVzZXIgaXMgYWN0aXZlbHkgc2Nyb2xsaW5nIHRoaXMgY29kZSB3b3VsZCBiZWNvbWUgYW4gaW5maW5pdGUgbG9vcCB1bnRpbCB0aGV5IHN0b3BwZWQgc2Nyb2xsaW5nLiBUaGlzIHdvdWxkIGJlIG9rYXksIGV4Y2VwdCBlYWNoIHNjcm9sbCBldmVudCB3b3VsZCBzdGFydCBhbiBhZGRpdGlvbmFsIGluZmludGUgbG9vcC4gV2Ugd2FudCB0byBzaG9ydC1jaXJjdWl0IGl0IHRvIHByZXZlbnQgaGlzLlxuXG5cdFx0dGhpcy56b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcblx0XHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG5cblx0XHRcdFx0aWYgKGl0ZW1zQXJyYXlNb2RpZmllZCkge1xuXHRcdFx0XHRcdHRoaXMucmVzZXRXcmFwR3JvdXBEaW1lbnNpb25zKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0bGV0IHZpZXdwb3J0OiBhbnkgPSB0aGlzLmNhbGN1bGF0ZVZpZXdwb3J0KCk7XG5cblx0XHRcdFx0bGV0IHN0YXJ0Q2hhbmdlZDogYW55ID0gaXRlbXNBcnJheU1vZGlmaWVkIHx8IHZpZXdwb3J0LnN0YXJ0SW5kZXggIT09IHRoaXMucHJldmlvdXNWaWV3UG9ydC5zdGFydEluZGV4O1xuXHRcdFx0XHRsZXQgZW5kQ2hhbmdlZDogYW55ID0gaXRlbXNBcnJheU1vZGlmaWVkIHx8IHZpZXdwb3J0LmVuZEluZGV4ICE9PSB0aGlzLnByZXZpb3VzVmlld1BvcnQuZW5kSW5kZXg7XG5cdFx0XHRcdGxldCBzY3JvbGxMZW5ndGhDaGFuZ2VkOiBhbnkgPSB2aWV3cG9ydC5zY3JvbGxMZW5ndGggIT09IHRoaXMucHJldmlvdXNWaWV3UG9ydC5zY3JvbGxMZW5ndGg7XG5cdFx0XHRcdGxldCBwYWRkaW5nQ2hhbmdlZDogYW55ID0gdmlld3BvcnQucGFkZGluZyAhPT0gdGhpcy5wcmV2aW91c1ZpZXdQb3J0LnBhZGRpbmc7XG5cblx0XHRcdFx0dGhpcy5wcmV2aW91c1ZpZXdQb3J0ID0gdmlld3BvcnQ7XG5cblx0XHRcdFx0aWYgKHNjcm9sbExlbmd0aENoYW5nZWQpIHtcblx0XHRcdFx0XHR0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHRoaXMuaW52aXNpYmxlUGFkZGluZ0VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgdGhpcy5faW52aXNpYmxlUGFkZGluZ1Byb3BlcnR5LCBgJHt2aWV3cG9ydC5zY3JvbGxMZW5ndGh9cHhgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChwYWRkaW5nQ2hhbmdlZCkge1xuXHRcdFx0XHRcdGlmICh0aGlzLnVzZU1hcmdpbkluc3RlYWRPZlRyYW5zbGF0ZSkge1xuXHRcdFx0XHRcdFx0dGhpcy5yZW5kZXJlci5zZXRTdHlsZSh0aGlzLmNvbnRlbnRFbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsIHRoaXMuX21hcmdpbkRpciwgYCR7dmlld3BvcnQucGFkZGluZ31weGApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdHRoaXMucmVuZGVyZXIuc2V0U3R5bGUodGhpcy5jb250ZW50RWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCAndHJhbnNmb3JtJywgYCR7dGhpcy5fdHJhbnNsYXRlRGlyfSgke3ZpZXdwb3J0LnBhZGRpbmd9cHgpYCk7XG5cdFx0XHRcdFx0XHR0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHRoaXMuY29udGVudEVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgJ3dlYmtpdFRyYW5zZm9ybScsIGAke3RoaXMuX3RyYW5zbGF0ZURpcn0oJHt2aWV3cG9ydC5wYWRkaW5nfXB4KWApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBlbWl0SW5kZXhDaGFuZ2VkRXZlbnRzOiBhbnkgPSB0cnVlOyAvLyBtYXhSZVJ1blRpbWVzID09PSAxICh3b3VsZCBuZWVkIHRvIHN0aWxsIHJ1biBpZiBkaWRuJ3QgdXBkYXRlIGlmIHByZXZpb3VzIGl0ZXJhdGlvbiBoYWQgdXBkYXRlZClcblxuXHRcdFx0XHRpZiAoc3RhcnRDaGFuZ2VkIHx8IGVuZENoYW5nZWQpIHtcblx0XHRcdFx0XHR0aGlzLnpvbmUucnVuKCgpID0+IHtcblxuXHRcdFx0XHRcdFx0Ly8gdXBkYXRlIHRoZSBzY3JvbGwgbGlzdCB0byB0cmlnZ2VyIHJlLXJlbmRlciBvZiBjb21wb25lbnRzIGluIHZpZXdwb3J0XG5cdFx0XHRcdFx0XHR0aGlzLnZpZXdQb3J0SXRlbXMgPSB2aWV3cG9ydC5zdGFydEluZGV4V2l0aEJ1ZmZlciA+PSAwICYmIHZpZXdwb3J0LmVuZEluZGV4V2l0aEJ1ZmZlciA+PSAwID8gdGhpcy5pdGVtcy5zbGljZSh2aWV3cG9ydC5zdGFydEluZGV4V2l0aEJ1ZmZlciwgdmlld3BvcnQuZW5kSW5kZXhXaXRoQnVmZmVyICsgMSkgOiBbXTtcblx0XHRcdFx0XHRcdHRoaXMudXBkYXRlLmVtaXQodGhpcy52aWV3UG9ydEl0ZW1zKTtcblx0XHRcdFx0XHRcdHRoaXMudnNVcGRhdGUuZW1pdCh0aGlzLnZpZXdQb3J0SXRlbXMpO1xuXG5cdFx0XHRcdFx0XHRpZiAoZW1pdEluZGV4Q2hhbmdlZEV2ZW50cykge1xuXHRcdFx0XHRcdFx0XHRpZiAoc3RhcnRDaGFuZ2VkKSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5zdGFydC5lbWl0KHsgc3RhcnQ6IHZpZXdwb3J0LnN0YXJ0SW5kZXgsIGVuZDogdmlld3BvcnQuZW5kSW5kZXggfSk7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy52c1N0YXJ0LmVtaXQoeyBzdGFydDogdmlld3BvcnQuc3RhcnRJbmRleCwgZW5kOiB2aWV3cG9ydC5lbmRJbmRleCB9KTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChlbmRDaGFuZ2VkKSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5lbmQuZW1pdCh7IHN0YXJ0OiB2aWV3cG9ydC5zdGFydEluZGV4LCBlbmQ6IHZpZXdwb3J0LmVuZEluZGV4IH0pO1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMudnNFbmQuZW1pdCh7IHN0YXJ0OiB2aWV3cG9ydC5zdGFydEluZGV4LCBlbmQ6IHZpZXdwb3J0LmVuZEluZGV4IH0pO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKHN0YXJ0Q2hhbmdlZCB8fCBlbmRDaGFuZ2VkKSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5jaGFuZ2UuZW1pdCh7IHN0YXJ0OiB2aWV3cG9ydC5zdGFydEluZGV4LCBlbmQ6IHZpZXdwb3J0LmVuZEluZGV4IH0pO1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMudnNDaGFuZ2UuZW1pdCh7IHN0YXJ0OiB2aWV3cG9ydC5zdGFydEluZGV4LCBlbmQ6IHZpZXdwb3J0LmVuZEluZGV4IH0pO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmIChtYXhSdW5UaW1lcyA+IDApIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5yZWZyZXNoX2ludGVybmFsKGZhbHNlLCByZWZyZXNoQ29tcGxldGVkQ2FsbGJhY2ssIG1heFJ1blRpbWVzIC0gMSk7XG5cdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYgKHJlZnJlc2hDb21wbGV0ZWRDYWxsYmFjaykge1xuXHRcdFx0XHRcdFx0XHRyZWZyZXNoQ29tcGxldGVkQ2FsbGJhY2soKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRpZiAobWF4UnVuVGltZXMgPiAwICYmIChzY3JvbGxMZW5ndGhDaGFuZ2VkIHx8IHBhZGRpbmdDaGFuZ2VkKSkge1xuXHRcdFx0XHRcdFx0dGhpcy5yZWZyZXNoX2ludGVybmFsKGZhbHNlLCByZWZyZXNoQ29tcGxldGVkQ2FsbGJhY2ssIG1heFJ1blRpbWVzIC0gMSk7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKHJlZnJlc2hDb21wbGV0ZWRDYWxsYmFjaykge1xuXHRcdFx0XHRcdFx0cmVmcmVzaENvbXBsZXRlZENhbGxiYWNrKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxuXG5cdHByb3RlY3RlZCBnZXRTY3JvbGxFbGVtZW50KCk6IGFueSB7XG5cdFx0cmV0dXJuIHRoaXMucGFyZW50U2Nyb2xsIGluc3RhbmNlb2YgV2luZG93ID8gZG9jdW1lbnQuc2Nyb2xsaW5nRWxlbWVudCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keSA6IHRoaXMucGFyZW50U2Nyb2xsIHx8IHRoaXMuZWxlbWVudC5uYXRpdmVFbGVtZW50O1xuXHR9XG5cblx0cHJvdGVjdGVkIGFkZFNjcm9sbEV2ZW50SGFuZGxlcnMoKSB7XG5cdFx0bGV0IHNjcm9sbEVsZW1lbnQ6IGFueSA9IHRoaXMuZ2V0U2Nyb2xsRWxlbWVudCgpO1xuXG5cdFx0dGhpcy5yZW1vdmVTY3JvbGxFdmVudEhhbmRsZXJzKCk7XG5cblx0XHR0aGlzLnpvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuXHRcdFx0aWYgKHRoaXMucGFyZW50U2Nyb2xsIGluc3RhbmNlb2YgV2luZG93KSB7XG5cdFx0XHRcdHRoaXMuZGlzcG9zZVNjcm9sbEhhbmRsZXIgPSB0aGlzLnJlbmRlcmVyLmxpc3Rlbignd2luZG93JywgJ3Njcm9sbCcsIHRoaXMucmVmcmVzaF90aHJvdHRsZWQpO1xuXHRcdFx0XHR0aGlzLmRpc3Bvc2VSZXNpemVIYW5kbGVyID0gdGhpcy5yZW5kZXJlci5saXN0ZW4oJ3dpbmRvdycsICdyZXNpemUnLCB0aGlzLnJlZnJlc2hfdGhyb3R0bGVkKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR0aGlzLmRpc3Bvc2VTY3JvbGxIYW5kbGVyID0gdGhpcy5yZW5kZXJlci5saXN0ZW4oc2Nyb2xsRWxlbWVudCwgJ3Njcm9sbCcsIHRoaXMucmVmcmVzaF90aHJvdHRsZWQpO1xuXHRcdFx0XHRpZiAodGhpcy5fY2hlY2tSZXNpemVJbnRlcnZhbCA+IDApIHtcblx0XHRcdFx0XHR0aGlzLmNoZWNrU2Nyb2xsRWxlbWVudFJlc2l6ZWRUaW1lciA9IDxhbnk+c2V0SW50ZXJ2YWwoKCkgPT4geyB0aGlzLmNoZWNrU2Nyb2xsRWxlbWVudFJlc2l6ZWQoKTsgfSwgdGhpcy5fY2hlY2tSZXNpemVJbnRlcnZhbCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHByb3RlY3RlZCByZW1vdmVTY3JvbGxFdmVudEhhbmRsZXJzKCkge1xuXHRcdGlmICh0aGlzLmNoZWNrU2Nyb2xsRWxlbWVudFJlc2l6ZWRUaW1lcikge1xuXHRcdFx0Y2xlYXJJbnRlcnZhbCh0aGlzLmNoZWNrU2Nyb2xsRWxlbWVudFJlc2l6ZWRUaW1lcik7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuZGlzcG9zZVNjcm9sbEhhbmRsZXIpIHtcblx0XHRcdHRoaXMuZGlzcG9zZVNjcm9sbEhhbmRsZXIoKTtcblx0XHRcdHRoaXMuZGlzcG9zZVNjcm9sbEhhbmRsZXIgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuZGlzcG9zZVJlc2l6ZUhhbmRsZXIpIHtcblx0XHRcdHRoaXMuZGlzcG9zZVJlc2l6ZUhhbmRsZXIoKTtcblx0XHRcdHRoaXMuZGlzcG9zZVJlc2l6ZUhhbmRsZXIgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9XG5cblx0cHJvdGVjdGVkIGdldEVsZW1lbnRzT2Zmc2V0KCk6IG51bWJlciB7XG5cdFx0bGV0IG9mZnNldDogYW55ID0gMDtcblxuXHRcdGlmICh0aGlzLmNvbnRhaW5lckVsZW1lbnRSZWYgJiYgdGhpcy5jb250YWluZXJFbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpIHtcblx0XHRcdG9mZnNldCArPSB0aGlzLmNvbnRhaW5lckVsZW1lbnRSZWYubmF0aXZlRWxlbWVudFt0aGlzLl9vZmZzZXRUeXBlXTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5wYXJlbnRTY3JvbGwpIHtcblx0XHRcdGxldCBzY3JvbGxFbGVtZW50OiBhbnkgPSB0aGlzLmdldFNjcm9sbEVsZW1lbnQoKTtcblx0XHRcdGxldCBlbGVtZW50Q2xpZW50UmVjdDogYW55ID0gdGhpcy5lbGVtZW50Lm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdFx0XHRsZXQgc2Nyb2xsQ2xpZW50UmVjdDogYW55ID0gc2Nyb2xsRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0XHRcdGlmICh0aGlzLmhvcml6b250YWwpIHtcblx0XHRcdFx0b2Zmc2V0ICs9IGVsZW1lbnRDbGllbnRSZWN0LmxlZnQgLSBzY3JvbGxDbGllbnRSZWN0LmxlZnQ7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0b2Zmc2V0ICs9IGVsZW1lbnRDbGllbnRSZWN0LnRvcCAtIHNjcm9sbENsaWVudFJlY3QudG9wO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoISh0aGlzLnBhcmVudFNjcm9sbCBpbnN0YW5jZW9mIFdpbmRvdykpIHtcblx0XHRcdFx0b2Zmc2V0ICs9IHNjcm9sbEVsZW1lbnRbdGhpcy5fc2Nyb2xsVHlwZV07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9mZnNldDtcblx0fVxuXG5cdHByb3RlY3RlZCBjb3VudEl0ZW1zUGVyV3JhcEdyb3VwKCkge1xuXHRcdGxldCBwcm9wZXJ0eU5hbWU6IGFueSA9IHRoaXMuaG9yaXpvbnRhbCA/ICdvZmZzZXRMZWZ0JyA6ICdvZmZzZXRUb3AnO1xuXHRcdGxldCBjaGlsZHJlbjogYW55ID0gKCh0aGlzLmNvbnRhaW5lckVsZW1lbnRSZWYgJiYgdGhpcy5jb250YWluZXJFbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpIHx8IHRoaXMuY29udGVudEVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkuY2hpbGRyZW47XG5cblx0XHRsZXQgY2hpbGRyZW5MZW5ndGg6IGFueSA9IGNoaWxkcmVuID8gY2hpbGRyZW4ubGVuZ3RoIDogMDtcblx0XHRpZiAoY2hpbGRyZW5MZW5ndGggPT09IDApIHtcblx0XHRcdHJldHVybiAxO1xuXHRcdH1cblxuXHRcdGxldCBmaXJzdE9mZnNldDogYW55ID0gY2hpbGRyZW5bMF1bcHJvcGVydHlOYW1lXTtcblx0XHRsZXQgcmVzdWx0OiBhbnkgPSAxO1xuXHRcdHdoaWxlIChyZXN1bHQgPCBjaGlsZHJlbkxlbmd0aCAmJiBmaXJzdE9mZnNldCA9PT0gY2hpbGRyZW5bcmVzdWx0XVtwcm9wZXJ0eU5hbWVdKSB7XG5cdFx0XHQrK3Jlc3VsdDtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIGdldFNjcm9sbFBvc2l0aW9uKCk6IG51bWJlciB7XG5cdFx0bGV0IHdpbmRvd1Njcm9sbFZhbHVlOiBudW1iZXIgPSB1bmRlZmluZWQ7XG5cdFx0aWYgKHRoaXMucGFyZW50U2Nyb2xsIGluc3RhbmNlb2YgV2luZG93KSB7XG5cdFx0XHR2YXIgd2luZG93OiBhbnk7XG5cdFx0XHR3aW5kb3dTY3JvbGxWYWx1ZSA9IHdpbmRvd1t0aGlzLl9wYWdlT2Zmc2V0VHlwZV07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHdpbmRvd1Njcm9sbFZhbHVlIHx8IHRoaXMuZ2V0U2Nyb2xsRWxlbWVudCgpW3RoaXMuX3Njcm9sbFR5cGVdIHx8IDA7XG5cdH1cblxuXHRwcm90ZWN0ZWQgbWluTWVhc3VyZWRDaGlsZFdpZHRoOiBudW1iZXI7XG5cdHByb3RlY3RlZCBtaW5NZWFzdXJlZENoaWxkSGVpZ2h0OiBudW1iZXI7XG5cblx0cHJvdGVjdGVkIHdyYXBHcm91cERpbWVuc2lvbnM6IGFueTtcblxuXHRwcm90ZWN0ZWQgcmVzZXRXcmFwR3JvdXBEaW1lbnNpb25zKCk6IHZvaWQge1xuXHRcdGNvbnN0IG9sZFdyYXBHcm91cERpbWVuc2lvbnMgPSB0aGlzLndyYXBHcm91cERpbWVuc2lvbnM7XG5cdFx0dGhpcy53cmFwR3JvdXBEaW1lbnNpb25zID0ge1xuXHRcdFx0bWF4Q2hpbGRTaXplUGVyV3JhcEdyb3VwOiBbXSxcblx0XHRcdG51bWJlck9mS25vd25XcmFwR3JvdXBDaGlsZFNpemVzOiAwLFxuXHRcdFx0c3VtT2ZLbm93bldyYXBHcm91cENoaWxkV2lkdGhzOiAwLFxuXHRcdFx0c3VtT2ZLbm93bldyYXBHcm91cENoaWxkSGVpZ2h0czogMFxuXHRcdH07XG5cblx0XHRpZiAoIXRoaXMuZW5hYmxlVW5lcXVhbENoaWxkcmVuU2l6ZXMgfHwgIW9sZFdyYXBHcm91cERpbWVuc2lvbnMgfHwgb2xkV3JhcEdyb3VwRGltZW5zaW9ucy5udW1iZXJPZktub3duV3JhcEdyb3VwQ2hpbGRTaXplcyA9PT0gMCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGNvbnN0IGl0ZW1zUGVyV3JhcEdyb3VwOiBudW1iZXIgPSB0aGlzLmNvdW50SXRlbXNQZXJXcmFwR3JvdXAoKTtcblx0XHRmb3IgKGxldCB3cmFwR3JvdXBJbmRleDogYW55ID0gMDsgd3JhcEdyb3VwSW5kZXggPCBvbGRXcmFwR3JvdXBEaW1lbnNpb25zLm1heENoaWxkU2l6ZVBlcldyYXBHcm91cC5sZW5ndGg7ICsrd3JhcEdyb3VwSW5kZXgpIHtcblx0XHRcdGNvbnN0IG9sZFdyYXBHcm91cERpbWVuc2lvbjogV3JhcEdyb3VwRGltZW5zaW9uID0gb2xkV3JhcEdyb3VwRGltZW5zaW9ucy5tYXhDaGlsZFNpemVQZXJXcmFwR3JvdXBbd3JhcEdyb3VwSW5kZXhdO1xuXHRcdFx0aWYgKCFvbGRXcmFwR3JvdXBEaW1lbnNpb24gfHwgIW9sZFdyYXBHcm91cERpbWVuc2lvbi5pdGVtcyB8fCAhb2xkV3JhcEdyb3VwRGltZW5zaW9uLml0ZW1zLmxlbmd0aCkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG9sZFdyYXBHcm91cERpbWVuc2lvbi5pdGVtcy5sZW5ndGggIT09IGl0ZW1zUGVyV3JhcEdyb3VwKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0bGV0IGl0ZW1zQ2hhbmdlZDogYW55ID0gZmFsc2U7XG5cdFx0XHRsZXQgYXJyYXlTdGFydEluZGV4OiBhbnkgPSBpdGVtc1BlcldyYXBHcm91cCAqIHdyYXBHcm91cEluZGV4O1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBpdGVtc1BlcldyYXBHcm91cDsgKytpKSB7XG5cdFx0XHRcdGlmICghdGhpcy5jb21wYXJlSXRlbXMob2xkV3JhcEdyb3VwRGltZW5zaW9uLml0ZW1zW2ldLCB0aGlzLml0ZW1zW2FycmF5U3RhcnRJbmRleCArIGldKSkge1xuXHRcdFx0XHRcdGl0ZW1zQ2hhbmdlZCA9IHRydWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKCFpdGVtc0NoYW5nZWQpIHtcblx0XHRcdFx0Kyt0aGlzLndyYXBHcm91cERpbWVuc2lvbnMubnVtYmVyT2ZLbm93bldyYXBHcm91cENoaWxkU2l6ZXM7XG5cdFx0XHRcdHRoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5zdW1PZktub3duV3JhcEdyb3VwQ2hpbGRXaWR0aHMgKz0gb2xkV3JhcEdyb3VwRGltZW5zaW9uLmNoaWxkV2lkdGggfHwgMDtcblx0XHRcdFx0dGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLnN1bU9mS25vd25XcmFwR3JvdXBDaGlsZEhlaWdodHMgKz0gb2xkV3JhcEdyb3VwRGltZW5zaW9uLmNoaWxkSGVpZ2h0IHx8IDA7XG5cdFx0XHRcdHRoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5tYXhDaGlsZFNpemVQZXJXcmFwR3JvdXBbd3JhcEdyb3VwSW5kZXhdID0gb2xkV3JhcEdyb3VwRGltZW5zaW9uO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHByb3RlY3RlZCBjYWxjdWxhdGVEaW1lbnNpb25zKCk6IElEaW1lbnNpb25zIHtcblx0XHRsZXQgc2Nyb2xsRWxlbWVudDogYW55ID0gdGhpcy5nZXRTY3JvbGxFbGVtZW50KCk7XG5cdFx0bGV0IGl0ZW1Db3VudDogYW55ID0gdGhpcy5pdGVtcy5sZW5ndGg7XG5cblx0XHRjb25zdCBtYXhDYWxjdWxhdGVkU2Nyb2xsQmFyU2l6ZTogbnVtYmVyID0gMjU7IC8vIE5vdGU6IEZvcm11bGEgdG8gYXV0by1jYWxjdWxhdGUgZG9lc24ndCB3b3JrIGZvciBQYXJlbnRTY3JvbGwsIHNvIHdlIGRlZmF1bHQgdG8gdGhpcyBpZiBub3Qgc2V0IGJ5IGNvbnN1bWluZyBhcHBsaWNhdGlvblxuXHRcdHRoaXMuY2FsY3VsYXRlZFNjcm9sbGJhckhlaWdodCA9IE1hdGgubWF4KE1hdGgubWluKHNjcm9sbEVsZW1lbnQub2Zmc2V0SGVpZ2h0IC0gc2Nyb2xsRWxlbWVudC5jbGllbnRIZWlnaHQsIG1heENhbGN1bGF0ZWRTY3JvbGxCYXJTaXplKSwgdGhpcy5jYWxjdWxhdGVkU2Nyb2xsYmFySGVpZ2h0KTtcblx0XHR0aGlzLmNhbGN1bGF0ZWRTY3JvbGxiYXJXaWR0aCA9IE1hdGgubWF4KE1hdGgubWluKHNjcm9sbEVsZW1lbnQub2Zmc2V0V2lkdGggLSBzY3JvbGxFbGVtZW50LmNsaWVudFdpZHRoLCBtYXhDYWxjdWxhdGVkU2Nyb2xsQmFyU2l6ZSksIHRoaXMuY2FsY3VsYXRlZFNjcm9sbGJhcldpZHRoKTtcblxuXHRcdGxldCB2aWV3V2lkdGg6IGFueSA9IHNjcm9sbEVsZW1lbnQub2Zmc2V0V2lkdGggLSAodGhpcy5zY3JvbGxiYXJXaWR0aCB8fCB0aGlzLmNhbGN1bGF0ZWRTY3JvbGxiYXJXaWR0aCB8fCAodGhpcy5ob3Jpem9udGFsID8gMCA6IG1heENhbGN1bGF0ZWRTY3JvbGxCYXJTaXplKSk7XG5cdFx0bGV0IHZpZXdIZWlnaHQ6IGFueSA9IHNjcm9sbEVsZW1lbnQub2Zmc2V0SGVpZ2h0IC0gKHRoaXMuc2Nyb2xsYmFySGVpZ2h0IHx8IHRoaXMuY2FsY3VsYXRlZFNjcm9sbGJhckhlaWdodCB8fCAodGhpcy5ob3Jpem9udGFsID8gbWF4Q2FsY3VsYXRlZFNjcm9sbEJhclNpemUgOiAwKSk7XG5cblx0XHRsZXQgY29udGVudDogYW55ID0gKHRoaXMuY29udGFpbmVyRWxlbWVudFJlZiAmJiB0aGlzLmNvbnRhaW5lckVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkgfHwgdGhpcy5jb250ZW50RWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuXG5cdFx0bGV0IGl0ZW1zUGVyV3JhcEdyb3VwOiBhbnkgPSB0aGlzLmNvdW50SXRlbXNQZXJXcmFwR3JvdXAoKTtcblx0XHRsZXQgd3JhcEdyb3Vwc1BlclBhZ2U6IGFueTtcblxuXHRcdGxldCBkZWZhdWx0Q2hpbGRXaWR0aDogYW55O1xuXHRcdGxldCBkZWZhdWx0Q2hpbGRIZWlnaHQ6IGFueTtcblxuXHRcdGlmICghdGhpcy5lbmFibGVVbmVxdWFsQ2hpbGRyZW5TaXplcykge1xuXHRcdFx0aWYgKGNvbnRlbnQuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRpZiAoIXRoaXMuY2hpbGRXaWR0aCB8fCAhdGhpcy5jaGlsZEhlaWdodCkge1xuXHRcdFx0XHRcdGlmICghdGhpcy5taW5NZWFzdXJlZENoaWxkV2lkdGggJiYgdmlld1dpZHRoID4gMCkge1xuXHRcdFx0XHRcdFx0dGhpcy5taW5NZWFzdXJlZENoaWxkV2lkdGggPSB2aWV3V2lkdGg7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmICghdGhpcy5taW5NZWFzdXJlZENoaWxkSGVpZ2h0ICYmIHZpZXdIZWlnaHQgPiAwKSB7XG5cdFx0XHRcdFx0XHR0aGlzLm1pbk1lYXN1cmVkQ2hpbGRIZWlnaHQgPSB2aWV3SGVpZ2h0O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBjaGlsZDogYW55ID0gY29udGVudC5jaGlsZHJlblswXTtcblx0XHRcdFx0bGV0IGNsaWVudFJlY3Q6IGFueSA9IGNoaWxkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0XHR0aGlzLm1pbk1lYXN1cmVkQ2hpbGRXaWR0aCA9IE1hdGgubWluKHRoaXMubWluTWVhc3VyZWRDaGlsZFdpZHRoLCBjbGllbnRSZWN0LndpZHRoKTtcblx0XHRcdFx0dGhpcy5taW5NZWFzdXJlZENoaWxkSGVpZ2h0ID0gTWF0aC5taW4odGhpcy5taW5NZWFzdXJlZENoaWxkSGVpZ2h0LCBjbGllbnRSZWN0LmhlaWdodCk7XG5cdFx0XHR9XG5cblx0XHRcdGRlZmF1bHRDaGlsZFdpZHRoID0gdGhpcy5jaGlsZFdpZHRoIHx8IHRoaXMubWluTWVhc3VyZWRDaGlsZFdpZHRoIHx8IHZpZXdXaWR0aDtcblx0XHRcdGRlZmF1bHRDaGlsZEhlaWdodCA9IHRoaXMuY2hpbGRIZWlnaHQgfHwgdGhpcy5taW5NZWFzdXJlZENoaWxkSGVpZ2h0IHx8IHZpZXdIZWlnaHQ7XG5cdFx0XHRsZXQgaXRlbXNQZXJSb3c6IGFueSA9IE1hdGgubWF4KE1hdGguY2VpbCh2aWV3V2lkdGggLyBkZWZhdWx0Q2hpbGRXaWR0aCksIDEpO1xuXHRcdFx0bGV0IGl0ZW1zUGVyQ29sOiBhbnkgPSBNYXRoLm1heChNYXRoLmNlaWwodmlld0hlaWdodCAvIGRlZmF1bHRDaGlsZEhlaWdodCksIDEpO1xuXHRcdFx0d3JhcEdyb3Vwc1BlclBhZ2UgPSB0aGlzLmhvcml6b250YWwgPyBpdGVtc1BlclJvdyA6IGl0ZW1zUGVyQ29sO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsZXQgc2Nyb2xsT2Zmc2V0OiBhbnkgPSBzY3JvbGxFbGVtZW50W3RoaXMuX3Njcm9sbFR5cGVdIC0gKHRoaXMucHJldmlvdXNWaWV3UG9ydCA/IHRoaXMucHJldmlvdXNWaWV3UG9ydC5wYWRkaW5nIDogMCk7XG5cdFx0XHRcblx0XHRcdGxldCBhcnJheVN0YXJ0SW5kZXg6IGFueSA9IHRoaXMucHJldmlvdXNWaWV3UG9ydC5zdGFydEluZGV4V2l0aEJ1ZmZlciB8fCAwO1xuXHRcdFx0bGV0IHdyYXBHcm91cEluZGV4OiBhbnkgPSBNYXRoLmNlaWwoYXJyYXlTdGFydEluZGV4IC8gaXRlbXNQZXJXcmFwR3JvdXApO1xuXG5cdFx0XHRsZXQgbWF4V2lkdGhGb3JXcmFwR3JvdXA6IGFueSA9IDA7XG5cdFx0XHRsZXQgbWF4SGVpZ2h0Rm9yV3JhcEdyb3VwOiBhbnkgPSAwO1xuXHRcdFx0bGV0IHN1bU9mVmlzaWJsZU1heFdpZHRoczogYW55ID0gMDtcblx0XHRcdGxldCBzdW1PZlZpc2libGVNYXhIZWlnaHRzOiBhbnkgPSAwO1xuXHRcdFx0d3JhcEdyb3Vwc1BlclBhZ2UgPSAwO1xuXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGNvbnRlbnQuY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcblx0XHRcdFx0KythcnJheVN0YXJ0SW5kZXg7XG5cdFx0XHRcdGxldCBjaGlsZDogYW55ID0gY29udGVudC5jaGlsZHJlbltpXTtcblx0XHRcdFx0bGV0IGNsaWVudFJlY3Q6IGFueSA9IGNoaWxkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG5cdFx0XHRcdG1heFdpZHRoRm9yV3JhcEdyb3VwID0gTWF0aC5tYXgobWF4V2lkdGhGb3JXcmFwR3JvdXAsIGNsaWVudFJlY3Qud2lkdGgpO1xuXHRcdFx0XHRtYXhIZWlnaHRGb3JXcmFwR3JvdXAgPSBNYXRoLm1heChtYXhIZWlnaHRGb3JXcmFwR3JvdXAsIGNsaWVudFJlY3QuaGVpZ2h0KTtcblxuXHRcdFx0XHRpZiAoYXJyYXlTdGFydEluZGV4ICUgaXRlbXNQZXJXcmFwR3JvdXAgPT09IDApIHtcblx0XHRcdFx0XHRsZXQgb2xkVmFsdWU6IGFueSA9IHRoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5tYXhDaGlsZFNpemVQZXJXcmFwR3JvdXBbd3JhcEdyb3VwSW5kZXhdO1xuXHRcdFx0XHRcdGlmIChvbGRWYWx1ZSkge1xuXHRcdFx0XHRcdFx0LS10aGlzLndyYXBHcm91cERpbWVuc2lvbnMubnVtYmVyT2ZLbm93bldyYXBHcm91cENoaWxkU2l6ZXM7XG5cdFx0XHRcdFx0XHR0aGlzLndyYXBHcm91cERpbWVuc2lvbnMuc3VtT2ZLbm93bldyYXBHcm91cENoaWxkV2lkdGhzIC09IG9sZFZhbHVlLmNoaWxkV2lkdGggfHwgMDtcblx0XHRcdFx0XHRcdHRoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5zdW1PZktub3duV3JhcEdyb3VwQ2hpbGRIZWlnaHRzIC09IG9sZFZhbHVlLmNoaWxkSGVpZ2h0IHx8IDA7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Kyt0aGlzLndyYXBHcm91cERpbWVuc2lvbnMubnVtYmVyT2ZLbm93bldyYXBHcm91cENoaWxkU2l6ZXM7XG5cdFx0XHRcdFx0Y29uc3QgaXRlbXMgPSB0aGlzLml0ZW1zLnNsaWNlKGFycmF5U3RhcnRJbmRleCAtIGl0ZW1zUGVyV3JhcEdyb3VwLCBhcnJheVN0YXJ0SW5kZXgpO1xuXHRcdFx0XHRcdHRoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5tYXhDaGlsZFNpemVQZXJXcmFwR3JvdXBbd3JhcEdyb3VwSW5kZXhdID0ge1xuXHRcdFx0XHRcdFx0Y2hpbGRXaWR0aDogbWF4V2lkdGhGb3JXcmFwR3JvdXAsXG5cdFx0XHRcdFx0XHRjaGlsZEhlaWdodDogbWF4SGVpZ2h0Rm9yV3JhcEdyb3VwLFxuXHRcdFx0XHRcdFx0aXRlbXM6IGl0ZW1zXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHR0aGlzLndyYXBHcm91cERpbWVuc2lvbnMuc3VtT2ZLbm93bldyYXBHcm91cENoaWxkV2lkdGhzICs9IG1heFdpZHRoRm9yV3JhcEdyb3VwO1xuXHRcdFx0XHRcdHRoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5zdW1PZktub3duV3JhcEdyb3VwQ2hpbGRIZWlnaHRzICs9IG1heEhlaWdodEZvcldyYXBHcm91cDtcblxuXHRcdFx0XHRcdGlmICh0aGlzLmhvcml6b250YWwpIHtcblx0XHRcdFx0XHRcdGxldCBtYXhWaXNpYmxlV2lkdGhGb3JXcmFwR3JvdXA6IGFueSA9IE1hdGgubWluKG1heFdpZHRoRm9yV3JhcEdyb3VwLCBNYXRoLm1heCh2aWV3V2lkdGggLSBzdW1PZlZpc2libGVNYXhXaWR0aHMsIDApKTtcblx0XHRcdFx0XHRcdGlmIChzY3JvbGxPZmZzZXQgPiAwKSB7XG5cdFx0XHRcdFx0XHRcdGxldCBzY3JvbGxPZmZzZXRUb1JlbW92ZTogYW55ID0gTWF0aC5taW4oc2Nyb2xsT2Zmc2V0LCBtYXhWaXNpYmxlV2lkdGhGb3JXcmFwR3JvdXApO1xuXHRcdFx0XHRcdFx0XHRtYXhWaXNpYmxlV2lkdGhGb3JXcmFwR3JvdXAgLT0gc2Nyb2xsT2Zmc2V0VG9SZW1vdmU7XG5cdFx0XHRcdFx0XHRcdHNjcm9sbE9mZnNldCAtPSBzY3JvbGxPZmZzZXRUb1JlbW92ZTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0c3VtT2ZWaXNpYmxlTWF4V2lkdGhzICs9IG1heFZpc2libGVXaWR0aEZvcldyYXBHcm91cDtcblx0XHRcdFx0XHRcdGlmIChtYXhWaXNpYmxlV2lkdGhGb3JXcmFwR3JvdXAgPiAwICYmIHZpZXdXaWR0aCA+PSBzdW1PZlZpc2libGVNYXhXaWR0aHMpIHtcblx0XHRcdFx0XHRcdFx0Kyt3cmFwR3JvdXBzUGVyUGFnZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0bGV0IG1heFZpc2libGVIZWlnaHRGb3JXcmFwR3JvdXA6IGFueSA9IE1hdGgubWluKG1heEhlaWdodEZvcldyYXBHcm91cCwgTWF0aC5tYXgodmlld0hlaWdodCAtIHN1bU9mVmlzaWJsZU1heEhlaWdodHMsIDApKTtcblx0XHRcdFx0XHRcdGlmIChzY3JvbGxPZmZzZXQgPiAwKSB7XG5cdFx0XHRcdFx0XHRcdGxldCBzY3JvbGxPZmZzZXRUb1JlbW92ZTogYW55ID0gTWF0aC5taW4oc2Nyb2xsT2Zmc2V0LCBtYXhWaXNpYmxlSGVpZ2h0Rm9yV3JhcEdyb3VwKTtcblx0XHRcdFx0XHRcdFx0bWF4VmlzaWJsZUhlaWdodEZvcldyYXBHcm91cCAtPSBzY3JvbGxPZmZzZXRUb1JlbW92ZTtcblx0XHRcdFx0XHRcdFx0c2Nyb2xsT2Zmc2V0IC09IHNjcm9sbE9mZnNldFRvUmVtb3ZlO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRzdW1PZlZpc2libGVNYXhIZWlnaHRzICs9IG1heFZpc2libGVIZWlnaHRGb3JXcmFwR3JvdXA7XG5cdFx0XHRcdFx0XHRpZiAobWF4VmlzaWJsZUhlaWdodEZvcldyYXBHcm91cCA+IDAgJiYgdmlld0hlaWdodCA+PSBzdW1PZlZpc2libGVNYXhIZWlnaHRzKSB7XG5cdFx0XHRcdFx0XHRcdCsrd3JhcEdyb3Vwc1BlclBhZ2U7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Kyt3cmFwR3JvdXBJbmRleDtcblxuXHRcdFx0XHRcdG1heFdpZHRoRm9yV3JhcEdyb3VwID0gMDtcblx0XHRcdFx0XHRtYXhIZWlnaHRGb3JXcmFwR3JvdXAgPSAwO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGxldCBhdmVyYWdlQ2hpbGRXaWR0aDogYW55ID0gdGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLnN1bU9mS25vd25XcmFwR3JvdXBDaGlsZFdpZHRocyAvIHRoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5udW1iZXJPZktub3duV3JhcEdyb3VwQ2hpbGRTaXplcztcblx0XHRcdGxldCBhdmVyYWdlQ2hpbGRIZWlnaHQ6IGFueSA9IHRoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5zdW1PZktub3duV3JhcEdyb3VwQ2hpbGRIZWlnaHRzIC8gdGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLm51bWJlck9mS25vd25XcmFwR3JvdXBDaGlsZFNpemVzO1xuXHRcdFx0ZGVmYXVsdENoaWxkV2lkdGggPSB0aGlzLmNoaWxkV2lkdGggfHwgYXZlcmFnZUNoaWxkV2lkdGggfHwgdmlld1dpZHRoO1xuXHRcdFx0ZGVmYXVsdENoaWxkSGVpZ2h0ID0gdGhpcy5jaGlsZEhlaWdodCB8fCBhdmVyYWdlQ2hpbGRIZWlnaHQgfHwgdmlld0hlaWdodDtcblxuXHRcdFx0aWYgKHRoaXMuaG9yaXpvbnRhbCkge1xuXHRcdFx0XHRpZiAodmlld1dpZHRoID4gc3VtT2ZWaXNpYmxlTWF4V2lkdGhzKSB7XG5cdFx0XHRcdFx0d3JhcEdyb3Vwc1BlclBhZ2UgKz0gTWF0aC5jZWlsKCh2aWV3V2lkdGggLSBzdW1PZlZpc2libGVNYXhXaWR0aHMpIC8gZGVmYXVsdENoaWxkV2lkdGgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAodmlld0hlaWdodCA+IHN1bU9mVmlzaWJsZU1heEhlaWdodHMpIHtcblx0XHRcdFx0XHR3cmFwR3JvdXBzUGVyUGFnZSArPSBNYXRoLmNlaWwoKHZpZXdIZWlnaHQgLSBzdW1PZlZpc2libGVNYXhIZWlnaHRzKSAvIGRlZmF1bHRDaGlsZEhlaWdodCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRsZXQgaXRlbXNQZXJQYWdlOiBhbnkgPSBpdGVtc1BlcldyYXBHcm91cCAqIHdyYXBHcm91cHNQZXJQYWdlO1xuXHRcdGxldCBwYWdlQ291bnRfZnJhY3Rpb25hbDogYW55ID0gaXRlbUNvdW50IC8gaXRlbXNQZXJQYWdlO1xuXHRcdGxldCBudW1iZXJPZldyYXBHcm91cHM6IGFueSA9IE1hdGguY2VpbChpdGVtQ291bnQgLyBpdGVtc1BlcldyYXBHcm91cCk7XG5cblx0XHRsZXQgc2Nyb2xsTGVuZ3RoOiBhbnkgPSAwO1xuXG5cdFx0bGV0IGRlZmF1bHRTY3JvbGxMZW5ndGhQZXJXcmFwR3JvdXA6IGFueSA9IHRoaXMuaG9yaXpvbnRhbCA/IGRlZmF1bHRDaGlsZFdpZHRoIDogZGVmYXVsdENoaWxkSGVpZ2h0O1xuXHRcdGlmICh0aGlzLmVuYWJsZVVuZXF1YWxDaGlsZHJlblNpemVzKSB7XG5cdFx0XHRsZXQgbnVtVW5rbm93bkNoaWxkU2l6ZXM6YW55ID0gMDtcblx0XHRcdGZvciAobGV0IGk6YW55ID0gMDsgaSA8IG51bWJlck9mV3JhcEdyb3VwczsgKytpKSB7XG5cdFx0XHRcdGxldCBjaGlsZFNpemU6IGFueSA9IHRoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5tYXhDaGlsZFNpemVQZXJXcmFwR3JvdXBbaV0gJiYgdGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLm1heENoaWxkU2l6ZVBlcldyYXBHcm91cFtpXVt0aGlzLl9jaGlsZFNjcm9sbERpbV07XG5cdFx0XHRcdGlmIChjaGlsZFNpemUpIHtcblx0XHRcdFx0XHRzY3JvbGxMZW5ndGggKz0gY2hpbGRTaXplO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCsrbnVtVW5rbm93bkNoaWxkU2l6ZXM7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0c2Nyb2xsTGVuZ3RoICs9IE1hdGgucm91bmQobnVtVW5rbm93bkNoaWxkU2l6ZXMgKiBkZWZhdWx0U2Nyb2xsTGVuZ3RoUGVyV3JhcEdyb3VwKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c2Nyb2xsTGVuZ3RoID0gbnVtYmVyT2ZXcmFwR3JvdXBzICogZGVmYXVsdFNjcm9sbExlbmd0aFBlcldyYXBHcm91cDtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0aXRlbUNvdW50OiBpdGVtQ291bnQsXG5cdFx0XHRpdGVtc1BlcldyYXBHcm91cDogaXRlbXNQZXJXcmFwR3JvdXAsXG5cdFx0XHR3cmFwR3JvdXBzUGVyUGFnZTogd3JhcEdyb3Vwc1BlclBhZ2UsXG5cdFx0XHRpdGVtc1BlclBhZ2U6IGl0ZW1zUGVyUGFnZSxcblx0XHRcdHBhZ2VDb3VudF9mcmFjdGlvbmFsOiBwYWdlQ291bnRfZnJhY3Rpb25hbCxcblx0XHRcdGNoaWxkV2lkdGg6IGRlZmF1bHRDaGlsZFdpZHRoLFxuXHRcdFx0Y2hpbGRIZWlnaHQ6IGRlZmF1bHRDaGlsZEhlaWdodCxcblx0XHRcdHNjcm9sbExlbmd0aDogc2Nyb2xsTGVuZ3RoXG5cdFx0fTtcblx0fVxuXG5cdHByb3RlY3RlZCBjYWNoZWRQYWdlU2l6ZTogbnVtYmVyID0gMDtcblx0cHJvdGVjdGVkIHByZXZpb3VzU2Nyb2xsTnVtYmVyRWxlbWVudHM6IG51bWJlciA9IDA7XG5cblx0cHJvdGVjdGVkIGNhbGN1bGF0ZVBhZGRpbmcoYXJyYXlTdGFydEluZGV4V2l0aEJ1ZmZlcjogbnVtYmVyLCBkaW1lbnNpb25zOiBhbnksIGFsbG93VW5lcXVhbENoaWxkcmVuU2l6ZXNfRXhwZXJpbWVudGFsOiBib29sZWFuKTogbnVtYmVyIHtcblx0XHRpZiAoZGltZW5zaW9ucy5pdGVtQ291bnQgPT09IDApIHtcblx0XHRcdHJldHVybiAwO1xuXHRcdH1cblxuXHRcdGxldCBkZWZhdWx0U2Nyb2xsTGVuZ3RoUGVyV3JhcEdyb3VwOiBudW1iZXIgPSBkaW1lbnNpb25zW3RoaXMuX2NoaWxkU2Nyb2xsRGltXTtcblx0XHRsZXQgc3RhcnRpbmdXcmFwR3JvdXBJbmRleDogbnVtYmVyID0gTWF0aC5jZWlsKGFycmF5U3RhcnRJbmRleFdpdGhCdWZmZXIgLyBkaW1lbnNpb25zLml0ZW1zUGVyV3JhcEdyb3VwKSB8fCAwO1xuXG5cdFx0aWYgKCF0aGlzLmVuYWJsZVVuZXF1YWxDaGlsZHJlblNpemVzKSB7XG5cdFx0XHRyZXR1cm4gZGVmYXVsdFNjcm9sbExlbmd0aFBlcldyYXBHcm91cCAqIHN0YXJ0aW5nV3JhcEdyb3VwSW5kZXg7XG5cdFx0fVxuXG5cdFx0bGV0IG51bVVua25vd25DaGlsZFNpemVzOiBhbnkgPSAwO1xuXHRcdGxldCByZXN1bHQ6IGFueSA9IDA7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzdGFydGluZ1dyYXBHcm91cEluZGV4OyArK2kpIHtcblx0XHRcdGxldCBjaGlsZFNpemU6IFdyYXBHcm91cERpbWVuc2lvbiA9IHRoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5tYXhDaGlsZFNpemVQZXJXcmFwR3JvdXBbaV0gJiYgdGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLm1heENoaWxkU2l6ZVBlcldyYXBHcm91cFtpXVt0aGlzLl9jaGlsZFNjcm9sbERpbV07XG5cdFx0XHRpZiAoY2hpbGRTaXplKSB7XG5cdFx0XHRcdHJlc3VsdCArPSBjaGlsZFNpemU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQrK251bVVua25vd25DaGlsZFNpemVzO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXN1bHQgKz0gTWF0aC5yb3VuZChudW1Vbmtub3duQ2hpbGRTaXplcyAqIGRlZmF1bHRTY3JvbGxMZW5ndGhQZXJXcmFwR3JvdXApO1xuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdHByb3RlY3RlZCBjYWxjdWxhdGVQYWdlSW5mbyhzY3JvbGxQb3NpdGlvbjogbnVtYmVyLCBkaW1lbnNpb25zOiBhbnkpOiBJUGFnZUluZm9XaXRoQnVmZmVyIHtcblx0XHRsZXQgc2Nyb2xsUGVyY2VudGFnZTogYW55ID0gMDtcblx0XHRpZiAodGhpcy5lbmFibGVVbmVxdWFsQ2hpbGRyZW5TaXplcykge1xuXHRcdFx0Y29uc3QgbnVtYmVyT2ZXcmFwR3JvdXBzOmFueSA9IE1hdGguY2VpbChkaW1lbnNpb25zLml0ZW1Db3VudCAvIGRpbWVuc2lvbnMuaXRlbXNQZXJXcmFwR3JvdXApO1xuXHRcdFx0bGV0IHRvdGFsU2Nyb2xsZWRMZW5ndGg6IGFueSA9IDA7XG5cdFx0XHRsZXQgZGVmYXVsdFNjcm9sbExlbmd0aFBlcldyYXBHcm91cDogYW55ID0gZGltZW5zaW9uc1t0aGlzLl9jaGlsZFNjcm9sbERpbV07XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IG51bWJlck9mV3JhcEdyb3VwczsgKytpKSB7XG5cdFx0XHRcdGxldCBjaGlsZFNpemU6IGFueSA9IHRoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5tYXhDaGlsZFNpemVQZXJXcmFwR3JvdXBbaV0gJiYgdGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLm1heENoaWxkU2l6ZVBlcldyYXBHcm91cFtpXVt0aGlzLl9jaGlsZFNjcm9sbERpbV07XG5cdFx0XHRcdGlmIChjaGlsZFNpemUpIHtcblx0XHRcdFx0XHR0b3RhbFNjcm9sbGVkTGVuZ3RoICs9IGNoaWxkU2l6ZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0b3RhbFNjcm9sbGVkTGVuZ3RoICs9IGRlZmF1bHRTY3JvbGxMZW5ndGhQZXJXcmFwR3JvdXA7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoc2Nyb2xsUG9zaXRpb24gPCB0b3RhbFNjcm9sbGVkTGVuZ3RoKSB7XG5cdFx0XHRcdFx0c2Nyb2xsUGVyY2VudGFnZSA9IGkgLyBudW1iZXJPZldyYXBHcm91cHM7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0c2Nyb2xsUGVyY2VudGFnZSA9IHNjcm9sbFBvc2l0aW9uIC8gZGltZW5zaW9ucy5zY3JvbGxMZW5ndGg7XG5cdFx0fVxuXG5cdFx0bGV0IHN0YXJ0aW5nQXJyYXlJbmRleF9mcmFjdGlvbmFsOiBhbnkgPSBNYXRoLm1pbihNYXRoLm1heChzY3JvbGxQZXJjZW50YWdlICogZGltZW5zaW9ucy5wYWdlQ291bnRfZnJhY3Rpb25hbCwgMCksIGRpbWVuc2lvbnMucGFnZUNvdW50X2ZyYWN0aW9uYWwpICogZGltZW5zaW9ucy5pdGVtc1BlclBhZ2U7XG5cblx0XHRsZXQgbWF4U3RhcnQ6IGFueSA9IGRpbWVuc2lvbnMuaXRlbUNvdW50IC0gZGltZW5zaW9ucy5pdGVtc1BlclBhZ2UgLSAxO1xuXHRcdGxldCBhcnJheVN0YXJ0SW5kZXg6IGFueSA9IE1hdGgubWluKE1hdGguZmxvb3Ioc3RhcnRpbmdBcnJheUluZGV4X2ZyYWN0aW9uYWwpLCBtYXhTdGFydCk7XG5cdFx0YXJyYXlTdGFydEluZGV4IC09IGFycmF5U3RhcnRJbmRleCAlIGRpbWVuc2lvbnMuaXRlbXNQZXJXcmFwR3JvdXA7IC8vIHJvdW5kIGRvd24gdG8gc3RhcnQgb2Ygd3JhcEdyb3VwXG5cblx0XHRsZXQgYXJyYXlFbmRJbmRleDogYW55ID0gTWF0aC5jZWlsKHN0YXJ0aW5nQXJyYXlJbmRleF9mcmFjdGlvbmFsKSArIGRpbWVuc2lvbnMuaXRlbXNQZXJQYWdlIC0gMTtcblx0XHRhcnJheUVuZEluZGV4ICs9IChkaW1lbnNpb25zLml0ZW1zUGVyV3JhcEdyb3VwIC0gKChhcnJheUVuZEluZGV4ICsgMSkgJSBkaW1lbnNpb25zLml0ZW1zUGVyV3JhcEdyb3VwKSk7IC8vIHJvdW5kIHVwIHRvIGVuZCBvZiB3cmFwR3JvdXBcblxuXHRcdGlmIChpc05hTihhcnJheVN0YXJ0SW5kZXgpKSB7XG5cdFx0XHRhcnJheVN0YXJ0SW5kZXggPSAwO1xuXHRcdH1cblx0XHRpZiAoaXNOYU4oYXJyYXlFbmRJbmRleCkpIHtcblx0XHRcdGFycmF5RW5kSW5kZXggPSAwO1xuXHRcdH1cblxuXHRcdGFycmF5U3RhcnRJbmRleCA9IE1hdGgubWluKE1hdGgubWF4KGFycmF5U3RhcnRJbmRleCwgMCksIGRpbWVuc2lvbnMuaXRlbUNvdW50IC0gMSk7XG5cdFx0YXJyYXlFbmRJbmRleCA9IE1hdGgubWluKE1hdGgubWF4KGFycmF5RW5kSW5kZXgsIDApLCBkaW1lbnNpb25zLml0ZW1Db3VudCAtIDEpO1xuXG5cdFx0bGV0IGJ1ZmZlclNpemU6IGFueSA9IHRoaXMuYnVmZmVyQW1vdW50ICogZGltZW5zaW9ucy5pdGVtc1BlcldyYXBHcm91cDtcblx0XHRsZXQgc3RhcnRJbmRleFdpdGhCdWZmZXI6IGFueSA9IE1hdGgubWluKE1hdGgubWF4KGFycmF5U3RhcnRJbmRleCAtIGJ1ZmZlclNpemUsIDApLCBkaW1lbnNpb25zLml0ZW1Db3VudCAtIDEpO1xuXHRcdGxldCBlbmRJbmRleFdpdGhCdWZmZXI6IGFueSA9IE1hdGgubWluKE1hdGgubWF4KGFycmF5RW5kSW5kZXggKyBidWZmZXJTaXplLCAwKSwgZGltZW5zaW9ucy5pdGVtQ291bnQgLSAxKTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHRzdGFydEluZGV4OiBhcnJheVN0YXJ0SW5kZXgsXG5cdFx0XHRlbmRJbmRleDogYXJyYXlFbmRJbmRleCxcblx0XHRcdHN0YXJ0SW5kZXhXaXRoQnVmZmVyOiBzdGFydEluZGV4V2l0aEJ1ZmZlcixcblx0XHRcdGVuZEluZGV4V2l0aEJ1ZmZlcjogZW5kSW5kZXhXaXRoQnVmZmVyXG5cdFx0fTtcblx0fVxuXG5cdHByb3RlY3RlZCBjYWxjdWxhdGVWaWV3cG9ydCgpOiBJVmlld3BvcnQge1xuXHRcdGxldCBkaW1lbnNpb25zOiBJRGltZW5zaW9ucyA9IHRoaXMuY2FsY3VsYXRlRGltZW5zaW9ucygpO1xuXHRcdGxldCBvZmZzZXQ6IGFueSA9IHRoaXMuZ2V0RWxlbWVudHNPZmZzZXQoKTtcblxuXHRcdGxldCBzY3JvbGxQb3NpdGlvbjogYW55ID0gdGhpcy5nZXRTY3JvbGxQb3NpdGlvbigpO1xuXHRcdGlmIChzY3JvbGxQb3NpdGlvbiA+IGRpbWVuc2lvbnMuc2Nyb2xsTGVuZ3RoICYmICEodGhpcy5wYXJlbnRTY3JvbGwgaW5zdGFuY2VvZiBXaW5kb3cpKSB7XG5cdFx0XHRzY3JvbGxQb3NpdGlvbiA9IGRpbWVuc2lvbnMuc2Nyb2xsTGVuZ3RoO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzY3JvbGxQb3NpdGlvbiAtPSBvZmZzZXQ7XG5cdFx0fVxuXHRcdHNjcm9sbFBvc2l0aW9uID0gTWF0aC5tYXgoMCwgc2Nyb2xsUG9zaXRpb24pO1xuXG5cdFx0bGV0IHBhZ2VJbmZvOiBhbnkgPSB0aGlzLmNhbGN1bGF0ZVBhZ2VJbmZvKHNjcm9sbFBvc2l0aW9uLCBkaW1lbnNpb25zKTtcblx0XHRsZXQgbmV3UGFkZGluZzogYW55ID0gdGhpcy5jYWxjdWxhdGVQYWRkaW5nKHBhZ2VJbmZvLnN0YXJ0SW5kZXhXaXRoQnVmZmVyLCBkaW1lbnNpb25zLCB0cnVlKTtcblx0XHRsZXQgbmV3U2Nyb2xsTGVuZ3RoOiBhbnkgPSBkaW1lbnNpb25zLnNjcm9sbExlbmd0aDtcblxuXHRcdHJldHVybiB7XG5cdFx0XHRzdGFydEluZGV4OiBwYWdlSW5mby5zdGFydEluZGV4LFxuXHRcdFx0ZW5kSW5kZXg6IHBhZ2VJbmZvLmVuZEluZGV4LFxuXHRcdFx0c3RhcnRJbmRleFdpdGhCdWZmZXI6IHBhZ2VJbmZvLnN0YXJ0SW5kZXhXaXRoQnVmZmVyLFxuXHRcdFx0ZW5kSW5kZXhXaXRoQnVmZmVyOiBwYWdlSW5mby5lbmRJbmRleFdpdGhCdWZmZXIsXG5cdFx0XHRwYWRkaW5nOiBNYXRoLnJvdW5kKG5ld1BhZGRpbmcpLFxuXHRcdFx0c2Nyb2xsTGVuZ3RoOiBNYXRoLnJvdW5kKG5ld1Njcm9sbExlbmd0aClcblx0XHR9O1xuXHR9XG59XG4iXX0=