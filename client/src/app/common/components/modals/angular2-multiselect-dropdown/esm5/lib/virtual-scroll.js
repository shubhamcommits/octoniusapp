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
var VirtualScrollComponent = /** @class */ (function () {
    function VirtualScrollComponent(element, renderer, zone) {
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
        this.compareItems = function (item1, item2) { return item1 === item2; };
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
    Object.defineProperty(VirtualScrollComponent.prototype, "viewPortIndices", {
        get: /**
         * @return {?}
         */
        function () {
            /** @type {?} */
            var pageInfo = this.previousViewPort || /** @type {?} */ ({});
            return {
                startIndex: pageInfo.startIndex || 0,
                endIndex: pageInfo.endIndex || 0
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VirtualScrollComponent.prototype, "enableUnequalChildrenSizes", {
        get: /**
         * @return {?}
         */
        function () {
            return this._enableUnequalChildrenSizes;
        },
        set: /**
         * @param {?} value
         * @return {?}
         */
        function (value) {
            if (this._enableUnequalChildrenSizes === value) {
                return;
            }
            this._enableUnequalChildrenSizes = value;
            this.minMeasuredChildWidth = undefined;
            this.minMeasuredChildHeight = undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VirtualScrollComponent.prototype, "bufferAmount", {
        get: /**
         * @return {?}
         */
        function () {
            return Math.max(this._bufferAmount, this.enableUnequalChildrenSizes ? 5 : 0);
        },
        set: /**
         * @param {?} value
         * @return {?}
         */
        function (value) {
            this._bufferAmount = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VirtualScrollComponent.prototype, "scrollThrottlingTime", {
        get: /**
         * @return {?}
         */
        function () {
            return this._scrollThrottlingTime;
        },
        set: /**
         * @param {?} value
         * @return {?}
         */
        function (value) {
            var _this_1 = this;
            this._scrollThrottlingTime = value;
            this.refresh_throttled = /** @type {?} */ (this.throttleTrailing(function () {
                _this_1.refresh_internal(false);
            }, this._scrollThrottlingTime));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VirtualScrollComponent.prototype, "checkResizeInterval", {
        get: /**
         * @return {?}
         */
        function () {
            return this._checkResizeInterval;
        },
        set: /**
         * @param {?} value
         * @return {?}
         */
        function (value) {
            if (this._checkResizeInterval === value) {
                return;
            }
            this._checkResizeInterval = value;
            this.addScrollEventHandlers();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VirtualScrollComponent.prototype, "items", {
        get: /**
         * @return {?}
         */
        function () {
            return this._items;
        },
        set: /**
         * @param {?} value
         * @return {?}
         */
        function (value) {
            if (value === this._items) {
                return;
            }
            this._items = value || [];
            this.refresh_internal(true);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VirtualScrollComponent.prototype, "horizontal", {
        get: /**
         * @return {?}
         */
        function () {
            return this._horizontal;
        },
        set: /**
         * @param {?} value
         * @return {?}
         */
        function (value) {
            this._horizontal = value;
            this.updateDirection();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @return {?}
     */
    VirtualScrollComponent.prototype.revertParentOverscroll = /**
     * @return {?}
     */
    function () {
        /** @type {?} */
        var scrollElement = this.getScrollElement();
        if (scrollElement && this.oldParentScrollOverflow) {
            scrollElement.style['overflow-y'] = this.oldParentScrollOverflow.y;
            scrollElement.style['overflow-x'] = this.oldParentScrollOverflow.x;
        }
        this.oldParentScrollOverflow = undefined;
    };
    Object.defineProperty(VirtualScrollComponent.prototype, "parentScroll", {
        get: /**
         * @return {?}
         */
        function () {
            return this._parentScroll;
        },
        set: /**
         * @param {?} value
         * @return {?}
         */
        function (value) {
            if (this._parentScroll === value) {
                return;
            }
            this.revertParentOverscroll();
            this._parentScroll = value;
            this.addScrollEventHandlers();
            /** @type {?} */
            var scrollElement = this.getScrollElement();
            if (scrollElement !== this.element.nativeElement) {
                this.oldParentScrollOverflow = { x: scrollElement.style['overflow-x'], y: scrollElement.style['overflow-y'] };
                scrollElement.style['overflow-y'] = this.horizontal ? 'visible' : 'auto';
                scrollElement.style['overflow-x'] = this.horizontal ? 'auto' : 'visible';
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @return {?}
     */
    VirtualScrollComponent.prototype.ngOnInit = /**
     * @return {?}
     */
    function () {
        this.addScrollEventHandlers();
    };
    /**
     * @return {?}
     */
    VirtualScrollComponent.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        this.removeScrollEventHandlers();
        this.revertParentOverscroll();
    };
    /**
     * @param {?} changes
     * @return {?}
     */
    VirtualScrollComponent.prototype.ngOnChanges = /**
     * @param {?} changes
     * @return {?}
     */
    function (changes) {
        /** @type {?} */
        var indexLengthChanged = this.cachedItemsLength !== this.items.length;
        this.cachedItemsLength = this.items.length;
        /** @type {?} */
        var firstRun = !changes.items || !changes.items.previousValue || changes.items.previousValue.length === 0;
        this.refresh_internal(indexLengthChanged || firstRun);
    };
    /**
     * @return {?}
     */
    VirtualScrollComponent.prototype.ngDoCheck = /**
     * @return {?}
     */
    function () {
        if (this.cachedItemsLength !== this.items.length) {
            this.cachedItemsLength = this.items.length;
            this.refresh_internal(true);
        }
    };
    /**
     * @return {?}
     */
    VirtualScrollComponent.prototype.refresh = /**
     * @return {?}
     */
    function () {
        this.refresh_internal(true);
    };
    /**
     * @param {?} item
     * @param {?=} alignToBeginning
     * @param {?=} additionalOffset
     * @param {?=} animationMilliseconds
     * @param {?=} animationCompletedCallback
     * @return {?}
     */
    VirtualScrollComponent.prototype.scrollInto = /**
     * @param {?} item
     * @param {?=} alignToBeginning
     * @param {?=} additionalOffset
     * @param {?=} animationMilliseconds
     * @param {?=} animationCompletedCallback
     * @return {?}
     */
    function (item, alignToBeginning, additionalOffset, animationMilliseconds, animationCompletedCallback) {
        if (alignToBeginning === void 0) { alignToBeginning = true; }
        if (additionalOffset === void 0) { additionalOffset = 0; }
        if (animationMilliseconds === void 0) { animationMilliseconds = undefined; }
        if (animationCompletedCallback === void 0) { animationCompletedCallback = undefined; }
        /** @type {?} */
        var index = this.items.indexOf(item);
        if (index === -1) {
            return;
        }
        this.scrollToIndex(index, alignToBeginning, additionalOffset, animationMilliseconds, animationCompletedCallback);
    };
    /**
     * @param {?} index
     * @param {?=} alignToBeginning
     * @param {?=} additionalOffset
     * @param {?=} animationMilliseconds
     * @param {?=} animationCompletedCallback
     * @return {?}
     */
    VirtualScrollComponent.prototype.scrollToIndex = /**
     * @param {?} index
     * @param {?=} alignToBeginning
     * @param {?=} additionalOffset
     * @param {?=} animationMilliseconds
     * @param {?=} animationCompletedCallback
     * @return {?}
     */
    function (index, alignToBeginning, additionalOffset, animationMilliseconds, animationCompletedCallback) {
        var _this_1 = this;
        if (alignToBeginning === void 0) { alignToBeginning = true; }
        if (additionalOffset === void 0) { additionalOffset = 0; }
        if (animationMilliseconds === void 0) { animationMilliseconds = undefined; }
        if (animationCompletedCallback === void 0) { animationCompletedCallback = undefined; }
        /** @type {?} */
        var maxRetries = 5;
        /** @type {?} */
        var retryIfNeeded = function () {
            --maxRetries;
            if (maxRetries <= 0) {
                if (animationCompletedCallback) {
                    animationCompletedCallback();
                }
                return;
            }
            /** @type {?} */
            var dimensions = _this_1.calculateDimensions();
            /** @type {?} */
            var desiredStartIndex = Math.min(Math.max(index, 0), dimensions.itemCount - 1);
            if (_this_1.previousViewPort.startIndex === desiredStartIndex) {
                if (animationCompletedCallback) {
                    animationCompletedCallback();
                }
                return;
            }
            _this_1.scrollToIndex_internal(index, alignToBeginning, additionalOffset, 0, retryIfNeeded);
        };
        this.scrollToIndex_internal(index, alignToBeginning, additionalOffset, animationMilliseconds, retryIfNeeded);
    };
    /**
     * @param {?} index
     * @param {?=} alignToBeginning
     * @param {?=} additionalOffset
     * @param {?=} animationMilliseconds
     * @param {?=} animationCompletedCallback
     * @return {?}
     */
    VirtualScrollComponent.prototype.scrollToIndex_internal = /**
     * @param {?} index
     * @param {?=} alignToBeginning
     * @param {?=} additionalOffset
     * @param {?=} animationMilliseconds
     * @param {?=} animationCompletedCallback
     * @return {?}
     */
    function (index, alignToBeginning, additionalOffset, animationMilliseconds, animationCompletedCallback) {
        if (alignToBeginning === void 0) { alignToBeginning = true; }
        if (additionalOffset === void 0) { additionalOffset = 0; }
        if (animationMilliseconds === void 0) { animationMilliseconds = undefined; }
        if (animationCompletedCallback === void 0) { animationCompletedCallback = undefined; }
        animationMilliseconds = animationMilliseconds === undefined ? this.scrollAnimationTime : animationMilliseconds;
        /** @type {?} */
        var scrollElement = this.getScrollElement();
        /** @type {?} */
        var offset = this.getElementsOffset();
        /** @type {?} */
        var dimensions = this.calculateDimensions();
        /** @type {?} */
        var scroll = this.calculatePadding(index, dimensions, false) + offset + additionalOffset;
        if (!alignToBeginning) {
            scroll -= dimensions.wrapGroupsPerPage * dimensions[this._childScrollDim];
        }
        /** @type {?} */
        var animationRequest;
        if (!animationMilliseconds) {
            this.renderer.setProperty(scrollElement, this._scrollType, scroll);
            this.refresh_internal(false, animationCompletedCallback);
            return;
        }
    };
    /**
     * @return {?}
     */
    VirtualScrollComponent.prototype.checkScrollElementResized = /**
     * @return {?}
     */
    function () {
        /** @type {?} */
        var boundingRect = this.getScrollElement().getBoundingClientRect();
        /** @type {?} */
        var sizeChanged;
        if (!this.previousScrollBoundingRect) {
            sizeChanged = true;
        }
        else {
            /** @type {?} */
            var widthChange = Math.abs(boundingRect.width - this.previousScrollBoundingRect.width);
            /** @type {?} */
            var heightChange = Math.abs(boundingRect.height - this.previousScrollBoundingRect.height);
            sizeChanged = widthChange > this.resizeBypassRefreshTheshold || heightChange > this.resizeBypassRefreshTheshold;
        }
        if (sizeChanged) {
            this.previousScrollBoundingRect = boundingRect;
            if (boundingRect.width > 0 && boundingRect.height > 0) {
                this.refresh_internal(false);
            }
        }
    };
    /**
     * @return {?}
     */
    VirtualScrollComponent.prototype.updateDirection = /**
     * @return {?}
     */
    function () {
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
    };
    /**
     * @param {?} func
     * @param {?} wait
     * @return {?}
     */
    VirtualScrollComponent.prototype.throttleTrailing = /**
     * @param {?} func
     * @param {?} wait
     * @return {?}
     */
    function (func, wait) {
        /** @type {?} */
        var timeout = undefined;
        /** @type {?} */
        var result = function () {
            /** @type {?} */
            var _this = this;
            /** @type {?} */
            var _arguments = arguments;
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
    };
    /**
     * @param {?} itemsArrayModified
     * @param {?=} refreshCompletedCallback
     * @param {?=} maxRunTimes
     * @return {?}
     */
    VirtualScrollComponent.prototype.refresh_internal = /**
     * @param {?} itemsArrayModified
     * @param {?=} refreshCompletedCallback
     * @param {?=} maxRunTimes
     * @return {?}
     */
    function (itemsArrayModified, refreshCompletedCallback, maxRunTimes) {
        var _this_1 = this;
        if (refreshCompletedCallback === void 0) { refreshCompletedCallback = undefined; }
        if (maxRunTimes === void 0) { maxRunTimes = 2; }
        //note: maxRunTimes is to force it to keep recalculating if the previous iteration caused a re-render (different sliced items in viewport or scrollPosition changed).
        //The default of 2x max will probably be accurate enough without causing too large a performance bottleneck
        //The code would typically quit out on the 2nd iteration anyways. The main time it'd think more than 2 runs would be necessary would be for vastly different sized child items or if this is the 1st time the items array was initialized.
        //Without maxRunTimes, If the user is actively scrolling this code would become an infinite loop until they stopped scrolling. This would be okay, except each scroll event would start an additional infinte loop. We want to short-circuit it to prevent his.
        this.zone.runOutsideAngular(function () {
            requestAnimationFrame(function () {
                if (itemsArrayModified) {
                    _this_1.resetWrapGroupDimensions();
                }
                /** @type {?} */
                var viewport = _this_1.calculateViewport();
                /** @type {?} */
                var startChanged = itemsArrayModified || viewport.startIndex !== _this_1.previousViewPort.startIndex;
                /** @type {?} */
                var endChanged = itemsArrayModified || viewport.endIndex !== _this_1.previousViewPort.endIndex;
                /** @type {?} */
                var scrollLengthChanged = viewport.scrollLength !== _this_1.previousViewPort.scrollLength;
                /** @type {?} */
                var paddingChanged = viewport.padding !== _this_1.previousViewPort.padding;
                _this_1.previousViewPort = viewport;
                if (scrollLengthChanged) {
                    _this_1.renderer.setStyle(_this_1.invisiblePaddingElementRef.nativeElement, _this_1._invisiblePaddingProperty, viewport.scrollLength + "px");
                }
                if (paddingChanged) {
                    if (_this_1.useMarginInsteadOfTranslate) {
                        _this_1.renderer.setStyle(_this_1.contentElementRef.nativeElement, _this_1._marginDir, viewport.padding + "px");
                    }
                    else {
                        _this_1.renderer.setStyle(_this_1.contentElementRef.nativeElement, 'transform', _this_1._translateDir + "(" + viewport.padding + "px)");
                        _this_1.renderer.setStyle(_this_1.contentElementRef.nativeElement, 'webkitTransform', _this_1._translateDir + "(" + viewport.padding + "px)");
                    }
                }
                /** @type {?} */
                var emitIndexChangedEvents = true; // maxReRunTimes === 1 (would need to still run if didn't update if previous iteration had updated)
                if (startChanged || endChanged) {
                    _this_1.zone.run(function () {
                        // update the scroll list to trigger re-render of components in viewport
                        // update the scroll list to trigger re-render of components in viewport
                        _this_1.viewPortItems = viewport.startIndexWithBuffer >= 0 && viewport.endIndexWithBuffer >= 0 ? _this_1.items.slice(viewport.startIndexWithBuffer, viewport.endIndexWithBuffer + 1) : [];
                        _this_1.update.emit(_this_1.viewPortItems);
                        _this_1.vsUpdate.emit(_this_1.viewPortItems);
                        if (emitIndexChangedEvents) {
                            if (startChanged) {
                                _this_1.start.emit({ start: viewport.startIndex, end: viewport.endIndex });
                                _this_1.vsStart.emit({ start: viewport.startIndex, end: viewport.endIndex });
                            }
                            if (endChanged) {
                                _this_1.end.emit({ start: viewport.startIndex, end: viewport.endIndex });
                                _this_1.vsEnd.emit({ start: viewport.startIndex, end: viewport.endIndex });
                            }
                            if (startChanged || endChanged) {
                                _this_1.change.emit({ start: viewport.startIndex, end: viewport.endIndex });
                                _this_1.vsChange.emit({ start: viewport.startIndex, end: viewport.endIndex });
                            }
                        }
                        if (maxRunTimes > 0) {
                            _this_1.refresh_internal(false, refreshCompletedCallback, maxRunTimes - 1);
                            return;
                        }
                        if (refreshCompletedCallback) {
                            refreshCompletedCallback();
                        }
                    });
                }
                else {
                    if (maxRunTimes > 0 && (scrollLengthChanged || paddingChanged)) {
                        _this_1.refresh_internal(false, refreshCompletedCallback, maxRunTimes - 1);
                        return;
                    }
                    if (refreshCompletedCallback) {
                        refreshCompletedCallback();
                    }
                }
            });
        });
    };
    /**
     * @return {?}
     */
    VirtualScrollComponent.prototype.getScrollElement = /**
     * @return {?}
     */
    function () {
        return this.parentScroll instanceof Window ? document.scrollingElement || document.documentElement || document.body : this.parentScroll || this.element.nativeElement;
    };
    /**
     * @return {?}
     */
    VirtualScrollComponent.prototype.addScrollEventHandlers = /**
     * @return {?}
     */
    function () {
        var _this_1 = this;
        /** @type {?} */
        var scrollElement = this.getScrollElement();
        this.removeScrollEventHandlers();
        this.zone.runOutsideAngular(function () {
            if (_this_1.parentScroll instanceof Window) {
                _this_1.disposeScrollHandler = _this_1.renderer.listen('window', 'scroll', _this_1.refresh_throttled);
                _this_1.disposeResizeHandler = _this_1.renderer.listen('window', 'resize', _this_1.refresh_throttled);
            }
            else {
                _this_1.disposeScrollHandler = _this_1.renderer.listen(scrollElement, 'scroll', _this_1.refresh_throttled);
                if (_this_1._checkResizeInterval > 0) {
                    _this_1.checkScrollElementResizedTimer = /** @type {?} */ (setInterval(function () { _this_1.checkScrollElementResized(); }, _this_1._checkResizeInterval));
                }
            }
        });
    };
    /**
     * @return {?}
     */
    VirtualScrollComponent.prototype.removeScrollEventHandlers = /**
     * @return {?}
     */
    function () {
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
    };
    /**
     * @return {?}
     */
    VirtualScrollComponent.prototype.getElementsOffset = /**
     * @return {?}
     */
    function () {
        /** @type {?} */
        var offset = 0;
        if (this.containerElementRef && this.containerElementRef.nativeElement) {
            offset += this.containerElementRef.nativeElement[this._offsetType];
        }
        if (this.parentScroll) {
            /** @type {?} */
            var scrollElement = this.getScrollElement();
            /** @type {?} */
            var elementClientRect = this.element.nativeElement.getBoundingClientRect();
            /** @type {?} */
            var scrollClientRect = scrollElement.getBoundingClientRect();
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
    };
    /**
     * @return {?}
     */
    VirtualScrollComponent.prototype.countItemsPerWrapGroup = /**
     * @return {?}
     */
    function () {
        /** @type {?} */
        var propertyName = this.horizontal ? 'offsetLeft' : 'offsetTop';
        /** @type {?} */
        var children = ((this.containerElementRef && this.containerElementRef.nativeElement) || this.contentElementRef.nativeElement).children;
        /** @type {?} */
        var childrenLength = children ? children.length : 0;
        if (childrenLength === 0) {
            return 1;
        }
        /** @type {?} */
        var firstOffset = children[0][propertyName];
        /** @type {?} */
        var result = 1;
        while (result < childrenLength && firstOffset === children[result][propertyName]) {
            ++result;
        }
        return result;
    };
    /**
     * @return {?}
     */
    VirtualScrollComponent.prototype.getScrollPosition = /**
     * @return {?}
     */
    function () {
        /** @type {?} */
        var windowScrollValue = undefined;
        if (this.parentScroll instanceof Window) {
            /** @type {?} */
            var window;
            windowScrollValue = window[this._pageOffsetType];
        }
        return windowScrollValue || this.getScrollElement()[this._scrollType] || 0;
    };
    /**
     * @return {?}
     */
    VirtualScrollComponent.prototype.resetWrapGroupDimensions = /**
     * @return {?}
     */
    function () {
        /** @type {?} */
        var oldWrapGroupDimensions = this.wrapGroupDimensions;
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
        var itemsPerWrapGroup = this.countItemsPerWrapGroup();
        for (var wrapGroupIndex = 0; wrapGroupIndex < oldWrapGroupDimensions.maxChildSizePerWrapGroup.length; ++wrapGroupIndex) {
            /** @type {?} */
            var oldWrapGroupDimension = oldWrapGroupDimensions.maxChildSizePerWrapGroup[wrapGroupIndex];
            if (!oldWrapGroupDimension || !oldWrapGroupDimension.items || !oldWrapGroupDimension.items.length) {
                continue;
            }
            if (oldWrapGroupDimension.items.length !== itemsPerWrapGroup) {
                return;
            }
            /** @type {?} */
            var itemsChanged = false;
            /** @type {?} */
            var arrayStartIndex = itemsPerWrapGroup * wrapGroupIndex;
            for (var i = 0; i < itemsPerWrapGroup; ++i) {
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
    };
    /**
     * @return {?}
     */
    VirtualScrollComponent.prototype.calculateDimensions = /**
     * @return {?}
     */
    function () {
        /** @type {?} */
        var scrollElement = this.getScrollElement();
        /** @type {?} */
        var itemCount = this.items.length;
        /** @type {?} */
        var maxCalculatedScrollBarSize = 25; // Note: Formula to auto-calculate doesn't work for ParentScroll, so we default to this if not set by consuming application
        this.calculatedScrollbarHeight = Math.max(Math.min(scrollElement.offsetHeight - scrollElement.clientHeight, maxCalculatedScrollBarSize), this.calculatedScrollbarHeight);
        this.calculatedScrollbarWidth = Math.max(Math.min(scrollElement.offsetWidth - scrollElement.clientWidth, maxCalculatedScrollBarSize), this.calculatedScrollbarWidth);
        /** @type {?} */
        var viewWidth = scrollElement.offsetWidth - (this.scrollbarWidth || this.calculatedScrollbarWidth || (this.horizontal ? 0 : maxCalculatedScrollBarSize));
        /** @type {?} */
        var viewHeight = scrollElement.offsetHeight - (this.scrollbarHeight || this.calculatedScrollbarHeight || (this.horizontal ? maxCalculatedScrollBarSize : 0));
        /** @type {?} */
        var content = (this.containerElementRef && this.containerElementRef.nativeElement) || this.contentElementRef.nativeElement;
        /** @type {?} */
        var itemsPerWrapGroup = this.countItemsPerWrapGroup();
        /** @type {?} */
        var wrapGroupsPerPage;
        /** @type {?} */
        var defaultChildWidth;
        /** @type {?} */
        var defaultChildHeight;
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
                var child = content.children[0];
                /** @type {?} */
                var clientRect = child.getBoundingClientRect();
                this.minMeasuredChildWidth = Math.min(this.minMeasuredChildWidth, clientRect.width);
                this.minMeasuredChildHeight = Math.min(this.minMeasuredChildHeight, clientRect.height);
            }
            defaultChildWidth = this.childWidth || this.minMeasuredChildWidth || viewWidth;
            defaultChildHeight = this.childHeight || this.minMeasuredChildHeight || viewHeight;
            /** @type {?} */
            var itemsPerRow = Math.max(Math.ceil(viewWidth / defaultChildWidth), 1);
            /** @type {?} */
            var itemsPerCol = Math.max(Math.ceil(viewHeight / defaultChildHeight), 1);
            wrapGroupsPerPage = this.horizontal ? itemsPerRow : itemsPerCol;
        }
        else {
            /** @type {?} */
            var scrollOffset = scrollElement[this._scrollType] - (this.previousViewPort ? this.previousViewPort.padding : 0);
            /** @type {?} */
            var arrayStartIndex = this.previousViewPort.startIndexWithBuffer || 0;
            /** @type {?} */
            var wrapGroupIndex = Math.ceil(arrayStartIndex / itemsPerWrapGroup);
            /** @type {?} */
            var maxWidthForWrapGroup = 0;
            /** @type {?} */
            var maxHeightForWrapGroup = 0;
            /** @type {?} */
            var sumOfVisibleMaxWidths = 0;
            /** @type {?} */
            var sumOfVisibleMaxHeights = 0;
            wrapGroupsPerPage = 0;
            for (var i = 0; i < content.children.length; ++i) {
                ++arrayStartIndex;
                /** @type {?} */
                var child = content.children[i];
                /** @type {?} */
                var clientRect = child.getBoundingClientRect();
                maxWidthForWrapGroup = Math.max(maxWidthForWrapGroup, clientRect.width);
                maxHeightForWrapGroup = Math.max(maxHeightForWrapGroup, clientRect.height);
                if (arrayStartIndex % itemsPerWrapGroup === 0) {
                    /** @type {?} */
                    var oldValue = this.wrapGroupDimensions.maxChildSizePerWrapGroup[wrapGroupIndex];
                    if (oldValue) {
                        --this.wrapGroupDimensions.numberOfKnownWrapGroupChildSizes;
                        this.wrapGroupDimensions.sumOfKnownWrapGroupChildWidths -= oldValue.childWidth || 0;
                        this.wrapGroupDimensions.sumOfKnownWrapGroupChildHeights -= oldValue.childHeight || 0;
                    }
                    ++this.wrapGroupDimensions.numberOfKnownWrapGroupChildSizes;
                    /** @type {?} */
                    var items = this.items.slice(arrayStartIndex - itemsPerWrapGroup, arrayStartIndex);
                    this.wrapGroupDimensions.maxChildSizePerWrapGroup[wrapGroupIndex] = {
                        childWidth: maxWidthForWrapGroup,
                        childHeight: maxHeightForWrapGroup,
                        items: items
                    };
                    this.wrapGroupDimensions.sumOfKnownWrapGroupChildWidths += maxWidthForWrapGroup;
                    this.wrapGroupDimensions.sumOfKnownWrapGroupChildHeights += maxHeightForWrapGroup;
                    if (this.horizontal) {
                        /** @type {?} */
                        var maxVisibleWidthForWrapGroup = Math.min(maxWidthForWrapGroup, Math.max(viewWidth - sumOfVisibleMaxWidths, 0));
                        if (scrollOffset > 0) {
                            /** @type {?} */
                            var scrollOffsetToRemove = Math.min(scrollOffset, maxVisibleWidthForWrapGroup);
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
                        var maxVisibleHeightForWrapGroup = Math.min(maxHeightForWrapGroup, Math.max(viewHeight - sumOfVisibleMaxHeights, 0));
                        if (scrollOffset > 0) {
                            /** @type {?} */
                            var scrollOffsetToRemove = Math.min(scrollOffset, maxVisibleHeightForWrapGroup);
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
            var averageChildWidth = this.wrapGroupDimensions.sumOfKnownWrapGroupChildWidths / this.wrapGroupDimensions.numberOfKnownWrapGroupChildSizes;
            /** @type {?} */
            var averageChildHeight = this.wrapGroupDimensions.sumOfKnownWrapGroupChildHeights / this.wrapGroupDimensions.numberOfKnownWrapGroupChildSizes;
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
        var itemsPerPage = itemsPerWrapGroup * wrapGroupsPerPage;
        /** @type {?} */
        var pageCount_fractional = itemCount / itemsPerPage;
        /** @type {?} */
        var numberOfWrapGroups = Math.ceil(itemCount / itemsPerWrapGroup);
        /** @type {?} */
        var scrollLength = 0;
        /** @type {?} */
        var defaultScrollLengthPerWrapGroup = this.horizontal ? defaultChildWidth : defaultChildHeight;
        if (this.enableUnequalChildrenSizes) {
            /** @type {?} */
            var numUnknownChildSizes = 0;
            for (var i = 0; i < numberOfWrapGroups; ++i) {
                /** @type {?} */
                var childSize = this.wrapGroupDimensions.maxChildSizePerWrapGroup[i] && this.wrapGroupDimensions.maxChildSizePerWrapGroup[i][this._childScrollDim];
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
    };
    /**
     * @param {?} arrayStartIndexWithBuffer
     * @param {?} dimensions
     * @param {?} allowUnequalChildrenSizes_Experimental
     * @return {?}
     */
    VirtualScrollComponent.prototype.calculatePadding = /**
     * @param {?} arrayStartIndexWithBuffer
     * @param {?} dimensions
     * @param {?} allowUnequalChildrenSizes_Experimental
     * @return {?}
     */
    function (arrayStartIndexWithBuffer, dimensions, allowUnequalChildrenSizes_Experimental) {
        if (dimensions.itemCount === 0) {
            return 0;
        }
        /** @type {?} */
        var defaultScrollLengthPerWrapGroup = dimensions[this._childScrollDim];
        /** @type {?} */
        var startingWrapGroupIndex = Math.ceil(arrayStartIndexWithBuffer / dimensions.itemsPerWrapGroup) || 0;
        if (!this.enableUnequalChildrenSizes) {
            return defaultScrollLengthPerWrapGroup * startingWrapGroupIndex;
        }
        /** @type {?} */
        var numUnknownChildSizes = 0;
        /** @type {?} */
        var result = 0;
        for (var i = 0; i < startingWrapGroupIndex; ++i) {
            /** @type {?} */
            var childSize = this.wrapGroupDimensions.maxChildSizePerWrapGroup[i] && this.wrapGroupDimensions.maxChildSizePerWrapGroup[i][this._childScrollDim];
            if (childSize) {
                result += childSize;
            }
            else {
                ++numUnknownChildSizes;
            }
        }
        result += Math.round(numUnknownChildSizes * defaultScrollLengthPerWrapGroup);
        return result;
    };
    /**
     * @param {?} scrollPosition
     * @param {?} dimensions
     * @return {?}
     */
    VirtualScrollComponent.prototype.calculatePageInfo = /**
     * @param {?} scrollPosition
     * @param {?} dimensions
     * @return {?}
     */
    function (scrollPosition, dimensions) {
        /** @type {?} */
        var scrollPercentage = 0;
        if (this.enableUnequalChildrenSizes) {
            /** @type {?} */
            var numberOfWrapGroups = Math.ceil(dimensions.itemCount / dimensions.itemsPerWrapGroup);
            /** @type {?} */
            var totalScrolledLength = 0;
            /** @type {?} */
            var defaultScrollLengthPerWrapGroup = dimensions[this._childScrollDim];
            for (var i = 0; i < numberOfWrapGroups; ++i) {
                /** @type {?} */
                var childSize = this.wrapGroupDimensions.maxChildSizePerWrapGroup[i] && this.wrapGroupDimensions.maxChildSizePerWrapGroup[i][this._childScrollDim];
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
        var startingArrayIndex_fractional = Math.min(Math.max(scrollPercentage * dimensions.pageCount_fractional, 0), dimensions.pageCount_fractional) * dimensions.itemsPerPage;
        /** @type {?} */
        var maxStart = dimensions.itemCount - dimensions.itemsPerPage - 1;
        /** @type {?} */
        var arrayStartIndex = Math.min(Math.floor(startingArrayIndex_fractional), maxStart);
        arrayStartIndex -= arrayStartIndex % dimensions.itemsPerWrapGroup;
        /** @type {?} */
        var arrayEndIndex = Math.ceil(startingArrayIndex_fractional) + dimensions.itemsPerPage - 1;
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
        var bufferSize = this.bufferAmount * dimensions.itemsPerWrapGroup;
        /** @type {?} */
        var startIndexWithBuffer = Math.min(Math.max(arrayStartIndex - bufferSize, 0), dimensions.itemCount - 1);
        /** @type {?} */
        var endIndexWithBuffer = Math.min(Math.max(arrayEndIndex + bufferSize, 0), dimensions.itemCount - 1);
        return {
            startIndex: arrayStartIndex,
            endIndex: arrayEndIndex,
            startIndexWithBuffer: startIndexWithBuffer,
            endIndexWithBuffer: endIndexWithBuffer
        };
    };
    /**
     * @return {?}
     */
    VirtualScrollComponent.prototype.calculateViewport = /**
     * @return {?}
     */
    function () {
        /** @type {?} */
        var dimensions = this.calculateDimensions();
        /** @type {?} */
        var offset = this.getElementsOffset();
        /** @type {?} */
        var scrollPosition = this.getScrollPosition();
        if (scrollPosition > dimensions.scrollLength && !(this.parentScroll instanceof Window)) {
            scrollPosition = dimensions.scrollLength;
        }
        else {
            scrollPosition -= offset;
        }
        scrollPosition = Math.max(0, scrollPosition);
        /** @type {?} */
        var pageInfo = this.calculatePageInfo(scrollPosition, dimensions);
        /** @type {?} */
        var newPadding = this.calculatePadding(pageInfo.startIndexWithBuffer, dimensions, true);
        /** @type {?} */
        var newScrollLength = dimensions.scrollLength;
        return {
            startIndex: pageInfo.startIndex,
            endIndex: pageInfo.endIndex,
            startIndexWithBuffer: pageInfo.startIndexWithBuffer,
            endIndexWithBuffer: pageInfo.endIndexWithBuffer,
            padding: Math.round(newPadding),
            scrollLength: Math.round(newScrollLength)
        };
    };
    VirtualScrollComponent.decorators = [
        { type: Component, args: [{
                    selector: 'virtual-scroll,[virtualScroll]',
                    exportAs: 'virtualScroll',
                    template: "\n    <div class=\"total-padding\" #invisiblePadding></div>\n    <div class=\"scrollable-content\" #content>\n      <ng-content></ng-content>\n    </div>\n  ",
                    host: {
                        '[class.horizontal]': "horizontal",
                        '[class.vertical]': "!horizontal",
                        '[class.selfScroll]': "!parentScroll"
                    },
                    styles: ["\n    :host {\n      position: relative;\n\t  display: block;\n      -webkit-overflow-scrolling: touch;\n    }\n\t\n\t:host.horizontal.selfScroll {\n      overflow-y: visible;\n      overflow-x: auto;\n\t}\n\t:host.vertical.selfScroll {\n      overflow-y: auto;\n      overflow-x: visible;\n\t}\n\t\n    .scrollable-content {\n      top: 0;\n      left: 0;\n      width: 100%;\n      height: 100%;\n      max-width: 100vw;\n      max-height: 100vh;\n      position: absolute;\n    }\n\n\t.scrollable-content ::ng-deep > * {\n\t\tbox-sizing: border-box;\n\t}\n\t\n\t:host.horizontal {\n\t\twhite-space: nowrap;\n\t}\n\t\n\t:host.horizontal .scrollable-content {\n\t\tdisplay: flex;\n\t}\n\t\n\t:host.horizontal .scrollable-content ::ng-deep > * {\n\t\tflex-shrink: 0;\n\t\tflex-grow: 0;\n\t\twhite-space: initial;\n\t}\n\t\n    .total-padding {\n      width: 1px;\n      opacity: 0;\n    }\n    \n    :host.horizontal .total-padding {\n      height: 100%;\n    }\n  "]
                }] }
    ];
    /** @nocollapse */
    VirtualScrollComponent.ctorParameters = function () { return [
        { type: ElementRef },
        { type: Renderer2 },
        { type: NgZone }
    ]; };
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
    return VirtualScrollComponent;
}());
export { VirtualScrollComponent };
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1zY3JvbGwuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyMi1tdWx0aXNlbGVjdC1kcm9wZG93bi8iLCJzb3VyY2VzIjpbImxpYi92aXJ0dWFsLXNjcm9sbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUNOLFNBQVMsRUFDVCxZQUFZLEVBQ1osVUFBVSxFQUNWLFlBQVksRUFDWixLQUFLLEVBRUwsTUFBTSxFQUlOLE1BQU0sRUFDTixTQUFTLEVBQ1QsU0FBUyxHQUNULE1BQU0sZUFBZSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBMFh0QixnQ0FBK0IsT0FBbUIsRUFBcUIsUUFBbUIsRUFBcUIsSUFBWTtRQUE1RixZQUFPLEdBQVAsT0FBTyxDQUFZO1FBQXFCLGFBQVEsR0FBUixRQUFRLENBQVc7UUFBcUIsU0FBSSxHQUFKLElBQUksQ0FBUTtzQkFuUTNHLE1BQU07MkNBVTJCLEtBQUs7MkNBZ0JSLEtBQUs7NkJBY2pCLENBQUM7bUNBVUUsR0FBRzsyQ0FHSyxDQUFDO29DQWVMLElBQUk7c0JBY25CLEVBQUU7NEJBZStCLFVBQUMsS0FBVSxFQUFFLEtBQVUsSUFBSyxPQUFBLEtBQUssS0FBSyxLQUFLLEVBQWYsQ0FBZTtzQkE4Q2pFLElBQUksWUFBWSxFQUFTO3dCQUV2QixJQUFJLFlBQVksRUFBUztzQkFHckIsSUFBSSxZQUFZLEVBQWU7d0JBRTdCLElBQUksWUFBWSxFQUFlO3FCQUdsQyxJQUFJLFlBQVksRUFBZTt1QkFFN0IsSUFBSSxZQUFZLEVBQWU7bUJBR25DLElBQUksWUFBWSxFQUFlO3FCQUU3QixJQUFJLFlBQVksRUFBZTt3Q0FtTDVCLENBQUM7eUNBQ0EsQ0FBQzt1QkFFbkIsQ0FBQztrREFDZ0IsRUFBRTs4QkEwWVosQ0FBQzs0Q0FDYSxDQUFDO1FBOWRqRCxJQUFJLENBQUMsVUFBVSxHQUFH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QWUsQ0FBQztTQUN6QyxDQUFDO0tBQ0Y7O2dCQW41QkQsU0FBUyxTQUFDO29CQUNWLFFBQVEsRUFBRSxnQ0FBZ0M7b0JBQzFDLFFBQVEsRUFBRSxlQUFlO29CQUN6QixRQUFRLEVBQUUsK0pBS1I7b0JBQ0YsSUFBSSxFQUFFO3dCQUNMLG9CQUFvQixFQUFFLFlBQVk7d0JBQ2xDLGtCQUFrQixFQUFFLGFBQWE7d0JBQ2pDLG9CQUFvQixFQUFFLGVBQWU7cUJBQ3JDOzZCQUNRLHU4QkFvRFA7aUJBQ0Y7Ozs7Z0JBL0hBLFVBQVU7Z0JBU1YsU0FBUztnQkFMVCxNQUFNOzs7NkNBeUlMLEtBQUs7OENBY0wsS0FBSztpQ0FHTCxLQUFLO2tDQUdMLEtBQUs7NkJBR0wsS0FBSzs4QkFHTCxLQUFLOytCQUlMLEtBQUs7c0NBUUwsS0FBSzs4Q0FHTCxLQUFLO3VDQUlMLEtBQUs7c0NBYUwsS0FBSzt3QkFjTCxLQUFLOytCQWFMLEtBQUs7NkJBSUwsS0FBSzsrQkFxQkwsS0FBSzt5QkFxQkwsTUFBTTsyQkFFTixNQUFNO3lCQUdOLE1BQU07MkJBRU4sTUFBTTt3QkFHTixNQUFNOzBCQUVOLE1BQU07c0JBR04sTUFBTTt3QkFFTixNQUFNO29DQUdOLFNBQVMsU0FBQyxTQUFTLEVBQUUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFOzZDQUd6QyxTQUFTLFNBQUMsa0JBQWtCLEVBQUUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFO3NDQUdsRCxZQUFZLFNBQUMsV0FBVyxFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRTs7aUNBN1NoRDs7U0FtSWEsc0JBQXNCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcblx0Q29tcG9uZW50LFxuXHRDb250ZW50Q2hpbGQsXG5cdEVsZW1lbnRSZWYsXG5cdEV2ZW50RW1pdHRlcixcblx0SW5wdXQsXG5cdE5nTW9kdWxlLFxuXHROZ1pvbmUsXG5cdE9uQ2hhbmdlcyxcblx0T25EZXN0cm95LFxuXHRPbkluaXQsXG5cdE91dHB1dCxcblx0UmVuZGVyZXIyLFxuXHRWaWV3Q2hpbGQsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2hhbmdlRXZlbnQge1xuXHRzdGFydD86IG51bWJlcjtcblx0ZW5kPzogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFdyYXBHcm91cERpbWVuc2lvbnMge1xuXHRudW1iZXJPZktub3duV3JhcEdyb3VwQ2hpbGRTaXplczogbnVtYmVyO1xuXHRzdW1PZktub3duV3JhcEdyb3VwQ2hpbGRXaWR0aHM6IG51bWJlcjtcblx0c3VtT2ZLbm93bldyYXBHcm91cENoaWxkSGVpZ2h0czogbnVtYmVyO1xuXHRtYXhDaGlsZFNpemVQZXJXcmFwR3JvdXA6IFdyYXBHcm91cERpbWVuc2lvbltdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFdyYXBHcm91cERpbWVuc2lvbiB7XG5cdGNoaWxkV2lkdGg6IG51bWJlcjtcblx0Y2hpbGRIZWlnaHQ6IG51bWJlcjtcblx0aXRlbXM6IGFueVtdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElEaW1lbnNpb25zIHtcblx0aXRlbUNvdW50OiBudW1iZXI7XG5cdGl0ZW1zUGVyV3JhcEdyb3VwOiBudW1iZXI7XG5cdHdyYXBHcm91cHNQZXJQYWdlOiBudW1iZXI7XG5cdGl0ZW1zUGVyUGFnZTogbnVtYmVyO1xuXHRwYWdlQ291bnRfZnJhY3Rpb25hbDogbnVtYmVyO1xuXHRjaGlsZFdpZHRoOiBudW1iZXI7XG5cdGNoaWxkSGVpZ2h0OiBudW1iZXI7XG5cdHNjcm9sbExlbmd0aDogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElQYWdlSW5mbyB7XG5cdHN0YXJ0SW5kZXg6IG51bWJlcjtcblx0ZW5kSW5kZXg6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJUGFnZUluZm9XaXRoQnVmZmVyIGV4dGVuZHMgSVBhZ2VJbmZvIHtcblx0c3RhcnRJbmRleFdpdGhCdWZmZXI6IG51bWJlcjtcblx0ZW5kSW5kZXhXaXRoQnVmZmVyOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVZpZXdwb3J0IGV4dGVuZHMgSVBhZ2VJbmZvV2l0aEJ1ZmZlciB7XG5cdHBhZGRpbmc6IG51bWJlcjtcblx0c2Nyb2xsTGVuZ3RoOiBudW1iZXI7XG59XG5cbkBDb21wb25lbnQoe1xuXHRzZWxlY3RvcjogJ3ZpcnR1YWwtc2Nyb2xsLFt2aXJ0dWFsU2Nyb2xsXScsXG5cdGV4cG9ydEFzOiAndmlydHVhbFNjcm9sbCcsXG5cdHRlbXBsYXRlOiBgXG4gICAgPGRpdiBjbGFzcz1cInRvdGFsLXBhZGRpbmdcIiAjaW52aXNpYmxlUGFkZGluZz48L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwic2Nyb2xsYWJsZS1jb250ZW50XCIgI2NvbnRlbnQ+XG4gICAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG4gICAgPC9kaXY+XG4gIGAsXG5cdGhvc3Q6IHtcblx0XHQnW2NsYXNzLmhvcml6b250YWxdJzogXCJob3Jpem9udGFsXCIsXG5cdFx0J1tjbGFzcy52ZXJ0aWNhbF0nOiBcIiFob3Jpem9udGFsXCIsXG5cdFx0J1tjbGFzcy5zZWxmU2Nyb2xsXSc6IFwiIXBhcmVudFNjcm9sbFwiXG5cdH0sXG5cdHN0eWxlczogW2BcbiAgICA6aG9zdCB7XG4gICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG5cdCAgZGlzcGxheTogYmxvY2s7XG4gICAgICAtd2Via2l0LW92ZXJmbG93LXNjcm9sbGluZzogdG91Y2g7XG4gICAgfVxuXHRcblx0Omhvc3QuaG9yaXpvbnRhbC5zZWxmU2Nyb2xsIHtcbiAgICAgIG92ZXJmbG93LXk6IHZpc2libGU7XG4gICAgICBvdmVyZmxvdy14OiBhdXRvO1xuXHR9XG5cdDpob3N0LnZlcnRpY2FsLnNlbGZTY3JvbGwge1xuICAgICAgb3ZlcmZsb3cteTogYXV0bztcbiAgICAgIG92ZXJmbG93LXg6IHZpc2libGU7XG5cdH1cblx0XG4gICAgLnNjcm9sbGFibGUtY29udGVudCB7XG4gICAgICB0b3A6IDA7XG4gICAgICBsZWZ0OiAwO1xuICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICBoZWlnaHQ6IDEwMCU7XG4gICAgICBtYXgtd2lkdGg6IDEwMHZ3O1xuICAgICAgbWF4LWhlaWdodDogMTAwdmg7XG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgfVxuXG5cdC5zY3JvbGxhYmxlLWNvbnRlbnQgOjpuZy1kZWVwID4gKiB7XG5cdFx0Ym94LXNpemluZzogYm9yZGVyLWJveDtcblx0fVxuXHRcblx0Omhvc3QuaG9yaXpvbnRhbCB7XG5cdFx0d2hpdGUtc3BhY2U6IG5vd3JhcDtcblx0fVxuXHRcblx0Omhvc3QuaG9yaXpvbnRhbCAuc2Nyb2xsYWJsZS1jb250ZW50IHtcblx0XHRkaXNwbGF5OiBmbGV4O1xuXHR9XG5cdFxuXHQ6aG9zdC5ob3Jpem9udGFsIC5zY3JvbGxhYmxlLWNvbnRlbnQgOjpuZy1kZWVwID4gKiB7XG5cdFx0ZmxleC1zaHJpbms6IDA7XG5cdFx0ZmxleC1ncm93OiAwO1xuXHRcdHdoaXRlLXNwYWNlOiBpbml0aWFsO1xuXHR9XG5cdFxuICAgIC50b3RhbC1wYWRkaW5nIHtcbiAgICAgIHdpZHRoOiAxcHg7XG4gICAgICBvcGFjaXR5OiAwO1xuICAgIH1cbiAgICBcbiAgICA6aG9zdC5ob3Jpem9udGFsIC50b3RhbC1wYWRkaW5nIHtcbiAgICAgIGhlaWdodDogMTAwJTtcbiAgICB9XG4gIGBdXG59KVxuZXhwb3J0IGNsYXNzIFZpcnR1YWxTY3JvbGxDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgT25EZXN0cm95IHtcblx0cHVibGljIHZpZXdQb3J0SXRlbXM6IGFueVtdO1xuXHRwdWJsaWMgd2luZG93ID0gd2luZG93O1xuXG5cdHB1YmxpYyBnZXQgdmlld1BvcnRJbmRpY2VzKCk6IElQYWdlSW5mbyB7XG5cdFx0bGV0IHBhZ2VJbmZvOiBJUGFnZUluZm8gPSB0aGlzLnByZXZpb3VzVmlld1BvcnQgfHwgPGFueT57fTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0c3RhcnRJbmRleDogcGFnZUluZm8uc3RhcnRJbmRleCB8fCAwLFxuXHRcdFx0ZW5kSW5kZXg6IHBhZ2VJbmZvLmVuZEluZGV4IHx8IDBcblx0XHR9O1xuXHR9XG5cblx0cHJvdGVjdGVkIF9lbmFibGVVbmVxdWFsQ2hpbGRyZW5TaXplczogYm9vbGVhbiA9IGZhbHNlO1xuXHRASW5wdXQoKVxuXHRwdWJsaWMgZ2V0IGVuYWJsZVVuZXF1YWxDaGlsZHJlblNpemVzKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLl9lbmFibGVVbmVxdWFsQ2hpbGRyZW5TaXplcztcblx0fVxuXHRwdWJsaWMgc2V0IGVuYWJsZVVuZXF1YWxDaGlsZHJlblNpemVzKHZhbHVlOiBib29sZWFuKSB7XG5cdFx0aWYgKHRoaXMuX2VuYWJsZVVuZXF1YWxDaGlsZHJlblNpemVzID09PSB2YWx1ZSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuX2VuYWJsZVVuZXF1YWxDaGlsZHJlblNpemVzID0gdmFsdWU7XG5cdFx0dGhpcy5taW5NZWFzdXJlZENoaWxkV2lkdGggPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5taW5NZWFzdXJlZENoaWxkSGVpZ2h0ID0gdW5kZWZpbmVkO1xuXHR9XG5cblx0QElucHV0KClcblx0cHVibGljIHVzZU1hcmdpbkluc3RlYWRPZlRyYW5zbGF0ZTogYm9vbGVhbiA9IGZhbHNlO1xuXG5cdEBJbnB1dCgpXG5cdHB1YmxpYyBzY3JvbGxiYXJXaWR0aDogbnVtYmVyO1xuXG5cdEBJbnB1dCgpXG5cdHB1YmxpYyBzY3JvbGxiYXJIZWlnaHQ6IG51bWJlcjtcblxuXHRASW5wdXQoKVxuXHRwdWJsaWMgY2hpbGRXaWR0aDogbnVtYmVyO1xuXG5cdEBJbnB1dCgpXG5cdHB1YmxpYyBjaGlsZEhlaWdodDogbnVtYmVyO1xuXG5cdHByb3RlY3RlZCBfYnVmZmVyQW1vdW50OiBudW1iZXIgPSAwO1xuXHRASW5wdXQoKVxuXHRwdWJsaWMgZ2V0IGJ1ZmZlckFtb3VudCgpOiBudW1iZXIge1xuXHRcdHJldHVybiBNYXRoLm1heCh0aGlzLl9idWZmZXJBbW91bnQsIHRoaXMuZW5hYmxlVW5lcXVhbENoaWxkcmVuU2l6ZXMgPyA1IDogMCk7XG5cdH1cblx0cHVibGljIHNldCBidWZmZXJBbW91bnQodmFsdWU6IG51bWJlcikge1xuXHRcdHRoaXMuX2J1ZmZlckFtb3VudCA9IHZhbHVlO1xuXHR9XG5cblx0QElucHV0KClcblx0cHVibGljIHNjcm9sbEFuaW1hdGlvblRpbWU6IG51bWJlciA9IDc1MDtcblxuXHRASW5wdXQoKVxuXHRwdWJsaWMgcmVzaXplQnlwYXNzUmVmcmVzaFRoZXNob2xkOiBudW1iZXIgPSA1O1xuXG5cdHByb3RlY3RlZCBfc2Nyb2xsVGhyb3R0bGluZ1RpbWU6IG51bWJlcjtcblx0QElucHV0KClcblx0cHVibGljIGdldCBzY3JvbGxUaHJvdHRsaW5nVGltZSgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLl9zY3JvbGxUaHJvdHRsaW5nVGltZTtcblx0fVxuXHRwdWJsaWMgc2V0IHNjcm9sbFRocm90dGxpbmdUaW1lKHZhbHVlOiBudW1iZXIpIHtcblx0XHR0aGlzLl9zY3JvbGxUaHJvdHRsaW5nVGltZSA9IHZhbHVlO1xuXHRcdHRoaXMucmVmcmVzaF90aHJvdHRsZWQgPSA8YW55PnRoaXMudGhyb3R0bGVUcmFpbGluZygoKSA9PiB7XG5cdFx0XHR0aGlzLnJlZnJlc2hfaW50ZXJuYWwoZmFsc2UpO1xuXHRcdH0sIHRoaXMuX3Njcm9sbFRocm90dGxpbmdUaW1lKTtcblx0fVxuXG5cdHByb3RlY3RlZCBjaGVja1Njcm9sbEVsZW1lbnRSZXNpemVkVGltZXI6IG51bWJlcjtcblx0cHJvdGVjdGVkIF9jaGVja1Jlc2l6ZUludGVydmFsOiBudW1iZXIgPSAxMDAwO1xuXHRASW5wdXQoKVxuXHRwdWJsaWMgZ2V0IGNoZWNrUmVzaXplSW50ZXJ2YWwoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5fY2hlY2tSZXNpemVJbnRlcnZhbDtcblx0fVxuXHRwdWJsaWMgc2V0IGNoZWNrUmVzaXplSW50ZXJ2YWwodmFsdWU6IG51bWJlcikge1xuXHRcdGlmICh0aGlzLl9jaGVja1Jlc2l6ZUludGVydmFsID09PSB2YWx1ZSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuX2NoZWNrUmVzaXplSW50ZXJ2YWwgPSB2YWx1ZTtcblx0XHR0aGlzLmFkZFNjcm9sbEV2ZW50SGFuZGxlcnMoKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfaXRlbXM6IGFueVtdID0gW107XG5cdEBJbnB1dCgpXG5cdHB1YmxpYyBnZXQgaXRlbXMoKTogYW55W10ge1xuXHRcdHJldHVybiB0aGlzLl9pdGVtcztcblx0fVxuXHRwdWJsaWMgc2V0IGl0ZW1zKHZhbHVlOiBhbnlbXSkge1xuXHRcdGlmICh2YWx1ZSA9PT0gdGhpcy5faXRlbXMpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLl9pdGVtcyA9IHZhbHVlIHx8IFtdO1xuXHRcdHRoaXMucmVmcmVzaF9pbnRlcm5hbCh0cnVlKTtcblx0fVxuXG5cdEBJbnB1dCgpXG5cdHB1YmxpYyBjb21wYXJlSXRlbXM6IChpdGVtMTogYW55LCBpdGVtMjogYW55KSA9PiBib29sZWFuID0gKGl0ZW0xOiBhbnksIGl0ZW0yOiBhbnkpID0+IGl0ZW0xID09PSBpdGVtMjtcblxuXHRwcm90ZWN0ZWQgX2hvcml6b250YWw6IGJvb2xlYW47XG5cdEBJbnB1dCgpXG5cdHB1YmxpYyBnZXQgaG9yaXpvbnRhbCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5faG9yaXpvbnRhbDtcblx0fVxuXHRwdWJsaWMgc2V0IGhvcml6b250YWwodmFsdWU6IGJvb2xlYW4pIHtcblx0XHR0aGlzLl9ob3Jpem9udGFsID0gdmFsdWU7XG5cdFx0dGhpcy51cGRhdGVEaXJlY3Rpb24oKTtcblx0fVxuXG5cdHByb3RlY3RlZCByZXZlcnRQYXJlbnRPdmVyc2Nyb2xsKCk6IHZvaWQge1xuXHRcdGNvbnN0IHNjcm9sbEVsZW1lbnQ6IGFueSA9IHRoaXMuZ2V0U2Nyb2xsRWxlbWVudCgpO1xuXHRcdGlmIChzY3JvbGxFbGVtZW50ICYmIHRoaXMub2xkUGFyZW50U2Nyb2xsT3ZlcmZsb3cpIHtcblx0XHRcdHNjcm9sbEVsZW1lbnQuc3R5bGVbJ292ZXJmbG93LXknXSA9IHRoaXMub2xkUGFyZW50U2Nyb2xsT3ZlcmZsb3cueTtcblx0XHRcdHNjcm9sbEVsZW1lbnQuc3R5bGVbJ292ZXJmbG93LXgnXSA9IHRoaXMub2xkUGFyZW50U2Nyb2xsT3ZlcmZsb3cueDtcblx0XHR9XG5cblx0XHR0aGlzLm9sZFBhcmVudFNjcm9sbE92ZXJmbG93ID0gdW5kZWZpbmVkO1xuXHR9XG5cblx0cHJvdGVjdGVkIG9sZFBhcmVudFNjcm9sbE92ZXJmbG93OiB7IHg6IHN0cmluZywgeTogc3RyaW5nIH07XG5cdHByb3RlY3RlZCBfcGFyZW50U2Nyb2xsOiBFbGVtZW50IHwgV2luZG93O1xuXHRASW5wdXQoKVxuXHRwdWJsaWMgZ2V0IHBhcmVudFNjcm9sbCgpOiBFbGVtZW50IHwgV2luZG93IHtcblx0XHRyZXR1cm4gdGhpcy5fcGFyZW50U2Nyb2xsO1xuXHR9XG5cdHB1YmxpYyBzZXQgcGFyZW50U2Nyb2xsKHZhbHVlOiBFbGVtZW50IHwgV2luZG93KSB7XG5cdFx0aWYgKHRoaXMuX3BhcmVudFNjcm9sbCA9PT0gdmFsdWUpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLnJldmVydFBhcmVudE92ZXJzY3JvbGwoKTtcblx0XHR0aGlzLl9wYXJlbnRTY3JvbGwgPSB2YWx1ZTtcblx0XHR0aGlzLmFkZFNjcm9sbEV2ZW50SGFuZGxlcnMoKTtcblxuXHRcdGNvbnN0IHNjcm9sbEVsZW1lbnQ6YW55ID0gdGhpcy5nZXRTY3JvbGxFbGVtZW50KCk7XG5cdFx0aWYgKHNjcm9sbEVsZW1lbnQgIT09IHRoaXMuZWxlbWVudC5uYXRpdmVFbGVtZW50KSB7XG5cdFx0XHR0aGlzLm9sZFBhcmVudFNjcm9sbE92ZXJmbG93ID0geyB4OiBzY3JvbGxFbGVtZW50LnN0eWxlWydvdmVyZmxvdy14J10sIHk6IHNjcm9sbEVsZW1lbnQuc3R5bGVbJ292ZXJmbG93LXknXSB9O1xuXHRcdFx0c2Nyb2xsRWxlbWVudC5zdHlsZVsnb3ZlcmZsb3cteSddID0gdGhpcy5ob3Jpem9udGFsID8gJ3Zpc2libGUnIDogJ2F1dG8nO1xuXHRcdFx0c2Nyb2xsRWxlbWVudC5zdHlsZVsnb3ZlcmZsb3cteCddID0gdGhpcy5ob3Jpem9udGFsID8gJ2F1dG8nIDogJ3Zpc2libGUnO1xuXHRcdH1cblx0fVxuXG5cdEBPdXRwdXQoKVxuXHRwdWJsaWMgdXBkYXRlOiBFdmVudEVtaXR0ZXI8YW55W10+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnlbXT4oKTtcblx0QE91dHB1dCgpXG5cdHB1YmxpYyB2c1VwZGF0ZTogRXZlbnRFbWl0dGVyPGFueVtdPiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55W10+KCk7XG5cblx0QE91dHB1dCgpXG5cdHB1YmxpYyBjaGFuZ2U6IEV2ZW50RW1pdHRlcjxDaGFuZ2VFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENoYW5nZUV2ZW50PigpO1xuXHRAT3V0cHV0KClcblx0cHVibGljIHZzQ2hhbmdlOiBFdmVudEVtaXR0ZXI8Q2hhbmdlRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDaGFuZ2VFdmVudD4oKTtcblxuXHRAT3V0cHV0KClcblx0cHVibGljIHN0YXJ0OiBFdmVudEVtaXR0ZXI8Q2hhbmdlRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDaGFuZ2VFdmVudD4oKTtcblx0QE91dHB1dCgpXG5cdHB1YmxpYyB2c1N0YXJ0OiBFdmVudEVtaXR0ZXI8Q2hhbmdlRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDaGFuZ2VFdmVudD4oKTtcblxuXHRAT3V0cHV0KClcblx0cHVibGljIGVuZDogRXZlbnRFbWl0dGVyPENoYW5nZUV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hhbmdlRXZlbnQ+KCk7XG5cdEBPdXRwdXQoKVxuXHRwdWJsaWMgdnNFbmQ6IEV2ZW50RW1pdHRlcjxDaGFuZ2VFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENoYW5nZUV2ZW50PigpO1xuXG5cdEBWaWV3Q2hpbGQoJ2NvbnRlbnQnLCB7IHJlYWQ6IEVsZW1lbnRSZWYgfSlcblx0cHVibGljIGNvbnRlbnRFbGVtZW50UmVmOiBFbGVtZW50UmVmO1xuXG5cdEBWaWV3Q2hpbGQoJ2ludmlzaWJsZVBhZGRpbmcnLCB7IHJlYWQ6IEVsZW1lbnRSZWYgfSlcblx0cHVibGljIGludmlzaWJsZVBhZGRpbmdFbGVtZW50UmVmOiBFbGVtZW50UmVmO1xuXG5cdEBDb250ZW50Q2hpbGQoJ2NvbnRhaW5lcicsIHsgcmVhZDogRWxlbWVudFJlZiB9KVxuXHRwdWJsaWMgY29udGFpbmVyRWxlbWVudFJlZjogRWxlbWVudFJlZjtcblxuXHRwdWJsaWMgbmdPbkluaXQoKSB7XG5cdFx0dGhpcy5hZGRTY3JvbGxFdmVudEhhbmRsZXJzKCk7XG5cdH1cblxuXHRwdWJsaWMgbmdPbkRlc3Ryb3koKSB7XG5cdFx0dGhpcy5yZW1vdmVTY3JvbGxFdmVudEhhbmRsZXJzKCk7XG5cdFx0dGhpcy5yZXZlcnRQYXJlbnRPdmVyc2Nyb2xsKCk7XG5cdH1cblxuXHRwdWJsaWMgbmdPbkNoYW5nZXMoY2hhbmdlczogYW55KSB7XG5cdFx0bGV0IGluZGV4TGVuZ3RoQ2hhbmdlZDogYW55ID0gdGhpcy5jYWNoZWRJdGVtc0xlbmd0aCAhPT0gdGhpcy5pdGVtcy5sZW5ndGg7XG5cdFx0dGhpcy5jYWNoZWRJdGVtc0xlbmd0aCA9IHRoaXMuaXRlbXMubGVuZ3RoO1xuXG5cdFx0Y29uc3QgZmlyc3RSdW46IGJvb2xlYW4gPSAhY2hhbmdlcy5pdGVtcyB8fCAhY2hhbmdlcy5pdGVtcy5wcmV2aW91c1ZhbHVlIHx8IGNoYW5nZXMuaXRlbXMucHJldmlvdXNWYWx1ZS5sZW5ndGggPT09IDA7XG5cdFx0dGhpcy5yZWZyZXNoX2ludGVybmFsKGluZGV4TGVuZ3RoQ2hhbmdlZCB8fCBmaXJzdFJ1bik7XG5cdH1cblxuXHRwdWJsaWMgbmdEb0NoZWNrKCkge1xuXHRcdGlmICh0aGlzLmNhY2hlZEl0ZW1zTGVuZ3RoICE9PSB0aGlzLml0ZW1zLmxlbmd0aCkge1xuXHRcdFx0dGhpcy5jYWNoZWRJdGVtc0xlbmd0aCA9IHRoaXMuaXRlbXMubGVuZ3RoO1xuXHRcdFx0dGhpcy5yZWZyZXNoX2ludGVybmFsKHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdHB1YmxpYyByZWZyZXNoKCkge1xuXHRcdHRoaXMucmVmcmVzaF9pbnRlcm5hbCh0cnVlKTtcblx0fVxuXG5cdHB1YmxpYyBzY3JvbGxJbnRvKGl0ZW06IGFueSwgYWxpZ25Ub0JlZ2lubmluZzogYm9vbGVhbiA9IHRydWUsIGFkZGl0aW9uYWxPZmZzZXQ6IG51bWJlciA9IDAsIGFuaW1hdGlvbk1pbGxpc2Vjb25kczogbnVtYmVyID0gdW5kZWZpbmVkLCBhbmltYXRpb25Db21wbGV0ZWRDYWxsYmFjazogKCkgPT4gdm9pZCA9IHVuZGVmaW5lZCkge1xuXHRcdGxldCBpbmRleDogbnVtYmVyID0gdGhpcy5pdGVtcy5pbmRleE9mKGl0ZW0pO1xuXHRcdGlmIChpbmRleCA9PT0gLTEpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLnNjcm9sbFRvSW5kZXgoaW5kZXgsIGFsaWduVG9CZWdpbm5pbmcsIGFkZGl0aW9uYWxPZmZzZXQsIGFuaW1hdGlvbk1pbGxpc2Vjb25kcywgYW5pbWF0aW9uQ29tcGxldGVkQ2FsbGJhY2spO1xuXHR9XG5cblx0cHVibGljIHNjcm9sbFRvSW5kZXgoaW5kZXg6IG51bWJlciwgYWxpZ25Ub0JlZ2lubmluZzogYm9vbGVhbiA9IHRydWUsIGFkZGl0aW9uYWxPZmZzZXQ6IG51bWJlciA9IDAsIGFuaW1hdGlvbk1pbGxpc2Vjb25kczogbnVtYmVyID0gdW5kZWZpbmVkLCBhbmltYXRpb25Db21wbGV0ZWRDYWxsYmFjazogKCkgPT4gdm9pZCA9IHVuZGVmaW5lZCkge1xuXHRcdGxldCBtYXhSZXRyaWVzOiBudW1iZXIgPSA1O1xuXG5cdFx0bGV0IHJldHJ5SWZOZWVkZWQgPSAoKSA9PiB7XG5cdFx0XHQtLW1heFJldHJpZXM7XG5cdFx0XHRpZiAobWF4UmV0cmllcyA8PSAwKSB7XG5cdFx0XHRcdGlmIChhbmltYXRpb25Db21wbGV0ZWRDYWxsYmFjaykge1xuXHRcdFx0XHRcdGFuaW1hdGlvbkNvbXBsZXRlZENhbGxiYWNrKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgZGltZW5zaW9uczogYW55ID0gdGhpcy5jYWxjdWxhdGVEaW1lbnNpb25zKCk7XG5cdFx0XHRsZXQgZGVzaXJlZFN0YXJ0SW5kZXg6IGFueSA9IE1hdGgubWluKE1hdGgubWF4KGluZGV4LCAwKSwgZGltZW5zaW9ucy5pdGVtQ291bnQgLSAxKTtcblx0XHRcdGlmICh0aGlzLnByZXZpb3VzVmlld1BvcnQuc3RhcnRJbmRleCA9PT0gZGVzaXJlZFN0YXJ0SW5kZXgpIHtcblx0XHRcdFx0aWYgKGFuaW1hdGlvbkNvbXBsZXRlZENhbGxiYWNrKSB7XG5cdFx0XHRcdFx0YW5pbWF0aW9uQ29tcGxldGVkQ2FsbGJhY2soKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuc2Nyb2xsVG9JbmRleF9pbnRlcm5hbChpbmRleCwgYWxpZ25Ub0JlZ2lubmluZywgYWRkaXRpb25hbE9mZnNldCwgMCwgcmV0cnlJZk5lZWRlZCk7XG5cdFx0fTtcblxuXHRcdHRoaXMuc2Nyb2xsVG9JbmRleF9pbnRlcm5hbChpbmRleCwgYWxpZ25Ub0JlZ2lubmluZywgYWRkaXRpb25hbE9mZnNldCwgYW5pbWF0aW9uTWlsbGlzZWNvbmRzLCByZXRyeUlmTmVlZGVkKTtcblx0fVxuXG5cdHByb3RlY3RlZCBzY3JvbGxUb0luZGV4X2ludGVybmFsKGluZGV4OiBudW1iZXIsIGFsaWduVG9CZWdpbm5pbmc6IGJvb2xlYW4gPSB0cnVlLCBhZGRpdGlvbmFsT2Zmc2V0OiBudW1iZXIgPSAwLCBhbmltYXRpb25NaWxsaXNlY29uZHM6IG51bWJlciA9IHVuZGVmaW5lZCwgYW5pbWF0aW9uQ29tcGxldGVkQ2FsbGJhY2s6ICgpID0+IHZvaWQgPSB1bmRlZmluZWQpIHtcblx0XHRhbmltYXRpb25NaWxsaXNlY29uZHMgPSBhbmltYXRpb25NaWxsaXNlY29uZHMgPT09IHVuZGVmaW5lZCA/IHRoaXMuc2Nyb2xsQW5pbWF0aW9uVGltZSA6IGFuaW1hdGlvbk1pbGxpc2Vjb25kcztcblxuXHRcdGxldCBzY3JvbGxFbGVtZW50OiBhbnkgPSB0aGlzLmdldFNjcm9sbEVsZW1lbnQoKTtcblx0XHRsZXQgb2Zmc2V0OiBhbnkgPSB0aGlzLmdldEVsZW1lbnRzT2Zmc2V0KCk7XG5cblx0XHRsZXQgZGltZW5zaW9uczogYW55ID0gdGhpcy5jYWxjdWxhdGVEaW1lbnNpb25zKCk7XG5cdFx0bGV0IHNjcm9sbDogYW55ID0gdGhpcy5jYWxjdWxhdGVQYWRkaW5nKGluZGV4LCBkaW1lbnNpb25zLCBmYWxzZSkgKyBvZmZzZXQgKyBhZGRpdGlvbmFsT2Zmc2V0O1xuXHRcdGlmICghYWxpZ25Ub0JlZ2lubmluZykge1xuXHRcdFx0c2Nyb2xsIC09IGRpbWVuc2lvbnMud3JhcEdyb3Vwc1BlclBhZ2UgKiBkaW1lbnNpb25zW3RoaXMuX2NoaWxkU2Nyb2xsRGltXTtcblx0XHR9XG5cblx0XHRsZXQgYW5pbWF0aW9uUmVxdWVzdDogbnVtYmVyO1xuXG5cblx0XHRpZiAoIWFuaW1hdGlvbk1pbGxpc2Vjb25kcykge1xuXHRcdFx0dGhpcy5yZW5kZXJlci5zZXRQcm9wZXJ0eShzY3JvbGxFbGVtZW50LCB0aGlzLl9zY3JvbGxUeXBlLCBzY3JvbGwpO1xuXHRcdFx0dGhpcy5yZWZyZXNoX2ludGVybmFsKGZhbHNlLCBhbmltYXRpb25Db21wbGV0ZWRDYWxsYmFjayk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFxuXHR9XG5cblx0Y29uc3RydWN0b3IocHJvdGVjdGVkIHJlYWRvbmx5IGVsZW1lbnQ6IEVsZW1lbnRSZWYsIHByb3RlY3RlZCByZWFkb25seSByZW5kZXJlcjogUmVuZGVyZXIyLCBwcm90ZWN0ZWQgcmVhZG9ubHkgem9uZTogTmdab25lKSB7XG5cdFx0dGhpcy5ob3Jpem9udGFsID0gZmFsc2U7XG5cdFx0dGhpcy5zY3JvbGxUaHJvdHRsaW5nVGltZSA9IDA7XG5cdFx0dGhpcy5yZXNldFdyYXBHcm91cERpbWVuc2lvbnMoKTtcblx0fVxuXG5cdHByb3RlY3RlZCBwcmV2aW91c1Njcm9sbEJvdW5kaW5nUmVjdDogQ2xpZW50UmVjdDtcblx0cHJvdGVjdGVkIGNoZWNrU2Nyb2xsRWxlbWVudFJlc2l6ZWQoKTogdm9pZCB7XG5cdFx0bGV0IGJvdW5kaW5nUmVjdDogYW55ID0gdGhpcy5nZXRTY3JvbGxFbGVtZW50KCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cblx0XHRsZXQgc2l6ZUNoYW5nZWQ6IGJvb2xlYW47XG5cdFx0aWYgKCF0aGlzLnByZXZpb3VzU2Nyb2xsQm91bmRpbmdSZWN0KSB7XG5cdFx0XHRzaXplQ2hhbmdlZCA9IHRydWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxldCB3aWR0aENoYW5nZTogYW55ID0gTWF0aC5hYnMoYm91bmRpbmdSZWN0LndpZHRoIC0gdGhpcy5wcmV2aW91c1Njcm9sbEJvdW5kaW5nUmVjdC53aWR0aCk7XG5cdFx0XHRsZXQgaGVpZ2h0Q2hhbmdlOiBhbnkgPSBNYXRoLmFicyhib3VuZGluZ1JlY3QuaGVpZ2h0IC0gdGhpcy5wcmV2aW91c1Njcm9sbEJvdW5kaW5nUmVjdC5oZWlnaHQpO1xuXHRcdFx0c2l6ZUNoYW5nZWQgPSB3aWR0aENoYW5nZSA+IHRoaXMucmVzaXplQnlwYXNzUmVmcmVzaFRoZXNob2xkIHx8IGhlaWdodENoYW5nZSA+IHRoaXMucmVzaXplQnlwYXNzUmVmcmVzaFRoZXNob2xkO1xuXHRcdH1cblxuXHRcdGlmIChzaXplQ2hhbmdlZCkge1xuXHRcdFx0dGhpcy5wcmV2aW91c1Njcm9sbEJvdW5kaW5nUmVjdCA9IGJvdW5kaW5nUmVjdDtcblx0XHRcdGlmIChib3VuZGluZ1JlY3Qud2lkdGggPiAwICYmIGJvdW5kaW5nUmVjdC5oZWlnaHQgPiAwKSB7XG5cdFx0XHRcdHRoaXMucmVmcmVzaF9pbnRlcm5hbChmYWxzZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cHJvdGVjdGVkIF9pbnZpc2libGVQYWRkaW5nUHJvcGVydHk6IGFueTtcblx0cHJvdGVjdGVkIF9vZmZzZXRUeXBlOiBhbnk7XG5cdHByb3RlY3RlZCBfc2Nyb2xsVHlwZTogYW55O1xuXHRwcm90ZWN0ZWQgX3BhZ2VPZmZzZXRUeXBlOiBhbnk7XG5cdHByb3RlY3RlZCBfY2hpbGRTY3JvbGxEaW06IGFueTtcblx0cHJvdGVjdGVkIF90cmFuc2xhdGVEaXI6IGFueTtcblx0cHJvdGVjdGVkIF9tYXJnaW5EaXI6IGFueTtcblx0cHJvdGVjdGVkIHVwZGF0ZURpcmVjdGlvbigpOiB2b2lkIHtcblx0XHRpZiAodGhpcy5ob3Jpem9udGFsKSB7XG5cdFx0XHR0aGlzLl9pbnZpc2libGVQYWRkaW5nUHJvcGVydHkgPSAnd2lkdGgnO1xuXHRcdFx0dGhpcy5fb2Zmc2V0VHlwZSA9ICdvZmZzZXRMZWZ0Jztcblx0XHRcdHRoaXMuX3BhZ2VPZmZzZXRUeXBlID0gJ3BhZ2VYT2Zmc2V0Jztcblx0XHRcdHRoaXMuX2NoaWxkU2Nyb2xsRGltID0gJ2NoaWxkV2lkdGgnO1xuXHRcdFx0dGhpcy5fbWFyZ2luRGlyID0gJ21hcmdpbi1sZWZ0Jztcblx0XHRcdHRoaXMuX3RyYW5zbGF0ZURpciA9ICd0cmFuc2xhdGVYJztcblx0XHRcdHRoaXMuX3Njcm9sbFR5cGUgPSAnc2Nyb2xsTGVmdCc7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dGhpcy5faW52aXNpYmxlUGFkZGluZ1Byb3BlcnR5ID0gJ2hlaWdodCc7XG5cdFx0XHR0aGlzLl9vZmZzZXRUeXBlID0gJ29mZnNldFRvcCc7XG5cdFx0XHR0aGlzLl9wYWdlT2Zmc2V0VHlwZSA9ICdwYWdlWU9mZnNldCc7XG5cdFx0XHR0aGlzLl9jaGlsZFNjcm9sbERpbSA9ICdjaGlsZEhlaWdodCc7XG5cdFx0XHR0aGlzLl9tYXJnaW5EaXIgPSAnbWFyZ2luLXRvcCc7XG5cdFx0XHR0aGlzLl90cmFuc2xhdGVEaXIgPSAndHJhbnNsYXRlWSc7XG5cdFx0XHR0aGlzLl9zY3JvbGxUeXBlID0gJ3Njcm9sbFRvcCc7XG5cdFx0fVxuXHR9XG5cblx0cHJvdGVjdGVkIHJlZnJlc2hfdGhyb3R0bGVkOiAoKSA9PiB2b2lkO1xuXG5cdHByb3RlY3RlZCB0aHJvdHRsZVRyYWlsaW5nKGZ1bmM6IEZ1bmN0aW9uLCB3YWl0OiBudW1iZXIpOiBGdW5jdGlvbiB7XG5cdFx0bGV0IHRpbWVvdXQ6IGFueSA9IHVuZGVmaW5lZDtcblx0XHRjb25zdCByZXN1bHQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRjb25zdCBfdGhpcyA9IHRoaXM7XG5cdFx0XHRjb25zdCBfYXJndW1lbnRzID0gYXJndW1lbnRzO1xuXG5cdFx0XHRpZiAodGltZW91dCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGlmICh3YWl0IDw9IDApIHtcblx0XHRcdFx0ZnVuYy5hcHBseShfdGhpcywgX2FyZ3VtZW50cyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0dGltZW91dCA9IHVuZGVmaW5lZDtcblx0XHRcdFx0XHRmdW5jLmFwcGx5KF90aGlzLCBfYXJndW1lbnRzKTtcblx0XHRcdFx0fSwgd2FpdCk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgY2FsY3VsYXRlZFNjcm9sbGJhcldpZHRoOiBudW1iZXIgPSAwO1xuXHRwcm90ZWN0ZWQgY2FsY3VsYXRlZFNjcm9sbGJhckhlaWdodDogbnVtYmVyID0gMDtcblxuXHRwcm90ZWN0ZWQgcGFkZGluZzogbnVtYmVyID0gMDtcblx0cHJvdGVjdGVkIHByZXZpb3VzVmlld1BvcnQ6IElWaWV3cG9ydCA9IDxhbnk+e307XG5cdHByb3RlY3RlZCBjYWNoZWRJdGVtc0xlbmd0aDogbnVtYmVyO1xuXG5cdHByb3RlY3RlZCBkaXNwb3NlU2Nyb2xsSGFuZGxlcjogKCkgPT4gdm9pZCB8IHVuZGVmaW5lZDtcblx0cHJvdGVjdGVkIGRpc3Bvc2VSZXNpemVIYW5kbGVyOiAoKSA9PiB2b2lkIHwgdW5kZWZpbmVkO1xuXG5cdHByb3RlY3RlZCByZWZyZXNoX2ludGVybmFsKGl0ZW1zQXJyYXlNb2RpZmllZDogYm9vbGVhbiwgcmVmcmVzaENvbXBsZXRlZENhbGxiYWNrOiAoKSA9PiB2b2lkID0gdW5kZWZpbmVkLCBtYXhSdW5UaW1lczogbnVtYmVyID0gMikge1xuXHRcdC8vbm90ZTogbWF4UnVuVGltZXMgaXMgdG8gZm9yY2UgaXQgdG8ga2VlcCByZWNhbGN1bGF0aW5nIGlmIHRoZSBwcmV2aW91cyBpdGVyYXRpb24gY2F1c2VkIGEgcmUtcmVuZGVyIChkaWZmZXJlbnQgc2xpY2VkIGl0ZW1zIGluIHZpZXdwb3J0IG9yIHNjcm9sbFBvc2l0aW9uIGNoYW5nZWQpLlxuXHRcdC8vVGhlIGRlZmF1bHQgb2YgMnggbWF4IHdpbGwgcHJvYmFibHkgYmUgYWNjdXJhdGUgZW5vdWdoIHdpdGhvdXQgY2F1c2luZyB0b28gbGFyZ2UgYSBwZXJmb3JtYW5jZSBib3R0bGVuZWNrXG5cdFx0Ly9UaGUgY29kZSB3b3VsZCB0eXBpY2FsbHkgcXVpdCBvdXQgb24gdGhlIDJuZCBpdGVyYXRpb24gYW55d2F5cy4gVGhlIG1haW4gdGltZSBpdCdkIHRoaW5rIG1vcmUgdGhhbiAyIHJ1bnMgd291bGQgYmUgbmVjZXNzYXJ5IHdvdWxkIGJlIGZvciB2YXN0bHkgZGlmZmVyZW50IHNpemVkIGNoaWxkIGl0ZW1zIG9yIGlmIHRoaXMgaXMgdGhlIDFzdCB0aW1lIHRoZSBpdGVtcyBhcnJheSB3YXMgaW5pdGlhbGl6ZWQuXG5cdFx0Ly9XaXRob3V0IG1heFJ1blRpbWVzLCBJZiB0aGUgdXNlciBpcyBhY3RpdmVseSBzY3JvbGxpbmcgdGhpcyBjb2RlIHdvdWxkIGJlY29tZSBhbiBpbmZpbml0ZSBsb29wIHVudGlsIHRoZXkgc3RvcHBlZCBzY3JvbGxpbmcuIFRoaXMgd291bGQgYmUgb2theSwgZXhjZXB0IGVhY2ggc2Nyb2xsIGV2ZW50IHdvdWxkIHN0YXJ0IGFuIGFkZGl0aW9uYWwgaW5maW50ZSBsb29wLiBXZSB3YW50IHRvIHNob3J0LWNpcmN1aXQgaXQgdG8gcHJldmVudCBoaXMuXG5cblx0XHR0aGlzLnpvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuXHRcdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcblxuXHRcdFx0XHRpZiAoaXRlbXNBcnJheU1vZGlmaWVkKSB7XG5cdFx0XHRcdFx0dGhpcy5yZXNldFdyYXBHcm91cERpbWVuc2lvbnMoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRsZXQgdmlld3BvcnQ6IGFueSA9IHRoaXMuY2FsY3VsYXRlVmlld3BvcnQoKTtcblxuXHRcdFx0XHRsZXQgc3RhcnRDaGFuZ2VkOiBhbnkgPSBpdGVtc0FycmF5TW9kaWZpZWQgfHwgdmlld3BvcnQuc3RhcnRJbmRleCAhPT0gdGhpcy5wcmV2aW91c1ZpZXdQb3J0LnN0YXJ0SW5kZXg7XG5cdFx0XHRcdGxldCBlbmRDaGFuZ2VkOiBhbnkgPSBpdGVtc0FycmF5TW9kaWZpZWQgfHwgdmlld3BvcnQuZW5kSW5kZXggIT09IHRoaXMucHJldmlvdXNWaWV3UG9ydC5lbmRJbmRleDtcblx0XHRcdFx0bGV0IHNjcm9sbExlbmd0aENoYW5nZWQ6IGFueSA9IHZpZXdwb3J0LnNjcm9sbExlbmd0aCAhPT0gdGhpcy5wcmV2aW91c1ZpZXdQb3J0LnNjcm9sbExlbmd0aDtcblx0XHRcdFx0bGV0IHBhZGRpbmdDaGFuZ2VkOiBhbnkgPSB2aWV3cG9ydC5wYWRkaW5nICE9PSB0aGlzLnByZXZpb3VzVmlld1BvcnQucGFkZGluZztcblxuXHRcdFx0XHR0aGlzLnByZXZpb3VzVmlld1BvcnQgPSB2aWV3cG9ydDtcblxuXHRcdFx0XHRpZiAoc2Nyb2xsTGVuZ3RoQ2hhbmdlZCkge1xuXHRcdFx0XHRcdHRoaXMucmVuZGVyZXIuc2V0U3R5bGUodGhpcy5pbnZpc2libGVQYWRkaW5nRWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCB0aGlzLl9pbnZpc2libGVQYWRkaW5nUHJvcGVydHksIGAke3ZpZXdwb3J0LnNjcm9sbExlbmd0aH1weGApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHBhZGRpbmdDaGFuZ2VkKSB7XG5cdFx0XHRcdFx0aWYgKHRoaXMudXNlTWFyZ2luSW5zdGVhZE9mVHJhbnNsYXRlKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHRoaXMuY29udGVudEVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgdGhpcy5fbWFyZ2luRGlyLCBgJHt2aWV3cG9ydC5wYWRkaW5nfXB4YCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0dGhpcy5yZW5kZXJlci5zZXRTdHlsZSh0aGlzLmNvbnRlbnRFbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsICd0cmFuc2Zvcm0nLCBgJHt0aGlzLl90cmFuc2xhdGVEaXJ9KCR7dmlld3BvcnQucGFkZGluZ31weClgKTtcblx0XHRcdFx0XHRcdHRoaXMucmVuZGVyZXIuc2V0U3R5bGUodGhpcy5jb250ZW50RWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCAnd2Via2l0VHJhbnNmb3JtJywgYCR7dGhpcy5fdHJhbnNsYXRlRGlyfSgke3ZpZXdwb3J0LnBhZGRpbmd9cHgpYCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IGVtaXRJbmRleENoYW5nZWRFdmVudHM6IGFueSA9IHRydWU7IC8vIG1heFJlUnVuVGltZXMgPT09IDEgKHdvdWxkIG5lZWQgdG8gc3RpbGwgcnVuIGlmIGRpZG4ndCB1cGRhdGUgaWYgcHJldmlvdXMgaXRlcmF0aW9uIGhhZCB1cGRhdGVkKVxuXG5cdFx0XHRcdGlmIChzdGFydENoYW5nZWQgfHwgZW5kQ2hhbmdlZCkge1xuXHRcdFx0XHRcdHRoaXMuem9uZS5ydW4oKCkgPT4ge1xuXG5cdFx0XHRcdFx0XHQvLyB1cGRhdGUgdGhlIHNjcm9sbCBsaXN0IHRvIHRyaWdnZXIgcmUtcmVuZGVyIG9mIGNvbXBvbmVudHMgaW4gdmlld3BvcnRcblx0XHRcdFx0XHRcdHRoaXMudmlld1BvcnRJdGVtcyA9IHZpZXdwb3J0LnN0YXJ0SW5kZXhXaXRoQnVmZmVyID49IDAgJiYgdmlld3BvcnQuZW5kSW5kZXhXaXRoQnVmZmVyID49IDAgPyB0aGlzLml0ZW1zLnNsaWNlKHZpZXdwb3J0LnN0YXJ0SW5kZXhXaXRoQnVmZmVyLCB2aWV3cG9ydC5lbmRJbmRleFdpdGhCdWZmZXIgKyAxKSA6IFtdO1xuXHRcdFx0XHRcdFx0dGhpcy51cGRhdGUuZW1pdCh0aGlzLnZpZXdQb3J0SXRlbXMpO1xuXHRcdFx0XHRcdFx0dGhpcy52c1VwZGF0ZS5lbWl0KHRoaXMudmlld1BvcnRJdGVtcyk7XG5cblx0XHRcdFx0XHRcdGlmIChlbWl0SW5kZXhDaGFuZ2VkRXZlbnRzKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChzdGFydENoYW5nZWQpIHtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnN0YXJ0LmVtaXQoeyBzdGFydDogdmlld3BvcnQuc3RhcnRJbmRleCwgZW5kOiB2aWV3cG9ydC5lbmRJbmRleCB9KTtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnZzU3RhcnQuZW1pdCh7IHN0YXJ0OiB2aWV3cG9ydC5zdGFydEluZGV4LCBlbmQ6IHZpZXdwb3J0LmVuZEluZGV4IH0pO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKGVuZENoYW5nZWQpIHtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLmVuZC5lbWl0KHsgc3RhcnQ6IHZpZXdwb3J0LnN0YXJ0SW5kZXgsIGVuZDogdmlld3BvcnQuZW5kSW5kZXggfSk7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy52c0VuZC5lbWl0KHsgc3RhcnQ6IHZpZXdwb3J0LnN0YXJ0SW5kZXgsIGVuZDogdmlld3BvcnQuZW5kSW5kZXggfSk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAoc3RhcnRDaGFuZ2VkIHx8IGVuZENoYW5nZWQpIHtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLmNoYW5nZS5lbWl0KHsgc3RhcnQ6IHZpZXdwb3J0LnN0YXJ0SW5kZXgsIGVuZDogdmlld3BvcnQuZW5kSW5kZXggfSk7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy52c0NoYW5nZS5lbWl0KHsgc3RhcnQ6IHZpZXdwb3J0LnN0YXJ0SW5kZXgsIGVuZDogdmlld3BvcnQuZW5kSW5kZXggfSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYgKG1heFJ1blRpbWVzID4gMCkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLnJlZnJlc2hfaW50ZXJuYWwoZmFsc2UsIHJlZnJlc2hDb21wbGV0ZWRDYWxsYmFjaywgbWF4UnVuVGltZXMgLSAxKTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAocmVmcmVzaENvbXBsZXRlZENhbGxiYWNrKSB7XG5cdFx0XHRcdFx0XHRcdHJlZnJlc2hDb21wbGV0ZWRDYWxsYmFjaygpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGlmIChtYXhSdW5UaW1lcyA+IDAgJiYgKHNjcm9sbExlbmd0aENoYW5nZWQgfHwgcGFkZGluZ0NoYW5nZWQpKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnJlZnJlc2hfaW50ZXJuYWwoZmFsc2UsIHJlZnJlc2hDb21wbGV0ZWRDYWxsYmFjaywgbWF4UnVuVGltZXMgLSAxKTtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAocmVmcmVzaENvbXBsZXRlZENhbGxiYWNrKSB7XG5cdFx0XHRcdFx0XHRyZWZyZXNoQ29tcGxldGVkQ2FsbGJhY2soKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0cHJvdGVjdGVkIGdldFNjcm9sbEVsZW1lbnQoKTogYW55IHtcblx0XHRyZXR1cm4gdGhpcy5wYXJlbnRTY3JvbGwgaW5zdGFuY2VvZiBXaW5kb3cgPyBkb2N1bWVudC5zY3JvbGxpbmdFbGVtZW50IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5IDogdGhpcy5wYXJlbnRTY3JvbGwgfHwgdGhpcy5lbGVtZW50Lm5hdGl2ZUVsZW1lbnQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgYWRkU2Nyb2xsRXZlbnRIYW5kbGVycygpIHtcblx0XHRsZXQgc2Nyb2xsRWxlbWVudDogYW55ID0gdGhpcy5nZXRTY3JvbGxFbGVtZW50KCk7XG5cblx0XHR0aGlzLnJlbW92ZVNjcm9sbEV2ZW50SGFuZGxlcnMoKTtcblxuXHRcdHRoaXMuem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG5cdFx0XHRpZiAodGhpcy5wYXJlbnRTY3JvbGwgaW5zdGFuY2VvZiBXaW5kb3cpIHtcblx0XHRcdFx0dGhpcy5kaXNwb3NlU2Nyb2xsSGFuZGxlciA9IHRoaXMucmVuZGVyZXIubGlzdGVuKCd3aW5kb3cnLCAnc2Nyb2xsJywgdGhpcy5yZWZyZXNoX3Rocm90dGxlZCk7XG5cdFx0XHRcdHRoaXMuZGlzcG9zZVJlc2l6ZUhhbmRsZXIgPSB0aGlzLnJlbmRlcmVyLmxpc3Rlbignd2luZG93JywgJ3Jlc2l6ZScsIHRoaXMucmVmcmVzaF90aHJvdHRsZWQpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHRoaXMuZGlzcG9zZVNjcm9sbEhhbmRsZXIgPSB0aGlzLnJlbmRlcmVyLmxpc3RlbihzY3JvbGxFbGVtZW50LCAnc2Nyb2xsJywgdGhpcy5yZWZyZXNoX3Rocm90dGxlZCk7XG5cdFx0XHRcdGlmICh0aGlzLl9jaGVja1Jlc2l6ZUludGVydmFsID4gMCkge1xuXHRcdFx0XHRcdHRoaXMuY2hlY2tTY3JvbGxFbGVtZW50UmVzaXplZFRpbWVyID0gPGFueT5zZXRJbnRlcnZhbCgoKSA9PiB7IHRoaXMuY2hlY2tTY3JvbGxFbGVtZW50UmVzaXplZCgpOyB9LCB0aGlzLl9jaGVja1Jlc2l6ZUludGVydmFsKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cHJvdGVjdGVkIHJlbW92ZVNjcm9sbEV2ZW50SGFuZGxlcnMoKSB7XG5cdFx0aWYgKHRoaXMuY2hlY2tTY3JvbGxFbGVtZW50UmVzaXplZFRpbWVyKSB7XG5cdFx0XHRjbGVhckludGVydmFsKHRoaXMuY2hlY2tTY3JvbGxFbGVtZW50UmVzaXplZFRpbWVyKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5kaXNwb3NlU2Nyb2xsSGFuZGxlcikge1xuXHRcdFx0dGhpcy5kaXNwb3NlU2Nyb2xsSGFuZGxlcigpO1xuXHRcdFx0dGhpcy5kaXNwb3NlU2Nyb2xsSGFuZGxlciA9IHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5kaXNwb3NlUmVzaXplSGFuZGxlcikge1xuXHRcdFx0dGhpcy5kaXNwb3NlUmVzaXplSGFuZGxlcigpO1xuXHRcdFx0dGhpcy5kaXNwb3NlUmVzaXplSGFuZGxlciA9IHVuZGVmaW5lZDtcblx0XHR9XG5cdH1cblxuXHRwcm90ZWN0ZWQgZ2V0RWxlbWVudHNPZmZzZXQoKTogbnVtYmVyIHtcblx0XHRsZXQgb2Zmc2V0OiBhbnkgPSAwO1xuXG5cdFx0aWYgKHRoaXMuY29udGFpbmVyRWxlbWVudFJlZiAmJiB0aGlzLmNvbnRhaW5lckVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkge1xuXHRcdFx0b2Zmc2V0ICs9IHRoaXMuY29udGFpbmVyRWxlbWVudFJlZi5uYXRpdmVFbGVtZW50W3RoaXMuX29mZnNldFR5cGVdO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLnBhcmVudFNjcm9sbCkge1xuXHRcdFx0bGV0IHNjcm9sbEVsZW1lbnQ6IGFueSA9IHRoaXMuZ2V0U2Nyb2xsRWxlbWVudCgpO1xuXHRcdFx0bGV0IGVsZW1lbnRDbGllbnRSZWN0OiBhbnkgPSB0aGlzLmVsZW1lbnQubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0XHRcdGxldCBzY3JvbGxDbGllbnRSZWN0OiBhbnkgPSBzY3JvbGxFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0aWYgKHRoaXMuaG9yaXpvbnRhbCkge1xuXHRcdFx0XHRvZmZzZXQgKz0gZWxlbWVudENsaWVudFJlY3QubGVmdCAtIHNjcm9sbENsaWVudFJlY3QubGVmdDtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRvZmZzZXQgKz0gZWxlbWVudENsaWVudFJlY3QudG9wIC0gc2Nyb2xsQ2xpZW50UmVjdC50b3A7XG5cdFx0XHR9XG5cblx0XHRcdGlmICghKHRoaXMucGFyZW50U2Nyb2xsIGluc3RhbmNlb2YgV2luZG93KSkge1xuXHRcdFx0XHRvZmZzZXQgKz0gc2Nyb2xsRWxlbWVudFt0aGlzLl9zY3JvbGxUeXBlXTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gb2Zmc2V0O1xuXHR9XG5cblx0cHJvdGVjdGVkIGNvdW50SXRlbXNQZXJXcmFwR3JvdXAoKSB7XG5cdFx0bGV0IHByb3BlcnR5TmFtZTogYW55ID0gdGhpcy5ob3Jpem9udGFsID8gJ29mZnNldExlZnQnIDogJ29mZnNldFRvcCc7XG5cdFx0bGV0IGNoaWxkcmVuOiBhbnkgPSAoKHRoaXMuY29udGFpbmVyRWxlbWVudFJlZiAmJiB0aGlzLmNvbnRhaW5lckVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkgfHwgdGhpcy5jb250ZW50RWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KS5jaGlsZHJlbjtcblxuXHRcdGxldCBjaGlsZHJlbkxlbmd0aDogYW55ID0gY2hpbGRyZW4gPyBjaGlsZHJlbi5sZW5ndGggOiAwO1xuXHRcdGlmIChjaGlsZHJlbkxlbmd0aCA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIDE7XG5cdFx0fVxuXG5cdFx0bGV0IGZpcnN0T2Zmc2V0OiBhbnkgPSBjaGlsZHJlblswXVtwcm9wZXJ0eU5hbWVdO1xuXHRcdGxldCByZXN1bHQ6IGFueSA9IDE7XG5cdFx0d2hpbGUgKHJlc3VsdCA8IGNoaWxkcmVuTGVuZ3RoICYmIGZpcnN0T2Zmc2V0ID09PSBjaGlsZHJlbltyZXN1bHRdW3Byb3BlcnR5TmFtZV0pIHtcblx0XHRcdCsrcmVzdWx0O1xuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgZ2V0U2Nyb2xsUG9zaXRpb24oKTogbnVtYmVyIHtcblx0XHRsZXQgd2luZG93U2Nyb2xsVmFsdWU6IG51bWJlciA9IHVuZGVmaW5lZDtcblx0XHRpZiAodGhpcy5wYXJlbnRTY3JvbGwgaW5zdGFuY2VvZiBXaW5kb3cpIHtcblx0XHRcdHZhciB3aW5kb3c6IGFueTtcblx0XHRcdHdpbmRvd1Njcm9sbFZhbHVlID0gd2luZG93W3RoaXMuX3BhZ2VPZmZzZXRUeXBlXTtcblx0XHR9XG5cblx0XHRyZXR1cm4gd2luZG93U2Nyb2xsVmFsdWUgfHwgdGhpcy5nZXRTY3JvbGxFbGVtZW50KClbdGhpcy5fc2Nyb2xsVHlwZV0gfHwgMDtcblx0fVxuXG5cdHByb3RlY3RlZCBtaW5NZWFzdXJlZENoaWxkV2lkdGg6IG51bWJlcjtcblx0cHJvdGVjdGVkIG1pbk1lYXN1cmVkQ2hpbGRIZWlnaHQ6IG51bWJlcjtcblxuXHRwcm90ZWN0ZWQgd3JhcEdyb3VwRGltZW5zaW9uczogYW55O1xuXG5cdHByb3RlY3RlZCByZXNldFdyYXBHcm91cERpbWVuc2lvbnMoKTogdm9pZCB7XG5cdFx0Y29uc3Qgb2xkV3JhcEdyb3VwRGltZW5zaW9ucyA9IHRoaXMud3JhcEdyb3VwRGltZW5zaW9ucztcblx0XHR0aGlzLndyYXBHcm91cERpbWVuc2lvbnMgPSB7XG5cdFx0XHRtYXhDaGlsZFNpemVQZXJXcmFwR3JvdXA6IFtdLFxuXHRcdFx0bnVtYmVyT2ZLbm93bldyYXBHcm91cENoaWxkU2l6ZXM6IDAsXG5cdFx0XHRzdW1PZktub3duV3JhcEdyb3VwQ2hpbGRXaWR0aHM6IDAsXG5cdFx0XHRzdW1PZktub3duV3JhcEdyb3VwQ2hpbGRIZWlnaHRzOiAwXG5cdFx0fTtcblxuXHRcdGlmICghdGhpcy5lbmFibGVVbmVxdWFsQ2hpbGRyZW5TaXplcyB8fCAhb2xkV3JhcEdyb3VwRGltZW5zaW9ucyB8fCBvbGRXcmFwR3JvdXBEaW1lbnNpb25zLm51bWJlck9mS25vd25XcmFwR3JvdXBDaGlsZFNpemVzID09PSAwKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y29uc3QgaXRlbXNQZXJXcmFwR3JvdXA6IG51bWJlciA9IHRoaXMuY291bnRJdGVtc1BlcldyYXBHcm91cCgpO1xuXHRcdGZvciAobGV0IHdyYXBHcm91cEluZGV4OiBhbnkgPSAwOyB3cmFwR3JvdXBJbmRleCA8IG9sZFdyYXBHcm91cERpbWVuc2lvbnMubWF4Q2hpbGRTaXplUGVyV3JhcEdyb3VwLmxlbmd0aDsgKyt3cmFwR3JvdXBJbmRleCkge1xuXHRcdFx0Y29uc3Qgb2xkV3JhcEdyb3VwRGltZW5zaW9uOiBXcmFwR3JvdXBEaW1lbnNpb24gPSBvbGRXcmFwR3JvdXBEaW1lbnNpb25zLm1heENoaWxkU2l6ZVBlcldyYXBHcm91cFt3cmFwR3JvdXBJbmRleF07XG5cdFx0XHRpZiAoIW9sZFdyYXBHcm91cERpbWVuc2lvbiB8fCAhb2xkV3JhcEdyb3VwRGltZW5zaW9uLml0ZW1zIHx8ICFvbGRXcmFwR3JvdXBEaW1lbnNpb24uaXRlbXMubGVuZ3RoKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAob2xkV3JhcEdyb3VwRGltZW5zaW9uLml0ZW1zLmxlbmd0aCAhPT0gaXRlbXNQZXJXcmFwR3JvdXApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgaXRlbXNDaGFuZ2VkOiBhbnkgPSBmYWxzZTtcblx0XHRcdGxldCBhcnJheVN0YXJ0SW5kZXg6IGFueSA9IGl0ZW1zUGVyV3JhcEdyb3VwICogd3JhcEdyb3VwSW5kZXg7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGl0ZW1zUGVyV3JhcEdyb3VwOyArK2kpIHtcblx0XHRcdFx0aWYgKCF0aGlzLmNvbXBhcmVJdGVtcyhvbGRXcmFwR3JvdXBEaW1lbnNpb24uaXRlbXNbaV0sIHRoaXMuaXRlbXNbYXJyYXlTdGFydEluZGV4ICsgaV0pKSB7XG5cdFx0XHRcdFx0aXRlbXNDaGFuZ2VkID0gdHJ1ZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIWl0ZW1zQ2hhbmdlZCkge1xuXHRcdFx0XHQrK3RoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5udW1iZXJPZktub3duV3JhcEdyb3VwQ2hpbGRTaXplcztcblx0XHRcdFx0dGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLnN1bU9mS25vd25XcmFwR3JvdXBDaGlsZFdpZHRocyArPSBvbGRXcmFwR3JvdXBEaW1lbnNpb24uY2hpbGRXaWR0aCB8fCAwO1xuXHRcdFx0XHR0aGlzLndyYXBHcm91cERpbWVuc2lvbnMuc3VtT2ZLbm93bldyYXBHcm91cENoaWxkSGVpZ2h0cyArPSBvbGRXcmFwR3JvdXBEaW1lbnNpb24uY2hpbGRIZWlnaHQgfHwgMDtcblx0XHRcdFx0dGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLm1heENoaWxkU2l6ZVBlcldyYXBHcm91cFt3cmFwR3JvdXBJbmRleF0gPSBvbGRXcmFwR3JvdXBEaW1lbnNpb247XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cHJvdGVjdGVkIGNhbGN1bGF0ZURpbWVuc2lvbnMoKTogSURpbWVuc2lvbnMge1xuXHRcdGxldCBzY3JvbGxFbGVtZW50OiBhbnkgPSB0aGlzLmdldFNjcm9sbEVsZW1lbnQoKTtcblx0XHRsZXQgaXRlbUNvdW50OiBhbnkgPSB0aGlzLml0ZW1zLmxlbmd0aDtcblxuXHRcdGNvbnN0IG1heENhbGN1bGF0ZWRTY3JvbGxCYXJTaXplOiBudW1iZXIgPSAyNTsgLy8gTm90ZTogRm9ybXVsYSB0byBhdXRvLWNhbGN1bGF0ZSBkb2Vzbid0IHdvcmsgZm9yIFBhcmVudFNjcm9sbCwgc28gd2UgZGVmYXVsdCB0byB0aGlzIGlmIG5vdCBzZXQgYnkgY29uc3VtaW5nIGFwcGxpY2F0aW9uXG5cdFx0dGhpcy5jYWxjdWxhdGVkU2Nyb2xsYmFySGVpZ2h0ID0gTWF0aC5tYXgoTWF0aC5taW4oc2Nyb2xsRWxlbWVudC5vZmZzZXRIZWlnaHQgLSBzY3JvbGxFbGVtZW50LmNsaWVudEhlaWdodCwgbWF4Q2FsY3VsYXRlZFNjcm9sbEJhclNpemUpLCB0aGlzLmNhbGN1bGF0ZWRTY3JvbGxiYXJIZWlnaHQpO1xuXHRcdHRoaXMuY2FsY3VsYXRlZFNjcm9sbGJhcldpZHRoID0gTWF0aC5tYXgoTWF0aC5taW4oc2Nyb2xsRWxlbWVudC5vZmZzZXRXaWR0aCAtIHNjcm9sbEVsZW1lbnQuY2xpZW50V2lkdGgsIG1heENhbGN1bGF0ZWRTY3JvbGxCYXJTaXplKSwgdGhpcy5jYWxjdWxhdGVkU2Nyb2xsYmFyV2lkdGgpO1xuXG5cdFx0bGV0IHZpZXdXaWR0aDogYW55ID0gc2Nyb2xsRWxlbWVudC5vZmZzZXRXaWR0aCAtICh0aGlzLnNjcm9sbGJhcldpZHRoIHx8IHRoaXMuY2FsY3VsYXRlZFNjcm9sbGJhcldpZHRoIHx8ICh0aGlzLmhvcml6b250YWwgPyAwIDogbWF4Q2FsY3VsYXRlZFNjcm9sbEJhclNpemUpKTtcblx0XHRsZXQgdmlld0hlaWdodDogYW55ID0gc2Nyb2xsRWxlbWVudC5vZmZzZXRIZWlnaHQgLSAodGhpcy5zY3JvbGxiYXJIZWlnaHQgfHwgdGhpcy5jYWxjdWxhdGVkU2Nyb2xsYmFySGVpZ2h0IHx8ICh0aGlzLmhvcml6b250YWwgPyBtYXhDYWxjdWxhdGVkU2Nyb2xsQmFyU2l6ZSA6IDApKTtcblxuXHRcdGxldCBjb250ZW50OiBhbnkgPSAodGhpcy5jb250YWluZXJFbGVtZW50UmVmICYmIHRoaXMuY29udGFpbmVyRWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KSB8fCB0aGlzLmNvbnRlbnRFbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG5cblx0XHRsZXQgaXRlbXNQZXJXcmFwR3JvdXA6IGFueSA9IHRoaXMuY291bnRJdGVtc1BlcldyYXBHcm91cCgpO1xuXHRcdGxldCB3cmFwR3JvdXBzUGVyUGFnZTogYW55O1xuXG5cdFx0bGV0IGRlZmF1bHRDaGlsZFdpZHRoOiBhbnk7XG5cdFx0bGV0IGRlZmF1bHRDaGlsZEhlaWdodDogYW55O1xuXG5cdFx0aWYgKCF0aGlzLmVuYWJsZVVuZXF1YWxDaGlsZHJlblNpemVzKSB7XG5cdFx0XHRpZiAoY29udGVudC5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGlmICghdGhpcy5jaGlsZFdpZHRoIHx8ICF0aGlzLmNoaWxkSGVpZ2h0KSB7XG5cdFx0XHRcdFx0aWYgKCF0aGlzLm1pbk1lYXN1cmVkQ2hpbGRXaWR0aCAmJiB2aWV3V2lkdGggPiAwKSB7XG5cdFx0XHRcdFx0XHR0aGlzLm1pbk1lYXN1cmVkQ2hpbGRXaWR0aCA9IHZpZXdXaWR0aDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKCF0aGlzLm1pbk1lYXN1cmVkQ2hpbGRIZWlnaHQgJiYgdmlld0hlaWdodCA+IDApIHtcblx0XHRcdFx0XHRcdHRoaXMubWluTWVhc3VyZWRDaGlsZEhlaWdodCA9IHZpZXdIZWlnaHQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IGNoaWxkOiBhbnkgPSBjb250ZW50LmNoaWxkcmVuWzBdO1xuXHRcdFx0XHRsZXQgY2xpZW50UmVjdDogYW55ID0gY2hpbGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdFx0XHRcdHRoaXMubWluTWVhc3VyZWRDaGlsZFdpZHRoID0gTWF0aC5taW4odGhpcy5taW5NZWFzdXJlZENoaWxkV2lkdGgsIGNsaWVudFJlY3Qud2lkdGgpO1xuXHRcdFx0XHR0aGlzLm1pbk1lYXN1cmVkQ2hpbGRIZWlnaHQgPSBNYXRoLm1pbih0aGlzLm1pbk1lYXN1cmVkQ2hpbGRIZWlnaHQsIGNsaWVudFJlY3QuaGVpZ2h0KTtcblx0XHRcdH1cblxuXHRcdFx0ZGVmYXVsdENoaWxkV2lkdGggPSB0aGlzLmNoaWxkV2lkdGggfHwgdGhpcy5taW5NZWFzdXJlZENoaWxkV2lkdGggfHwgdmlld1dpZHRoO1xuXHRcdFx0ZGVmYXVsdENoaWxkSGVpZ2h0ID0gdGhpcy5jaGlsZEhlaWdodCB8fCB0aGlzLm1pbk1lYXN1cmVkQ2hpbGRIZWlnaHQgfHwgdmlld0hlaWdodDtcblx0XHRcdGxldCBpdGVtc1BlclJvdzogYW55ID0gTWF0aC5tYXgoTWF0aC5jZWlsKHZpZXdXaWR0aCAvIGRlZmF1bHRDaGlsZFdpZHRoKSwgMSk7XG5cdFx0XHRsZXQgaXRlbXNQZXJDb2w6IGFueSA9IE1hdGgubWF4KE1hdGguY2VpbCh2aWV3SGVpZ2h0IC8gZGVmYXVsdENoaWxkSGVpZ2h0KSwgMSk7XG5cdFx0XHR3cmFwR3JvdXBzUGVyUGFnZSA9IHRoaXMuaG9yaXpvbnRhbCA/IGl0ZW1zUGVyUm93IDogaXRlbXNQZXJDb2w7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxldCBzY3JvbGxPZmZzZXQ6IGFueSA9IHNjcm9sbEVsZW1lbnRbdGhpcy5fc2Nyb2xsVHlwZV0gLSAodGhpcy5wcmV2aW91c1ZpZXdQb3J0ID8gdGhpcy5wcmV2aW91c1ZpZXdQb3J0LnBhZGRpbmcgOiAwKTtcblx0XHRcdFxuXHRcdFx0bGV0IGFycmF5U3RhcnRJbmRleDogYW55ID0gdGhpcy5wcmV2aW91c1ZpZXdQb3J0LnN0YXJ0SW5kZXhXaXRoQnVmZmVyIHx8IDA7XG5cdFx0XHRsZXQgd3JhcEdyb3VwSW5kZXg6IGFueSA9IE1hdGguY2VpbChhcnJheVN0YXJ0SW5kZXggLyBpdGVtc1BlcldyYXBHcm91cCk7XG5cblx0XHRcdGxldCBtYXhXaWR0aEZvcldyYXBHcm91cDogYW55ID0gMDtcblx0XHRcdGxldCBtYXhIZWlnaHRGb3JXcmFwR3JvdXA6IGFueSA9IDA7XG5cdFx0XHRsZXQgc3VtT2ZWaXNpYmxlTWF4V2lkdGhzOiBhbnkgPSAwO1xuXHRcdFx0bGV0IHN1bU9mVmlzaWJsZU1heEhlaWdodHM6IGFueSA9IDA7XG5cdFx0XHR3cmFwR3JvdXBzUGVyUGFnZSA9IDA7XG5cblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgY29udGVudC5jaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuXHRcdFx0XHQrK2FycmF5U3RhcnRJbmRleDtcblx0XHRcdFx0bGV0IGNoaWxkOiBhbnkgPSBjb250ZW50LmNoaWxkcmVuW2ldO1xuXHRcdFx0XHRsZXQgY2xpZW50UmVjdDogYW55ID0gY2hpbGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cblx0XHRcdFx0bWF4V2lkdGhGb3JXcmFwR3JvdXAgPSBNYXRoLm1heChtYXhXaWR0aEZvcldyYXBHcm91cCwgY2xpZW50UmVjdC53aWR0aCk7XG5cdFx0XHRcdG1heEhlaWdodEZvcldyYXBHcm91cCA9IE1hdGgubWF4KG1heEhlaWdodEZvcldyYXBHcm91cCwgY2xpZW50UmVjdC5oZWlnaHQpO1xuXG5cdFx0XHRcdGlmIChhcnJheVN0YXJ0SW5kZXggJSBpdGVtc1BlcldyYXBHcm91cCA9PT0gMCkge1xuXHRcdFx0XHRcdGxldCBvbGRWYWx1ZTogYW55ID0gdGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLm1heENoaWxkU2l6ZVBlcldyYXBHcm91cFt3cmFwR3JvdXBJbmRleF07XG5cdFx0XHRcdFx0aWYgKG9sZFZhbHVlKSB7XG5cdFx0XHRcdFx0XHQtLXRoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5udW1iZXJPZktub3duV3JhcEdyb3VwQ2hpbGRTaXplcztcblx0XHRcdFx0XHRcdHRoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5zdW1PZktub3duV3JhcEdyb3VwQ2hpbGRXaWR0aHMgLT0gb2xkVmFsdWUuY2hpbGRXaWR0aCB8fCAwO1xuXHRcdFx0XHRcdFx0dGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLnN1bU9mS25vd25XcmFwR3JvdXBDaGlsZEhlaWdodHMgLT0gb2xkVmFsdWUuY2hpbGRIZWlnaHQgfHwgMDtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQrK3RoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5udW1iZXJPZktub3duV3JhcEdyb3VwQ2hpbGRTaXplcztcblx0XHRcdFx0XHRjb25zdCBpdGVtcyA9IHRoaXMuaXRlbXMuc2xpY2UoYXJyYXlTdGFydEluZGV4IC0gaXRlbXNQZXJXcmFwR3JvdXAsIGFycmF5U3RhcnRJbmRleCk7XG5cdFx0XHRcdFx0dGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLm1heENoaWxkU2l6ZVBlcldyYXBHcm91cFt3cmFwR3JvdXBJbmRleF0gPSB7XG5cdFx0XHRcdFx0XHRjaGlsZFdpZHRoOiBtYXhXaWR0aEZvcldyYXBHcm91cCxcblx0XHRcdFx0XHRcdGNoaWxkSGVpZ2h0OiBtYXhIZWlnaHRGb3JXcmFwR3JvdXAsXG5cdFx0XHRcdFx0XHRpdGVtczogaXRlbXNcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdHRoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5zdW1PZktub3duV3JhcEdyb3VwQ2hpbGRXaWR0aHMgKz0gbWF4V2lkdGhGb3JXcmFwR3JvdXA7XG5cdFx0XHRcdFx0dGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLnN1bU9mS25vd25XcmFwR3JvdXBDaGlsZEhlaWdodHMgKz0gbWF4SGVpZ2h0Rm9yV3JhcEdyb3VwO1xuXG5cdFx0XHRcdFx0aWYgKHRoaXMuaG9yaXpvbnRhbCkge1xuXHRcdFx0XHRcdFx0bGV0IG1heFZpc2libGVXaWR0aEZvcldyYXBHcm91cDogYW55ID0gTWF0aC5taW4obWF4V2lkdGhGb3JXcmFwR3JvdXAsIE1hdGgubWF4KHZpZXdXaWR0aCAtIHN1bU9mVmlzaWJsZU1heFdpZHRocywgMCkpO1xuXHRcdFx0XHRcdFx0aWYgKHNjcm9sbE9mZnNldCA+IDApIHtcblx0XHRcdFx0XHRcdFx0bGV0IHNjcm9sbE9mZnNldFRvUmVtb3ZlOiBhbnkgPSBNYXRoLm1pbihzY3JvbGxPZmZzZXQsIG1heFZpc2libGVXaWR0aEZvcldyYXBHcm91cCk7XG5cdFx0XHRcdFx0XHRcdG1heFZpc2libGVXaWR0aEZvcldyYXBHcm91cCAtPSBzY3JvbGxPZmZzZXRUb1JlbW92ZTtcblx0XHRcdFx0XHRcdFx0c2Nyb2xsT2Zmc2V0IC09IHNjcm9sbE9mZnNldFRvUmVtb3ZlO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRzdW1PZlZpc2libGVNYXhXaWR0aHMgKz0gbWF4VmlzaWJsZVdpZHRoRm9yV3JhcEdyb3VwO1xuXHRcdFx0XHRcdFx0aWYgKG1heFZpc2libGVXaWR0aEZvcldyYXBHcm91cCA+IDAgJiYgdmlld1dpZHRoID49IHN1bU9mVmlzaWJsZU1heFdpZHRocykge1xuXHRcdFx0XHRcdFx0XHQrK3dyYXBHcm91cHNQZXJQYWdlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRsZXQgbWF4VmlzaWJsZUhlaWdodEZvcldyYXBHcm91cDogYW55ID0gTWF0aC5taW4obWF4SGVpZ2h0Rm9yV3JhcEdyb3VwLCBNYXRoLm1heCh2aWV3SGVpZ2h0IC0gc3VtT2ZWaXNpYmxlTWF4SGVpZ2h0cywgMCkpO1xuXHRcdFx0XHRcdFx0aWYgKHNjcm9sbE9mZnNldCA+IDApIHtcblx0XHRcdFx0XHRcdFx0bGV0IHNjcm9sbE9mZnNldFRvUmVtb3ZlOiBhbnkgPSBNYXRoLm1pbihzY3JvbGxPZmZzZXQsIG1heFZpc2libGVIZWlnaHRGb3JXcmFwR3JvdXApO1xuXHRcdFx0XHRcdFx0XHRtYXhWaXNpYmxlSGVpZ2h0Rm9yV3JhcEdyb3VwIC09IHNjcm9sbE9mZnNldFRvUmVtb3ZlO1xuXHRcdFx0XHRcdFx0XHRzY3JvbGxPZmZzZXQgLT0gc2Nyb2xsT2Zmc2V0VG9SZW1vdmU7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHN1bU9mVmlzaWJsZU1heEhlaWdodHMgKz0gbWF4VmlzaWJsZUhlaWdodEZvcldyYXBHcm91cDtcblx0XHRcdFx0XHRcdGlmIChtYXhWaXNpYmxlSGVpZ2h0Rm9yV3JhcEdyb3VwID4gMCAmJiB2aWV3SGVpZ2h0ID49IHN1bU9mVmlzaWJsZU1heEhlaWdodHMpIHtcblx0XHRcdFx0XHRcdFx0Kyt3cmFwR3JvdXBzUGVyUGFnZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQrK3dyYXBHcm91cEluZGV4O1xuXG5cdFx0XHRcdFx0bWF4V2lkdGhGb3JXcmFwR3JvdXAgPSAwO1xuXHRcdFx0XHRcdG1heEhlaWdodEZvcldyYXBHcm91cCA9IDA7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0bGV0IGF2ZXJhZ2VDaGlsZFdpZHRoOiBhbnkgPSB0aGlzLndyYXBHcm91cERpbWVuc2lvbnMuc3VtT2ZLbm93bldyYXBHcm91cENoaWxkV2lkdGhzIC8gdGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLm51bWJlck9mS25vd25XcmFwR3JvdXBDaGlsZFNpemVzO1xuXHRcdFx0bGV0IGF2ZXJhZ2VDaGlsZEhlaWdodDogYW55ID0gdGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLnN1bU9mS25vd25XcmFwR3JvdXBDaGlsZEhlaWdodHMgLyB0aGlzLndyYXBHcm91cERpbWVuc2lvbnMubnVtYmVyT2ZLbm93bldyYXBHcm91cENoaWxkU2l6ZXM7XG5cdFx0XHRkZWZhdWx0Q2hpbGRXaWR0aCA9IHRoaXMuY2hpbGRXaWR0aCB8fCBhdmVyYWdlQ2hpbGRXaWR0aCB8fCB2aWV3V2lkdGg7XG5cdFx0XHRkZWZhdWx0Q2hpbGRIZWlnaHQgPSB0aGlzLmNoaWxkSGVpZ2h0IHx8IGF2ZXJhZ2VDaGlsZEhlaWdodCB8fCB2aWV3SGVpZ2h0O1xuXG5cdFx0XHRpZiAodGhpcy5ob3Jpem9udGFsKSB7XG5cdFx0XHRcdGlmICh2aWV3V2lkdGggPiBzdW1PZlZpc2libGVNYXhXaWR0aHMpIHtcblx0XHRcdFx0XHR3cmFwR3JvdXBzUGVyUGFnZSArPSBNYXRoLmNlaWwoKHZpZXdXaWR0aCAtIHN1bU9mVmlzaWJsZU1heFdpZHRocykgLyBkZWZhdWx0Q2hpbGRXaWR0aCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmICh2aWV3SGVpZ2h0ID4gc3VtT2ZWaXNpYmxlTWF4SGVpZ2h0cykge1xuXHRcdFx0XHRcdHdyYXBHcm91cHNQZXJQYWdlICs9IE1hdGguY2VpbCgodmlld0hlaWdodCAtIHN1bU9mVmlzaWJsZU1heEhlaWdodHMpIC8gZGVmYXVsdENoaWxkSGVpZ2h0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGxldCBpdGVtc1BlclBhZ2U6IGFueSA9IGl0ZW1zUGVyV3JhcEdyb3VwICogd3JhcEdyb3Vwc1BlclBhZ2U7XG5cdFx0bGV0IHBhZ2VDb3VudF9mcmFjdGlvbmFsOiBhbnkgPSBpdGVtQ291bnQgLyBpdGVtc1BlclBhZ2U7XG5cdFx0bGV0IG51bWJlck9mV3JhcEdyb3VwczogYW55ID0gTWF0aC5jZWlsKGl0ZW1Db3VudCAvIGl0ZW1zUGVyV3JhcEdyb3VwKTtcblxuXHRcdGxldCBzY3JvbGxMZW5ndGg6IGFueSA9IDA7XG5cblx0XHRsZXQgZGVmYXVsdFNjcm9sbExlbmd0aFBlcldyYXBHcm91cDogYW55ID0gdGhpcy5ob3Jpem9udGFsID8gZGVmYXVsdENoaWxkV2lkdGggOiBkZWZhdWx0Q2hpbGRIZWlnaHQ7XG5cdFx0aWYgKHRoaXMuZW5hYmxlVW5lcXVhbENoaWxkcmVuU2l6ZXMpIHtcblx0XHRcdGxldCBudW1Vbmtub3duQ2hpbGRTaXplczphbnkgPSAwO1xuXHRcdFx0Zm9yIChsZXQgaTphbnkgPSAwOyBpIDwgbnVtYmVyT2ZXcmFwR3JvdXBzOyArK2kpIHtcblx0XHRcdFx0bGV0IGNoaWxkU2l6ZTogYW55ID0gdGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLm1heENoaWxkU2l6ZVBlcldyYXBHcm91cFtpXSAmJiB0aGlzLndyYXBHcm91cERpbWVuc2lvbnMubWF4Q2hpbGRTaXplUGVyV3JhcEdyb3VwW2ldW3RoaXMuX2NoaWxkU2Nyb2xsRGltXTtcblx0XHRcdFx0aWYgKGNoaWxkU2l6ZSkge1xuXHRcdFx0XHRcdHNjcm9sbExlbmd0aCArPSBjaGlsZFNpemU7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0KytudW1Vbmtub3duQ2hpbGRTaXplcztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRzY3JvbGxMZW5ndGggKz0gTWF0aC5yb3VuZChudW1Vbmtub3duQ2hpbGRTaXplcyAqIGRlZmF1bHRTY3JvbGxMZW5ndGhQZXJXcmFwR3JvdXApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzY3JvbGxMZW5ndGggPSBudW1iZXJPZldyYXBHcm91cHMgKiBkZWZhdWx0U2Nyb2xsTGVuZ3RoUGVyV3JhcEdyb3VwO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRpdGVtQ291bnQ6IGl0ZW1Db3VudCxcblx0XHRcdGl0ZW1zUGVyV3JhcEdyb3VwOiBpdGVtc1BlcldyYXBHcm91cCxcblx0XHRcdHdyYXBHcm91cHNQZXJQYWdlOiB3cmFwR3JvdXBzUGVyUGFnZSxcblx0XHRcdGl0ZW1zUGVyUGFnZTogaXRlbXNQZXJQYWdlLFxuXHRcdFx0cGFnZUNvdW50X2ZyYWN0aW9uYWw6IHBhZ2VDb3VudF9mcmFjdGlvbmFsLFxuXHRcdFx0Y2hpbGRXaWR0aDogZGVmYXVsdENoaWxkV2lkdGgsXG5cdFx0XHRjaGlsZEhlaWdodDogZGVmYXVsdENoaWxkSGVpZ2h0LFxuXHRcdFx0c2Nyb2xsTGVuZ3RoOiBzY3JvbGxMZW5ndGhcblx0XHR9O1xuXHR9XG5cblx0cHJvdGVjdGVkIGNhY2hlZFBhZ2VTaXplOiBudW1iZXIgPSAwO1xuXHRwcm90ZWN0ZWQgcHJldmlvdXNTY3JvbGxOdW1iZXJFbGVtZW50czogbnVtYmVyID0gMDtcblxuXHRwcm90ZWN0ZWQgY2FsY3VsYXRlUGFkZGluZyhhcnJheVN0YXJ0SW5kZXhXaXRoQnVmZmVyOiBudW1iZXIsIGRpbWVuc2lvbnM6IGFueSwgYWxsb3dVbmVxdWFsQ2hpbGRyZW5TaXplc19FeHBlcmltZW50YWw6IGJvb2xlYW4pOiBudW1iZXIge1xuXHRcdGlmIChkaW1lbnNpb25zLml0ZW1Db3VudCA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIDA7XG5cdFx0fVxuXG5cdFx0bGV0IGRlZmF1bHRTY3JvbGxMZW5ndGhQZXJXcmFwR3JvdXA6IG51bWJlciA9IGRpbWVuc2lvbnNbdGhpcy5fY2hpbGRTY3JvbGxEaW1dO1xuXHRcdGxldCBzdGFydGluZ1dyYXBHcm91cEluZGV4OiBudW1iZXIgPSBNYXRoLmNlaWwoYXJyYXlTdGFydEluZGV4V2l0aEJ1ZmZlciAvIGRpbWVuc2lvbnMuaXRlbXNQZXJXcmFwR3JvdXApIHx8IDA7XG5cblx0XHRpZiAoIXRoaXMuZW5hYmxlVW5lcXVhbENoaWxkcmVuU2l6ZXMpIHtcblx0XHRcdHJldHVybiBkZWZhdWx0U2Nyb2xsTGVuZ3RoUGVyV3JhcEdyb3VwICogc3RhcnRpbmdXcmFwR3JvdXBJbmRleDtcblx0XHR9XG5cblx0XHRsZXQgbnVtVW5rbm93bkNoaWxkU2l6ZXM6IGFueSA9IDA7XG5cdFx0bGV0IHJlc3VsdDogYW55ID0gMDtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHN0YXJ0aW5nV3JhcEdyb3VwSW5kZXg7ICsraSkge1xuXHRcdFx0bGV0IGNoaWxkU2l6ZTogV3JhcEdyb3VwRGltZW5zaW9uID0gdGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLm1heENoaWxkU2l6ZVBlcldyYXBHcm91cFtpXSAmJiB0aGlzLndyYXBHcm91cERpbWVuc2lvbnMubWF4Q2hpbGRTaXplUGVyV3JhcEdyb3VwW2ldW3RoaXMuX2NoaWxkU2Nyb2xsRGltXTtcblx0XHRcdGlmIChjaGlsZFNpemUpIHtcblx0XHRcdFx0cmVzdWx0ICs9IGNoaWxkU2l6ZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCsrbnVtVW5rbm93bkNoaWxkU2l6ZXM7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJlc3VsdCArPSBNYXRoLnJvdW5kKG51bVVua25vd25DaGlsZFNpemVzICogZGVmYXVsdFNjcm9sbExlbmd0aFBlcldyYXBHcm91cCk7XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIGNhbGN1bGF0ZVBhZ2VJbmZvKHNjcm9sbFBvc2l0aW9uOiBudW1iZXIsIGRpbWVuc2lvbnM6IGFueSk6IElQYWdlSW5mb1dpdGhCdWZmZXIge1xuXHRcdGxldCBzY3JvbGxQZXJjZW50YWdlOiBhbnkgPSAwO1xuXHRcdGlmICh0aGlzLmVuYWJsZVVuZXF1YWxDaGlsZHJlblNpemVzKSB7XG5cdFx0XHRjb25zdCBudW1iZXJPZldyYXBHcm91cHM6YW55ID0gTWF0aC5jZWlsKGRpbWVuc2lvbnMuaXRlbUNvdW50IC8gZGltZW5zaW9ucy5pdGVtc1BlcldyYXBHcm91cCk7XG5cdFx0XHRsZXQgdG90YWxTY3JvbGxlZExlbmd0aDogYW55ID0gMDtcblx0XHRcdGxldCBkZWZhdWx0U2Nyb2xsTGVuZ3RoUGVyV3JhcEdyb3VwOiBhbnkgPSBkaW1lbnNpb25zW3RoaXMuX2NoaWxkU2Nyb2xsRGltXTtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZXcmFwR3JvdXBzOyArK2kpIHtcblx0XHRcdFx0bGV0IGNoaWxkU2l6ZTogYW55ID0gdGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLm1heENoaWxkU2l6ZVBlcldyYXBHcm91cFtpXSAmJiB0aGlzLndyYXBHcm91cERpbWVuc2lvbnMubWF4Q2hpbGRTaXplUGVyV3JhcEdyb3VwW2ldW3RoaXMuX2NoaWxkU2Nyb2xsRGltXTtcblx0XHRcdFx0aWYgKGNoaWxkU2l6ZSkge1xuXHRcdFx0XHRcdHRvdGFsU2Nyb2xsZWRMZW5ndGggKz0gY2hpbGRTaXplO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRvdGFsU2Nyb2xsZWRMZW5ndGggKz0gZGVmYXVsdFNjcm9sbExlbmd0aFBlcldyYXBHcm91cDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChzY3JvbGxQb3NpdGlvbiA8IHRvdGFsU2Nyb2xsZWRMZW5ndGgpIHtcblx0XHRcdFx0XHRzY3JvbGxQZXJjZW50YWdlID0gaSAvIG51bWJlck9mV3JhcEdyb3Vwcztcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRzY3JvbGxQZXJjZW50YWdlID0gc2Nyb2xsUG9zaXRpb24gLyBkaW1lbnNpb25zLnNjcm9sbExlbmd0aDtcblx0XHR9XG5cblx0XHRsZXQgc3RhcnRpbmdBcnJheUluZGV4X2ZyYWN0aW9uYWw6IGFueSA9IE1hdGgubWluKE1hdGgubWF4KHNjcm9sbFBlcmNlbnRhZ2UgKiBkaW1lbnNpb25zLnBhZ2VDb3VudF9mcmFjdGlvbmFsLCAwKSwgZGltZW5zaW9ucy5wYWdlQ291bnRfZnJhY3Rpb25hbCkgKiBkaW1lbnNpb25zLml0ZW1zUGVyUGFnZTtcblxuXHRcdGxldCBtYXhTdGFydDogYW55ID0gZGltZW5zaW9ucy5pdGVtQ291bnQgLSBkaW1lbnNpb25zLml0ZW1zUGVyUGFnZSAtIDE7XG5cdFx0bGV0IGFycmF5U3RhcnRJbmRleDogYW55ID0gTWF0aC5taW4oTWF0aC5mbG9vcihzdGFydGluZ0FycmF5SW5kZXhfZnJhY3Rpb25hbCksIG1heFN0YXJ0KTtcblx0XHRhcnJheVN0YXJ0SW5kZXggLT0gYXJyYXlTdGFydEluZGV4ICUgZGltZW5zaW9ucy5pdGVtc1BlcldyYXBHcm91cDsgLy8gcm91bmQgZG93biB0byBzdGFydCBvZiB3cmFwR3JvdXBcblxuXHRcdGxldCBhcnJheUVuZEluZGV4OiBhbnkgPSBNYXRoLmNlaWwoc3RhcnRpbmdBcnJheUluZGV4X2ZyYWN0aW9uYWwpICsgZGltZW5zaW9ucy5pdGVtc1BlclBhZ2UgLSAxO1xuXHRcdGFycmF5RW5kSW5kZXggKz0gKGRpbWVuc2lvbnMuaXRlbXNQZXJXcmFwR3JvdXAgLSAoKGFycmF5RW5kSW5kZXggKyAxKSAlIGRpbWVuc2lvbnMuaXRlbXNQZXJXcmFwR3JvdXApKTsgLy8gcm91bmQgdXAgdG8gZW5kIG9mIHdyYXBHcm91cFxuXG5cdFx0aWYgKGlzTmFOKGFycmF5U3RhcnRJbmRleCkpIHtcblx0XHRcdGFycmF5U3RhcnRJbmRleCA9IDA7XG5cdFx0fVxuXHRcdGlmIChpc05hTihhcnJheUVuZEluZGV4KSkge1xuXHRcdFx0YXJyYXlFbmRJbmRleCA9IDA7XG5cdFx0fVxuXG5cdFx0YXJyYXlTdGFydEluZGV4ID0gTWF0aC5taW4oTWF0aC5tYXgoYXJyYXlTdGFydEluZGV4LCAwKSwgZGltZW5zaW9ucy5pdGVtQ291bnQgLSAxKTtcblx0XHRhcnJheUVuZEluZGV4ID0gTWF0aC5taW4oTWF0aC5tYXgoYXJyYXlFbmRJbmRleCwgMCksIGRpbWVuc2lvbnMuaXRlbUNvdW50IC0gMSk7XG5cblx0XHRsZXQgYnVmZmVyU2l6ZTogYW55ID0gdGhpcy5idWZmZXJBbW91bnQgKiBkaW1lbnNpb25zLml0ZW1zUGVyV3JhcEdyb3VwO1xuXHRcdGxldCBzdGFydEluZGV4V2l0aEJ1ZmZlcjogYW55ID0gTWF0aC5taW4oTWF0aC5tYXgoYXJyYXlTdGFydEluZGV4IC0gYnVmZmVyU2l6ZSwgMCksIGRpbWVuc2lvbnMuaXRlbUNvdW50IC0gMSk7XG5cdFx0bGV0IGVuZEluZGV4V2l0aEJ1ZmZlcjogYW55ID0gTWF0aC5taW4oTWF0aC5tYXgoYXJyYXlFbmRJbmRleCArIGJ1ZmZlclNpemUsIDApLCBkaW1lbnNpb25zLml0ZW1Db3VudCAtIDEpO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHN0YXJ0SW5kZXg6IGFycmF5U3RhcnRJbmRleCxcblx0XHRcdGVuZEluZGV4OiBhcnJheUVuZEluZGV4LFxuXHRcdFx0c3RhcnRJbmRleFdpdGhCdWZmZXI6IHN0YXJ0SW5kZXhXaXRoQnVmZmVyLFxuXHRcdFx0ZW5kSW5kZXhXaXRoQnVmZmVyOiBlbmRJbmRleFdpdGhCdWZmZXJcblx0XHR9O1xuXHR9XG5cblx0cHJvdGVjdGVkIGNhbGN1bGF0ZVZpZXdwb3J0KCk6IElWaWV3cG9ydCB7XG5cdFx0bGV0IGRpbWVuc2lvbnM6IElEaW1lbnNpb25zID0gdGhpcy5jYWxjdWxhdGVEaW1lbnNpb25zKCk7XG5cdFx0bGV0IG9mZnNldDogYW55ID0gdGhpcy5nZXRFbGVtZW50c09mZnNldCgpO1xuXG5cdFx0bGV0IHNjcm9sbFBvc2l0aW9uOiBhbnkgPSB0aGlzLmdldFNjcm9sbFBvc2l0aW9uKCk7XG5cdFx0aWYgKHNjcm9sbFBvc2l0aW9uID4gZGltZW5zaW9ucy5zY3JvbGxMZW5ndGggJiYgISh0aGlzLnBhcmVudFNjcm9sbCBpbnN0YW5jZW9mIFdpbmRvdykpIHtcblx0XHRcdHNjcm9sbFBvc2l0aW9uID0gZGltZW5zaW9ucy5zY3JvbGxMZW5ndGg7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNjcm9sbFBvc2l0aW9uIC09IG9mZnNldDtcblx0XHR9XG5cdFx0c2Nyb2xsUG9zaXRpb24gPSBNYXRoLm1heCgwLCBzY3JvbGxQb3NpdGlvbik7XG5cblx0XHRsZXQgcGFnZUluZm86IGFueSA9IHRoaXMuY2FsY3VsYXRlUGFnZUluZm8oc2Nyb2xsUG9zaXRpb24sIGRpbWVuc2lvbnMpO1xuXHRcdGxldCBuZXdQYWRkaW5nOiBhbnkgPSB0aGlzLmNhbGN1bGF0ZVBhZGRpbmcocGFnZUluZm8uc3RhcnRJbmRleFdpdGhCdWZmZXIsIGRpbWVuc2lvbnMsIHRydWUpO1xuXHRcdGxldCBuZXdTY3JvbGxMZW5ndGg6IGFueSA9IGRpbWVuc2lvbnMuc2Nyb2xsTGVuZ3RoO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHN0YXJ0SW5kZXg6IHBhZ2VJbmZvLnN0YXJ0SW5kZXgsXG5cdFx0XHRlbmRJbmRleDogcGFnZUluZm8uZW5kSW5kZXgsXG5cdFx0XHRzdGFydEluZGV4V2l0aEJ1ZmZlcjogcGFnZUluZm8uc3RhcnRJbmRleFdpdGhCdWZmZXIsXG5cdFx0XHRlbmRJbmRleFdpdGhCdWZmZXI6IHBhZ2VJbmZvLmVuZEluZGV4V2l0aEJ1ZmZlcixcblx0XHRcdHBhZGRpbmc6IE1hdGgucm91bmQobmV3UGFkZGluZyksXG5cdFx0XHRzY3JvbGxMZW5ndGg6IE1hdGgucm91bmQobmV3U2Nyb2xsTGVuZ3RoKVxuXHRcdH07XG5cdH1cbn1cbiJdfQ==