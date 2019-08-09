(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('rxjs'), require('@angular/forms'), require('@angular/common')) :
    typeof define === 'function' && define.amd ? define('angular2-multiselect-dropdown', ['exports', '@angular/core', 'rxjs', '@angular/forms', '@angular/common'], factory) :
    (factory((global['angular2-multiselect-dropdown'] = {}),global.ng.core,global.rxjs,global.ng.forms,global.ng.common));
}(this, (function (exports,core,rxjs,forms,common) { 'use strict';

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
     */
    var MyException = /** @class */ (function () {
        function MyException(status, body) {
            this.status = status;
            this.body = body;
        }
        return MyException;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
     */
    var ClickOutsideDirective = /** @class */ (function () {
        function ClickOutsideDirective(_elementRef) {
            this._elementRef = _elementRef;
            this.clickOutside = new core.EventEmitter();
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
            { type: core.Directive, args: [{
                        selector: '[clickOutside]'
                    },] }
        ];
        /** @nocollapse */
        ClickOutsideDirective.ctorParameters = function () {
            return [
                { type: core.ElementRef }
            ];
        };
        ClickOutsideDirective.propDecorators = {
            clickOutside: [{ type: core.Output }],
            onClick: [{ type: core.HostListener, args: ['document:click', ['$event', '$event.target'],] }, { type: core.HostListener, args: ['document:touchstart', ['$event', '$event.target'],] }]
        };
        return ClickOutsideDirective;
    }());
    var ScrollDirective = /** @class */ (function () {
        function ScrollDirective(_elementRef) {
            this._elementRef = _elementRef;
            this.scroll = new core.EventEmitter();
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
            { type: core.Directive, args: [{
                        selector: '[scroll]'
                    },] }
        ];
        /** @nocollapse */
        ScrollDirective.ctorParameters = function () {
            return [
                { type: core.ElementRef }
            ];
        };
        ScrollDirective.propDecorators = {
            scroll: [{ type: core.Output }],
            onClick: [{ type: core.HostListener, args: ['scroll', ['$event'],] }]
        };
        return ScrollDirective;
    }());
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
            { type: core.Directive, args: [{
                        selector: '[styleProp]'
                    },] }
        ];
        /** @nocollapse */
        styleDirective.ctorParameters = function () {
            return [
                { type: core.ElementRef }
            ];
        };
        styleDirective.propDecorators = {
            styleVal: [{ type: core.Input, args: ['styleProp',] }]
        };
        return styleDirective;
    }());
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
            { type: core.Directive, args: [{
                        selector: '[setPosition]'
                    },] }
        ];
        /** @nocollapse */
        setPosition.ctorParameters = function () {
            return [
                { type: core.ElementRef }
            ];
        };
        setPosition.propDecorators = {
            height: [{ type: core.Input, args: ['setPosition',] }]
        };
        return setPosition;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
     */
    var DataService = /** @class */ (function () {
        function DataService() {
            this.filteredData = [];
            this.subject = new rxjs.Subject();
        }
        /**
         * @param {?} data
         * @return {?}
         */
        DataService.prototype.setData = /**
         * @param {?} data
         * @return {?}
         */
            function (data) {
                this.filteredData = data;
                this.subject.next(data);
            };
        /**
         * @return {?}
         */
        DataService.prototype.getData = /**
         * @return {?}
         */
            function () {
                return this.subject.asObservable();
            };
        /**
         * @return {?}
         */
        DataService.prototype.getFilteredData = /**
         * @return {?}
         */
            function () {
                if (this.filteredData && this.filteredData.length > 0) {
                    return this.filteredData;
                }
                else {
                    return [];
                }
            };
        DataService.decorators = [
            { type: core.Injectable }
        ];
        return DataService;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
     */
    var ListFilterPipe = /** @class */ (function () {
        function ListFilterPipe(ds) {
            this.ds = ds;
            this.filteredList = [];
        }
        /**
         * @param {?} items
         * @param {?} filter
         * @param {?} searchBy
         * @return {?}
         */
        ListFilterPipe.prototype.transform = /**
         * @param {?} items
         * @param {?} filter
         * @param {?} searchBy
         * @return {?}
         */
            function (items, filter, searchBy) {
                var _this = this;
                if (!items || !filter) {
                    this.ds.setData(items);
                    return items;
                }
                this.filteredList = items.filter(function (item) { return _this.applyFilter(item, filter, searchBy); });
                this.ds.setData(this.filteredList);
                return this.filteredList;
            };
        /**
         * @param {?} item
         * @param {?} filter
         * @param {?} searchBy
         * @return {?}
         */
        ListFilterPipe.prototype.applyFilter = /**
         * @param {?} item
         * @param {?} filter
         * @param {?} searchBy
         * @return {?}
         */
            function (item, filter, searchBy) {
                /** @type {?} */
                var found = false;
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
            };
        ListFilterPipe.decorators = [
            { type: core.Pipe, args: [{
                        name: 'listFilter',
                        pure: true
                    },] }
        ];
        /** @nocollapse */
        ListFilterPipe.ctorParameters = function () {
            return [
                { type: DataService }
            ];
        };
        return ListFilterPipe;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
     */
    var Item = /** @class */ (function () {
        function Item() {
        }
        Item.decorators = [
            { type: core.Component, args: [{
                        selector: 'c-item',
                        template: ""
                    }] }
        ];
        /** @nocollapse */
        Item.ctorParameters = function () { return []; };
        Item.propDecorators = {
            template: [{ type: core.ContentChild, args: [core.TemplateRef,] }]
        };
        return Item;
    }());
    var Badge = /** @class */ (function () {
        function Badge() {
        }
        Badge.decorators = [
            { type: core.Component, args: [{
                        selector: 'c-badge',
                        template: ""
                    }] }
        ];
        /** @nocollapse */
        Badge.ctorParameters = function () { return []; };
        Badge.propDecorators = {
            template: [{ type: core.ContentChild, args: [core.TemplateRef,] }]
        };
        return Badge;
    }());
    var Search = /** @class */ (function () {
        function Search() {
        }
        Search.decorators = [
            { type: core.Component, args: [{
                        selector: 'c-search',
                        template: ""
                    }] }
        ];
        /** @nocollapse */
        Search.ctorParameters = function () { return []; };
        Search.propDecorators = {
            template: [{ type: core.ContentChild, args: [core.TemplateRef,] }]
        };
        return Search;
    }());
    var TemplateRenderer = /** @class */ (function () {
        function TemplateRenderer(viewContainer) {
            this.viewContainer = viewContainer;
        }
        /**
         * @return {?}
         */
        TemplateRenderer.prototype.ngOnInit = /**
         * @return {?}
         */
            function () {
                this.view = this.viewContainer.createEmbeddedView(this.data.template, {
                    '\$implicit': this.data,
                    'item': this.item
                });
            };
        /**
         * @return {?}
         */
        TemplateRenderer.prototype.ngOnDestroy = /**
         * @return {?}
         */
            function () {
                this.view.destroy();
            };
        TemplateRenderer.decorators = [
            { type: core.Component, args: [{
                        selector: 'c-templateRenderer',
                        template: ""
                    }] }
        ];
        /** @nocollapse */
        TemplateRenderer.ctorParameters = function () {
            return [
                { type: core.ViewContainerRef }
            ];
        };
        TemplateRenderer.propDecorators = {
            data: [{ type: core.Input }],
            item: [{ type: core.Input }]
        };
        return TemplateRenderer;
    }());
    var CIcon = /** @class */ (function () {
        function CIcon() {
        }
        CIcon.decorators = [
            { type: core.Component, args: [{
                        selector: 'c-icon',
                        template: "<svg *ngIf=\"name == 'remove'\" width=\"100%\" height=\"100%\" version=\"1.1\" id=\"Capa_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n                        viewBox=\"0 0 47.971 47.971\" style=\"enable-background:new 0 0 47.971 47.971;\" xml:space=\"preserve\">\n                        <g>\n                            <path d=\"M28.228,23.986L47.092,5.122c1.172-1.171,1.172-3.071,0-4.242c-1.172-1.172-3.07-1.172-4.242,0L23.986,19.744L5.121,0.88\n                                c-1.172-1.172-3.07-1.172-4.242,0c-1.172,1.171-1.172,3.071,0,4.242l18.865,18.864L0.879,42.85c-1.172,1.171-1.172,3.071,0,4.242\n                                C1.465,47.677,2.233,47.97,3,47.97s1.535-0.293,2.121-0.879l18.865-18.864L42.85,47.091c0.586,0.586,1.354,0.879,2.121,0.879\n                                s1.535-0.293,2.121-0.879c1.172-1.171,1.172-3.071,0-4.242L28.228,23.986z\"/>\n                        </g>\n                    </svg>\n            <svg *ngIf=\"name == 'angle-down'\" version=\"1.1\" id=\"Capa_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n\t width=\"100%\" height=\"100%\" viewBox=\"0 0 612 612\" style=\"enable-background:new 0 0 612 612;\" xml:space=\"preserve\">\n<g>\n\t<g id=\"_x31_0_34_\">\n\t\t<g>\n\t\t\t<path d=\"M604.501,134.782c-9.999-10.05-26.222-10.05-36.221,0L306.014,422.558L43.721,134.782\n\t\t\t\tc-9.999-10.05-26.223-10.05-36.222,0s-9.999,26.35,0,36.399l279.103,306.241c5.331,5.357,12.422,7.652,19.386,7.296\n\t\t\t\tc6.988,0.356,14.055-1.939,19.386-7.296l279.128-306.268C614.5,161.106,614.5,144.832,604.501,134.782z\"/>\n\t\t</g>\n\t</g>\n</g>\n</svg>\n<svg *ngIf=\"name == 'angle-up'\" version=\"1.1\" id=\"Capa_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n\t width=\"100%\" height=\"100%\" viewBox=\"0 0 612 612\" style=\"enable-background:new 0 0 612 612;\" xml:space=\"preserve\">\n<g>\n\t<g id=\"_x39__30_\">\n\t\t<g>\n\t\t\t<path d=\"M604.501,440.509L325.398,134.956c-5.331-5.357-12.423-7.627-19.386-7.27c-6.989-0.357-14.056,1.913-19.387,7.27\n\t\t\t\tL7.499,440.509c-9.999,10.024-9.999,26.298,0,36.323s26.223,10.024,36.222,0l262.293-287.164L568.28,476.832\n\t\t\t\tc9.999,10.024,26.222,10.024,36.221,0C614.5,466.809,614.5,450.534,604.501,440.509z\"/>\n\t\t</g>\n\t</g>\n</g>\n\n</svg>\n<svg *ngIf=\"name == 'search'\" version=\"1.1\" id=\"Capa_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n\t width=\"100%\" height=\"100%\" viewBox=\"0 0 615.52 615.52\" style=\"enable-background:new 0 0 615.52 615.52;\"\n\t xml:space=\"preserve\">\n<g>\n\t<g>\n\t\t<g id=\"Search__x28_and_thou_shall_find_x29_\">\n\t\t\t<g>\n\t\t\t\t<path d=\"M602.531,549.736l-184.31-185.368c26.679-37.72,42.528-83.729,42.528-133.548C460.75,103.35,357.997,0,231.258,0\n\t\t\t\t\tC104.518,0,1.765,103.35,1.765,230.82c0,127.47,102.753,230.82,229.493,230.82c49.53,0,95.271-15.944,132.78-42.777\n\t\t\t\t\tl184.31,185.366c7.482,7.521,17.292,11.291,27.102,11.291c9.812,0,19.62-3.77,27.083-11.291\n\t\t\t\t\tC617.496,589.188,617.496,564.777,602.531,549.736z M355.9,319.763l-15.042,21.273L319.7,356.174\n\t\t\t\t\tc-26.083,18.658-56.667,28.526-88.442,28.526c-84.365,0-152.995-69.035-152.995-153.88c0-84.846,68.63-153.88,152.995-153.88\n\t\t\t\t\ts152.996,69.034,152.996,153.88C384.271,262.769,374.462,293.526,355.9,319.763z\"/>\n\t\t\t</g>\n\t\t</g>\n\t</g>\n</g>\n\n</svg>\n<svg *ngIf=\"name == 'clear'\" version=\"1.1\" id=\"Capa_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n\t viewBox=\"0 0 51.976 51.976\" style=\"enable-background:new 0 0 51.976 51.976;\" xml:space=\"preserve\">\n<g>\n\t<path d=\"M44.373,7.603c-10.137-10.137-26.632-10.138-36.77,0c-10.138,10.138-10.137,26.632,0,36.77s26.632,10.138,36.77,0\n\t\tC54.51,34.235,54.51,17.74,44.373,7.603z M36.241,36.241c-0.781,0.781-2.047,0.781-2.828,0l-7.425-7.425l-7.778,7.778\n\t\tc-0.781,0.781-2.047,0.781-2.828,0c-0.781-0.781-0.781-2.047,0-2.828l7.778-7.778l-7.425-7.425c-0.781-0.781-0.781-2.048,0-2.828\n\t\tc0.781-0.781,2.047-0.781,2.828,0l7.425,7.425l7.071-7.071c0.781-0.781,2.047-0.781,2.828,0c0.781,0.781,0.781,2.047,0,2.828\n\t\tl-7.071,7.071l7.425,7.425C37.022,34.194,37.022,35.46,36.241,36.241z\"/>\n</g>\n</svg>",
                        encapsulation: core.ViewEncapsulation.None
                    }] }
        ];
        CIcon.propDecorators = {
            name: [{ type: core.Input }]
        };
        return CIcon;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
     */
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
            this.update = new core.EventEmitter();
            this.vsUpdate = new core.EventEmitter();
            this.change = new core.EventEmitter();
            this.vsChange = new core.EventEmitter();
            this.start = new core.EventEmitter();
            this.vsStart = new core.EventEmitter();
            this.end = new core.EventEmitter();
            this.vsEnd = new core.EventEmitter();
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
             */ function () {
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
             */ function () {
                return this._enableUnequalChildrenSizes;
            },
            set: /**
             * @param {?} value
             * @return {?}
             */ function (value) {
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
             */ function () {
                return Math.max(this._bufferAmount, this.enableUnequalChildrenSizes ? 5 : 0);
            },
            set: /**
             * @param {?} value
             * @return {?}
             */ function (value) {
                this._bufferAmount = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VirtualScrollComponent.prototype, "scrollThrottlingTime", {
            get: /**
             * @return {?}
             */ function () {
                return this._scrollThrottlingTime;
            },
            set: /**
             * @param {?} value
             * @return {?}
             */ function (value) {
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
             */ function () {
                return this._checkResizeInterval;
            },
            set: /**
             * @param {?} value
             * @return {?}
             */ function (value) {
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
             */ function () {
                return this._items;
            },
            set: /**
             * @param {?} value
             * @return {?}
             */ function (value) {
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
             */ function () {
                return this._horizontal;
            },
            set: /**
             * @param {?} value
             * @return {?}
             */ function (value) {
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
             */ function () {
                return this._parentScroll;
            },
            set: /**
             * @param {?} value
             * @return {?}
             */ function (value) {
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
                if (alignToBeginning === void 0) {
                    alignToBeginning = true;
                }
                if (additionalOffset === void 0) {
                    additionalOffset = 0;
                }
                if (animationMilliseconds === void 0) {
                    animationMilliseconds = undefined;
                }
                if (animationCompletedCallback === void 0) {
                    animationCompletedCallback = undefined;
                }
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
                if (alignToBeginning === void 0) {
                    alignToBeginning = true;
                }
                if (additionalOffset === void 0) {
                    additionalOffset = 0;
                }
                if (animationMilliseconds === void 0) {
                    animationMilliseconds = undefined;
                }
                if (animationCompletedCallback === void 0) {
                    animationCompletedCallback = undefined;
                }
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
                if (alignToBeginning === void 0) {
                    alignToBeginning = true;
                }
                if (additionalOffset === void 0) {
                    additionalOffset = 0;
                }
                if (animationMilliseconds === void 0) {
                    animationMilliseconds = undefined;
                }
                if (animationCompletedCallback === void 0) {
                    animationCompletedCallback = undefined;
                }
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
                if (refreshCompletedCallback === void 0) {
                    refreshCompletedCallback = undefined;
                }
                if (maxRunTimes === void 0) {
                    maxRunTimes = 2;
                }
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
                        if (startChanged || endChanged) {
                            _this_1.zone.run(function () {
                                // update the scroll list to trigger re-render of components in viewport
                                // update the scroll list to trigger re-render of components in viewport
                                _this_1.viewPortItems = viewport.startIndexWithBuffer >= 0 && viewport.endIndexWithBuffer >= 0 ? _this_1.items.slice(viewport.startIndexWithBuffer, viewport.endIndexWithBuffer + 1) : [];
                                _this_1.update.emit(_this_1.viewPortItems);
                                _this_1.vsUpdate.emit(_this_1.viewPortItems);
                                {
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
            { type: core.Component, args: [{
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
        VirtualScrollComponent.ctorParameters = function () {
            return [
                { type: core.ElementRef },
                { type: core.Renderer2 },
                { type: core.NgZone }
            ];
        };
        VirtualScrollComponent.propDecorators = {
            enableUnequalChildrenSizes: [{ type: core.Input }],
            useMarginInsteadOfTranslate: [{ type: core.Input }],
            scrollbarWidth: [{ type: core.Input }],
            scrollbarHeight: [{ type: core.Input }],
            childWidth: [{ type: core.Input }],
            childHeight: [{ type: core.Input }],
            bufferAmount: [{ type: core.Input }],
            scrollAnimationTime: [{ type: core.Input }],
            resizeBypassRefreshTheshold: [{ type: core.Input }],
            scrollThrottlingTime: [{ type: core.Input }],
            checkResizeInterval: [{ type: core.Input }],
            items: [{ type: core.Input }],
            compareItems: [{ type: core.Input }],
            horizontal: [{ type: core.Input }],
            parentScroll: [{ type: core.Input }],
            update: [{ type: core.Output }],
            vsUpdate: [{ type: core.Output }],
            change: [{ type: core.Output }],
            vsChange: [{ type: core.Output }],
            start: [{ type: core.Output }],
            vsStart: [{ type: core.Output }],
            end: [{ type: core.Output }],
            vsEnd: [{ type: core.Output }],
            contentElementRef: [{ type: core.ViewChild, args: ['content', { read: core.ElementRef },] }],
            invisiblePaddingElementRef: [{ type: core.ViewChild, args: ['invisiblePadding', { read: core.ElementRef },] }],
            containerElementRef: [{ type: core.ContentChild, args: ['container', { read: core.ElementRef },] }]
        };
        return VirtualScrollComponent;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
     */
    /** @type {?} */
    var DROPDOWN_CONTROL_VALUE_ACCESSOR = {
        provide: forms.NG_VALUE_ACCESSOR,
        useExisting: core.forwardRef(function () { return AngularMultiSelect; }),
        multi: true
    };
    /** @type {?} */
    var DROPDOWN_CONTROL_VALIDATION = {
        provide: forms.NG_VALIDATORS,
        useExisting: core.forwardRef(function () { return AngularMultiSelect; }),
        multi: true,
    };
    /** @type {?} */
    var noop = function () {
    };
    var AngularMultiSelect = /** @class */ (function () {
        function AngularMultiSelect(_elementRef, cdr, ds) {
            this._elementRef = _elementRef;
            this.cdr = cdr;
            this.ds = ds;
            this.onSelect = new core.EventEmitter();
            this.onDeSelect = new core.EventEmitter();
            this.onSelectAll = new core.EventEmitter();
            this.onDeSelectAll = new core.EventEmitter();
            this.onOpen = new core.EventEmitter();
            this.onClose = new core.EventEmitter();
            this.onScrollToEnd = new core.EventEmitter();
            this.onFilterSelectAll = new core.EventEmitter();
            this.onFilterDeSelectAll = new core.EventEmitter();
            this.onAddFilterNewItem = new core.EventEmitter();
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
        AngularMultiSelect.prototype.onEscapeDown = /**
         * @param {?} event
         * @return {?}
         */
            function (event) {
                if (this.settings.escapeToClose) {
                    this.closeDropdown();
                }
            };
        /**
         * @return {?}
         */
        AngularMultiSelect.prototype.ngOnInit = /**
         * @return {?}
         */
            function () {
                var _this = this;
                this.settings = Object.assign(this.defaultSettings, this.settings);
                if (this.settings.groupBy) {
                    this.groupedData = this.transformData(this.data, this.settings.groupBy);
                    this.groupCachedItems = this.cloneArray(this.groupedData);
                }
                this.cachedItems = this.cloneArray(this.data);
                if (this.settings.position == 'top') {
                    setTimeout(function () {
                        _this.selectedListHeight = { val: 0 };
                        _this.selectedListHeight.val = _this.selectedListElem.nativeElement.clientHeight;
                    });
                }
                this.subscription = this.ds.getData().subscribe(function (data) {
                    if (data) {
                        /** @type {?} */
                        var len = 0;
                        data.forEach(function (obj, i) {
                            if (!obj.hasOwnProperty('grpTitle')) {
                                len++;
                            }
                        });
                        _this.filterLength = len;
                        _this.onFilterChange(data);
                    }
                });
                setTimeout(function () {
                    _this.calculateDropdownDirection();
                });
            };
        /**
         * @param {?} changes
         * @return {?}
         */
        AngularMultiSelect.prototype.ngOnChanges = /**
         * @param {?} changes
         * @return {?}
         */
            function (changes) {
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
            };
        /**
         * @return {?}
         */
        AngularMultiSelect.prototype.ngDoCheck = /**
         * @return {?}
         */
            function () {
                if (this.selectedItems) {
                    if (this.selectedItems.length == 0 || this.data.length == 0 || this.selectedItems.length < this.data.length) {
                        this.isSelectAll = false;
                    }
                }
            };
        /**
         * @return {?}
         */
        AngularMultiSelect.prototype.ngAfterViewInit = /**
         * @return {?}
         */
            function () {
                if (this.settings.lazyLoading) ;
            };
        /**
         * @return {?}
         */
        AngularMultiSelect.prototype.ngAfterViewChecked = /**
         * @return {?}
         */
            function () {
                if (this.selectedListElem.nativeElement.clientHeight && this.settings.position == 'top' && this.selectedListHeight) {
                    this.selectedListHeight.val = this.selectedListElem.nativeElement.clientHeight;
                    this.cdr.detectChanges();
                }
            };
        /**
         * @param {?} item
         * @param {?} index
         * @param {?} evt
         * @return {?}
         */
        AngularMultiSelect.prototype.onItemClick = /**
         * @param {?} item
         * @param {?} index
         * @param {?} evt
         * @return {?}
         */
            function (item, index, evt) {
                if (this.settings.disabled) {
                    return false;
                }
                /** @type {?} */
                var found = this.isSelected(item);
                /** @type {?} */
                var limit = this.selectedItems.length < this.settings.limitSelection ? true : false;
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
            };
        /**
         * @param {?} c
         * @return {?}
         */
        AngularMultiSelect.prototype.validate = /**
         * @param {?} c
         * @return {?}
         */
            function (c) {
                return null;
            };
        /**
         * @param {?} value
         * @return {?}
         */
        AngularMultiSelect.prototype.writeValue = /**
         * @param {?} value
         * @return {?}
         */
            function (value) {
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
            };
        //From ControlValueAccessor interface
        /**
         * @param {?} fn
         * @return {?}
         */
        AngularMultiSelect.prototype.registerOnChange = /**
         * @param {?} fn
         * @return {?}
         */
            function (fn) {
                this.onChangeCallback = fn;
            };
        //From ControlValueAccessor interface
        /**
         * @param {?} fn
         * @return {?}
         */
        AngularMultiSelect.prototype.registerOnTouched = /**
         * @param {?} fn
         * @return {?}
         */
            function (fn) {
                this.onTouchedCallback = fn;
            };
        /**
         * @param {?} index
         * @param {?} item
         * @return {?}
         */
        AngularMultiSelect.prototype.trackByFn = /**
         * @param {?} index
         * @param {?} item
         * @return {?}
         */
            function (index, item) {
                return item[this.settings.primaryKey];
            };
        /**
         * @param {?} clickedItem
         * @return {?}
         */
        AngularMultiSelect.prototype.isSelected = /**
         * @param {?} clickedItem
         * @return {?}
         */
            function (clickedItem) {
                var _this = this;
                /** @type {?} */
                var found = false;
                this.selectedItems && this.selectedItems.forEach(function (item) {
                    if (clickedItem[_this.settings.primaryKey] === item[_this.settings.primaryKey]) {
                        found = true;
                    }
                });
                return found;
            };
        /**
         * @param {?} item
         * @return {?}
         */
        AngularMultiSelect.prototype.addSelected = /**
         * @param {?} item
         * @return {?}
         */
            function (item) {
                if (this.settings.singleSelection) {
                    this.selectedItems = [];
                    this.selectedItems.push(item);
                    this.closeDropdown();
                }
                else
                    this.selectedItems.push(item);
                this.onChangeCallback(this.selectedItems);
                this.onTouchedCallback(this.selectedItems);
            };
        /**
         * @param {?} clickedItem
         * @return {?}
         */
        AngularMultiSelect.prototype.removeSelected = /**
         * @param {?} clickedItem
         * @return {?}
         */
            function (clickedItem) {
                var _this = this;
                this.selectedItems && this.selectedItems.forEach(function (item) {
                    if (clickedItem[_this.settings.primaryKey] === item[_this.settings.primaryKey]) {
                        _this.selectedItems.splice(_this.selectedItems.indexOf(item), 1);
                    }
                });
                this.onChangeCallback(this.selectedItems);
                this.onTouchedCallback(this.selectedItems);
            };
        /**
         * @param {?} evt
         * @return {?}
         */
        AngularMultiSelect.prototype.toggleDropdown = /**
         * @param {?} evt
         * @return {?}
         */
            function (evt) {
                var _this = this;
                if (this.settings.disabled) {
                    return false;
                }
                this.isActive = !this.isActive;
                if (this.isActive) {
                    if (this.settings.searchAutofocus && this.searchInput && this.settings.enableSearchFilter && !this.searchTempl) {
                        setTimeout(function () {
                            _this.searchInput.nativeElement.focus();
                        }, 0);
                    }
                    this.onOpen.emit(true);
                }
                else {
                    this.onClose.emit(false);
                }
                setTimeout(function () {
                    _this.calculateDropdownDirection();
                }, 0);
                evt.preventDefault();
            };
        /**
         * @return {?}
         */
        AngularMultiSelect.prototype.openDropdown = /**
         * @return {?}
         */
            function () {
                var _this = this;
                if (this.settings.disabled) {
                    return false;
                }
                this.isActive = true;
                if (this.settings.searchAutofocus && this.searchInput && this.settings.enableSearchFilter && !this.searchTempl) {
                    setTimeout(function () {
                        _this.searchInput.nativeElement.focus();
                    }, 0);
                }
                this.onOpen.emit(true);
            };
        /**
         * @return {?}
         */
        AngularMultiSelect.prototype.closeDropdown = /**
         * @return {?}
         */
            function () {
                if (this.searchInput && this.settings.lazyLoading) {
                    this.searchInput.nativeElement.value = "";
                }
                if (this.searchInput) {
                    this.searchInput.nativeElement.value = "";
                }
                this.filter = "";
                this.isActive = false;
                this.onClose.emit(false);
            };
        /**
         * @return {?}
         */
        AngularMultiSelect.prototype.closeDropdownOnClickOut = /**
         * @return {?}
         */
            function () {
                if (this.searchInput && this.settings.lazyLoading) {
                    this.searchInput.nativeElement.value = "";
                }
                if (this.searchInput) {
                    this.searchInput.nativeElement.value = "";
                }
                this.filter = "";
                this.isActive = false;
                this.onClose.emit(false);
            };
        /**
         * @return {?}
         */
        AngularMultiSelect.prototype.toggleSelectAll = /**
         * @return {?}
         */
            function () {
                if (!this.isSelectAll) {
                    this.selectedItems = [];
                    if (this.settings.groupBy) {
                        this.groupedData.forEach(function (obj) {
                            obj.selected = true;
                        });
                        this.groupCachedItems.forEach(function (obj) {
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
                        this.groupedData.forEach(function (obj) {
                            obj.selected = false;
                        });
                        this.groupCachedItems.forEach(function (obj) {
                            obj.selected = false;
                        });
                    }
                    this.selectedItems = [];
                    this.isSelectAll = false;
                    this.onChangeCallback(this.selectedItems);
                    this.onTouchedCallback(this.selectedItems);
                    this.onDeSelectAll.emit(this.selectedItems);
                }
            };
        /**
         * @return {?}
         */
        AngularMultiSelect.prototype.filterGroupedList = /**
         * @return {?}
         */
            function () {
                var _this = this;
                if (this.filter == "" || this.filter == null) {
                    this.clearSearch();
                    return;
                }
                this.groupedData = this.cloneArray(this.groupCachedItems);
                this.groupedData = this.groupedData.filter(function (obj) {
                    /** @type {?} */
                    var arr = obj.list.filter(function (t) {
                        return t.itemName.toLowerCase().indexOf(_this.filter.toLowerCase()) > -1;
                    });
                    obj.list = arr;
                    return arr.some(function (cat) {
                        return cat.itemName.toLowerCase().indexOf(_this.filter.toLowerCase()) > -1;
                    });
                });
                console.log(this.groupedData);
            };
        /**
         * @return {?}
         */
        AngularMultiSelect.prototype.toggleFilterSelectAll = /**
         * @return {?}
         */
            function () {
                var _this = this;
                if (!this.isFilterSelectAll) {
                    /** @type {?} */
                    var added_1 = [];
                    if (this.settings.groupBy) {
                        this.groupedData.forEach(function (item) {
                            if (item.list) {
                                item.list.forEach(function (el) {
                                    if (!_this.isSelected(el)) {
                                        _this.addSelected(el);
                                        added_1.push(el);
                                    }
                                });
                            }
                            _this.updateGroupInfo(item);
                        });
                    }
                    else {
                        this.ds.getFilteredData().forEach(function (item) {
                            if (!_this.isSelected(item)) {
                                _this.addSelected(item);
                                added_1.push(item);
                            }
                        });
                    }
                    this.isFilterSelectAll = true;
                    this.onFilterSelectAll.emit(added_1);
                }
                else {
                    /** @type {?} */
                    var removed_1 = [];
                    if (this.settings.groupBy) {
                        this.groupedData.forEach(function (item) {
                            if (item.list) {
                                item.list.forEach(function (el) {
                                    if (_this.isSelected(el)) {
                                        _this.removeSelected(el);
                                        removed_1.push(el);
                                    }
                                });
                            }
                        });
                    }
                    else {
                        this.ds.getFilteredData().forEach(function (item) {
                            if (_this.isSelected(item)) {
                                _this.removeSelected(item);
                                removed_1.push(item);
                            }
                        });
                    }
                    this.isFilterSelectAll = false;
                    this.onFilterDeSelectAll.emit(removed_1);
                }
            };
        /**
         * @return {?}
         */
        AngularMultiSelect.prototype.toggleInfiniteFilterSelectAll = /**
         * @return {?}
         */
            function () {
                var _this = this;
                if (!this.isInfiniteFilterSelectAll) {
                    this.data.forEach(function (item) {
                        if (!_this.isSelected(item)) {
                            _this.addSelected(item);
                        }
                    });
                    this.isInfiniteFilterSelectAll = true;
                }
                else {
                    this.data.forEach(function (item) {
                        if (_this.isSelected(item)) {
                            _this.removeSelected(item);
                        }
                    });
                    this.isInfiniteFilterSelectAll = false;
                }
            };
        /**
         * @return {?}
         */
        AngularMultiSelect.prototype.clearSearch = /**
         * @return {?}
         */
            function () {
                if (this.settings.groupBy) {
                    this.groupedData = [];
                    this.groupedData = this.cloneArray(this.groupCachedItems);
                }
                this.filter = "";
                this.isFilterSelectAll = false;
            };
        /**
         * @param {?} data
         * @return {?}
         */
        AngularMultiSelect.prototype.onFilterChange = /**
         * @param {?} data
         * @return {?}
         */
            function (data) {
                var _this = this;
                if (this.filter && this.filter == "" || data.length == 0) {
                    this.isFilterSelectAll = false;
                }
                /** @type {?} */
                var cnt = 0;
                data.forEach(function (item) {
                    if (!item.hasOwnProperty('grpTitle') && _this.isSelected(item)) {
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
            };
        /**
         * @param {?} arr
         * @return {?}
         */
        AngularMultiSelect.prototype.cloneArray = /**
         * @param {?} arr
         * @return {?}
         */
            function (arr) {
                if (Array.isArray(arr)) {
                    return JSON.parse(JSON.stringify(arr));
                }
                else if (typeof arr === 'object') {
                    throw 'Cannot clone array containing an object!';
                }
                else {
                    return arr;
                }
            };
        /**
         * @param {?} item
         * @return {?}
         */
        AngularMultiSelect.prototype.updateGroupInfo = /**
         * @param {?} item
         * @return {?}
         */
            function (item) {
                var _this = this;
                /** @type {?} */
                var key = this.settings.groupBy;
                this.groupedData.forEach(function (obj) {
                    /** @type {?} */
                    var cnt = 0;
                    if (obj.grpTitle && (item[key] == obj[key])) {
                        if (obj.list) {
                            obj.list.forEach(function (el) {
                                if (_this.isSelected(el)) {
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
                this.groupCachedItems.forEach(function (obj) {
                    /** @type {?} */
                    var cnt = 0;
                    if (obj.grpTitle && (item[key] == obj[key])) {
                        if (obj.list) {
                            obj.list.forEach(function (el) {
                                if (_this.isSelected(el)) {
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
            };
        /**
         * @param {?} arr
         * @param {?} field
         * @return {?}
         */
        AngularMultiSelect.prototype.transformData = /**
         * @param {?} arr
         * @param {?} field
         * @return {?}
         */
            function (arr, field) {
                var _this = this;
                /** @type {?} */
                var groupedObj = arr.reduce(function (prev, cur) {
                    if (!prev[cur[field]]) {
                        prev[cur[field]] = [cur];
                    }
                    else {
                        prev[cur[field]].push(cur);
                    }
                    return prev;
                }, {});
                /** @type {?} */
                var tempArr = [];
                Object.keys(groupedObj).map(function (x) {
                    /** @type {?} */
                    var obj = {};
                    obj["grpTitle"] = true;
                    obj[_this.settings.labelKey] = x;
                    obj[_this.settings.groupBy] = x;
                    obj['selected'] = false;
                    obj['list'] = [];
                    groupedObj[x].forEach(function (item) {
                        item['list'] = [];
                        obj.list.push(item);
                    });
                    tempArr.push(obj);
                    // obj.list.forEach((item: any) => {
                    //     tempArr.push(item);
                    // });
                });
                return tempArr;
            };
        /**
         * @param {?} evt
         * @return {?}
         */
        AngularMultiSelect.prototype.filterInfiniteList = /**
         * @param {?} evt
         * @return {?}
         */
            function (evt) {
                var _this = this;
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
                            this.data.filter(function (el) {
                                if (el[_this.settings.searchBy[t].toString()].toString().toLowerCase().indexOf(evt.target.value.toString().toLowerCase()) >= 0) {
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
            };
        /**
         * @return {?}
         */
        AngularMultiSelect.prototype.resetInfiniteSearch = /**
         * @return {?}
         */
            function () {
                this.filter = "";
                this.isInfiniteFilterSelectAll = false;
                this.data = [];
                this.data = this.cachedItems;
                this.groupedData = this.groupCachedItems;
                this.infiniteFilterLength = 0;
            };
        /**
         * @param {?} e
         * @return {?}
         */
        AngularMultiSelect.prototype.onScrollEnd = /**
         * @param {?} e
         * @return {?}
         */
            function (e) {
                this.onScrollToEnd.emit(e);
            };
        /**
         * @return {?}
         */
        AngularMultiSelect.prototype.ngOnDestroy = /**
         * @return {?}
         */
            function () {
                this.subscription.unsubscribe();
            };
        /**
         * @param {?} item
         * @return {?}
         */
        AngularMultiSelect.prototype.selectGroup = /**
         * @param {?} item
         * @return {?}
         */
            function (item) {
                var _this = this;
                if (item.selected) {
                    item.selected = false;
                    item.list.forEach(function (obj) {
                        _this.removeSelected(obj);
                    });
                }
                else {
                    item.selected = true;
                    item.list.forEach(function (obj) {
                        if (!_this.isSelected(obj)) {
                            _this.addSelected(obj);
                        }
                    });
                }
                this.updateGroupInfo(item);
            };
        /**
         * @return {?}
         */
        AngularMultiSelect.prototype.addFilterNewItem = /**
         * @return {?}
         */
            function () {
                this.onAddFilterNewItem.emit(this.filter);
                this.filterPipe = new ListFilterPipe(this.ds);
                this.filterPipe.transform(this.data, this.filter, this.settings.searchBy);
            };
        /**
         * @return {?}
         */
        AngularMultiSelect.prototype.calculateDropdownDirection = /**
         * @return {?}
         */
            function () {
                /** @type {?} */
                var shouldOpenTowardsTop = this.settings.position == 'top';
                if (this.settings.autoPosition) {
                    /** @type {?} */
                    var dropdownHeight = this.dropdownListElem.nativeElement.clientHeight;
                    /** @type {?} */
                    var viewportHeight = document.documentElement.clientHeight;
                    /** @type {?} */
                    var selectedListBounds = this.selectedListElem.nativeElement.getBoundingClientRect();
                    /** @type {?} */
                    var spaceOnTop = selectedListBounds.top;
                    /** @type {?} */
                    var spaceOnBottom = viewportHeight - selectedListBounds.top;
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
            };
        /**
         * @param {?} value
         * @return {?}
         */
        AngularMultiSelect.prototype.openTowardsTop = /**
         * @param {?} value
         * @return {?}
         */
            function (value) {
                if (value && this.selectedListElem.nativeElement.clientHeight) {
                    this.dropdownListYOffset = 15 + this.selectedListElem.nativeElement.clientHeight;
                }
                else {
                    this.dropdownListYOffset = 0;
                }
            };
        AngularMultiSelect.decorators = [
            { type: core.Component, args: [{
                        selector: 'angular2-multiselect',
                        template: "<div class=\"cuppa-dropdown\" (clickOutside)=\"closeDropdownOnClickOut()\">\n    <div class=\"selected-list\" #selectedList>\n        <div class=\"c-btn\" (click)=\"toggleDropdown($event)\" [ngClass]=\"{'disabled': settings.disabled}\" [attr.tabindex]=\"0\">\n\n            <span *ngIf=\"selectedItems?.length == 0\">{{settings.text}}</span>\n            <span *ngIf=\"settings.singleSelection && !badgeTempl\">\n                <span *ngFor=\"let item of selectedItems;trackBy: trackByFn.bind(this);\">\n                    {{item[settings.labelKey]}}\n                </span>\n            </span>\n            <span class=\"c-list\" *ngIf=\"selectedItems?.length > 0 && settings.singleSelection && badgeTempl \">\n                <div class=\"c-token\" *ngFor=\"let item of selectedItems;trackBy: trackByFn.bind(this);let k = index\">\n                <span *ngIf=\"!badgeTempl\" class=\"c-label\">{{item[settings.labelKey]}}</span>\n\n            <span *ngIf=\"badgeTempl\" class=\"c-label\">\n                            <c-templateRenderer [data]=\"badgeTempl\" [item]=\"item\"></c-templateRenderer>\n                        </span>\n            <span class=\"c-remove\" (click)=\"onItemClick(item,k,$event);$event.stopPropagation()\">\n                <c-icon [name]=\"'remove'\"></c-icon>\n            </span>\n        </div>\n        </span>\n        <div class=\"c-list\" *ngIf=\"selectedItems?.length > 0 && !settings.singleSelection\">\n            <div class=\"c-token\" *ngFor=\"let item of selectedItems;trackBy: trackByFn.bind(this);let k = index\" [hidden]=\"k > settings.badgeShowLimit-1\">\n                <span *ngIf=\"!badgeTempl\" class=\"c-label\">{{item[settings.labelKey]}}</span>\n                <span *ngIf=\"badgeTempl\" class=\"c-label\">\n                    <c-templateRenderer [data]=\"badgeTempl\" [item]=\"item\"></c-templateRenderer>\n                </span>\n                <span class=\"c-remove\" (click)=\"onItemClick(item,k,$event);$event.stopPropagation()\">\n                    <c-icon [name]=\"'remove'\"></c-icon>\n                </span>\n            </div>\n        </div>\n        <span class=\"countplaceholder\" *ngIf=\"selectedItems?.length > settings.badgeShowLimit\">+{{selectedItems?.length - settings.badgeShowLimit }}</span>\n        <span *ngIf=\"!isActive\" class=\"c-angle-down\">\n    <c-icon [name]=\"'angle-down'\"></c-icon>\n            </span>\n        <span *ngIf=\"isActive\" class=\"c-angle-up\">\n            <c-icon [name]=\"'angle-up'\"></c-icon>\n\n            </span>\n    </div>\n</div>\n<div #dropdownList class=\"dropdown-list\"\n[ngClass]=\"{'dropdown-list-top': dropdownListYOffset}\"\n[style.bottom.px]=\"dropdownListYOffset ? dropdownListYOffset : null\"\n[hidden]=\"!isActive\">\n    <div [ngClass]=\"{'arrow-up': !dropdownListYOffset, 'arrow-down': dropdownListYOffset}\" class=\"arrow-2\"></div>\n    <div [ngClass]=\"{'arrow-up': !dropdownListYOffset, 'arrow-down': dropdownListYOffset}\"></div>\n<div class=\"list-area\">\n        <div class=\"pure-checkbox select-all\" *ngIf=\"settings.enableCheckAll && !settings.singleSelection && !settings.limitSelection && data?.length > 0\"\n            (click)=\"toggleSelectAll()\">\n            <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelectAll\" [disabled]=\"settings.limitSelection == selectedItems?.length\"\n            />\n            <label>\n                <span [hidden]=\"isSelectAll\">{{settings.selectAllText}}</span>\n                <span [hidden]=\"!isSelectAll\">{{settings.unSelectAllText}}</span>\n            </label>\n            <img class=\"loading-icon\" *ngIf=\"loading\" src=\"assets/img/loading.gif\"/>\n        </div>\n        <div class=\"list-filter\" *ngIf=\"settings.enableSearchFilter\">\n            <span class=\"c-search\">\n                <c-icon [name]=\"'search'\"></c-icon>\n                </span>\n            <span *ngIf=\"!settings.lazyLoading\" [hidden]=\"filter == undefined || filter?.length == 0\" class=\"c-clear\" (click)=\"clearSearch()\">\n                <c-icon [name]=\"'clear'\"></c-icon>\n                </span>\n            <span *ngIf=\"settings.lazyLoading\" [hidden]=\"filter == undefined || filter?.length == 0\" class=\"c-clear\" (click)=\"resetInfiniteSearch()\">\n                <c-icon [name]=\"'clear'\"></c-icon>\n                </span>\n\n            <input class=\"c-input\" *ngIf=\"settings.groupBy && !settings.lazyLoading && !searchTempl\" #searchInput type=\"text\" [placeholder]=\"settings.searchPlaceholderText\"\n                [(ngModel)]=\"filter\" (keyup)=\"filterGroupedList()\">\n                <input class=\"c-input\" *ngIf=\"!settings.groupBy && !settings.lazyLoading && !searchTempl\" #searchInput type=\"text\" [placeholder]=\"settings.searchPlaceholderText\"\n                [(ngModel)]=\"filter\" >\n            <input class=\"c-input\" *ngIf=\"settings.lazyLoading && !searchTempl\" #searchInput type=\"text\" [placeholder]=\"settings.searchPlaceholderText\"\n                [(ngModel)]=\"filter\" (keyup)=\"filterInfiniteList($event)\">\n            <!--            <input class=\"c-input\" *ngIf=\"!settings.lazyLoading && !searchTempl && settings.groupBy\" #searchInput type=\"text\" [placeholder]=\"settings.searchPlaceholderText\"\n                [(ngModel)]=\"filter\" (keyup)=\"filterGroupList($event)\">-->\n            <c-templateRenderer *ngIf=\"searchTempl\" [data]=\"searchTempl\" [item]=\"item\"></c-templateRenderer>\n        </div>\n        <div class=\"filter-select-all\" *ngIf=\"!settings.lazyLoading && settings.enableFilterSelectAll\">\n            <div class=\"pure-checkbox select-all\" *ngIf=\"!settings.groupBy && filter?.length > 0 && filterLength > 0\" (click)=\"toggleFilterSelectAll()\">\n                <input type=\"checkbox\" [checked]=\"isFilterSelectAll\" [disabled]=\"settings.limitSelection == selectedItems?.length\" />\n                <label>\n                <span [hidden]=\"isFilterSelectAll\">{{settings.filterSelectAllText}}</span>\n                <span [hidden]=\"!isFilterSelectAll\">{{settings.filterUnSelectAllText}}</span>\n            </label>\n            </div>\n            <div class=\"pure-checkbox select-all\" *ngIf=\"settings.groupBy && filter?.length > 0 && groupedData?.length > 0\" (click)=\"toggleFilterSelectAll()\">\n                    <input type=\"checkbox\" [checked]=\"isFilterSelectAll && filter?.length > 0\" [disabled]=\"settings.limitSelection == selectedItems?.length\" />\n                    <label>\n                    <span [hidden]=\"isFilterSelectAll\">{{settings.filterSelectAllText}}</span>\n                    <span [hidden]=\"!isFilterSelectAll\">{{settings.filterUnSelectAllText}}</span>\n                </label>\n                </div>\n            <label class=\"nodata-label\" *ngIf=\"!settings.groupBy && filterLength == 0\" [hidden]=\"filter == undefined || filter?.length == 0\">{{settings.noDataLabel}}</label>\n            <label class=\"nodata-label\" *ngIf=\"settings.groupBy && groupedData?.length == 0\" [hidden]=\"filter == undefined || filter?.length == 0\">{{settings.noDataLabel}}</label>\n\n            <div class=\"btn-container\" *ngIf=\"settings.addNewItemOnFilter && filterLength == 0\" [hidden]=\"filter == undefined || filter?.length == 0\">\n            <button class=\"c-btn btn-iceblue\" (click)=\"addFilterNewItem()\">{{settings.addNewButtonText}}</button>\n            </div>\n        </div>\n        <div class=\"filter-select-all\" *ngIf=\"settings.lazyLoading && settings.enableFilterSelectAll\">\n            <div class=\"pure-checkbox select-all\" *ngIf=\"filter?.length > 0 && infiniteFilterLength > 0\" (click)=\"toggleInfiniteFilterSelectAll()\">\n                <input type=\"checkbox\" [checked]=\"isInfiniteFilterSelectAll\" [disabled]=\"settings.limitSelection == selectedItems?.length\"\n                />\n                <label>\n                <span [hidden]=\"isInfiniteFilterSelectAll\">{{settings.filterSelectAllText}}</span>\n                <span [hidden]=\"!isInfiniteFilterSelectAll\">{{settings.filterUnSelectAllText}}</span>\n            </label>\n            </div>\n        </div>\n\n        <div *ngIf=\"!settings.groupBy && !settings.lazyLoading && itemTempl == undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n            <ul class=\"lazyContainer\">\n                <li *ngFor=\"let item of data | listFilter:filter : settings.searchBy; let i = index;\" (click)=\"onItemClick(item,i,$event)\"\n                    class=\"pure-checkbox\" [ngClass]=\"{'selected-item': isSelected(item) == true }\">\n                    <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label>{{item[settings.labelKey]}}</label>\n                </li>\n            </ul>\n        </div>\n        <div *ngIf=\"!settings.groupBy && settings.lazyLoading && itemTempl == undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n            <virtual-scroll [items]=\"data\" (vsUpdate)=\"viewPortItems = $event\" (vsEnd)=\"onScrollEnd($event)\" [ngStyle]=\"{'height': settings.maxHeight+'px'}\">\n                <ul class=\"lazyContainer\">\n                    <li *ngFor=\"let item of viewPortItems | listFilter:filter : settings.searchBy; let i = index;\" (click)=\"onItemClick(item,i,$event)\"\n                        class=\"pure-checkbox\" [ngClass]=\"{'selected-item': isSelected(item) == true }\">\n                        <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                        />\n                        <label>{{item[settings.labelKey]}}</label>\n                    </li>\n                </ul>\n            </virtual-scroll>\n        </div>\n        <div *ngIf=\"!settings.groupBy && !settings.lazyLoading && itemTempl != undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n            <ul class=\"lazyContainer\">\n                <li *ngFor=\"let item of data | listFilter:filter : settings.searchBy; let i = index;\" (click)=\"onItemClick(item,i,$event)\"\n                    class=\"pure-checkbox\" [ngClass]=\"{'selected-item': isSelected(item) == true }\">\n                    <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label></label>\n                    <c-templateRenderer [data]=\"itemTempl\" [item]=\"item\"></c-templateRenderer>\n                </li>\n            </ul>\n        </div>\n        <div *ngIf=\"!settings.groupBy && settings.lazyLoading && itemTempl != undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n            <virtual-scroll [items]=\"data\" (vsUpdate)=\"viewPortItems = $event\" (vsEnd)=\"onScrollEnd($event)\" [ngStyle]=\"{'height': settings.maxHeight+'px'}\">\n\n                <ul class=\"lazyContainer\">\n                    <li *ngFor=\"let item of viewPortItems | listFilter:filter : settings.searchBy; let i = index;\" (click)=\"onItemClick(item,i,$event)\"\n                        class=\"pure-checkbox\" [ngClass]=\"{'selected-item': isSelected(item) == true }\">\n                        <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                        />\n                        <label></label>\n                        <c-templateRenderer [data]=\"itemTempl\" [item]=\"item\"></c-templateRenderer>\n                    </li>\n                </ul>\n            </virtual-scroll>\n        </div>\n        <div *ngIf=\"settings.groupBy && settings.lazyLoading && itemTempl != undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n            <virtual-scroll [items]=\"groupedData\" (vsUpdate)=\"viewPortItems = $event\" (vsEnd)=\"onScrollEnd($event)\" [ngStyle]=\"{'height': settings.maxHeight+'px'}\">\n            <ul class=\"lazyContainer\">\n                <span *ngFor=\"let item of viewPortItems | listFilter:filter : settings.searchBy; let i = index;\">\n                <li (click)=\"onItemClick(item,i,$event)\" *ngIf=\"!item.grpTitle\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle}\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label></label>\n                    <c-templateRenderer [data]=\"itemTempl\" [item]=\"item\"></c-templateRenderer>\n                </li>\n                <li *ngIf=\"item.grpTitle\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle}\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label></label>\n                    <c-templateRenderer [data]=\"itemTempl\" [item]=\"item\"></c-templateRenderer>\n                </li>\n                </span>\n            </ul>\n            </virtual-scroll>\n        </div>\n        <div *ngIf=\"settings.groupBy && !settings.lazyLoading && itemTempl != undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n            <ul class=\"lazyContainer\">\n                <span *ngFor=\"let item of groupedData | listFilter:filter : settings.searchBy; let i = index;\">\n                    <li (click)=\"onItemClick(item,i,$event)\" *ngIf=\"!item.grpTitle\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle}\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label></label>\n                    <c-templateRenderer [data]=\"itemTempl\" [item]=\"item\"></c-templateRenderer>\n                </li>\n                <li *ngIf=\"item.grpTitle\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle}\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label></label>\n                    <c-templateRenderer [data]=\"itemTempl\" [item]=\"item\"></c-templateRenderer>\n                </li>\n                </span>\n            </ul>\n        </div>\n        <div *ngIf=\"settings.groupBy && settings.lazyLoading && itemTempl == undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n            <virtual-scroll [items]=\"groupedData\" (vsUpdate)=\"viewPortItems = $event\" (vsEnd)=\"onScrollEnd($event)\" [ngStyle]=\"{'height': settings.maxHeight+'px'}\">\n                <ul class=\"lazyContainer\">\n                    <span *ngFor=\"let item of viewPortItems; let i = index;\">\n                <li  *ngIf=\"item.grpTitle\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle, 'selected-item': isSelected(item) == true }\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox && !item.grpTitle\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label>{{item[settings.labelKey]}}</label>\n                </li>\n                <li (click)=\"onItemClick(item,i,$event)\" *ngIf=\"!item.grpTitle\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle, 'selected-item': isSelected(item) == true }\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox && !item.grpTitle\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label>{{item[settings.labelKey]}}</label>\n                </li>\n                </span>\n                </ul>\n            </virtual-scroll>\n        </div>\n        <div *ngIf=\"settings.groupBy && !settings.lazyLoading && itemTempl == undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n            <ul class=\"lazyContainer\">\n                    <span *ngFor=\"let item of groupedData ; let i = index;\">\n                            <li (click)=\"selectGroup(item)\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle}\" class=\"pure-checkbox\">\n                                    <input  *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"item.selected\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                                    />\n                                    <label>{{item[settings.labelKey]}}</label>\n                                    <ul class=\"lazyContainer\">\n                                            <span *ngFor=\"let val of item.list ; let j = index;\">\n                                            <li (click)=\"onItemClick(val,j,$event); $event.stopPropagation()\" [ngClass]=\"{'grp-title': val.grpTitle,'grp-item': !val.grpTitle}\" class=\"pure-checkbox\">\n                                                    <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(val)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(val)\"\n                                                    />\n                                                    <label>{{val[settings.labelKey]}}</label>\n                                                </li>\n                                                </span>\n                                    </ul>\n                                </li>\n                    </span>\n                <!-- <span *ngFor=\"let item of groupedData ; let i = index;\">\n                    <li (click)=\"onItemClick(item,i,$event)\" *ngIf=\"!item.grpTitle\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle}\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox && !item.grpTitle\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label>{{item[settings.labelKey]}}</label>\n                </li>\n                <li *ngIf=\"item.grpTitle && !settings.selectGroup\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle}\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox && settings.selectGroup\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label>{{item[settings.labelKey]}}</label>\n                </li>\n                 <li  (click)=\"selectGroup(item)\" *ngIf=\"item.grpTitle && settings.selectGroup\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle}\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox && settings.selectGroup\" type=\"checkbox\" [checked]=\"item.selected\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label>{{item[settings.labelKey]}}</label>\n                </li>\n                </span> -->\n            </ul>\n        </div>\n        <h5 class=\"list-message\" *ngIf=\"data?.length == 0\">{{settings.noDataLabel}}</h5>\n    </div>\n</div>\n</div>",
                        host: { '[class]': 'defaultSettings.classes' },
                        providers: [DROPDOWN_CONTROL_VALUE_ACCESSOR, DROPDOWN_CONTROL_VALIDATION],
                        encapsulation: core.ViewEncapsulation.None,
                        styles: ["virtual-scroll{display:block;width:100%}.cuppa-dropdown{position:relative}.c-btn{display:inline-block;border-width:1px;line-height:1.25;border-radius:3px;font-size:14px;padding:5px 10px;cursor:pointer}.c-btn.disabled{background:#ccc}.selected-list .c-list{float:left;padding:0;margin:0;width:calc(100% - 20px)}.selected-list .c-list .c-token{list-style:none;padding:2px 25px 2px 8px;border-radius:2px;margin-right:4px;margin-top:2px;float:left;position:relative}.selected-list .c-list .c-token .c-label{display:block;float:left}.selected-list .c-list .c-token .c-remove{position:absolute;right:8px;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%);width:10px}.selected-list .c-list .c-token .c-remove svg{fill:#fff}.selected-list .fa-angle-down,.selected-list .fa-angle-up{font-size:15pt;position:absolute;right:10px;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%)}.selected-list .c-angle-down,.selected-list .c-angle-up{width:15px;height:15px;position:absolute;right:10px;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%);pointer-events:none}.selected-list .c-angle-down svg,.selected-list .c-angle-up svg{fill:#333}.selected-list .countplaceholder{position:absolute;right:30px;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%)}.selected-list .c-btn{width:100%;padding:10px;cursor:pointer;display:flex;position:relative}.selected-list .c-btn .c-icon{position:absolute;right:5px;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%)}.dropdown-list{position:absolute;padding-top:14px;width:100%;z-index:99999}.dropdown-list ul{padding:0;list-style:none;overflow:auto;margin:0}.dropdown-list ul li{padding:10px;cursor:pointer;text-align:left}.dropdown-list ul li:first-child{padding-top:10px}.dropdown-list ul li:last-child{padding-bottom:10px}.dropdown-list ::-webkit-scrollbar{width:8px}.dropdown-list ::-webkit-scrollbar-thumb{background:#ccc;border-radius:5px}.dropdown-list ::-webkit-scrollbar-track{background:#f2f2f2}.arrow-down,.arrow-up{width:0;height:0;border-left:13px solid transparent;border-right:13px solid transparent;border-bottom:15px solid #fff;margin-left:15px;position:absolute;top:0}.arrow-down{bottom:-14px;top:unset;-webkit-transform:rotate(180deg);transform:rotate(180deg)}.arrow-2{border-bottom:15px solid #ccc;top:-1px}.arrow-down.arrow-2{top:unset;bottom:-16px}.list-area{border:1px solid #ccc;border-radius:3px;background:#fff;margin:0}.select-all{padding:10px;border-bottom:1px solid #ccc;text-align:left}.list-filter{border-bottom:1px solid #ccc;position:relative;padding-left:35px;height:35px}.list-filter input{border:0;width:100%;height:100%;padding:0}.list-filter input:focus{outline:0}.list-filter .c-search{position:absolute;top:9px;left:10px;width:15px;height:15px}.list-filter .c-search svg{fill:#888}.list-filter .c-clear{position:absolute;top:10px;right:10px;width:15px;height:15px}.list-filter .c-clear svg{fill:#888}.pure-checkbox input[type=checkbox]{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.pure-checkbox input[type=checkbox]:focus+label:before,.pure-checkbox input[type=checkbox]:hover+label:before{background-color:#f2f2f2}.pure-checkbox input[type=checkbox]:active+label:before{transition-duration:0s}.pure-checkbox input[type=checkbox]+label{position:relative;padding-left:2em;vertical-align:middle;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer;margin:0;font-weight:300}.pure-checkbox input[type=checkbox]+label:before{box-sizing:content-box;content:'';position:absolute;top:50%;left:0;width:14px;height:14px;margin-top:-9px;text-align:center;transition:.4s}.pure-checkbox input[type=checkbox]+label:after{box-sizing:content-box;content:'';position:absolute;-webkit-transform:scale(0);transform:scale(0);-webkit-transform-origin:50%;transform-origin:50%;transition:transform .2s ease-out,-webkit-transform .2s ease-out;background-color:transparent;top:50%;left:4px;width:8px;height:3px;margin-top:-4px;border-style:solid;border-color:#fff;border-width:0 0 3px 3px;-o-border-image:none;border-image:none;-webkit-transform:rotate(-45deg) scale(0);transform:rotate(-45deg) scale(0)}.pure-checkbox input[type=checkbox]:disabled+label:before{border-color:#ccc}.pure-checkbox input[type=checkbox]:disabled:focus+label:before .pure-checkbox input[type=checkbox]:disabled:hover+label:before{background-color:inherit}.pure-checkbox input[type=checkbox]:disabled:checked+label:before{background-color:#ccc}.pure-checkbox input[type=radio]:checked+label:before{background-color:#fff}.pure-checkbox input[type=radio]:checked+label:after{-webkit-transform:scale(1);transform:scale(1)}.pure-checkbox input[type=radio]+label:before{border-radius:50%}.pure-checkbox input[type=checkbox]:checked+label:after{content:'';transition:transform .2s ease-out,-webkit-transform .2s ease-out;-webkit-transform:rotate(-45deg) scale(1);transform:rotate(-45deg) scale(1)}.list-message{text-align:center;margin:0;padding:15px 0;font-size:initial}.list-grp{padding:0 15px!important}.list-grp h4{text-transform:capitalize;margin:15px 0 0;font-size:14px;font-weight:700}.list-grp>li{padding-left:15px!important}.grp-item{padding-left:30px!important}.grp-title{padding-bottom:0!important}.grp-title label{margin-bottom:0!important;font-weight:800;text-transform:capitalize}.grp-title:hover{background:0 0!important}.loading-icon{width:20px;float:right}.nodata-label{width:100%;text-align:center;padding:10px 0 0}.btn-container{text-align:center;padding:0 5px 10px}"]
                    }] }
        ];
        /** @nocollapse */
        AngularMultiSelect.ctorParameters = function () {
            return [
                { type: core.ElementRef },
                { type: core.ChangeDetectorRef },
                { type: DataService }
            ];
        };
        AngularMultiSelect.propDecorators = {
            data: [{ type: core.Input }],
            settings: [{ type: core.Input }],
            loading: [{ type: core.Input }],
            onSelect: [{ type: core.Output, args: ['onSelect',] }],
            onDeSelect: [{ type: core.Output, args: ['onDeSelect',] }],
            onSelectAll: [{ type: core.Output, args: ['onSelectAll',] }],
            onDeSelectAll: [{ type: core.Output, args: ['onDeSelectAll',] }],
            onOpen: [{ type: core.Output, args: ['onOpen',] }],
            onClose: [{ type: core.Output, args: ['onClose',] }],
            onScrollToEnd: [{ type: core.Output, args: ['onScrollToEnd',] }],
            onFilterSelectAll: [{ type: core.Output, args: ['onFilterSelectAll',] }],
            onFilterDeSelectAll: [{ type: core.Output, args: ['onFilterDeSelectAll',] }],
            onAddFilterNewItem: [{ type: core.Output, args: ['onAddFilterNewItem',] }],
            itemTempl: [{ type: core.ContentChild, args: [Item,] }],
            badgeTempl: [{ type: core.ContentChild, args: [Badge,] }],
            searchTempl: [{ type: core.ContentChild, args: [Search,] }],
            searchInput: [{ type: core.ViewChild, args: ['searchInput',] }],
            selectedListElem: [{ type: core.ViewChild, args: ['selectedList',] }],
            dropdownListElem: [{ type: core.ViewChild, args: ['dropdownList',] }],
            onEscapeDown: [{ type: core.HostListener, args: ['document:keyup.escape', ['$event'],] }]
        };
        return AngularMultiSelect;
    }());
    var AngularMultiSelectModule = /** @class */ (function () {
        function AngularMultiSelectModule() {
        }
        AngularMultiSelectModule.decorators = [
            { type: core.NgModule, args: [{
                        imports: [common.CommonModule, forms.FormsModule],
                        declarations: [AngularMultiSelect, ClickOutsideDirective, ScrollDirective, styleDirective, ListFilterPipe, Item, TemplateRenderer, Badge, Search, setPosition, VirtualScrollComponent, CIcon],
                        exports: [AngularMultiSelect, ClickOutsideDirective, ScrollDirective, styleDirective, ListFilterPipe, Item, TemplateRenderer, Badge, Search, setPosition, VirtualScrollComponent, CIcon],
                        providers: [DataService]
                    },] }
        ];
        return AngularMultiSelectModule;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
     */

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
     */

    exports.AngularMultiSelect = AngularMultiSelect;
    exports.ClickOutsideDirective = ClickOutsideDirective;
    exports.ListFilterPipe = ListFilterPipe;
    exports.Item = Item;
    exports.TemplateRenderer = TemplateRenderer;
    exports.AngularMultiSelectModule = AngularMultiSelectModule;
    exports.ɵc = ScrollDirective;
    exports.ɵe = setPosition;
    exports.ɵd = styleDirective;
    exports.ɵf = Badge;
    exports.ɵh = CIcon;
    exports.ɵg = Search;
    exports.ɵb = DROPDOWN_CONTROL_VALIDATION;
    exports.ɵa = DROPDOWN_CONTROL_VALUE_ACCESSOR;
    exports.ɵi = DataService;
    exports.ɵj = VirtualScrollComponent;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhcjItbXVsdGlzZWxlY3QtZHJvcGRvd24udW1kLmpzLm1hcCIsInNvdXJjZXMiOlsibmc6Ly9hbmd1bGFyMi1tdWx0aXNlbGVjdC1kcm9wZG93bi9saWIvbXVsdGlzZWxlY3QubW9kZWwudHMiLCJuZzovL2FuZ3VsYXIyLW11bHRpc2VsZWN0LWRyb3Bkb3duL2xpYi9jbGlja091dHNpZGUudHMiLCJuZzovL2FuZ3VsYXIyLW11bHRpc2VsZWN0LWRyb3Bkb3duL2xpYi9tdWx0aXNlbGVjdC5zZXJ2aWNlLnRzIiwibmc6Ly9hbmd1bGFyMi1tdWx0aXNlbGVjdC1kcm9wZG93bi9saWIvbGlzdC1maWx0ZXIudHMiLCJuZzovL2FuZ3VsYXIyLW11bHRpc2VsZWN0LWRyb3Bkb3duL2xpYi9tZW51LWl0ZW0udHMiLCJuZzovL2FuZ3VsYXIyLW11bHRpc2VsZWN0LWRyb3Bkb3duL2xpYi92aXJ0dWFsLXNjcm9sbC50cyIsIm5nOi8vYW5ndWxhcjItbXVsdGlzZWxlY3QtZHJvcGRvd24vbGliL211bHRpc2VsZWN0LmNvbXBvbmVudC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgTXlFeGNlcHRpb24ge1xuXHRzdGF0dXMgOiBudW1iZXI7XG5cdGJvZHkgOiBhbnk7XG5cdGNvbnN0cnVjdG9yKHN0YXR1cyA6IG51bWJlciwgYm9keSA6IGFueSkge1xuXHRcdHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuXHRcdHRoaXMuYm9keSA9IGJvZHk7XG5cdH1cblx0XG59IiwiaW1wb3J0IHsgRGlyZWN0aXZlLCBFbGVtZW50UmVmLCBPdXRwdXQsIEV2ZW50RW1pdHRlciwgSG9zdExpc3RlbmVyLCBJbnB1dCwgT25Jbml0LCBPbkNoYW5nZXMgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbY2xpY2tPdXRzaWRlXSdcbn0pXG5leHBvcnQgY2xhc3MgQ2xpY2tPdXRzaWRlRGlyZWN0aXZlIHtcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmKSB7XG4gICAgfVxuXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIGNsaWNrT3V0c2lkZSA9IG5ldyBFdmVudEVtaXR0ZXI8TW91c2VFdmVudD4oKTtcblxuICAgIEBIb3N0TGlzdGVuZXIoJ2RvY3VtZW50OmNsaWNrJywgWyckZXZlbnQnLCAnJGV2ZW50LnRhcmdldCddKVxuICAgIEBIb3N0TGlzdGVuZXIoJ2RvY3VtZW50OnRvdWNoc3RhcnQnLCBbJyRldmVudCcsICckZXZlbnQudGFyZ2V0J10pXG4gICAgcHVibGljIG9uQ2xpY2soZXZlbnQ6IE1vdXNlRXZlbnQsIHRhcmdldEVsZW1lbnQ6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgICAgIGlmICghdGFyZ2V0RWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2xpY2tlZEluc2lkZSA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5jb250YWlucyh0YXJnZXRFbGVtZW50KTtcbiAgICAgICAgaWYgKCFjbGlja2VkSW5zaWRlKSB7XG4gICAgICAgICAgICB0aGlzLmNsaWNrT3V0c2lkZS5lbWl0KGV2ZW50KTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbc2Nyb2xsXSdcbn0pXG5leHBvcnQgY2xhc3MgU2Nyb2xsRGlyZWN0aXZlIHtcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmKSB7XG4gICAgfVxuXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIHNjcm9sbCA9IG5ldyBFdmVudEVtaXR0ZXI8TW91c2VFdmVudD4oKTtcblxuICAgIEBIb3N0TGlzdGVuZXIoJ3Njcm9sbCcsIFsnJGV2ZW50J10pXG4gICAgcHVibGljIG9uQ2xpY2soZXZlbnQ6IE1vdXNlRXZlbnQsIHRhcmdldEVsZW1lbnQ6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgICAgIHRoaXMuc2Nyb2xsLmVtaXQoZXZlbnQpO1xuICAgIH1cbn1cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW3N0eWxlUHJvcF0nXG59KVxuZXhwb3J0IGNsYXNzIHN0eWxlRGlyZWN0aXZlIHtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgZWw6IEVsZW1lbnRSZWYpIHtcblxuICAgIH1cblxuICAgIEBJbnB1dCgnc3R5bGVQcm9wJykgc3R5bGVWYWw6IG51bWJlcjtcblxuICAgIG5nT25Jbml0KCkge1xuXG4gICAgICAgIHRoaXMuZWwubmF0aXZlRWxlbWVudC5zdHlsZS50b3AgPSB0aGlzLnN0eWxlVmFsO1xuICAgIH1cbiAgICBuZ09uQ2hhbmdlcygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5lbC5uYXRpdmVFbGVtZW50LnN0eWxlLnRvcCA9IHRoaXMuc3R5bGVWYWw7XG4gICAgfVxufVxuXG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW3NldFBvc2l0aW9uXSdcbn0pXG5leHBvcnQgY2xhc3Mgc2V0UG9zaXRpb24gaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcyB7XG5cbiAgICBASW5wdXQoJ3NldFBvc2l0aW9uJykgaGVpZ2h0OiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZWw6IEVsZW1lbnRSZWYpIHtcblxuICAgIH1cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgaWYgKHRoaXMuaGVpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQuc3R5bGUuYm90dG9tID0gcGFyc2VJbnQodGhpcy5oZWlnaHQgKyAxNSArIFwiXCIpICsgJ3B4JztcbiAgICAgICAgfVxuICAgIH1cbiAgICBuZ09uQ2hhbmdlcygpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuaGVpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQuc3R5bGUuYm90dG9tID0gcGFyc2VJbnQodGhpcy5oZWlnaHQgKyAxNSArIFwiXCIpICsgJ3B4JztcbiAgICAgICAgfVxuICAgIH1cbn0iLCJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIERhdGFTZXJ2aWNlIHtcblxuICBmaWx0ZXJlZERhdGE6IGFueSA9IFtdO1xuICBwcml2YXRlIHN1YmplY3QgPSBuZXcgU3ViamVjdDxhbnk+KCk7XG5cbiAgc2V0RGF0YShkYXRhOiBhbnkpIHtcblxuICAgIHRoaXMuZmlsdGVyZWREYXRhID0gZGF0YTtcbiAgICB0aGlzLnN1YmplY3QubmV4dChkYXRhKTtcbiAgfVxuICBnZXREYXRhKCk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMuc3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgfVxuICBnZXRGaWx0ZXJlZERhdGEoKSB7XG4gICAgaWYgKHRoaXMuZmlsdGVyZWREYXRhICYmIHRoaXMuZmlsdGVyZWREYXRhLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB0aGlzLmZpbHRlcmVkRGF0YTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICB9XG5cbn0iLCJpbXBvcnQgeyBQaXBlLCBQaXBlVHJhbnNmb3JtIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBEYXRhU2VydmljZSB9IGZyb20gJy4vbXVsdGlzZWxlY3Quc2VydmljZSc7XG5cblxuQFBpcGUoe1xuICAgIG5hbWU6ICdsaXN0RmlsdGVyJyxcbiAgICBwdXJlOiB0cnVlXG59KVxuZXhwb3J0IGNsYXNzIExpc3RGaWx0ZXJQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG5cbiAgICBwdWJsaWMgZmlsdGVyZWRMaXN0OiBhbnkgPSBbXTtcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGRzOiBEYXRhU2VydmljZSkge1xuXG4gICAgfVxuXG4gICAgdHJhbnNmb3JtKGl0ZW1zOiBhbnlbXSwgZmlsdGVyOiBhbnksIHNlYXJjaEJ5OiBhbnkpOiBhbnlbXSB7XG4gICAgICAgIGlmICghaXRlbXMgfHwgIWZpbHRlcikge1xuICAgICAgICAgICAgdGhpcy5kcy5zZXREYXRhKGl0ZW1zKTtcbiAgICAgICAgICAgIHJldHVybiBpdGVtcztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZpbHRlcmVkTGlzdCA9IGl0ZW1zLmZpbHRlcigoaXRlbTogYW55KSA9PiB0aGlzLmFwcGx5RmlsdGVyKGl0ZW0sIGZpbHRlciwgc2VhcmNoQnkpKTtcbiAgICAgICAgdGhpcy5kcy5zZXREYXRhKHRoaXMuZmlsdGVyZWRMaXN0KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsdGVyZWRMaXN0O1xuICAgIH1cbiAgICBhcHBseUZpbHRlcihpdGVtOiBhbnksIGZpbHRlcjogYW55LCBzZWFyY2hCeTogYW55KTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBmb3VuZCA9IGZhbHNlO1xuICAgICAgICBpZiAoc2VhcmNoQnkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgaWYgKGl0ZW0uZ3JwVGl0bGUpIHtcbiAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB0ID0gMDsgdCA8IHNlYXJjaEJ5Lmxlbmd0aDsgdCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWx0ZXIgJiYgaXRlbVtzZWFyY2hCeVt0XV0gJiYgaXRlbVtzZWFyY2hCeVt0XV0gIT0gXCJcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW1bc2VhcmNoQnlbdF1dLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKS5pbmRleE9mKGZpbHRlci50b0xvd2VyQ2FzZSgpKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoaXRlbS5ncnBUaXRsZSkge1xuICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHByb3AgaW4gaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsdGVyICYmIGl0ZW1bcHJvcF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtW3Byb3BdLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKS5pbmRleE9mKGZpbHRlci50b0xvd2VyQ2FzZSgpKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZvdW5kO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBDb21wb25lbnQsIE9uSW5pdCwgT25EZXN0cm95LCBOZ01vZHVsZSwgVGVtcGxhdGVSZWYsIEFmdGVyQ29udGVudEluaXQsIENvbnRlbnRDaGlsZCwgRW1iZWRkZWRWaWV3UmVmLCBPbkNoYW5nZXMsIFZpZXdDb250YWluZXJSZWYsIFZpZXdFbmNhcHN1bGF0aW9uLCBJbnB1dCwgT3V0cHV0LCBFdmVudEVtaXR0ZXIsIEVsZW1lbnRSZWYsIEFmdGVyVmlld0luaXQsIFBpcGUsIFBpcGVUcmFuc2Zvcm0sIERpcmVjdGl2ZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgU2FmZVJlc291cmNlVXJsLCBEb21TYW5pdGl6ZXIgfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyJztcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9ICAgICAgIGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2MtaXRlbScsXG4gIHRlbXBsYXRlOiBgYFxufSlcblxuZXhwb3J0IGNsYXNzIEl0ZW0geyBcblxuICAgIEBDb250ZW50Q2hpbGQoVGVtcGxhdGVSZWYpIHRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+XG4gICAgY29uc3RydWN0b3IoKSB7ICAgXG4gICAgfVxuXG59XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2MtYmFkZ2UnLFxuICB0ZW1wbGF0ZTogYGBcbn0pXG5cbmV4cG9ydCBjbGFzcyBCYWRnZSB7IFxuXG4gICAgQENvbnRlbnRDaGlsZChUZW1wbGF0ZVJlZikgdGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT5cbiAgICBjb25zdHJ1Y3RvcigpIHsgICBcbiAgICB9XG5cbn1cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnYy1zZWFyY2gnLFxuICB0ZW1wbGF0ZTogYGBcbn0pXG5cbmV4cG9ydCBjbGFzcyBTZWFyY2ggeyBcblxuICAgIEBDb250ZW50Q2hpbGQoVGVtcGxhdGVSZWYpIHRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+XG4gICAgY29uc3RydWN0b3IoKSB7ICAgXG4gICAgfVxuXG59XG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdjLXRlbXBsYXRlUmVuZGVyZXInLFxuICB0ZW1wbGF0ZTogYGBcbn0pXG5cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZVJlbmRlcmVyIGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kgeyBcblxuICAgIEBJbnB1dCgpIGRhdGE6IGFueVxuICAgIEBJbnB1dCgpIGl0ZW06IGFueVxuICAgIHZpZXc6IEVtYmVkZGVkVmlld1JlZjxhbnk+O1xuXG4gICAgY29uc3RydWN0b3IocHVibGljIHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWYpIHsgICBcbiAgICB9XG4gICAgbmdPbkluaXQoKSB7XG4gICAgICAgIHRoaXMudmlldyA9IHRoaXMudmlld0NvbnRhaW5lci5jcmVhdGVFbWJlZGRlZFZpZXcodGhpcy5kYXRhLnRlbXBsYXRlLCB7XG4gICAgICAgICAgICAnXFwkaW1wbGljaXQnOiB0aGlzLmRhdGEsXG4gICAgICAgICAgICAnaXRlbSc6dGhpcy5pdGVtXG4gICAgICAgIH0pO1xuICAgIH1cblx0XG4gICAgbmdPbkRlc3Ryb3koKSB7XG5cdFx0dGhpcy52aWV3LmRlc3Ryb3koKTtcblx0fVxuXG59XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2MtaWNvbicsXG4gIHRlbXBsYXRlOiBgPHN2ZyAqbmdJZj1cIm5hbWUgPT0gJ3JlbW92ZSdcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgdmVyc2lvbj1cIjEuMVwiIGlkPVwiQ2FwYV8xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiIHg9XCIwcHhcIiB5PVwiMHB4XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdCb3g9XCIwIDAgNDcuOTcxIDQ3Ljk3MVwiIHN0eWxlPVwiZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0Ny45NzEgNDcuOTcxO1wiIHhtbDpzcGFjZT1cInByZXNlcnZlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Zz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTI4LjIyOCwyMy45ODZMNDcuMDkyLDUuMTIyYzEuMTcyLTEuMTcxLDEuMTcyLTMuMDcxLDAtNC4yNDJjLTEuMTcyLTEuMTcyLTMuMDctMS4xNzItNC4yNDIsMEwyMy45ODYsMTkuNzQ0TDUuMTIxLDAuODhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYy0xLjE3Mi0xLjE3Mi0zLjA3LTEuMTcyLTQuMjQyLDBjLTEuMTcyLDEuMTcxLTEuMTcyLDMuMDcxLDAsNC4yNDJsMTguODY1LDE4Ljg2NEwwLjg3OSw0Mi44NWMtMS4xNzIsMS4xNzEtMS4xNzIsMy4wNzEsMCw0LjI0MlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDMS40NjUsNDcuNjc3LDIuMjMzLDQ3Ljk3LDMsNDcuOTdzMS41MzUtMC4yOTMsMi4xMjEtMC44NzlsMTguODY1LTE4Ljg2NEw0Mi44NSw0Ny4wOTFjMC41ODYsMC41ODYsMS4zNTQsMC44NzksMi4xMjEsMC44NzlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgczEuNTM1LTAuMjkzLDIuMTIxLTAuODc5YzEuMTcyLTEuMTcxLDEuMTcyLTMuMDcxLDAtNC4yNDJMMjguMjI4LDIzLjk4NnpcIi8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2c+XG4gICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgPHN2ZyAqbmdJZj1cIm5hbWUgPT0gJ2FuZ2xlLWRvd24nXCIgdmVyc2lvbj1cIjEuMVwiIGlkPVwiQ2FwYV8xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiIHg9XCIwcHhcIiB5PVwiMHB4XCJcblx0IHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIiB2aWV3Qm94PVwiMCAwIDYxMiA2MTJcIiBzdHlsZT1cImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNjEyIDYxMjtcIiB4bWw6c3BhY2U9XCJwcmVzZXJ2ZVwiPlxuPGc+XG5cdDxnIGlkPVwiX3gzMV8wXzM0X1wiPlxuXHRcdDxnPlxuXHRcdFx0PHBhdGggZD1cIk02MDQuNTAxLDEzNC43ODJjLTkuOTk5LTEwLjA1LTI2LjIyMi0xMC4wNS0zNi4yMjEsMEwzMDYuMDE0LDQyMi41NThMNDMuNzIxLDEzNC43ODJcblx0XHRcdFx0Yy05Ljk5OS0xMC4wNS0yNi4yMjMtMTAuMDUtMzYuMjIyLDBzLTkuOTk5LDI2LjM1LDAsMzYuMzk5bDI3OS4xMDMsMzA2LjI0MWM1LjMzMSw1LjM1NywxMi40MjIsNy42NTIsMTkuMzg2LDcuMjk2XG5cdFx0XHRcdGM2Ljk4OCwwLjM1NiwxNC4wNTUtMS45MzksMTkuMzg2LTcuMjk2bDI3OS4xMjgtMzA2LjI2OEM2MTQuNSwxNjEuMTA2LDYxNC41LDE0NC44MzIsNjA0LjUwMSwxMzQuNzgyelwiLz5cblx0XHQ8L2c+XG5cdDwvZz5cbjwvZz5cbjwvc3ZnPlxuPHN2ZyAqbmdJZj1cIm5hbWUgPT0gJ2FuZ2xlLXVwJ1wiIHZlcnNpb249XCIxLjFcIiBpZD1cIkNhcGFfMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiB4PVwiMHB4XCIgeT1cIjBweFwiXG5cdCB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgdmlld0JveD1cIjAgMCA2MTIgNjEyXCIgc3R5bGU9XCJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDYxMiA2MTI7XCIgeG1sOnNwYWNlPVwicHJlc2VydmVcIj5cbjxnPlxuXHQ8ZyBpZD1cIl94MzlfXzMwX1wiPlxuXHRcdDxnPlxuXHRcdFx0PHBhdGggZD1cIk02MDQuNTAxLDQ0MC41MDlMMzI1LjM5OCwxMzQuOTU2Yy01LjMzMS01LjM1Ny0xMi40MjMtNy42MjctMTkuMzg2LTcuMjdjLTYuOTg5LTAuMzU3LTE0LjA1NiwxLjkxMy0xOS4zODcsNy4yN1xuXHRcdFx0XHRMNy40OTksNDQwLjUwOWMtOS45OTksMTAuMDI0LTkuOTk5LDI2LjI5OCwwLDM2LjMyM3MyNi4yMjMsMTAuMDI0LDM2LjIyMiwwbDI2Mi4yOTMtMjg3LjE2NEw1NjguMjgsNDc2LjgzMlxuXHRcdFx0XHRjOS45OTksMTAuMDI0LDI2LjIyMiwxMC4wMjQsMzYuMjIxLDBDNjE0LjUsNDY2LjgwOSw2MTQuNSw0NTAuNTM0LDYwNC41MDEsNDQwLjUwOXpcIi8+XG5cdFx0PC9nPlxuXHQ8L2c+XG48L2c+XG5cbjwvc3ZnPlxuPHN2ZyAqbmdJZj1cIm5hbWUgPT0gJ3NlYXJjaCdcIiB2ZXJzaW9uPVwiMS4xXCIgaWQ9XCJDYXBhXzFcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgeG1sbnM6eGxpbms9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIgeD1cIjBweFwiIHk9XCIwcHhcIlxuXHQgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiIHZpZXdCb3g9XCIwIDAgNjE1LjUyIDYxNS41MlwiIHN0eWxlPVwiZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA2MTUuNTIgNjE1LjUyO1wiXG5cdCB4bWw6c3BhY2U9XCJwcmVzZXJ2ZVwiPlxuPGc+XG5cdDxnPlxuXHRcdDxnIGlkPVwiU2VhcmNoX194MjhfYW5kX3Rob3Vfc2hhbGxfZmluZF94MjlfXCI+XG5cdFx0XHQ8Zz5cblx0XHRcdFx0PHBhdGggZD1cIk02MDIuNTMxLDU0OS43MzZsLTE4NC4zMS0xODUuMzY4YzI2LjY3OS0zNy43Miw0Mi41MjgtODMuNzI5LDQyLjUyOC0xMzMuNTQ4QzQ2MC43NSwxMDMuMzUsMzU3Ljk5NywwLDIzMS4yNTgsMFxuXHRcdFx0XHRcdEMxMDQuNTE4LDAsMS43NjUsMTAzLjM1LDEuNzY1LDIzMC44MmMwLDEyNy40NywxMDIuNzUzLDIzMC44MiwyMjkuNDkzLDIzMC44MmM0OS41MywwLDk1LjI3MS0xNS45NDQsMTMyLjc4LTQyLjc3N1xuXHRcdFx0XHRcdGwxODQuMzEsMTg1LjM2NmM3LjQ4Miw3LjUyMSwxNy4yOTIsMTEuMjkxLDI3LjEwMiwxMS4yOTFjOS44MTIsMCwxOS42Mi0zLjc3LDI3LjA4My0xMS4yOTFcblx0XHRcdFx0XHRDNjE3LjQ5Niw1ODkuMTg4LDYxNy40OTYsNTY0Ljc3Nyw2MDIuNTMxLDU0OS43MzZ6IE0zNTUuOSwzMTkuNzYzbC0xNS4wNDIsMjEuMjczTDMxOS43LDM1Ni4xNzRcblx0XHRcdFx0XHRjLTI2LjA4MywxOC42NTgtNTYuNjY3LDI4LjUyNi04OC40NDIsMjguNTI2Yy04NC4zNjUsMC0xNTIuOTk1LTY5LjAzNS0xNTIuOTk1LTE1My44OGMwLTg0Ljg0Niw2OC42My0xNTMuODgsMTUyLjk5NS0xNTMuODhcblx0XHRcdFx0XHRzMTUyLjk5Niw2OS4wMzQsMTUyLjk5NiwxNTMuODhDMzg0LjI3MSwyNjIuNzY5LDM3NC40NjIsMjkzLjUyNiwzNTUuOSwzMTkuNzYzelwiLz5cblx0XHRcdDwvZz5cblx0XHQ8L2c+XG5cdDwvZz5cbjwvZz5cblxuPC9zdmc+XG48c3ZnICpuZ0lmPVwibmFtZSA9PSAnY2xlYXInXCIgdmVyc2lvbj1cIjEuMVwiIGlkPVwiQ2FwYV8xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiIHg9XCIwcHhcIiB5PVwiMHB4XCJcblx0IHZpZXdCb3g9XCIwIDAgNTEuOTc2IDUxLjk3NlwiIHN0eWxlPVwiZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MS45NzYgNTEuOTc2O1wiIHhtbDpzcGFjZT1cInByZXNlcnZlXCI+XG48Zz5cblx0PHBhdGggZD1cIk00NC4zNzMsNy42MDNjLTEwLjEzNy0xMC4xMzctMjYuNjMyLTEwLjEzOC0zNi43NywwYy0xMC4xMzgsMTAuMTM4LTEwLjEzNywyNi42MzIsMCwzNi43N3MyNi42MzIsMTAuMTM4LDM2Ljc3LDBcblx0XHRDNTQuNTEsMzQuMjM1LDU0LjUxLDE3Ljc0LDQ0LjM3Myw3LjYwM3ogTTM2LjI0MSwzNi4yNDFjLTAuNzgxLDAuNzgxLTIuMDQ3LDAuNzgxLTIuODI4LDBsLTcuNDI1LTcuNDI1bC03Ljc3OCw3Ljc3OFxuXHRcdGMtMC43ODEsMC43ODEtMi4wNDcsMC43ODEtMi44MjgsMGMtMC43ODEtMC43ODEtMC43ODEtMi4wNDcsMC0yLjgyOGw3Ljc3OC03Ljc3OGwtNy40MjUtNy40MjVjLTAuNzgxLTAuNzgxLTAuNzgxLTIuMDQ4LDAtMi44Mjhcblx0XHRjMC43ODEtMC43ODEsMi4wNDctMC43ODEsMi44MjgsMGw3LjQyNSw3LjQyNWw3LjA3MS03LjA3MWMwLjc4MS0wLjc4MSwyLjA0Ny0wLjc4MSwyLjgyOCwwYzAuNzgxLDAuNzgxLDAuNzgxLDIuMDQ3LDAsMi44Mjhcblx0XHRsLTcuMDcxLDcuMDcxbDcuNDI1LDcuNDI1QzM3LjAyMiwzNC4xOTQsMzcuMDIyLDM1LjQ2LDM2LjI0MSwzNi4yNDF6XCIvPlxuPC9nPlxuPC9zdmc+YCxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcblxufSlcblxuZXhwb3J0IGNsYXNzIENJY29uIHsgXG5cbiAgICBASW5wdXQoKSBuYW1lOmFueTtcblxufSIsImltcG9ydCB7XG5cdENvbXBvbmVudCxcblx0Q29udGVudENoaWxkLFxuXHRFbGVtZW50UmVmLFxuXHRFdmVudEVtaXR0ZXIsXG5cdElucHV0LFxuXHROZ01vZHVsZSxcblx0Tmdab25lLFxuXHRPbkNoYW5nZXMsXG5cdE9uRGVzdHJveSxcblx0T25Jbml0LFxuXHRPdXRwdXQsXG5cdFJlbmRlcmVyMixcblx0Vmlld0NoaWxkLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcblxuXG5leHBvcnQgaW50ZXJmYWNlIENoYW5nZUV2ZW50IHtcblx0c3RhcnQ/OiBudW1iZXI7XG5cdGVuZD86IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBXcmFwR3JvdXBEaW1lbnNpb25zIHtcblx0bnVtYmVyT2ZLbm93bldyYXBHcm91cENoaWxkU2l6ZXM6IG51bWJlcjtcblx0c3VtT2ZLbm93bldyYXBHcm91cENoaWxkV2lkdGhzOiBudW1iZXI7XG5cdHN1bU9mS25vd25XcmFwR3JvdXBDaGlsZEhlaWdodHM6IG51bWJlcjtcblx0bWF4Q2hpbGRTaXplUGVyV3JhcEdyb3VwOiBXcmFwR3JvdXBEaW1lbnNpb25bXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBXcmFwR3JvdXBEaW1lbnNpb24ge1xuXHRjaGlsZFdpZHRoOiBudW1iZXI7XG5cdGNoaWxkSGVpZ2h0OiBudW1iZXI7XG5cdGl0ZW1zOiBhbnlbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJRGltZW5zaW9ucyB7XG5cdGl0ZW1Db3VudDogbnVtYmVyO1xuXHRpdGVtc1BlcldyYXBHcm91cDogbnVtYmVyO1xuXHR3cmFwR3JvdXBzUGVyUGFnZTogbnVtYmVyO1xuXHRpdGVtc1BlclBhZ2U6IG51bWJlcjtcblx0cGFnZUNvdW50X2ZyYWN0aW9uYWw6IG51bWJlcjtcblx0Y2hpbGRXaWR0aDogbnVtYmVyO1xuXHRjaGlsZEhlaWdodDogbnVtYmVyO1xuXHRzY3JvbGxMZW5ndGg6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJUGFnZUluZm8ge1xuXHRzdGFydEluZGV4OiBudW1iZXI7XG5cdGVuZEluZGV4OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVBhZ2VJbmZvV2l0aEJ1ZmZlciBleHRlbmRzIElQYWdlSW5mbyB7XG5cdHN0YXJ0SW5kZXhXaXRoQnVmZmVyOiBudW1iZXI7XG5cdGVuZEluZGV4V2l0aEJ1ZmZlcjogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElWaWV3cG9ydCBleHRlbmRzIElQYWdlSW5mb1dpdGhCdWZmZXIge1xuXHRwYWRkaW5nOiBudW1iZXI7XG5cdHNjcm9sbExlbmd0aDogbnVtYmVyO1xufVxuXG5AQ29tcG9uZW50KHtcblx0c2VsZWN0b3I6ICd2aXJ0dWFsLXNjcm9sbCxbdmlydHVhbFNjcm9sbF0nLFxuXHRleHBvcnRBczogJ3ZpcnR1YWxTY3JvbGwnLFxuXHR0ZW1wbGF0ZTogYFxuICAgIDxkaXYgY2xhc3M9XCJ0b3RhbC1wYWRkaW5nXCIgI2ludmlzaWJsZVBhZGRpbmc+PC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInNjcm9sbGFibGUtY29udGVudFwiICNjb250ZW50PlxuICAgICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxuICAgIDwvZGl2PlxuICBgLFxuXHRob3N0OiB7XG5cdFx0J1tjbGFzcy5ob3Jpem9udGFsXSc6IFwiaG9yaXpvbnRhbFwiLFxuXHRcdCdbY2xhc3MudmVydGljYWxdJzogXCIhaG9yaXpvbnRhbFwiLFxuXHRcdCdbY2xhc3Muc2VsZlNjcm9sbF0nOiBcIiFwYXJlbnRTY3JvbGxcIlxuXHR9LFxuXHRzdHlsZXM6IFtgXG4gICAgOmhvc3Qge1xuICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuXHQgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgLXdlYmtpdC1vdmVyZmxvdy1zY3JvbGxpbmc6IHRvdWNoO1xuICAgIH1cblx0XG5cdDpob3N0Lmhvcml6b250YWwuc2VsZlNjcm9sbCB7XG4gICAgICBvdmVyZmxvdy15OiB2aXNpYmxlO1xuICAgICAgb3ZlcmZsb3cteDogYXV0bztcblx0fVxuXHQ6aG9zdC52ZXJ0aWNhbC5zZWxmU2Nyb2xsIHtcbiAgICAgIG92ZXJmbG93LXk6IGF1dG87XG4gICAgICBvdmVyZmxvdy14OiB2aXNpYmxlO1xuXHR9XG5cdFxuICAgIC5zY3JvbGxhYmxlLWNvbnRlbnQge1xuICAgICAgdG9wOiAwO1xuICAgICAgbGVmdDogMDtcbiAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgaGVpZ2h0OiAxMDAlO1xuICAgICAgbWF4LXdpZHRoOiAxMDB2dztcbiAgICAgIG1heC1oZWlnaHQ6IDEwMHZoO1xuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIH1cblxuXHQuc2Nyb2xsYWJsZS1jb250ZW50IDo6bmctZGVlcCA+ICoge1xuXHRcdGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG5cdH1cblx0XG5cdDpob3N0Lmhvcml6b250YWwge1xuXHRcdHdoaXRlLXNwYWNlOiBub3dyYXA7XG5cdH1cblx0XG5cdDpob3N0Lmhvcml6b250YWwgLnNjcm9sbGFibGUtY29udGVudCB7XG5cdFx0ZGlzcGxheTogZmxleDtcblx0fVxuXHRcblx0Omhvc3QuaG9yaXpvbnRhbCAuc2Nyb2xsYWJsZS1jb250ZW50IDo6bmctZGVlcCA+ICoge1xuXHRcdGZsZXgtc2hyaW5rOiAwO1xuXHRcdGZsZXgtZ3JvdzogMDtcblx0XHR3aGl0ZS1zcGFjZTogaW5pdGlhbDtcblx0fVxuXHRcbiAgICAudG90YWwtcGFkZGluZyB7XG4gICAgICB3aWR0aDogMXB4O1xuICAgICAgb3BhY2l0eTogMDtcbiAgICB9XG4gICAgXG4gICAgOmhvc3QuaG9yaXpvbnRhbCAudG90YWwtcGFkZGluZyB7XG4gICAgICBoZWlnaHQ6IDEwMCU7XG4gICAgfVxuICBgXVxufSlcbmV4cG9ydCBjbGFzcyBWaXJ0dWFsU2Nyb2xsQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkNoYW5nZXMsIE9uRGVzdHJveSB7XG5cdHB1YmxpYyB2aWV3UG9ydEl0ZW1zOiBhbnlbXTtcblx0cHVibGljIHdpbmRvdyA9IHdpbmRvdztcblxuXHRwdWJsaWMgZ2V0IHZpZXdQb3J0SW5kaWNlcygpOiBJUGFnZUluZm8ge1xuXHRcdGxldCBwYWdlSW5mbzogSVBhZ2VJbmZvID0gdGhpcy5wcmV2aW91c1ZpZXdQb3J0IHx8IDxhbnk+e307XG5cdFx0cmV0dXJuIHtcblx0XHRcdHN0YXJ0SW5kZXg6IHBhZ2VJbmZvLnN0YXJ0SW5kZXggfHwgMCxcblx0XHRcdGVuZEluZGV4OiBwYWdlSW5mby5lbmRJbmRleCB8fCAwXG5cdFx0fTtcblx0fVxuXG5cdHByb3RlY3RlZCBfZW5hYmxlVW5lcXVhbENoaWxkcmVuU2l6ZXM6IGJvb2xlYW4gPSBmYWxzZTtcblx0QElucHV0KClcblx0cHVibGljIGdldCBlbmFibGVVbmVxdWFsQ2hpbGRyZW5TaXplcygpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5fZW5hYmxlVW5lcXVhbENoaWxkcmVuU2l6ZXM7XG5cdH1cblx0cHVibGljIHNldCBlbmFibGVVbmVxdWFsQ2hpbGRyZW5TaXplcyh2YWx1ZTogYm9vbGVhbikge1xuXHRcdGlmICh0aGlzLl9lbmFibGVVbmVxdWFsQ2hpbGRyZW5TaXplcyA9PT0gdmFsdWUpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLl9lbmFibGVVbmVxdWFsQ2hpbGRyZW5TaXplcyA9IHZhbHVlO1xuXHRcdHRoaXMubWluTWVhc3VyZWRDaGlsZFdpZHRoID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMubWluTWVhc3VyZWRDaGlsZEhlaWdodCA9IHVuZGVmaW5lZDtcblx0fVxuXG5cdEBJbnB1dCgpXG5cdHB1YmxpYyB1c2VNYXJnaW5JbnN0ZWFkT2ZUcmFuc2xhdGU6IGJvb2xlYW4gPSBmYWxzZTtcblxuXHRASW5wdXQoKVxuXHRwdWJsaWMgc2Nyb2xsYmFyV2lkdGg6IG51bWJlcjtcblxuXHRASW5wdXQoKVxuXHRwdWJsaWMgc2Nyb2xsYmFySGVpZ2h0OiBudW1iZXI7XG5cblx0QElucHV0KClcblx0cHVibGljIGNoaWxkV2lkdGg6IG51bWJlcjtcblxuXHRASW5wdXQoKVxuXHRwdWJsaWMgY2hpbGRIZWlnaHQ6IG51bWJlcjtcblxuXHRwcm90ZWN0ZWQgX2J1ZmZlckFtb3VudDogbnVtYmVyID0gMDtcblx0QElucHV0KClcblx0cHVibGljIGdldCBidWZmZXJBbW91bnQoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gTWF0aC5tYXgodGhpcy5fYnVmZmVyQW1vdW50LCB0aGlzLmVuYWJsZVVuZXF1YWxDaGlsZHJlblNpemVzID8gNSA6IDApO1xuXHR9XG5cdHB1YmxpYyBzZXQgYnVmZmVyQW1vdW50KHZhbHVlOiBudW1iZXIpIHtcblx0XHR0aGlzLl9idWZmZXJBbW91bnQgPSB2YWx1ZTtcblx0fVxuXG5cdEBJbnB1dCgpXG5cdHB1YmxpYyBzY3JvbGxBbmltYXRpb25UaW1lOiBudW1iZXIgPSA3NTA7XG5cblx0QElucHV0KClcblx0cHVibGljIHJlc2l6ZUJ5cGFzc1JlZnJlc2hUaGVzaG9sZDogbnVtYmVyID0gNTtcblxuXHRwcm90ZWN0ZWQgX3Njcm9sbFRocm90dGxpbmdUaW1lOiBudW1iZXI7XG5cdEBJbnB1dCgpXG5cdHB1YmxpYyBnZXQgc2Nyb2xsVGhyb3R0bGluZ1RpbWUoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5fc2Nyb2xsVGhyb3R0bGluZ1RpbWU7XG5cdH1cblx0cHVibGljIHNldCBzY3JvbGxUaHJvdHRsaW5nVGltZSh2YWx1ZTogbnVtYmVyKSB7XG5cdFx0dGhpcy5fc2Nyb2xsVGhyb3R0bGluZ1RpbWUgPSB2YWx1ZTtcblx0XHR0aGlzLnJlZnJlc2hfdGhyb3R0bGVkID0gPGFueT50aGlzLnRocm90dGxlVHJhaWxpbmcoKCkgPT4ge1xuXHRcdFx0dGhpcy5yZWZyZXNoX2ludGVybmFsKGZhbHNlKTtcblx0XHR9LCB0aGlzLl9zY3JvbGxUaHJvdHRsaW5nVGltZSk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgY2hlY2tTY3JvbGxFbGVtZW50UmVzaXplZFRpbWVyOiBudW1iZXI7XG5cdHByb3RlY3RlZCBfY2hlY2tSZXNpemVJbnRlcnZhbDogbnVtYmVyID0gMTAwMDtcblx0QElucHV0KClcblx0cHVibGljIGdldCBjaGVja1Jlc2l6ZUludGVydmFsKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuX2NoZWNrUmVzaXplSW50ZXJ2YWw7XG5cdH1cblx0cHVibGljIHNldCBjaGVja1Jlc2l6ZUludGVydmFsKHZhbHVlOiBudW1iZXIpIHtcblx0XHRpZiAodGhpcy5fY2hlY2tSZXNpemVJbnRlcnZhbCA9PT0gdmFsdWUpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLl9jaGVja1Jlc2l6ZUludGVydmFsID0gdmFsdWU7XG5cdFx0dGhpcy5hZGRTY3JvbGxFdmVudEhhbmRsZXJzKCk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2l0ZW1zOiBhbnlbXSA9IFtdO1xuXHRASW5wdXQoKVxuXHRwdWJsaWMgZ2V0IGl0ZW1zKCk6IGFueVtdIHtcblx0XHRyZXR1cm4gdGhpcy5faXRlbXM7XG5cdH1cblx0cHVibGljIHNldCBpdGVtcyh2YWx1ZTogYW55W10pIHtcblx0XHRpZiAodmFsdWUgPT09IHRoaXMuX2l0ZW1zKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5faXRlbXMgPSB2YWx1ZSB8fCBbXTtcblx0XHR0aGlzLnJlZnJlc2hfaW50ZXJuYWwodHJ1ZSk7XG5cdH1cblxuXHRASW5wdXQoKVxuXHRwdWJsaWMgY29tcGFyZUl0ZW1zOiAoaXRlbTE6IGFueSwgaXRlbTI6IGFueSkgPT4gYm9vbGVhbiA9IChpdGVtMTogYW55LCBpdGVtMjogYW55KSA9PiBpdGVtMSA9PT0gaXRlbTI7XG5cblx0cHJvdGVjdGVkIF9ob3Jpem9udGFsOiBib29sZWFuO1xuXHRASW5wdXQoKVxuXHRwdWJsaWMgZ2V0IGhvcml6b250YWwoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuX2hvcml6b250YWw7XG5cdH1cblx0cHVibGljIHNldCBob3Jpem9udGFsKHZhbHVlOiBib29sZWFuKSB7XG5cdFx0dGhpcy5faG9yaXpvbnRhbCA9IHZhbHVlO1xuXHRcdHRoaXMudXBkYXRlRGlyZWN0aW9uKCk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgcmV2ZXJ0UGFyZW50T3ZlcnNjcm9sbCgpOiB2b2lkIHtcblx0XHRjb25zdCBzY3JvbGxFbGVtZW50OiBhbnkgPSB0aGlzLmdldFNjcm9sbEVsZW1lbnQoKTtcblx0XHRpZiAoc2Nyb2xsRWxlbWVudCAmJiB0aGlzLm9sZFBhcmVudFNjcm9sbE92ZXJmbG93KSB7XG5cdFx0XHRzY3JvbGxFbGVtZW50LnN0eWxlWydvdmVyZmxvdy15J10gPSB0aGlzLm9sZFBhcmVudFNjcm9sbE92ZXJmbG93Lnk7XG5cdFx0XHRzY3JvbGxFbGVtZW50LnN0eWxlWydvdmVyZmxvdy14J10gPSB0aGlzLm9sZFBhcmVudFNjcm9sbE92ZXJmbG93Lng7XG5cdFx0fVxuXG5cdFx0dGhpcy5vbGRQYXJlbnRTY3JvbGxPdmVyZmxvdyA9IHVuZGVmaW5lZDtcblx0fVxuXG5cdHByb3RlY3RlZCBvbGRQYXJlbnRTY3JvbGxPdmVyZmxvdzogeyB4OiBzdHJpbmcsIHk6IHN0cmluZyB9O1xuXHRwcm90ZWN0ZWQgX3BhcmVudFNjcm9sbDogRWxlbWVudCB8IFdpbmRvdztcblx0QElucHV0KClcblx0cHVibGljIGdldCBwYXJlbnRTY3JvbGwoKTogRWxlbWVudCB8IFdpbmRvdyB7XG5cdFx0cmV0dXJuIHRoaXMuX3BhcmVudFNjcm9sbDtcblx0fVxuXHRwdWJsaWMgc2V0IHBhcmVudFNjcm9sbCh2YWx1ZTogRWxlbWVudCB8IFdpbmRvdykge1xuXHRcdGlmICh0aGlzLl9wYXJlbnRTY3JvbGwgPT09IHZhbHVlKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5yZXZlcnRQYXJlbnRPdmVyc2Nyb2xsKCk7XG5cdFx0dGhpcy5fcGFyZW50U2Nyb2xsID0gdmFsdWU7XG5cdFx0dGhpcy5hZGRTY3JvbGxFdmVudEhhbmRsZXJzKCk7XG5cblx0XHRjb25zdCBzY3JvbGxFbGVtZW50OmFueSA9IHRoaXMuZ2V0U2Nyb2xsRWxlbWVudCgpO1xuXHRcdGlmIChzY3JvbGxFbGVtZW50ICE9PSB0aGlzLmVsZW1lbnQubmF0aXZlRWxlbWVudCkge1xuXHRcdFx0dGhpcy5vbGRQYXJlbnRTY3JvbGxPdmVyZmxvdyA9IHsgeDogc2Nyb2xsRWxlbWVudC5zdHlsZVsnb3ZlcmZsb3cteCddLCB5OiBzY3JvbGxFbGVtZW50LnN0eWxlWydvdmVyZmxvdy15J10gfTtcblx0XHRcdHNjcm9sbEVsZW1lbnQuc3R5bGVbJ292ZXJmbG93LXknXSA9IHRoaXMuaG9yaXpvbnRhbCA/ICd2aXNpYmxlJyA6ICdhdXRvJztcblx0XHRcdHNjcm9sbEVsZW1lbnQuc3R5bGVbJ292ZXJmbG93LXgnXSA9IHRoaXMuaG9yaXpvbnRhbCA/ICdhdXRvJyA6ICd2aXNpYmxlJztcblx0XHR9XG5cdH1cblxuXHRAT3V0cHV0KClcblx0cHVibGljIHVwZGF0ZTogRXZlbnRFbWl0dGVyPGFueVtdPiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55W10+KCk7XG5cdEBPdXRwdXQoKVxuXHRwdWJsaWMgdnNVcGRhdGU6IEV2ZW50RW1pdHRlcjxhbnlbXT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueVtdPigpO1xuXG5cdEBPdXRwdXQoKVxuXHRwdWJsaWMgY2hhbmdlOiBFdmVudEVtaXR0ZXI8Q2hhbmdlRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDaGFuZ2VFdmVudD4oKTtcblx0QE91dHB1dCgpXG5cdHB1YmxpYyB2c0NoYW5nZTogRXZlbnRFbWl0dGVyPENoYW5nZUV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hhbmdlRXZlbnQ+KCk7XG5cblx0QE91dHB1dCgpXG5cdHB1YmxpYyBzdGFydDogRXZlbnRFbWl0dGVyPENoYW5nZUV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hhbmdlRXZlbnQ+KCk7XG5cdEBPdXRwdXQoKVxuXHRwdWJsaWMgdnNTdGFydDogRXZlbnRFbWl0dGVyPENoYW5nZUV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hhbmdlRXZlbnQ+KCk7XG5cblx0QE91dHB1dCgpXG5cdHB1YmxpYyBlbmQ6IEV2ZW50RW1pdHRlcjxDaGFuZ2VFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENoYW5nZUV2ZW50PigpO1xuXHRAT3V0cHV0KClcblx0cHVibGljIHZzRW5kOiBFdmVudEVtaXR0ZXI8Q2hhbmdlRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDaGFuZ2VFdmVudD4oKTtcblxuXHRAVmlld0NoaWxkKCdjb250ZW50JywgeyByZWFkOiBFbGVtZW50UmVmIH0pXG5cdHB1YmxpYyBjb250ZW50RWxlbWVudFJlZjogRWxlbWVudFJlZjtcblxuXHRAVmlld0NoaWxkKCdpbnZpc2libGVQYWRkaW5nJywgeyByZWFkOiBFbGVtZW50UmVmIH0pXG5cdHB1YmxpYyBpbnZpc2libGVQYWRkaW5nRWxlbWVudFJlZjogRWxlbWVudFJlZjtcblxuXHRAQ29udGVudENoaWxkKCdjb250YWluZXInLCB7IHJlYWQ6IEVsZW1lbnRSZWYgfSlcblx0cHVibGljIGNvbnRhaW5lckVsZW1lbnRSZWY6IEVsZW1lbnRSZWY7XG5cblx0cHVibGljIG5nT25Jbml0KCkge1xuXHRcdHRoaXMuYWRkU2Nyb2xsRXZlbnRIYW5kbGVycygpO1xuXHR9XG5cblx0cHVibGljIG5nT25EZXN0cm95KCkge1xuXHRcdHRoaXMucmVtb3ZlU2Nyb2xsRXZlbnRIYW5kbGVycygpO1xuXHRcdHRoaXMucmV2ZXJ0UGFyZW50T3ZlcnNjcm9sbCgpO1xuXHR9XG5cblx0cHVibGljIG5nT25DaGFuZ2VzKGNoYW5nZXM6IGFueSkge1xuXHRcdGxldCBpbmRleExlbmd0aENoYW5nZWQ6IGFueSA9IHRoaXMuY2FjaGVkSXRlbXNMZW5ndGggIT09IHRoaXMuaXRlbXMubGVuZ3RoO1xuXHRcdHRoaXMuY2FjaGVkSXRlbXNMZW5ndGggPSB0aGlzLml0ZW1zLmxlbmd0aDtcblxuXHRcdGNvbnN0IGZpcnN0UnVuOiBib29sZWFuID0gIWNoYW5nZXMuaXRlbXMgfHwgIWNoYW5nZXMuaXRlbXMucHJldmlvdXNWYWx1ZSB8fCBjaGFuZ2VzLml0ZW1zLnByZXZpb3VzVmFsdWUubGVuZ3RoID09PSAwO1xuXHRcdHRoaXMucmVmcmVzaF9pbnRlcm5hbChpbmRleExlbmd0aENoYW5nZWQgfHwgZmlyc3RSdW4pO1xuXHR9XG5cblx0cHVibGljIG5nRG9DaGVjaygpIHtcblx0XHRpZiAodGhpcy5jYWNoZWRJdGVtc0xlbmd0aCAhPT0gdGhpcy5pdGVtcy5sZW5ndGgpIHtcblx0XHRcdHRoaXMuY2FjaGVkSXRlbXNMZW5ndGggPSB0aGlzLml0ZW1zLmxlbmd0aDtcblx0XHRcdHRoaXMucmVmcmVzaF9pbnRlcm5hbCh0cnVlKTtcblx0XHR9XG5cdH1cblxuXHRwdWJsaWMgcmVmcmVzaCgpIHtcblx0XHR0aGlzLnJlZnJlc2hfaW50ZXJuYWwodHJ1ZSk7XG5cdH1cblxuXHRwdWJsaWMgc2Nyb2xsSW50byhpdGVtOiBhbnksIGFsaWduVG9CZWdpbm5pbmc6IGJvb2xlYW4gPSB0cnVlLCBhZGRpdGlvbmFsT2Zmc2V0OiBudW1iZXIgPSAwLCBhbmltYXRpb25NaWxsaXNlY29uZHM6IG51bWJlciA9IHVuZGVmaW5lZCwgYW5pbWF0aW9uQ29tcGxldGVkQ2FsbGJhY2s6ICgpID0+IHZvaWQgPSB1bmRlZmluZWQpIHtcblx0XHRsZXQgaW5kZXg6IG51bWJlciA9IHRoaXMuaXRlbXMuaW5kZXhPZihpdGVtKTtcblx0XHRpZiAoaW5kZXggPT09IC0xKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5zY3JvbGxUb0luZGV4KGluZGV4LCBhbGlnblRvQmVnaW5uaW5nLCBhZGRpdGlvbmFsT2Zmc2V0LCBhbmltYXRpb25NaWxsaXNlY29uZHMsIGFuaW1hdGlvbkNvbXBsZXRlZENhbGxiYWNrKTtcblx0fVxuXG5cdHB1YmxpYyBzY3JvbGxUb0luZGV4KGluZGV4OiBudW1iZXIsIGFsaWduVG9CZWdpbm5pbmc6IGJvb2xlYW4gPSB0cnVlLCBhZGRpdGlvbmFsT2Zmc2V0OiBudW1iZXIgPSAwLCBhbmltYXRpb25NaWxsaXNlY29uZHM6IG51bWJlciA9IHVuZGVmaW5lZCwgYW5pbWF0aW9uQ29tcGxldGVkQ2FsbGJhY2s6ICgpID0+IHZvaWQgPSB1bmRlZmluZWQpIHtcblx0XHRsZXQgbWF4UmV0cmllczogbnVtYmVyID0gNTtcblxuXHRcdGxldCByZXRyeUlmTmVlZGVkID0gKCkgPT4ge1xuXHRcdFx0LS1tYXhSZXRyaWVzO1xuXHRcdFx0aWYgKG1heFJldHJpZXMgPD0gMCkge1xuXHRcdFx0XHRpZiAoYW5pbWF0aW9uQ29tcGxldGVkQ2FsbGJhY2spIHtcblx0XHRcdFx0XHRhbmltYXRpb25Db21wbGV0ZWRDYWxsYmFjaygpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0bGV0IGRpbWVuc2lvbnM6IGFueSA9IHRoaXMuY2FsY3VsYXRlRGltZW5zaW9ucygpO1xuXHRcdFx0bGV0IGRlc2lyZWRTdGFydEluZGV4OiBhbnkgPSBNYXRoLm1pbihNYXRoLm1heChpbmRleCwgMCksIGRpbWVuc2lvbnMuaXRlbUNvdW50IC0gMSk7XG5cdFx0XHRpZiAodGhpcy5wcmV2aW91c1ZpZXdQb3J0LnN0YXJ0SW5kZXggPT09IGRlc2lyZWRTdGFydEluZGV4KSB7XG5cdFx0XHRcdGlmIChhbmltYXRpb25Db21wbGV0ZWRDYWxsYmFjaykge1xuXHRcdFx0XHRcdGFuaW1hdGlvbkNvbXBsZXRlZENhbGxiYWNrKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnNjcm9sbFRvSW5kZXhfaW50ZXJuYWwoaW5kZXgsIGFsaWduVG9CZWdpbm5pbmcsIGFkZGl0aW9uYWxPZmZzZXQsIDAsIHJldHJ5SWZOZWVkZWQpO1xuXHRcdH07XG5cblx0XHR0aGlzLnNjcm9sbFRvSW5kZXhfaW50ZXJuYWwoaW5kZXgsIGFsaWduVG9CZWdpbm5pbmcsIGFkZGl0aW9uYWxPZmZzZXQsIGFuaW1hdGlvbk1pbGxpc2Vjb25kcywgcmV0cnlJZk5lZWRlZCk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgc2Nyb2xsVG9JbmRleF9pbnRlcm5hbChpbmRleDogbnVtYmVyLCBhbGlnblRvQmVnaW5uaW5nOiBib29sZWFuID0gdHJ1ZSwgYWRkaXRpb25hbE9mZnNldDogbnVtYmVyID0gMCwgYW5pbWF0aW9uTWlsbGlzZWNvbmRzOiBudW1iZXIgPSB1bmRlZmluZWQsIGFuaW1hdGlvbkNvbXBsZXRlZENhbGxiYWNrOiAoKSA9PiB2b2lkID0gdW5kZWZpbmVkKSB7XG5cdFx0YW5pbWF0aW9uTWlsbGlzZWNvbmRzID0gYW5pbWF0aW9uTWlsbGlzZWNvbmRzID09PSB1bmRlZmluZWQgPyB0aGlzLnNjcm9sbEFuaW1hdGlvblRpbWUgOiBhbmltYXRpb25NaWxsaXNlY29uZHM7XG5cblx0XHRsZXQgc2Nyb2xsRWxlbWVudDogYW55ID0gdGhpcy5nZXRTY3JvbGxFbGVtZW50KCk7XG5cdFx0bGV0IG9mZnNldDogYW55ID0gdGhpcy5nZXRFbGVtZW50c09mZnNldCgpO1xuXG5cdFx0bGV0IGRpbWVuc2lvbnM6IGFueSA9IHRoaXMuY2FsY3VsYXRlRGltZW5zaW9ucygpO1xuXHRcdGxldCBzY3JvbGw6IGFueSA9IHRoaXMuY2FsY3VsYXRlUGFkZGluZyhpbmRleCwgZGltZW5zaW9ucywgZmFsc2UpICsgb2Zmc2V0ICsgYWRkaXRpb25hbE9mZnNldDtcblx0XHRpZiAoIWFsaWduVG9CZWdpbm5pbmcpIHtcblx0XHRcdHNjcm9sbCAtPSBkaW1lbnNpb25zLndyYXBHcm91cHNQZXJQYWdlICogZGltZW5zaW9uc1t0aGlzLl9jaGlsZFNjcm9sbERpbV07XG5cdFx0fVxuXG5cdFx0bGV0IGFuaW1hdGlvblJlcXVlc3Q6IG51bWJlcjtcblxuXG5cdFx0aWYgKCFhbmltYXRpb25NaWxsaXNlY29uZHMpIHtcblx0XHRcdHRoaXMucmVuZGVyZXIuc2V0UHJvcGVydHkoc2Nyb2xsRWxlbWVudCwgdGhpcy5fc2Nyb2xsVHlwZSwgc2Nyb2xsKTtcblx0XHRcdHRoaXMucmVmcmVzaF9pbnRlcm5hbChmYWxzZSwgYW5pbWF0aW9uQ29tcGxldGVkQ2FsbGJhY2spO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcblx0fVxuXG5cdGNvbnN0cnVjdG9yKHByb3RlY3RlZCByZWFkb25seSBlbGVtZW50OiBFbGVtZW50UmVmLCBwcm90ZWN0ZWQgcmVhZG9ubHkgcmVuZGVyZXI6IFJlbmRlcmVyMiwgcHJvdGVjdGVkIHJlYWRvbmx5IHpvbmU6IE5nWm9uZSkge1xuXHRcdHRoaXMuaG9yaXpvbnRhbCA9IGZhbHNlO1xuXHRcdHRoaXMuc2Nyb2xsVGhyb3R0bGluZ1RpbWUgPSAwO1xuXHRcdHRoaXMucmVzZXRXcmFwR3JvdXBEaW1lbnNpb25zKCk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgcHJldmlvdXNTY3JvbGxCb3VuZGluZ1JlY3Q6IENsaWVudFJlY3Q7XG5cdHByb3RlY3RlZCBjaGVja1Njcm9sbEVsZW1lbnRSZXNpemVkKCk6IHZvaWQge1xuXHRcdGxldCBib3VuZGluZ1JlY3Q6IGFueSA9IHRoaXMuZ2V0U2Nyb2xsRWxlbWVudCgpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG5cdFx0bGV0IHNpemVDaGFuZ2VkOiBib29sZWFuO1xuXHRcdGlmICghdGhpcy5wcmV2aW91c1Njcm9sbEJvdW5kaW5nUmVjdCkge1xuXHRcdFx0c2l6ZUNoYW5nZWQgPSB0cnVlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsZXQgd2lkdGhDaGFuZ2U6IGFueSA9IE1hdGguYWJzKGJvdW5kaW5nUmVjdC53aWR0aCAtIHRoaXMucHJldmlvdXNTY3JvbGxCb3VuZGluZ1JlY3Qud2lkdGgpO1xuXHRcdFx0bGV0IGhlaWdodENoYW5nZTogYW55ID0gTWF0aC5hYnMoYm91bmRpbmdSZWN0LmhlaWdodCAtIHRoaXMucHJldmlvdXNTY3JvbGxCb3VuZGluZ1JlY3QuaGVpZ2h0KTtcblx0XHRcdHNpemVDaGFuZ2VkID0gd2lkdGhDaGFuZ2UgPiB0aGlzLnJlc2l6ZUJ5cGFzc1JlZnJlc2hUaGVzaG9sZCB8fCBoZWlnaHRDaGFuZ2UgPiB0aGlzLnJlc2l6ZUJ5cGFzc1JlZnJlc2hUaGVzaG9sZDtcblx0XHR9XG5cblx0XHRpZiAoc2l6ZUNoYW5nZWQpIHtcblx0XHRcdHRoaXMucHJldmlvdXNTY3JvbGxCb3VuZGluZ1JlY3QgPSBib3VuZGluZ1JlY3Q7XG5cdFx0XHRpZiAoYm91bmRpbmdSZWN0LndpZHRoID4gMCAmJiBib3VuZGluZ1JlY3QuaGVpZ2h0ID4gMCkge1xuXHRcdFx0XHR0aGlzLnJlZnJlc2hfaW50ZXJuYWwoZmFsc2UpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHByb3RlY3RlZCBfaW52aXNpYmxlUGFkZGluZ1Byb3BlcnR5OiBhbnk7XG5cdHByb3RlY3RlZCBfb2Zmc2V0VHlwZTogYW55O1xuXHRwcm90ZWN0ZWQgX3Njcm9sbFR5cGU6IGFueTtcblx0cHJvdGVjdGVkIF9wYWdlT2Zmc2V0VHlwZTogYW55O1xuXHRwcm90ZWN0ZWQgX2NoaWxkU2Nyb2xsRGltOiBhbnk7XG5cdHByb3RlY3RlZCBfdHJhbnNsYXRlRGlyOiBhbnk7XG5cdHByb3RlY3RlZCBfbWFyZ2luRGlyOiBhbnk7XG5cdHByb3RlY3RlZCB1cGRhdGVEaXJlY3Rpb24oKTogdm9pZCB7XG5cdFx0aWYgKHRoaXMuaG9yaXpvbnRhbCkge1xuXHRcdFx0dGhpcy5faW52aXNpYmxlUGFkZGluZ1Byb3BlcnR5ID0gJ3dpZHRoJztcblx0XHRcdHRoaXMuX29mZnNldFR5cGUgPSAnb2Zmc2V0TGVmdCc7XG5cdFx0XHR0aGlzLl9wYWdlT2Zmc2V0VHlwZSA9ICdwYWdlWE9mZnNldCc7XG5cdFx0XHR0aGlzLl9jaGlsZFNjcm9sbERpbSA9ICdjaGlsZFdpZHRoJztcblx0XHRcdHRoaXMuX21hcmdpbkRpciA9ICdtYXJnaW4tbGVmdCc7XG5cdFx0XHR0aGlzLl90cmFuc2xhdGVEaXIgPSAndHJhbnNsYXRlWCc7XG5cdFx0XHR0aGlzLl9zY3JvbGxUeXBlID0gJ3Njcm9sbExlZnQnO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHRoaXMuX2ludmlzaWJsZVBhZGRpbmdQcm9wZXJ0eSA9ICdoZWlnaHQnO1xuXHRcdFx0dGhpcy5fb2Zmc2V0VHlwZSA9ICdvZmZzZXRUb3AnO1xuXHRcdFx0dGhpcy5fcGFnZU9mZnNldFR5cGUgPSAncGFnZVlPZmZzZXQnO1xuXHRcdFx0dGhpcy5fY2hpbGRTY3JvbGxEaW0gPSAnY2hpbGRIZWlnaHQnO1xuXHRcdFx0dGhpcy5fbWFyZ2luRGlyID0gJ21hcmdpbi10b3AnO1xuXHRcdFx0dGhpcy5fdHJhbnNsYXRlRGlyID0gJ3RyYW5zbGF0ZVknO1xuXHRcdFx0dGhpcy5fc2Nyb2xsVHlwZSA9ICdzY3JvbGxUb3AnO1xuXHRcdH1cblx0fVxuXG5cdHByb3RlY3RlZCByZWZyZXNoX3Rocm90dGxlZDogKCkgPT4gdm9pZDtcblxuXHRwcm90ZWN0ZWQgdGhyb3R0bGVUcmFpbGluZyhmdW5jOiBGdW5jdGlvbiwgd2FpdDogbnVtYmVyKTogRnVuY3Rpb24ge1xuXHRcdGxldCB0aW1lb3V0OiBhbnkgPSB1bmRlZmluZWQ7XG5cdFx0Y29uc3QgcmVzdWx0ID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0Y29uc3QgX3RoaXMgPSB0aGlzO1xuXHRcdFx0Y29uc3QgX2FyZ3VtZW50cyA9IGFyZ3VtZW50cztcblxuXHRcdFx0aWYgKHRpbWVvdXQpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAod2FpdCA8PSAwKSB7XG5cdFx0XHRcdGZ1bmMuYXBwbHkoX3RoaXMsIF9hcmd1bWVudHMpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHRpbWVvdXQgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0ZnVuYy5hcHBseShfdGhpcywgX2FyZ3VtZW50cyk7XG5cdFx0XHRcdH0sIHdhaXQpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIGNhbGN1bGF0ZWRTY3JvbGxiYXJXaWR0aDogbnVtYmVyID0gMDtcblx0cHJvdGVjdGVkIGNhbGN1bGF0ZWRTY3JvbGxiYXJIZWlnaHQ6IG51bWJlciA9IDA7XG5cblx0cHJvdGVjdGVkIHBhZGRpbmc6IG51bWJlciA9IDA7XG5cdHByb3RlY3RlZCBwcmV2aW91c1ZpZXdQb3J0OiBJVmlld3BvcnQgPSA8YW55Pnt9O1xuXHRwcm90ZWN0ZWQgY2FjaGVkSXRlbXNMZW5ndGg6IG51bWJlcjtcblxuXHRwcm90ZWN0ZWQgZGlzcG9zZVNjcm9sbEhhbmRsZXI6ICgpID0+IHZvaWQgfCB1bmRlZmluZWQ7XG5cdHByb3RlY3RlZCBkaXNwb3NlUmVzaXplSGFuZGxlcjogKCkgPT4gdm9pZCB8IHVuZGVmaW5lZDtcblxuXHRwcm90ZWN0ZWQgcmVmcmVzaF9pbnRlcm5hbChpdGVtc0FycmF5TW9kaWZpZWQ6IGJvb2xlYW4sIHJlZnJlc2hDb21wbGV0ZWRDYWxsYmFjazogKCkgPT4gdm9pZCA9IHVuZGVmaW5lZCwgbWF4UnVuVGltZXM6IG51bWJlciA9IDIpIHtcblx0XHQvL25vdGU6IG1heFJ1blRpbWVzIGlzIHRvIGZvcmNlIGl0IHRvIGtlZXAgcmVjYWxjdWxhdGluZyBpZiB0aGUgcHJldmlvdXMgaXRlcmF0aW9uIGNhdXNlZCBhIHJlLXJlbmRlciAoZGlmZmVyZW50IHNsaWNlZCBpdGVtcyBpbiB2aWV3cG9ydCBvciBzY3JvbGxQb3NpdGlvbiBjaGFuZ2VkKS5cblx0XHQvL1RoZSBkZWZhdWx0IG9mIDJ4IG1heCB3aWxsIHByb2JhYmx5IGJlIGFjY3VyYXRlIGVub3VnaCB3aXRob3V0IGNhdXNpbmcgdG9vIGxhcmdlIGEgcGVyZm9ybWFuY2UgYm90dGxlbmVja1xuXHRcdC8vVGhlIGNvZGUgd291bGQgdHlwaWNhbGx5IHF1aXQgb3V0IG9uIHRoZSAybmQgaXRlcmF0aW9uIGFueXdheXMuIFRoZSBtYWluIHRpbWUgaXQnZCB0aGluayBtb3JlIHRoYW4gMiBydW5zIHdvdWxkIGJlIG5lY2Vzc2FyeSB3b3VsZCBiZSBmb3IgdmFzdGx5IGRpZmZlcmVudCBzaXplZCBjaGlsZCBpdGVtcyBvciBpZiB0aGlzIGlzIHRoZSAxc3QgdGltZSB0aGUgaXRlbXMgYXJyYXkgd2FzIGluaXRpYWxpemVkLlxuXHRcdC8vV2l0aG91dCBtYXhSdW5UaW1lcywgSWYgdGhlIHVzZXIgaXMgYWN0aXZlbHkgc2Nyb2xsaW5nIHRoaXMgY29kZSB3b3VsZCBiZWNvbWUgYW4gaW5maW5pdGUgbG9vcCB1bnRpbCB0aGV5IHN0b3BwZWQgc2Nyb2xsaW5nLiBUaGlzIHdvdWxkIGJlIG9rYXksIGV4Y2VwdCBlYWNoIHNjcm9sbCBldmVudCB3b3VsZCBzdGFydCBhbiBhZGRpdGlvbmFsIGluZmludGUgbG9vcC4gV2Ugd2FudCB0byBzaG9ydC1jaXJjdWl0IGl0IHRvIHByZXZlbnQgaGlzLlxuXG5cdFx0dGhpcy56b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcblx0XHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG5cblx0XHRcdFx0aWYgKGl0ZW1zQXJyYXlNb2RpZmllZCkge1xuXHRcdFx0XHRcdHRoaXMucmVzZXRXcmFwR3JvdXBEaW1lbnNpb25zKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0bGV0IHZpZXdwb3J0OiBhbnkgPSB0aGlzLmNhbGN1bGF0ZVZpZXdwb3J0KCk7XG5cblx0XHRcdFx0bGV0IHN0YXJ0Q2hhbmdlZDogYW55ID0gaXRlbXNBcnJheU1vZGlmaWVkIHx8IHZpZXdwb3J0LnN0YXJ0SW5kZXggIT09IHRoaXMucHJldmlvdXNWaWV3UG9ydC5zdGFydEluZGV4O1xuXHRcdFx0XHRsZXQgZW5kQ2hhbmdlZDogYW55ID0gaXRlbXNBcnJheU1vZGlmaWVkIHx8IHZpZXdwb3J0LmVuZEluZGV4ICE9PSB0aGlzLnByZXZpb3VzVmlld1BvcnQuZW5kSW5kZXg7XG5cdFx0XHRcdGxldCBzY3JvbGxMZW5ndGhDaGFuZ2VkOiBhbnkgPSB2aWV3cG9ydC5zY3JvbGxMZW5ndGggIT09IHRoaXMucHJldmlvdXNWaWV3UG9ydC5zY3JvbGxMZW5ndGg7XG5cdFx0XHRcdGxldCBwYWRkaW5nQ2hhbmdlZDogYW55ID0gdmlld3BvcnQucGFkZGluZyAhPT0gdGhpcy5wcmV2aW91c1ZpZXdQb3J0LnBhZGRpbmc7XG5cblx0XHRcdFx0dGhpcy5wcmV2aW91c1ZpZXdQb3J0ID0gdmlld3BvcnQ7XG5cblx0XHRcdFx0aWYgKHNjcm9sbExlbmd0aENoYW5nZWQpIHtcblx0XHRcdFx0XHR0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHRoaXMuaW52aXNpYmxlUGFkZGluZ0VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgdGhpcy5faW52aXNpYmxlUGFkZGluZ1Byb3BlcnR5LCBgJHt2aWV3cG9ydC5zY3JvbGxMZW5ndGh9cHhgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChwYWRkaW5nQ2hhbmdlZCkge1xuXHRcdFx0XHRcdGlmICh0aGlzLnVzZU1hcmdpbkluc3RlYWRPZlRyYW5zbGF0ZSkge1xuXHRcdFx0XHRcdFx0dGhpcy5yZW5kZXJlci5zZXRTdHlsZSh0aGlzLmNvbnRlbnRFbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsIHRoaXMuX21hcmdpbkRpciwgYCR7dmlld3BvcnQucGFkZGluZ31weGApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdHRoaXMucmVuZGVyZXIuc2V0U3R5bGUodGhpcy5jb250ZW50RWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCAndHJhbnNmb3JtJywgYCR7dGhpcy5fdHJhbnNsYXRlRGlyfSgke3ZpZXdwb3J0LnBhZGRpbmd9cHgpYCk7XG5cdFx0XHRcdFx0XHR0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHRoaXMuY29udGVudEVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgJ3dlYmtpdFRyYW5zZm9ybScsIGAke3RoaXMuX3RyYW5zbGF0ZURpcn0oJHt2aWV3cG9ydC5wYWRkaW5nfXB4KWApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBlbWl0SW5kZXhDaGFuZ2VkRXZlbnRzOiBhbnkgPSB0cnVlOyAvLyBtYXhSZVJ1blRpbWVzID09PSAxICh3b3VsZCBuZWVkIHRvIHN0aWxsIHJ1biBpZiBkaWRuJ3QgdXBkYXRlIGlmIHByZXZpb3VzIGl0ZXJhdGlvbiBoYWQgdXBkYXRlZClcblxuXHRcdFx0XHRpZiAoc3RhcnRDaGFuZ2VkIHx8IGVuZENoYW5nZWQpIHtcblx0XHRcdFx0XHR0aGlzLnpvbmUucnVuKCgpID0+IHtcblxuXHRcdFx0XHRcdFx0Ly8gdXBkYXRlIHRoZSBzY3JvbGwgbGlzdCB0byB0cmlnZ2VyIHJlLXJlbmRlciBvZiBjb21wb25lbnRzIGluIHZpZXdwb3J0XG5cdFx0XHRcdFx0XHR0aGlzLnZpZXdQb3J0SXRlbXMgPSB2aWV3cG9ydC5zdGFydEluZGV4V2l0aEJ1ZmZlciA+PSAwICYmIHZpZXdwb3J0LmVuZEluZGV4V2l0aEJ1ZmZlciA+PSAwID8gdGhpcy5pdGVtcy5zbGljZSh2aWV3cG9ydC5zdGFydEluZGV4V2l0aEJ1ZmZlciwgdmlld3BvcnQuZW5kSW5kZXhXaXRoQnVmZmVyICsgMSkgOiBbXTtcblx0XHRcdFx0XHRcdHRoaXMudXBkYXRlLmVtaXQodGhpcy52aWV3UG9ydEl0ZW1zKTtcblx0XHRcdFx0XHRcdHRoaXMudnNVcGRhdGUuZW1pdCh0aGlzLnZpZXdQb3J0SXRlbXMpO1xuXG5cdFx0XHRcdFx0XHRpZiAoZW1pdEluZGV4Q2hhbmdlZEV2ZW50cykge1xuXHRcdFx0XHRcdFx0XHRpZiAoc3RhcnRDaGFuZ2VkKSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5zdGFydC5lbWl0KHsgc3RhcnQ6IHZpZXdwb3J0LnN0YXJ0SW5kZXgsIGVuZDogdmlld3BvcnQuZW5kSW5kZXggfSk7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy52c1N0YXJ0LmVtaXQoeyBzdGFydDogdmlld3BvcnQuc3RhcnRJbmRleCwgZW5kOiB2aWV3cG9ydC5lbmRJbmRleCB9KTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChlbmRDaGFuZ2VkKSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5lbmQuZW1pdCh7IHN0YXJ0OiB2aWV3cG9ydC5zdGFydEluZGV4LCBlbmQ6IHZpZXdwb3J0LmVuZEluZGV4IH0pO1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMudnNFbmQuZW1pdCh7IHN0YXJ0OiB2aWV3cG9ydC5zdGFydEluZGV4LCBlbmQ6IHZpZXdwb3J0LmVuZEluZGV4IH0pO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKHN0YXJ0Q2hhbmdlZCB8fCBlbmRDaGFuZ2VkKSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5jaGFuZ2UuZW1pdCh7IHN0YXJ0OiB2aWV3cG9ydC5zdGFydEluZGV4LCBlbmQ6IHZpZXdwb3J0LmVuZEluZGV4IH0pO1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMudnNDaGFuZ2UuZW1pdCh7IHN0YXJ0OiB2aWV3cG9ydC5zdGFydEluZGV4LCBlbmQ6IHZpZXdwb3J0LmVuZEluZGV4IH0pO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmIChtYXhSdW5UaW1lcyA+IDApIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5yZWZyZXNoX2ludGVybmFsKGZhbHNlLCByZWZyZXNoQ29tcGxldGVkQ2FsbGJhY2ssIG1heFJ1blRpbWVzIC0gMSk7XG5cdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYgKHJlZnJlc2hDb21wbGV0ZWRDYWxsYmFjaykge1xuXHRcdFx0XHRcdFx0XHRyZWZyZXNoQ29tcGxldGVkQ2FsbGJhY2soKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRpZiAobWF4UnVuVGltZXMgPiAwICYmIChzY3JvbGxMZW5ndGhDaGFuZ2VkIHx8IHBhZGRpbmdDaGFuZ2VkKSkge1xuXHRcdFx0XHRcdFx0dGhpcy5yZWZyZXNoX2ludGVybmFsKGZhbHNlLCByZWZyZXNoQ29tcGxldGVkQ2FsbGJhY2ssIG1heFJ1blRpbWVzIC0gMSk7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKHJlZnJlc2hDb21wbGV0ZWRDYWxsYmFjaykge1xuXHRcdFx0XHRcdFx0cmVmcmVzaENvbXBsZXRlZENhbGxiYWNrKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxuXG5cdHByb3RlY3RlZCBnZXRTY3JvbGxFbGVtZW50KCk6IGFueSB7XG5cdFx0cmV0dXJuIHRoaXMucGFyZW50U2Nyb2xsIGluc3RhbmNlb2YgV2luZG93ID8gZG9jdW1lbnQuc2Nyb2xsaW5nRWxlbWVudCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keSA6IHRoaXMucGFyZW50U2Nyb2xsIHx8IHRoaXMuZWxlbWVudC5uYXRpdmVFbGVtZW50O1xuXHR9XG5cblx0cHJvdGVjdGVkIGFkZFNjcm9sbEV2ZW50SGFuZGxlcnMoKSB7XG5cdFx0bGV0IHNjcm9sbEVsZW1lbnQ6IGFueSA9IHRoaXMuZ2V0U2Nyb2xsRWxlbWVudCgpO1xuXG5cdFx0dGhpcy5yZW1vdmVTY3JvbGxFdmVudEhhbmRsZXJzKCk7XG5cblx0XHR0aGlzLnpvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuXHRcdFx0aWYgKHRoaXMucGFyZW50U2Nyb2xsIGluc3RhbmNlb2YgV2luZG93KSB7XG5cdFx0XHRcdHRoaXMuZGlzcG9zZVNjcm9sbEhhbmRsZXIgPSB0aGlzLnJlbmRlcmVyLmxpc3Rlbignd2luZG93JywgJ3Njcm9sbCcsIHRoaXMucmVmcmVzaF90aHJvdHRsZWQpO1xuXHRcdFx0XHR0aGlzLmRpc3Bvc2VSZXNpemVIYW5kbGVyID0gdGhpcy5yZW5kZXJlci5saXN0ZW4oJ3dpbmRvdycsICdyZXNpemUnLCB0aGlzLnJlZnJlc2hfdGhyb3R0bGVkKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR0aGlzLmRpc3Bvc2VTY3JvbGxIYW5kbGVyID0gdGhpcy5yZW5kZXJlci5saXN0ZW4oc2Nyb2xsRWxlbWVudCwgJ3Njcm9sbCcsIHRoaXMucmVmcmVzaF90aHJvdHRsZWQpO1xuXHRcdFx0XHRpZiAodGhpcy5fY2hlY2tSZXNpemVJbnRlcnZhbCA+IDApIHtcblx0XHRcdFx0XHR0aGlzLmNoZWNrU2Nyb2xsRWxlbWVudFJlc2l6ZWRUaW1lciA9IDxhbnk+c2V0SW50ZXJ2YWwoKCkgPT4geyB0aGlzLmNoZWNrU2Nyb2xsRWxlbWVudFJlc2l6ZWQoKTsgfSwgdGhpcy5fY2hlY2tSZXNpemVJbnRlcnZhbCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHByb3RlY3RlZCByZW1vdmVTY3JvbGxFdmVudEhhbmRsZXJzKCkge1xuXHRcdGlmICh0aGlzLmNoZWNrU2Nyb2xsRWxlbWVudFJlc2l6ZWRUaW1lcikge1xuXHRcdFx0Y2xlYXJJbnRlcnZhbCh0aGlzLmNoZWNrU2Nyb2xsRWxlbWVudFJlc2l6ZWRUaW1lcik7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuZGlzcG9zZVNjcm9sbEhhbmRsZXIpIHtcblx0XHRcdHRoaXMuZGlzcG9zZVNjcm9sbEhhbmRsZXIoKTtcblx0XHRcdHRoaXMuZGlzcG9zZVNjcm9sbEhhbmRsZXIgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuZGlzcG9zZVJlc2l6ZUhhbmRsZXIpIHtcblx0XHRcdHRoaXMuZGlzcG9zZVJlc2l6ZUhhbmRsZXIoKTtcblx0XHRcdHRoaXMuZGlzcG9zZVJlc2l6ZUhhbmRsZXIgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9XG5cblx0cHJvdGVjdGVkIGdldEVsZW1lbnRzT2Zmc2V0KCk6IG51bWJlciB7XG5cdFx0bGV0IG9mZnNldDogYW55ID0gMDtcblxuXHRcdGlmICh0aGlzLmNvbnRhaW5lckVsZW1lbnRSZWYgJiYgdGhpcy5jb250YWluZXJFbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpIHtcblx0XHRcdG9mZnNldCArPSB0aGlzLmNvbnRhaW5lckVsZW1lbnRSZWYubmF0aXZlRWxlbWVudFt0aGlzLl9vZmZzZXRUeXBlXTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5wYXJlbnRTY3JvbGwpIHtcblx0XHRcdGxldCBzY3JvbGxFbGVtZW50OiBhbnkgPSB0aGlzLmdldFNjcm9sbEVsZW1lbnQoKTtcblx0XHRcdGxldCBlbGVtZW50Q2xpZW50UmVjdDogYW55ID0gdGhpcy5lbGVtZW50Lm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdFx0XHRsZXQgc2Nyb2xsQ2xpZW50UmVjdDogYW55ID0gc2Nyb2xsRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0XHRcdGlmICh0aGlzLmhvcml6b250YWwpIHtcblx0XHRcdFx0b2Zmc2V0ICs9IGVsZW1lbnRDbGllbnRSZWN0LmxlZnQgLSBzY3JvbGxDbGllbnRSZWN0LmxlZnQ7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0b2Zmc2V0ICs9IGVsZW1lbnRDbGllbnRSZWN0LnRvcCAtIHNjcm9sbENsaWVudFJlY3QudG9wO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoISh0aGlzLnBhcmVudFNjcm9sbCBpbnN0YW5jZW9mIFdpbmRvdykpIHtcblx0XHRcdFx0b2Zmc2V0ICs9IHNjcm9sbEVsZW1lbnRbdGhpcy5fc2Nyb2xsVHlwZV07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9mZnNldDtcblx0fVxuXG5cdHByb3RlY3RlZCBjb3VudEl0ZW1zUGVyV3JhcEdyb3VwKCkge1xuXHRcdGxldCBwcm9wZXJ0eU5hbWU6IGFueSA9IHRoaXMuaG9yaXpvbnRhbCA/ICdvZmZzZXRMZWZ0JyA6ICdvZmZzZXRUb3AnO1xuXHRcdGxldCBjaGlsZHJlbjogYW55ID0gKCh0aGlzLmNvbnRhaW5lckVsZW1lbnRSZWYgJiYgdGhpcy5jb250YWluZXJFbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpIHx8IHRoaXMuY29udGVudEVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkuY2hpbGRyZW47XG5cblx0XHRsZXQgY2hpbGRyZW5MZW5ndGg6IGFueSA9IGNoaWxkcmVuID8gY2hpbGRyZW4ubGVuZ3RoIDogMDtcblx0XHRpZiAoY2hpbGRyZW5MZW5ndGggPT09IDApIHtcblx0XHRcdHJldHVybiAxO1xuXHRcdH1cblxuXHRcdGxldCBmaXJzdE9mZnNldDogYW55ID0gY2hpbGRyZW5bMF1bcHJvcGVydHlOYW1lXTtcblx0XHRsZXQgcmVzdWx0OiBhbnkgPSAxO1xuXHRcdHdoaWxlIChyZXN1bHQgPCBjaGlsZHJlbkxlbmd0aCAmJiBmaXJzdE9mZnNldCA9PT0gY2hpbGRyZW5bcmVzdWx0XVtwcm9wZXJ0eU5hbWVdKSB7XG5cdFx0XHQrK3Jlc3VsdDtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIGdldFNjcm9sbFBvc2l0aW9uKCk6IG51bWJlciB7XG5cdFx0bGV0IHdpbmRvd1Njcm9sbFZhbHVlOiBudW1iZXIgPSB1bmRlZmluZWQ7XG5cdFx0aWYgKHRoaXMucGFyZW50U2Nyb2xsIGluc3RhbmNlb2YgV2luZG93KSB7XG5cdFx0XHR2YXIgd2luZG93OiBhbnk7XG5cdFx0XHR3aW5kb3dTY3JvbGxWYWx1ZSA9IHdpbmRvd1t0aGlzLl9wYWdlT2Zmc2V0VHlwZV07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHdpbmRvd1Njcm9sbFZhbHVlIHx8IHRoaXMuZ2V0U2Nyb2xsRWxlbWVudCgpW3RoaXMuX3Njcm9sbFR5cGVdIHx8IDA7XG5cdH1cblxuXHRwcm90ZWN0ZWQgbWluTWVhc3VyZWRDaGlsZFdpZHRoOiBudW1iZXI7XG5cdHByb3RlY3RlZCBtaW5NZWFzdXJlZENoaWxkSGVpZ2h0OiBudW1iZXI7XG5cblx0cHJvdGVjdGVkIHdyYXBHcm91cERpbWVuc2lvbnM6IGFueTtcblxuXHRwcm90ZWN0ZWQgcmVzZXRXcmFwR3JvdXBEaW1lbnNpb25zKCk6IHZvaWQge1xuXHRcdGNvbnN0IG9sZFdyYXBHcm91cERpbWVuc2lvbnMgPSB0aGlzLndyYXBHcm91cERpbWVuc2lvbnM7XG5cdFx0dGhpcy53cmFwR3JvdXBEaW1lbnNpb25zID0ge1xuXHRcdFx0bWF4Q2hpbGRTaXplUGVyV3JhcEdyb3VwOiBbXSxcblx0XHRcdG51bWJlck9mS25vd25XcmFwR3JvdXBDaGlsZFNpemVzOiAwLFxuXHRcdFx0c3VtT2ZLbm93bldyYXBHcm91cENoaWxkV2lkdGhzOiAwLFxuXHRcdFx0c3VtT2ZLbm93bldyYXBHcm91cENoaWxkSGVpZ2h0czogMFxuXHRcdH07XG5cblx0XHRpZiAoIXRoaXMuZW5hYmxlVW5lcXVhbENoaWxkcmVuU2l6ZXMgfHwgIW9sZFdyYXBHcm91cERpbWVuc2lvbnMgfHwgb2xkV3JhcEdyb3VwRGltZW5zaW9ucy5udW1iZXJPZktub3duV3JhcEdyb3VwQ2hpbGRTaXplcyA9PT0gMCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGNvbnN0IGl0ZW1zUGVyV3JhcEdyb3VwOiBudW1iZXIgPSB0aGlzLmNvdW50SXRlbXNQZXJXcmFwR3JvdXAoKTtcblx0XHRmb3IgKGxldCB3cmFwR3JvdXBJbmRleDogYW55ID0gMDsgd3JhcEdyb3VwSW5kZXggPCBvbGRXcmFwR3JvdXBEaW1lbnNpb25zLm1heENoaWxkU2l6ZVBlcldyYXBHcm91cC5sZW5ndGg7ICsrd3JhcEdyb3VwSW5kZXgpIHtcblx0XHRcdGNvbnN0IG9sZFdyYXBHcm91cERpbWVuc2lvbjogV3JhcEdyb3VwRGltZW5zaW9uID0gb2xkV3JhcEdyb3VwRGltZW5zaW9ucy5tYXhDaGlsZFNpemVQZXJXcmFwR3JvdXBbd3JhcEdyb3VwSW5kZXhdO1xuXHRcdFx0aWYgKCFvbGRXcmFwR3JvdXBEaW1lbnNpb24gfHwgIW9sZFdyYXBHcm91cERpbWVuc2lvbi5pdGVtcyB8fCAhb2xkV3JhcEdyb3VwRGltZW5zaW9uLml0ZW1zLmxlbmd0aCkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG9sZFdyYXBHcm91cERpbWVuc2lvbi5pdGVtcy5sZW5ndGggIT09IGl0ZW1zUGVyV3JhcEdyb3VwKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0bGV0IGl0ZW1zQ2hhbmdlZDogYW55ID0gZmFsc2U7XG5cdFx0XHRsZXQgYXJyYXlTdGFydEluZGV4OiBhbnkgPSBpdGVtc1BlcldyYXBHcm91cCAqIHdyYXBHcm91cEluZGV4O1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBpdGVtc1BlcldyYXBHcm91cDsgKytpKSB7XG5cdFx0XHRcdGlmICghdGhpcy5jb21wYXJlSXRlbXMob2xkV3JhcEdyb3VwRGltZW5zaW9uLml0ZW1zW2ldLCB0aGlzLml0ZW1zW2FycmF5U3RhcnRJbmRleCArIGldKSkge1xuXHRcdFx0XHRcdGl0ZW1zQ2hhbmdlZCA9IHRydWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKCFpdGVtc0NoYW5nZWQpIHtcblx0XHRcdFx0Kyt0aGlzLndyYXBHcm91cERpbWVuc2lvbnMubnVtYmVyT2ZLbm93bldyYXBHcm91cENoaWxkU2l6ZXM7XG5cdFx0XHRcdHRoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5zdW1PZktub3duV3JhcEdyb3VwQ2hpbGRXaWR0aHMgKz0gb2xkV3JhcEdyb3VwRGltZW5zaW9uLmNoaWxkV2lkdGggfHwgMDtcblx0XHRcdFx0dGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLnN1bU9mS25vd25XcmFwR3JvdXBDaGlsZEhlaWdodHMgKz0gb2xkV3JhcEdyb3VwRGltZW5zaW9uLmNoaWxkSGVpZ2h0IHx8IDA7XG5cdFx0XHRcdHRoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5tYXhDaGlsZFNpemVQZXJXcmFwR3JvdXBbd3JhcEdyb3VwSW5kZXhdID0gb2xkV3JhcEdyb3VwRGltZW5zaW9uO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHByb3RlY3RlZCBjYWxjdWxhdGVEaW1lbnNpb25zKCk6IElEaW1lbnNpb25zIHtcblx0XHRsZXQgc2Nyb2xsRWxlbWVudDogYW55ID0gdGhpcy5nZXRTY3JvbGxFbGVtZW50KCk7XG5cdFx0bGV0IGl0ZW1Db3VudDogYW55ID0gdGhpcy5pdGVtcy5sZW5ndGg7XG5cblx0XHRjb25zdCBtYXhDYWxjdWxhdGVkU2Nyb2xsQmFyU2l6ZTogbnVtYmVyID0gMjU7IC8vIE5vdGU6IEZvcm11bGEgdG8gYXV0by1jYWxjdWxhdGUgZG9lc24ndCB3b3JrIGZvciBQYXJlbnRTY3JvbGwsIHNvIHdlIGRlZmF1bHQgdG8gdGhpcyBpZiBub3Qgc2V0IGJ5IGNvbnN1bWluZyBhcHBsaWNhdGlvblxuXHRcdHRoaXMuY2FsY3VsYXRlZFNjcm9sbGJhckhlaWdodCA9IE1hdGgubWF4KE1hdGgubWluKHNjcm9sbEVsZW1lbnQub2Zmc2V0SGVpZ2h0IC0gc2Nyb2xsRWxlbWVudC5jbGllbnRIZWlnaHQsIG1heENhbGN1bGF0ZWRTY3JvbGxCYXJTaXplKSwgdGhpcy5jYWxjdWxhdGVkU2Nyb2xsYmFySGVpZ2h0KTtcblx0XHR0aGlzLmNhbGN1bGF0ZWRTY3JvbGxiYXJXaWR0aCA9IE1hdGgubWF4KE1hdGgubWluKHNjcm9sbEVsZW1lbnQub2Zmc2V0V2lkdGggLSBzY3JvbGxFbGVtZW50LmNsaWVudFdpZHRoLCBtYXhDYWxjdWxhdGVkU2Nyb2xsQmFyU2l6ZSksIHRoaXMuY2FsY3VsYXRlZFNjcm9sbGJhcldpZHRoKTtcblxuXHRcdGxldCB2aWV3V2lkdGg6IGFueSA9IHNjcm9sbEVsZW1lbnQub2Zmc2V0V2lkdGggLSAodGhpcy5zY3JvbGxiYXJXaWR0aCB8fCB0aGlzLmNhbGN1bGF0ZWRTY3JvbGxiYXJXaWR0aCB8fCAodGhpcy5ob3Jpem9udGFsID8gMCA6IG1heENhbGN1bGF0ZWRTY3JvbGxCYXJTaXplKSk7XG5cdFx0bGV0IHZpZXdIZWlnaHQ6IGFueSA9IHNjcm9sbEVsZW1lbnQub2Zmc2V0SGVpZ2h0IC0gKHRoaXMuc2Nyb2xsYmFySGVpZ2h0IHx8IHRoaXMuY2FsY3VsYXRlZFNjcm9sbGJhckhlaWdodCB8fCAodGhpcy5ob3Jpem9udGFsID8gbWF4Q2FsY3VsYXRlZFNjcm9sbEJhclNpemUgOiAwKSk7XG5cblx0XHRsZXQgY29udGVudDogYW55ID0gKHRoaXMuY29udGFpbmVyRWxlbWVudFJlZiAmJiB0aGlzLmNvbnRhaW5lckVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkgfHwgdGhpcy5jb250ZW50RWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuXG5cdFx0bGV0IGl0ZW1zUGVyV3JhcEdyb3VwOiBhbnkgPSB0aGlzLmNvdW50SXRlbXNQZXJXcmFwR3JvdXAoKTtcblx0XHRsZXQgd3JhcEdyb3Vwc1BlclBhZ2U6IGFueTtcblxuXHRcdGxldCBkZWZhdWx0Q2hpbGRXaWR0aDogYW55O1xuXHRcdGxldCBkZWZhdWx0Q2hpbGRIZWlnaHQ6IGFueTtcblxuXHRcdGlmICghdGhpcy5lbmFibGVVbmVxdWFsQ2hpbGRyZW5TaXplcykge1xuXHRcdFx0aWYgKGNvbnRlbnQuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRpZiAoIXRoaXMuY2hpbGRXaWR0aCB8fCAhdGhpcy5jaGlsZEhlaWdodCkge1xuXHRcdFx0XHRcdGlmICghdGhpcy5taW5NZWFzdXJlZENoaWxkV2lkdGggJiYgdmlld1dpZHRoID4gMCkge1xuXHRcdFx0XHRcdFx0dGhpcy5taW5NZWFzdXJlZENoaWxkV2lkdGggPSB2aWV3V2lkdGg7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmICghdGhpcy5taW5NZWFzdXJlZENoaWxkSGVpZ2h0ICYmIHZpZXdIZWlnaHQgPiAwKSB7XG5cdFx0XHRcdFx0XHR0aGlzLm1pbk1lYXN1cmVkQ2hpbGRIZWlnaHQgPSB2aWV3SGVpZ2h0O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBjaGlsZDogYW55ID0gY29udGVudC5jaGlsZHJlblswXTtcblx0XHRcdFx0bGV0IGNsaWVudFJlY3Q6IGFueSA9IGNoaWxkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0XHR0aGlzLm1pbk1lYXN1cmVkQ2hpbGRXaWR0aCA9IE1hdGgubWluKHRoaXMubWluTWVhc3VyZWRDaGlsZFdpZHRoLCBjbGllbnRSZWN0LndpZHRoKTtcblx0XHRcdFx0dGhpcy5taW5NZWFzdXJlZENoaWxkSGVpZ2h0ID0gTWF0aC5taW4odGhpcy5taW5NZWFzdXJlZENoaWxkSGVpZ2h0LCBjbGllbnRSZWN0LmhlaWdodCk7XG5cdFx0XHR9XG5cblx0XHRcdGRlZmF1bHRDaGlsZFdpZHRoID0gdGhpcy5jaGlsZFdpZHRoIHx8IHRoaXMubWluTWVhc3VyZWRDaGlsZFdpZHRoIHx8IHZpZXdXaWR0aDtcblx0XHRcdGRlZmF1bHRDaGlsZEhlaWdodCA9IHRoaXMuY2hpbGRIZWlnaHQgfHwgdGhpcy5taW5NZWFzdXJlZENoaWxkSGVpZ2h0IHx8IHZpZXdIZWlnaHQ7XG5cdFx0XHRsZXQgaXRlbXNQZXJSb3c6IGFueSA9IE1hdGgubWF4KE1hdGguY2VpbCh2aWV3V2lkdGggLyBkZWZhdWx0Q2hpbGRXaWR0aCksIDEpO1xuXHRcdFx0bGV0IGl0ZW1zUGVyQ29sOiBhbnkgPSBNYXRoLm1heChNYXRoLmNlaWwodmlld0hlaWdodCAvIGRlZmF1bHRDaGlsZEhlaWdodCksIDEpO1xuXHRcdFx0d3JhcEdyb3Vwc1BlclBhZ2UgPSB0aGlzLmhvcml6b250YWwgPyBpdGVtc1BlclJvdyA6IGl0ZW1zUGVyQ29sO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsZXQgc2Nyb2xsT2Zmc2V0OiBhbnkgPSBzY3JvbGxFbGVtZW50W3RoaXMuX3Njcm9sbFR5cGVdIC0gKHRoaXMucHJldmlvdXNWaWV3UG9ydCA/IHRoaXMucHJldmlvdXNWaWV3UG9ydC5wYWRkaW5nIDogMCk7XG5cdFx0XHRcblx0XHRcdGxldCBhcnJheVN0YXJ0SW5kZXg6IGFueSA9IHRoaXMucHJldmlvdXNWaWV3UG9ydC5zdGFydEluZGV4V2l0aEJ1ZmZlciB8fCAwO1xuXHRcdFx0bGV0IHdyYXBHcm91cEluZGV4OiBhbnkgPSBNYXRoLmNlaWwoYXJyYXlTdGFydEluZGV4IC8gaXRlbXNQZXJXcmFwR3JvdXApO1xuXG5cdFx0XHRsZXQgbWF4V2lkdGhGb3JXcmFwR3JvdXA6IGFueSA9IDA7XG5cdFx0XHRsZXQgbWF4SGVpZ2h0Rm9yV3JhcEdyb3VwOiBhbnkgPSAwO1xuXHRcdFx0bGV0IHN1bU9mVmlzaWJsZU1heFdpZHRoczogYW55ID0gMDtcblx0XHRcdGxldCBzdW1PZlZpc2libGVNYXhIZWlnaHRzOiBhbnkgPSAwO1xuXHRcdFx0d3JhcEdyb3Vwc1BlclBhZ2UgPSAwO1xuXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGNvbnRlbnQuY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcblx0XHRcdFx0KythcnJheVN0YXJ0SW5kZXg7XG5cdFx0XHRcdGxldCBjaGlsZDogYW55ID0gY29udGVudC5jaGlsZHJlbltpXTtcblx0XHRcdFx0bGV0IGNsaWVudFJlY3Q6IGFueSA9IGNoaWxkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG5cdFx0XHRcdG1heFdpZHRoRm9yV3JhcEdyb3VwID0gTWF0aC5tYXgobWF4V2lkdGhGb3JXcmFwR3JvdXAsIGNsaWVudFJlY3Qud2lkdGgpO1xuXHRcdFx0XHRtYXhIZWlnaHRGb3JXcmFwR3JvdXAgPSBNYXRoLm1heChtYXhIZWlnaHRGb3JXcmFwR3JvdXAsIGNsaWVudFJlY3QuaGVpZ2h0KTtcblxuXHRcdFx0XHRpZiAoYXJyYXlTdGFydEluZGV4ICUgaXRlbXNQZXJXcmFwR3JvdXAgPT09IDApIHtcblx0XHRcdFx0XHRsZXQgb2xkVmFsdWU6IGFueSA9IHRoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5tYXhDaGlsZFNpemVQZXJXcmFwR3JvdXBbd3JhcEdyb3VwSW5kZXhdO1xuXHRcdFx0XHRcdGlmIChvbGRWYWx1ZSkge1xuXHRcdFx0XHRcdFx0LS10aGlzLndyYXBHcm91cERpbWVuc2lvbnMubnVtYmVyT2ZLbm93bldyYXBHcm91cENoaWxkU2l6ZXM7XG5cdFx0XHRcdFx0XHR0aGlzLndyYXBHcm91cERpbWVuc2lvbnMuc3VtT2ZLbm93bldyYXBHcm91cENoaWxkV2lkdGhzIC09IG9sZFZhbHVlLmNoaWxkV2lkdGggfHwgMDtcblx0XHRcdFx0XHRcdHRoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5zdW1PZktub3duV3JhcEdyb3VwQ2hpbGRIZWlnaHRzIC09IG9sZFZhbHVlLmNoaWxkSGVpZ2h0IHx8IDA7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Kyt0aGlzLndyYXBHcm91cERpbWVuc2lvbnMubnVtYmVyT2ZLbm93bldyYXBHcm91cENoaWxkU2l6ZXM7XG5cdFx0XHRcdFx0Y29uc3QgaXRlbXMgPSB0aGlzLml0ZW1zLnNsaWNlKGFycmF5U3RhcnRJbmRleCAtIGl0ZW1zUGVyV3JhcEdyb3VwLCBhcnJheVN0YXJ0SW5kZXgpO1xuXHRcdFx0XHRcdHRoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5tYXhDaGlsZFNpemVQZXJXcmFwR3JvdXBbd3JhcEdyb3VwSW5kZXhdID0ge1xuXHRcdFx0XHRcdFx0Y2hpbGRXaWR0aDogbWF4V2lkdGhGb3JXcmFwR3JvdXAsXG5cdFx0XHRcdFx0XHRjaGlsZEhlaWdodDogbWF4SGVpZ2h0Rm9yV3JhcEdyb3VwLFxuXHRcdFx0XHRcdFx0aXRlbXM6IGl0ZW1zXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHR0aGlzLndyYXBHcm91cERpbWVuc2lvbnMuc3VtT2ZLbm93bldyYXBHcm91cENoaWxkV2lkdGhzICs9IG1heFdpZHRoRm9yV3JhcEdyb3VwO1xuXHRcdFx0XHRcdHRoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5zdW1PZktub3duV3JhcEdyb3VwQ2hpbGRIZWlnaHRzICs9IG1heEhlaWdodEZvcldyYXBHcm91cDtcblxuXHRcdFx0XHRcdGlmICh0aGlzLmhvcml6b250YWwpIHtcblx0XHRcdFx0XHRcdGxldCBtYXhWaXNpYmxlV2lkdGhGb3JXcmFwR3JvdXA6IGFueSA9IE1hdGgubWluKG1heFdpZHRoRm9yV3JhcEdyb3VwLCBNYXRoLm1heCh2aWV3V2lkdGggLSBzdW1PZlZpc2libGVNYXhXaWR0aHMsIDApKTtcblx0XHRcdFx0XHRcdGlmIChzY3JvbGxPZmZzZXQgPiAwKSB7XG5cdFx0XHRcdFx0XHRcdGxldCBzY3JvbGxPZmZzZXRUb1JlbW92ZTogYW55ID0gTWF0aC5taW4oc2Nyb2xsT2Zmc2V0LCBtYXhWaXNpYmxlV2lkdGhGb3JXcmFwR3JvdXApO1xuXHRcdFx0XHRcdFx0XHRtYXhWaXNpYmxlV2lkdGhGb3JXcmFwR3JvdXAgLT0gc2Nyb2xsT2Zmc2V0VG9SZW1vdmU7XG5cdFx0XHRcdFx0XHRcdHNjcm9sbE9mZnNldCAtPSBzY3JvbGxPZmZzZXRUb1JlbW92ZTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0c3VtT2ZWaXNpYmxlTWF4V2lkdGhzICs9IG1heFZpc2libGVXaWR0aEZvcldyYXBHcm91cDtcblx0XHRcdFx0XHRcdGlmIChtYXhWaXNpYmxlV2lkdGhGb3JXcmFwR3JvdXAgPiAwICYmIHZpZXdXaWR0aCA+PSBzdW1PZlZpc2libGVNYXhXaWR0aHMpIHtcblx0XHRcdFx0XHRcdFx0Kyt3cmFwR3JvdXBzUGVyUGFnZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0bGV0IG1heFZpc2libGVIZWlnaHRGb3JXcmFwR3JvdXA6IGFueSA9IE1hdGgubWluKG1heEhlaWdodEZvcldyYXBHcm91cCwgTWF0aC5tYXgodmlld0hlaWdodCAtIHN1bU9mVmlzaWJsZU1heEhlaWdodHMsIDApKTtcblx0XHRcdFx0XHRcdGlmIChzY3JvbGxPZmZzZXQgPiAwKSB7XG5cdFx0XHRcdFx0XHRcdGxldCBzY3JvbGxPZmZzZXRUb1JlbW92ZTogYW55ID0gTWF0aC5taW4oc2Nyb2xsT2Zmc2V0LCBtYXhWaXNpYmxlSGVpZ2h0Rm9yV3JhcEdyb3VwKTtcblx0XHRcdFx0XHRcdFx0bWF4VmlzaWJsZUhlaWdodEZvcldyYXBHcm91cCAtPSBzY3JvbGxPZmZzZXRUb1JlbW92ZTtcblx0XHRcdFx0XHRcdFx0c2Nyb2xsT2Zmc2V0IC09IHNjcm9sbE9mZnNldFRvUmVtb3ZlO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRzdW1PZlZpc2libGVNYXhIZWlnaHRzICs9IG1heFZpc2libGVIZWlnaHRGb3JXcmFwR3JvdXA7XG5cdFx0XHRcdFx0XHRpZiAobWF4VmlzaWJsZUhlaWdodEZvcldyYXBHcm91cCA+IDAgJiYgdmlld0hlaWdodCA+PSBzdW1PZlZpc2libGVNYXhIZWlnaHRzKSB7XG5cdFx0XHRcdFx0XHRcdCsrd3JhcEdyb3Vwc1BlclBhZ2U7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Kyt3cmFwR3JvdXBJbmRleDtcblxuXHRcdFx0XHRcdG1heFdpZHRoRm9yV3JhcEdyb3VwID0gMDtcblx0XHRcdFx0XHRtYXhIZWlnaHRGb3JXcmFwR3JvdXAgPSAwO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGxldCBhdmVyYWdlQ2hpbGRXaWR0aDogYW55ID0gdGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLnN1bU9mS25vd25XcmFwR3JvdXBDaGlsZFdpZHRocyAvIHRoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5udW1iZXJPZktub3duV3JhcEdyb3VwQ2hpbGRTaXplcztcblx0XHRcdGxldCBhdmVyYWdlQ2hpbGRIZWlnaHQ6IGFueSA9IHRoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5zdW1PZktub3duV3JhcEdyb3VwQ2hpbGRIZWlnaHRzIC8gdGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLm51bWJlck9mS25vd25XcmFwR3JvdXBDaGlsZFNpemVzO1xuXHRcdFx0ZGVmYXVsdENoaWxkV2lkdGggPSB0aGlzLmNoaWxkV2lkdGggfHwgYXZlcmFnZUNoaWxkV2lkdGggfHwgdmlld1dpZHRoO1xuXHRcdFx0ZGVmYXVsdENoaWxkSGVpZ2h0ID0gdGhpcy5jaGlsZEhlaWdodCB8fCBhdmVyYWdlQ2hpbGRIZWlnaHQgfHwgdmlld0hlaWdodDtcblxuXHRcdFx0aWYgKHRoaXMuaG9yaXpvbnRhbCkge1xuXHRcdFx0XHRpZiAodmlld1dpZHRoID4gc3VtT2ZWaXNpYmxlTWF4V2lkdGhzKSB7XG5cdFx0XHRcdFx0d3JhcEdyb3Vwc1BlclBhZ2UgKz0gTWF0aC5jZWlsKCh2aWV3V2lkdGggLSBzdW1PZlZpc2libGVNYXhXaWR0aHMpIC8gZGVmYXVsdENoaWxkV2lkdGgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAodmlld0hlaWdodCA+IHN1bU9mVmlzaWJsZU1heEhlaWdodHMpIHtcblx0XHRcdFx0XHR3cmFwR3JvdXBzUGVyUGFnZSArPSBNYXRoLmNlaWwoKHZpZXdIZWlnaHQgLSBzdW1PZlZpc2libGVNYXhIZWlnaHRzKSAvIGRlZmF1bHRDaGlsZEhlaWdodCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRsZXQgaXRlbXNQZXJQYWdlOiBhbnkgPSBpdGVtc1BlcldyYXBHcm91cCAqIHdyYXBHcm91cHNQZXJQYWdlO1xuXHRcdGxldCBwYWdlQ291bnRfZnJhY3Rpb25hbDogYW55ID0gaXRlbUNvdW50IC8gaXRlbXNQZXJQYWdlO1xuXHRcdGxldCBudW1iZXJPZldyYXBHcm91cHM6IGFueSA9IE1hdGguY2VpbChpdGVtQ291bnQgLyBpdGVtc1BlcldyYXBHcm91cCk7XG5cblx0XHRsZXQgc2Nyb2xsTGVuZ3RoOiBhbnkgPSAwO1xuXG5cdFx0bGV0IGRlZmF1bHRTY3JvbGxMZW5ndGhQZXJXcmFwR3JvdXA6IGFueSA9IHRoaXMuaG9yaXpvbnRhbCA/IGRlZmF1bHRDaGlsZFdpZHRoIDogZGVmYXVsdENoaWxkSGVpZ2h0O1xuXHRcdGlmICh0aGlzLmVuYWJsZVVuZXF1YWxDaGlsZHJlblNpemVzKSB7XG5cdFx0XHRsZXQgbnVtVW5rbm93bkNoaWxkU2l6ZXM6YW55ID0gMDtcblx0XHRcdGZvciAobGV0IGk6YW55ID0gMDsgaSA8IG51bWJlck9mV3JhcEdyb3VwczsgKytpKSB7XG5cdFx0XHRcdGxldCBjaGlsZFNpemU6IGFueSA9IHRoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5tYXhDaGlsZFNpemVQZXJXcmFwR3JvdXBbaV0gJiYgdGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLm1heENoaWxkU2l6ZVBlcldyYXBHcm91cFtpXVt0aGlzLl9jaGlsZFNjcm9sbERpbV07XG5cdFx0XHRcdGlmIChjaGlsZFNpemUpIHtcblx0XHRcdFx0XHRzY3JvbGxMZW5ndGggKz0gY2hpbGRTaXplO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCsrbnVtVW5rbm93bkNoaWxkU2l6ZXM7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0c2Nyb2xsTGVuZ3RoICs9IE1hdGgucm91bmQobnVtVW5rbm93bkNoaWxkU2l6ZXMgKiBkZWZhdWx0U2Nyb2xsTGVuZ3RoUGVyV3JhcEdyb3VwKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c2Nyb2xsTGVuZ3RoID0gbnVtYmVyT2ZXcmFwR3JvdXBzICogZGVmYXVsdFNjcm9sbExlbmd0aFBlcldyYXBHcm91cDtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0aXRlbUNvdW50OiBpdGVtQ291bnQsXG5cdFx0XHRpdGVtc1BlcldyYXBHcm91cDogaXRlbXNQZXJXcmFwR3JvdXAsXG5cdFx0XHR3cmFwR3JvdXBzUGVyUGFnZTogd3JhcEdyb3Vwc1BlclBhZ2UsXG5cdFx0XHRpdGVtc1BlclBhZ2U6IGl0ZW1zUGVyUGFnZSxcblx0XHRcdHBhZ2VDb3VudF9mcmFjdGlvbmFsOiBwYWdlQ291bnRfZnJhY3Rpb25hbCxcblx0XHRcdGNoaWxkV2lkdGg6IGRlZmF1bHRDaGlsZFdpZHRoLFxuXHRcdFx0Y2hpbGRIZWlnaHQ6IGRlZmF1bHRDaGlsZEhlaWdodCxcblx0XHRcdHNjcm9sbExlbmd0aDogc2Nyb2xsTGVuZ3RoXG5cdFx0fTtcblx0fVxuXG5cdHByb3RlY3RlZCBjYWNoZWRQYWdlU2l6ZTogbnVtYmVyID0gMDtcblx0cHJvdGVjdGVkIHByZXZpb3VzU2Nyb2xsTnVtYmVyRWxlbWVudHM6IG51bWJlciA9IDA7XG5cblx0cHJvdGVjdGVkIGNhbGN1bGF0ZVBhZGRpbmcoYXJyYXlTdGFydEluZGV4V2l0aEJ1ZmZlcjogbnVtYmVyLCBkaW1lbnNpb25zOiBhbnksIGFsbG93VW5lcXVhbENoaWxkcmVuU2l6ZXNfRXhwZXJpbWVudGFsOiBib29sZWFuKTogbnVtYmVyIHtcblx0XHRpZiAoZGltZW5zaW9ucy5pdGVtQ291bnQgPT09IDApIHtcblx0XHRcdHJldHVybiAwO1xuXHRcdH1cblxuXHRcdGxldCBkZWZhdWx0U2Nyb2xsTGVuZ3RoUGVyV3JhcEdyb3VwOiBudW1iZXIgPSBkaW1lbnNpb25zW3RoaXMuX2NoaWxkU2Nyb2xsRGltXTtcblx0XHRsZXQgc3RhcnRpbmdXcmFwR3JvdXBJbmRleDogbnVtYmVyID0gTWF0aC5jZWlsKGFycmF5U3RhcnRJbmRleFdpdGhCdWZmZXIgLyBkaW1lbnNpb25zLml0ZW1zUGVyV3JhcEdyb3VwKSB8fCAwO1xuXG5cdFx0aWYgKCF0aGlzLmVuYWJsZVVuZXF1YWxDaGlsZHJlblNpemVzKSB7XG5cdFx0XHRyZXR1cm4gZGVmYXVsdFNjcm9sbExlbmd0aFBlcldyYXBHcm91cCAqIHN0YXJ0aW5nV3JhcEdyb3VwSW5kZXg7XG5cdFx0fVxuXG5cdFx0bGV0IG51bVVua25vd25DaGlsZFNpemVzOiBhbnkgPSAwO1xuXHRcdGxldCByZXN1bHQ6IGFueSA9IDA7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzdGFydGluZ1dyYXBHcm91cEluZGV4OyArK2kpIHtcblx0XHRcdGxldCBjaGlsZFNpemU6IFdyYXBHcm91cERpbWVuc2lvbiA9IHRoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5tYXhDaGlsZFNpemVQZXJXcmFwR3JvdXBbaV0gJiYgdGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLm1heENoaWxkU2l6ZVBlcldyYXBHcm91cFtpXVt0aGlzLl9jaGlsZFNjcm9sbERpbV07XG5cdFx0XHRpZiAoY2hpbGRTaXplKSB7XG5cdFx0XHRcdHJlc3VsdCArPSBjaGlsZFNpemU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQrK251bVVua25vd25DaGlsZFNpemVzO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXN1bHQgKz0gTWF0aC5yb3VuZChudW1Vbmtub3duQ2hpbGRTaXplcyAqIGRlZmF1bHRTY3JvbGxMZW5ndGhQZXJXcmFwR3JvdXApO1xuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdHByb3RlY3RlZCBjYWxjdWxhdGVQYWdlSW5mbyhzY3JvbGxQb3NpdGlvbjogbnVtYmVyLCBkaW1lbnNpb25zOiBhbnkpOiBJUGFnZUluZm9XaXRoQnVmZmVyIHtcblx0XHRsZXQgc2Nyb2xsUGVyY2VudGFnZTogYW55ID0gMDtcblx0XHRpZiAodGhpcy5lbmFibGVVbmVxdWFsQ2hpbGRyZW5TaXplcykge1xuXHRcdFx0Y29uc3QgbnVtYmVyT2ZXcmFwR3JvdXBzOmFueSA9IE1hdGguY2VpbChkaW1lbnNpb25zLml0ZW1Db3VudCAvIGRpbWVuc2lvbnMuaXRlbXNQZXJXcmFwR3JvdXApO1xuXHRcdFx0bGV0IHRvdGFsU2Nyb2xsZWRMZW5ndGg6IGFueSA9IDA7XG5cdFx0XHRsZXQgZGVmYXVsdFNjcm9sbExlbmd0aFBlcldyYXBHcm91cDogYW55ID0gZGltZW5zaW9uc1t0aGlzLl9jaGlsZFNjcm9sbERpbV07XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IG51bWJlck9mV3JhcEdyb3VwczsgKytpKSB7XG5cdFx0XHRcdGxldCBjaGlsZFNpemU6IGFueSA9IHRoaXMud3JhcEdyb3VwRGltZW5zaW9ucy5tYXhDaGlsZFNpemVQZXJXcmFwR3JvdXBbaV0gJiYgdGhpcy53cmFwR3JvdXBEaW1lbnNpb25zLm1heENoaWxkU2l6ZVBlcldyYXBHcm91cFtpXVt0aGlzLl9jaGlsZFNjcm9sbERpbV07XG5cdFx0XHRcdGlmIChjaGlsZFNpemUpIHtcblx0XHRcdFx0XHR0b3RhbFNjcm9sbGVkTGVuZ3RoICs9IGNoaWxkU2l6ZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0b3RhbFNjcm9sbGVkTGVuZ3RoICs9IGRlZmF1bHRTY3JvbGxMZW5ndGhQZXJXcmFwR3JvdXA7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoc2Nyb2xsUG9zaXRpb24gPCB0b3RhbFNjcm9sbGVkTGVuZ3RoKSB7XG5cdFx0XHRcdFx0c2Nyb2xsUGVyY2VudGFnZSA9IGkgLyBudW1iZXJPZldyYXBHcm91cHM7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0c2Nyb2xsUGVyY2VudGFnZSA9IHNjcm9sbFBvc2l0aW9uIC8gZGltZW5zaW9ucy5zY3JvbGxMZW5ndGg7XG5cdFx0fVxuXG5cdFx0bGV0IHN0YXJ0aW5nQXJyYXlJbmRleF9mcmFjdGlvbmFsOiBhbnkgPSBNYXRoLm1pbihNYXRoLm1heChzY3JvbGxQZXJjZW50YWdlICogZGltZW5zaW9ucy5wYWdlQ291bnRfZnJhY3Rpb25hbCwgMCksIGRpbWVuc2lvbnMucGFnZUNvdW50X2ZyYWN0aW9uYWwpICogZGltZW5zaW9ucy5pdGVtc1BlclBhZ2U7XG5cblx0XHRsZXQgbWF4U3RhcnQ6IGFueSA9IGRpbWVuc2lvbnMuaXRlbUNvdW50IC0gZGltZW5zaW9ucy5pdGVtc1BlclBhZ2UgLSAxO1xuXHRcdGxldCBhcnJheVN0YXJ0SW5kZXg6IGFueSA9IE1hdGgubWluKE1hdGguZmxvb3Ioc3RhcnRpbmdBcnJheUluZGV4X2ZyYWN0aW9uYWwpLCBtYXhTdGFydCk7XG5cdFx0YXJyYXlTdGFydEluZGV4IC09IGFycmF5U3RhcnRJbmRleCAlIGRpbWVuc2lvbnMuaXRlbXNQZXJXcmFwR3JvdXA7IC8vIHJvdW5kIGRvd24gdG8gc3RhcnQgb2Ygd3JhcEdyb3VwXG5cblx0XHRsZXQgYXJyYXlFbmRJbmRleDogYW55ID0gTWF0aC5jZWlsKHN0YXJ0aW5nQXJyYXlJbmRleF9mcmFjdGlvbmFsKSArIGRpbWVuc2lvbnMuaXRlbXNQZXJQYWdlIC0gMTtcblx0XHRhcnJheUVuZEluZGV4ICs9IChkaW1lbnNpb25zLml0ZW1zUGVyV3JhcEdyb3VwIC0gKChhcnJheUVuZEluZGV4ICsgMSkgJSBkaW1lbnNpb25zLml0ZW1zUGVyV3JhcEdyb3VwKSk7IC8vIHJvdW5kIHVwIHRvIGVuZCBvZiB3cmFwR3JvdXBcblxuXHRcdGlmIChpc05hTihhcnJheVN0YXJ0SW5kZXgpKSB7XG5cdFx0XHRhcnJheVN0YXJ0SW5kZXggPSAwO1xuXHRcdH1cblx0XHRpZiAoaXNOYU4oYXJyYXlFbmRJbmRleCkpIHtcblx0XHRcdGFycmF5RW5kSW5kZXggPSAwO1xuXHRcdH1cblxuXHRcdGFycmF5U3RhcnRJbmRleCA9IE1hdGgubWluKE1hdGgubWF4KGFycmF5U3RhcnRJbmRleCwgMCksIGRpbWVuc2lvbnMuaXRlbUNvdW50IC0gMSk7XG5cdFx0YXJyYXlFbmRJbmRleCA9IE1hdGgubWluKE1hdGgubWF4KGFycmF5RW5kSW5kZXgsIDApLCBkaW1lbnNpb25zLml0ZW1Db3VudCAtIDEpO1xuXG5cdFx0bGV0IGJ1ZmZlclNpemU6IGFueSA9IHRoaXMuYnVmZmVyQW1vdW50ICogZGltZW5zaW9ucy5pdGVtc1BlcldyYXBHcm91cDtcblx0XHRsZXQgc3RhcnRJbmRleFdpdGhCdWZmZXI6IGFueSA9IE1hdGgubWluKE1hdGgubWF4KGFycmF5U3RhcnRJbmRleCAtIGJ1ZmZlclNpemUsIDApLCBkaW1lbnNpb25zLml0ZW1Db3VudCAtIDEpO1xuXHRcdGxldCBlbmRJbmRleFdpdGhCdWZmZXI6IGFueSA9IE1hdGgubWluKE1hdGgubWF4KGFycmF5RW5kSW5kZXggKyBidWZmZXJTaXplLCAwKSwgZGltZW5zaW9ucy5pdGVtQ291bnQgLSAxKTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHRzdGFydEluZGV4OiBhcnJheVN0YXJ0SW5kZXgsXG5cdFx0XHRlbmRJbmRleDogYXJyYXlFbmRJbmRleCxcblx0XHRcdHN0YXJ0SW5kZXhXaXRoQnVmZmVyOiBzdGFydEluZGV4V2l0aEJ1ZmZlcixcblx0XHRcdGVuZEluZGV4V2l0aEJ1ZmZlcjogZW5kSW5kZXhXaXRoQnVmZmVyXG5cdFx0fTtcblx0fVxuXG5cdHByb3RlY3RlZCBjYWxjdWxhdGVWaWV3cG9ydCgpOiBJVmlld3BvcnQge1xuXHRcdGxldCBkaW1lbnNpb25zOiBJRGltZW5zaW9ucyA9IHRoaXMuY2FsY3VsYXRlRGltZW5zaW9ucygpO1xuXHRcdGxldCBvZmZzZXQ6IGFueSA9IHRoaXMuZ2V0RWxlbWVudHNPZmZzZXQoKTtcblxuXHRcdGxldCBzY3JvbGxQb3NpdGlvbjogYW55ID0gdGhpcy5nZXRTY3JvbGxQb3NpdGlvbigpO1xuXHRcdGlmIChzY3JvbGxQb3NpdGlvbiA+IGRpbWVuc2lvbnMuc2Nyb2xsTGVuZ3RoICYmICEodGhpcy5wYXJlbnRTY3JvbGwgaW5zdGFuY2VvZiBXaW5kb3cpKSB7XG5cdFx0XHRzY3JvbGxQb3NpdGlvbiA9IGRpbWVuc2lvbnMuc2Nyb2xsTGVuZ3RoO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzY3JvbGxQb3NpdGlvbiAtPSBvZmZzZXQ7XG5cdFx0fVxuXHRcdHNjcm9sbFBvc2l0aW9uID0gTWF0aC5tYXgoMCwgc2Nyb2xsUG9zaXRpb24pO1xuXG5cdFx0bGV0IHBhZ2VJbmZvOiBhbnkgPSB0aGlzLmNhbGN1bGF0ZVBhZ2VJbmZvKHNjcm9sbFBvc2l0aW9uLCBkaW1lbnNpb25zKTtcblx0XHRsZXQgbmV3UGFkZGluZzogYW55ID0gdGhpcy5jYWxjdWxhdGVQYWRkaW5nKHBhZ2VJbmZvLnN0YXJ0SW5kZXhXaXRoQnVmZmVyLCBkaW1lbnNpb25zLCB0cnVlKTtcblx0XHRsZXQgbmV3U2Nyb2xsTGVuZ3RoOiBhbnkgPSBkaW1lbnNpb25zLnNjcm9sbExlbmd0aDtcblxuXHRcdHJldHVybiB7XG5cdFx0XHRzdGFydEluZGV4OiBwYWdlSW5mby5zdGFydEluZGV4LFxuXHRcdFx0ZW5kSW5kZXg6IHBhZ2VJbmZvLmVuZEluZGV4LFxuXHRcdFx0c3RhcnRJbmRleFdpdGhCdWZmZXI6IHBhZ2VJbmZvLnN0YXJ0SW5kZXhXaXRoQnVmZmVyLFxuXHRcdFx0ZW5kSW5kZXhXaXRoQnVmZmVyOiBwYWdlSW5mby5lbmRJbmRleFdpdGhCdWZmZXIsXG5cdFx0XHRwYWRkaW5nOiBNYXRoLnJvdW5kKG5ld1BhZGRpbmcpLFxuXHRcdFx0c2Nyb2xsTGVuZ3RoOiBNYXRoLnJvdW5kKG5ld1Njcm9sbExlbmd0aClcblx0XHR9O1xuXHR9XG59XG4iLCJpbXBvcnQgeyBDb21wb25lbnQsIE9uSW5pdCwgSG9zdExpc3RlbmVyLCBPbkRlc3Ryb3ksIE5nTW9kdWxlLCBTaW1wbGVDaGFuZ2VzLCBPbkNoYW5nZXMsIENoYW5nZURldGVjdG9yUmVmLCBBZnRlclZpZXdDaGVja2VkLCBWaWV3RW5jYXBzdWxhdGlvbiwgQ29udGVudENoaWxkLCBWaWV3Q2hpbGQsIGZvcndhcmRSZWYsIElucHV0LCBPdXRwdXQsIEV2ZW50RW1pdHRlciwgRWxlbWVudFJlZiwgQWZ0ZXJWaWV3SW5pdCwgUGlwZSwgUGlwZVRyYW5zZm9ybSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRm9ybXNNb2R1bGUsIE5HX1ZBTFVFX0FDQ0VTU09SLCBDb250cm9sVmFsdWVBY2Nlc3NvciwgTkdfVkFMSURBVE9SUywgVmFsaWRhdG9yLCBGb3JtQ29udHJvbCB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBNeUV4Y2VwdGlvbiB9IGZyb20gJy4vbXVsdGlzZWxlY3QubW9kZWwnO1xuaW1wb3J0IHsgRHJvcGRvd25TZXR0aW5ncyB9IGZyb20gJy4vbXVsdGlzZWxlY3QuaW50ZXJmYWNlJztcbmltcG9ydCB7IENsaWNrT3V0c2lkZURpcmVjdGl2ZSwgU2Nyb2xsRGlyZWN0aXZlLCBzdHlsZURpcmVjdGl2ZSwgc2V0UG9zaXRpb24gfSBmcm9tICcuL2NsaWNrT3V0c2lkZSc7XG5pbXBvcnQgeyBMaXN0RmlsdGVyUGlwZSB9IGZyb20gJy4vbGlzdC1maWx0ZXInO1xuaW1wb3J0IHsgSXRlbSwgQmFkZ2UsIFNlYXJjaCwgVGVtcGxhdGVSZW5kZXJlciwgQ0ljb24gfSBmcm9tICcuL21lbnUtaXRlbSc7XG5pbXBvcnQgeyBEYXRhU2VydmljZSB9IGZyb20gJy4vbXVsdGlzZWxlY3Quc2VydmljZSc7XG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IFZpcnR1YWxTY3JvbGxDb21wb25lbnQsIENoYW5nZUV2ZW50IH0gZnJvbSAnLi92aXJ0dWFsLXNjcm9sbCc7XG5cbmV4cG9ydCBjb25zdCBEUk9QRE9XTl9DT05UUk9MX1ZBTFVFX0FDQ0VTU09SOiBhbnkgPSB7XG4gICAgcHJvdmlkZTogTkdfVkFMVUVfQUNDRVNTT1IsXG4gICAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gQW5ndWxhck11bHRpU2VsZWN0KSxcbiAgICBtdWx0aTogdHJ1ZVxufTtcbmV4cG9ydCBjb25zdCBEUk9QRE9XTl9DT05UUk9MX1ZBTElEQVRJT046IGFueSA9IHtcbiAgICBwcm92aWRlOiBOR19WQUxJREFUT1JTLFxuICAgIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IEFuZ3VsYXJNdWx0aVNlbGVjdCksXG4gICAgbXVsdGk6IHRydWUsXG59XG5jb25zdCBub29wID0gKCkgPT4ge1xufTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdhbmd1bGFyMi1tdWx0aXNlbGVjdCcsXG4gICAgdGVtcGxhdGVVcmw6ICcuL211bHRpc2VsZWN0LmNvbXBvbmVudC5odG1sJyxcbiAgICBob3N0OiB7ICdbY2xhc3NdJzogJ2RlZmF1bHRTZXR0aW5ncy5jbGFzc2VzJyB9LFxuICAgIHN0eWxlVXJsczogWycuL211bHRpc2VsZWN0LmNvbXBvbmVudC5zY3NzJ10sXG4gICAgcHJvdmlkZXJzOiBbRFJPUERPV05fQ09OVFJPTF9WQUxVRV9BQ0NFU1NPUiwgRFJPUERPV05fQ09OVFJPTF9WQUxJREFUSU9OXSxcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxufSlcblxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJNdWx0aVNlbGVjdCBpbXBsZW1lbnRzIE9uSW5pdCwgQ29udHJvbFZhbHVlQWNjZXNzb3IsIE9uQ2hhbmdlcywgVmFsaWRhdG9yLCBBZnRlclZpZXdDaGVja2VkLCBPbkRlc3Ryb3kge1xuXG4gICAgQElucHV0KClcbiAgICBkYXRhOiBBcnJheTxhbnk+O1xuXG4gICAgQElucHV0KClcbiAgICBzZXR0aW5nczogRHJvcGRvd25TZXR0aW5ncztcblxuICAgIEBJbnB1dCgpXG4gICAgbG9hZGluZzogYm9vbGVhbjtcblxuICAgIEBPdXRwdXQoJ29uU2VsZWN0JylcbiAgICBvblNlbGVjdDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcblxuICAgIEBPdXRwdXQoJ29uRGVTZWxlY3QnKVxuICAgIG9uRGVTZWxlY3Q6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG5cbiAgICBAT3V0cHV0KCdvblNlbGVjdEFsbCcpXG4gICAgb25TZWxlY3RBbGw6IEV2ZW50RW1pdHRlcjxBcnJheTxhbnk+PiA9IG5ldyBFdmVudEVtaXR0ZXI8QXJyYXk8YW55Pj4oKTtcblxuICAgIEBPdXRwdXQoJ29uRGVTZWxlY3RBbGwnKVxuICAgIG9uRGVTZWxlY3RBbGw6IEV2ZW50RW1pdHRlcjxBcnJheTxhbnk+PiA9IG5ldyBFdmVudEVtaXR0ZXI8QXJyYXk8YW55Pj4oKTtcblxuICAgIEBPdXRwdXQoJ29uT3BlbicpXG4gICAgb25PcGVuOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuXG4gICAgQE91dHB1dCgnb25DbG9zZScpXG4gICAgb25DbG9zZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcblxuICAgIEBPdXRwdXQoJ29uU2Nyb2xsVG9FbmQnKVxuICAgIG9uU2Nyb2xsVG9FbmQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG5cbiAgICBAT3V0cHV0KCdvbkZpbHRlclNlbGVjdEFsbCcpXG4gICAgb25GaWx0ZXJTZWxlY3RBbGw6IEV2ZW50RW1pdHRlcjxBcnJheTxhbnk+PiA9IG5ldyBFdmVudEVtaXR0ZXI8QXJyYXk8YW55Pj4oKTtcblxuICAgIEBPdXRwdXQoJ29uRmlsdGVyRGVTZWxlY3RBbGwnKVxuICAgIG9uRmlsdGVyRGVTZWxlY3RBbGw6IEV2ZW50RW1pdHRlcjxBcnJheTxhbnk+PiA9IG5ldyBFdmVudEVtaXR0ZXI8QXJyYXk8YW55Pj4oKTtcblxuICAgIEBPdXRwdXQoJ29uQWRkRmlsdGVyTmV3SXRlbScpXG4gICAgb25BZGRGaWx0ZXJOZXdJdGVtOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuXG4gICAgQENvbnRlbnRDaGlsZChJdGVtKSBpdGVtVGVtcGw6IEl0ZW07XG4gICAgQENvbnRlbnRDaGlsZChCYWRnZSkgYmFkZ2VUZW1wbDogQmFkZ2U7XG4gICAgQENvbnRlbnRDaGlsZChTZWFyY2gpIHNlYXJjaFRlbXBsOiBTZWFyY2g7XG5cblxuICAgIEBWaWV3Q2hpbGQoJ3NlYXJjaElucHV0Jykgc2VhcmNoSW5wdXQ6IEVsZW1lbnRSZWY7XG4gICAgQFZpZXdDaGlsZCgnc2VsZWN0ZWRMaXN0Jykgc2VsZWN0ZWRMaXN0RWxlbTogRWxlbWVudFJlZjtcbiAgICBAVmlld0NoaWxkKCdkcm9wZG93bkxpc3QnKSBkcm9wZG93bkxpc3RFbGVtOiBFbGVtZW50UmVmO1xuXG4gICAgQEhvc3RMaXN0ZW5lcignZG9jdW1lbnQ6a2V5dXAuZXNjYXBlJywgWyckZXZlbnQnXSlcbiAgICBvbkVzY2FwZURvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuZXNjYXBlVG9DbG9zZSkge1xuICAgICAgICAgICAgdGhpcy5jbG9zZURyb3Bkb3duKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmaWx0ZXJQaXBlOiBMaXN0RmlsdGVyUGlwZTtcbiAgICBwdWJsaWMgc2VsZWN0ZWRJdGVtczogQXJyYXk8YW55PjtcbiAgICBwdWJsaWMgaXNBY3RpdmU6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBwdWJsaWMgaXNTZWxlY3RBbGw6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBwdWJsaWMgaXNGaWx0ZXJTZWxlY3RBbGw6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBwdWJsaWMgaXNJbmZpbml0ZUZpbHRlclNlbGVjdEFsbDogYm9vbGVhbiA9IGZhbHNlO1xuICAgIHB1YmxpYyBncm91cGVkRGF0YTogQXJyYXk8YW55PjtcbiAgICBmaWx0ZXI6IGFueTtcbiAgICBwdWJsaWMgY2h1bmtBcnJheTogYW55W107XG4gICAgcHVibGljIHNjcm9sbFRvcDogYW55O1xuICAgIHB1YmxpYyBjaHVua0luZGV4OiBhbnlbXSA9IFtdO1xuICAgIHB1YmxpYyBjYWNoZWRJdGVtczogYW55W10gPSBbXTtcbiAgICBwdWJsaWMgZ3JvdXBDYWNoZWRJdGVtczogYW55W10gPSBbXTtcbiAgICBwdWJsaWMgdG90YWxSb3dzOiBhbnk7XG4gICAgcHVibGljIGl0ZW1IZWlnaHQ6IGFueSA9IDQxLjY7XG4gICAgcHVibGljIHNjcmVlbkl0ZW1zTGVuOiBhbnk7XG4gICAgcHVibGljIGNhY2hlZEl0ZW1zTGVuOiBhbnk7XG4gICAgcHVibGljIHRvdGFsSGVpZ2h0OiBhbnk7XG4gICAgcHVibGljIHNjcm9sbGVyOiBhbnk7XG4gICAgcHVibGljIG1heEJ1ZmZlcjogYW55O1xuICAgIHB1YmxpYyBsYXN0U2Nyb2xsZWQ6IGFueTtcbiAgICBwdWJsaWMgbGFzdFJlcGFpbnRZOiBhbnk7XG4gICAgcHVibGljIHNlbGVjdGVkTGlzdEhlaWdodDogYW55O1xuICAgIHB1YmxpYyBmaWx0ZXJMZW5ndGg6IGFueSA9IDA7XG4gICAgcHVibGljIGluZmluaXRlRmlsdGVyTGVuZ3RoOiBhbnkgPSAwO1xuICAgIHB1YmxpYyB2aWV3UG9ydEl0ZW1zOiBhbnk7XG4gICAgcHVibGljIGl0ZW06IGFueTtcbiAgICBwdWJsaWMgZHJvcGRvd25MaXN0WU9mZnNldDogbnVtYmVyID0gMDtcbiAgICBzdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjtcbiAgICBkZWZhdWx0U2V0dGluZ3M6IERyb3Bkb3duU2V0dGluZ3MgPSB7XG4gICAgICAgIHNpbmdsZVNlbGVjdGlvbjogZmFsc2UsXG4gICAgICAgIHRleHQ6ICdTZWxlY3QnLFxuICAgICAgICBlbmFibGVDaGVja0FsbDogdHJ1ZSxcbiAgICAgICAgc2VsZWN0QWxsVGV4dDogJ1NlbGVjdCBBbGwnLFxuICAgICAgICB1blNlbGVjdEFsbFRleHQ6ICdVblNlbGVjdCBBbGwnLFxuICAgICAgICBmaWx0ZXJTZWxlY3RBbGxUZXh0OiAnU2VsZWN0IGFsbCBmaWx0ZXJlZCByZXN1bHRzJyxcbiAgICAgICAgZmlsdGVyVW5TZWxlY3RBbGxUZXh0OiAnVW5TZWxlY3QgYWxsIGZpbHRlcmVkIHJlc3VsdHMnLFxuICAgICAgICBlbmFibGVTZWFyY2hGaWx0ZXI6IGZhbHNlLFxuICAgICAgICBzZWFyY2hCeTogW10sXG4gICAgICAgIG1heEhlaWdodDogMzAwLFxuICAgICAgICBiYWRnZVNob3dMaW1pdDogOTk5OTk5OTk5OTk5LFxuICAgICAgICBjbGFzc2VzOiAnJyxcbiAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICBzZWFyY2hQbGFjZWhvbGRlclRleHQ6ICdTZWFyY2gnLFxuICAgICAgICBzaG93Q2hlY2tib3g6IHRydWUsXG4gICAgICAgIG5vRGF0YUxhYmVsOiAnTm8gRGF0YSBBdmFpbGFibGUnLFxuICAgICAgICBzZWFyY2hBdXRvZm9jdXM6IHRydWUsXG4gICAgICAgIGxhenlMb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgbGFiZWxLZXk6ICdpdGVtTmFtZScsXG4gICAgICAgIHByaW1hcnlLZXk6ICdpZCcsXG4gICAgICAgIHBvc2l0aW9uOiAnYm90dG9tJyxcbiAgICAgICAgYXV0b1Bvc2l0aW9uOiB0cnVlLFxuICAgICAgICBlbmFibGVGaWx0ZXJTZWxlY3RBbGw6IHRydWUsXG4gICAgICAgIHNlbGVjdEdyb3VwOiBmYWxzZSxcbiAgICAgICAgYWRkTmV3SXRlbU9uRmlsdGVyOiBmYWxzZSxcbiAgICAgICAgYWRkTmV3QnV0dG9uVGV4dDogXCJBZGRcIixcbiAgICAgICAgZXNjYXBlVG9DbG9zZTogdHJ1ZVxuICAgIH1cbiAgICBwdWJsaWMgcGFyc2VFcnJvcjogYm9vbGVhbjtcbiAgICBwdWJsaWMgZmlsdGVyZWRMaXN0OiBhbnkgPSBbXTtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYsIHByaXZhdGUgY2RyOiBDaGFuZ2VEZXRlY3RvclJlZiwgcHJpdmF0ZSBkczogRGF0YVNlcnZpY2UpIHtcblxuICAgIH1cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24odGhpcy5kZWZhdWx0U2V0dGluZ3MsIHRoaXMuc2V0dGluZ3MpO1xuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5ncm91cEJ5KSB7XG4gICAgICAgICAgICB0aGlzLmdyb3VwZWREYXRhID0gdGhpcy50cmFuc2Zvcm1EYXRhKHRoaXMuZGF0YSwgdGhpcy5zZXR0aW5ncy5ncm91cEJ5KTtcbiAgICAgICAgICAgIHRoaXMuZ3JvdXBDYWNoZWRJdGVtcyA9IHRoaXMuY2xvbmVBcnJheSh0aGlzLmdyb3VwZWREYXRhKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNhY2hlZEl0ZW1zID0gdGhpcy5jbG9uZUFycmF5KHRoaXMuZGF0YSk7XG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnBvc2l0aW9uID09ICd0b3AnKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkTGlzdEhlaWdodCA9IHsgdmFsOiAwIH07XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZExpc3RIZWlnaHQudmFsID0gdGhpcy5zZWxlY3RlZExpc3RFbGVtLm5hdGl2ZUVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb24gPSB0aGlzLmRzLmdldERhdGEoKS5zdWJzY3JpYmUoZGF0YSA9PiB7XG4gICAgICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIHZhciBsZW4gPSAwO1xuICAgICAgICAgICAgICAgIGRhdGEuZm9yRWFjaCgob2JqOiBhbnksIGk6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIW9iai5oYXNPd25Qcm9wZXJ0eSgnZ3JwVGl0bGUnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGVuKys7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLmZpbHRlckxlbmd0aCA9IGxlbjtcbiAgICAgICAgICAgICAgICB0aGlzLm9uRmlsdGVyQ2hhbmdlKGRhdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlRHJvcGRvd25EaXJlY3Rpb24oKTtcbiAgICAgICAgfSk7XG5cbiAgICB9XG4gICAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgICAgICBpZiAoY2hhbmdlcy5kYXRhICYmICFjaGFuZ2VzLmRhdGEuZmlyc3RDaGFuZ2UpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmdyb3VwQnkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3VwZWREYXRhID0gdGhpcy50cmFuc2Zvcm1EYXRhKHRoaXMuZGF0YSwgdGhpcy5zZXR0aW5ncy5ncm91cEJ5KTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kYXRhLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtcyA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY2FjaGVkSXRlbXMgPSB0aGlzLmNsb25lQXJyYXkodGhpcy5kYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2hhbmdlcy5zZXR0aW5ncyAmJiAhY2hhbmdlcy5zZXR0aW5ncy5maXJzdENoYW5nZSkge1xuICAgICAgICAgICAgdGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24odGhpcy5kZWZhdWx0U2V0dGluZ3MsIHRoaXMuc2V0dGluZ3MpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGFuZ2VzLmxvYWRpbmcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMubG9hZGluZyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgbmdEb0NoZWNrKCkge1xuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZEl0ZW1zKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zZWxlY3RlZEl0ZW1zLmxlbmd0aCA9PSAwIHx8IHRoaXMuZGF0YS5sZW5ndGggPT0gMCB8fCB0aGlzLnNlbGVjdGVkSXRlbXMubGVuZ3RoIDwgdGhpcy5kYXRhLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNTZWxlY3RBbGwgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmxhenlMb2FkaW5nKSB7XG4gICAgICAgICAgICAvLyB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImxhenlDb250YWluZXJcIilbMF0uYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy5vblNjcm9sbC5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBuZ0FmdGVyVmlld0NoZWNrZWQoKSB7XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkTGlzdEVsZW0ubmF0aXZlRWxlbWVudC5jbGllbnRIZWlnaHQgJiYgdGhpcy5zZXR0aW5ncy5wb3NpdGlvbiA9PSAndG9wJyAmJiB0aGlzLnNlbGVjdGVkTGlzdEhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZExpc3RIZWlnaHQudmFsID0gdGhpcy5zZWxlY3RlZExpc3RFbGVtLm5hdGl2ZUVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgICAgICAgICAgdGhpcy5jZHIuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgICB9XG4gICAgfVxuICAgIG9uSXRlbUNsaWNrKGl0ZW06IGFueSwgaW5kZXg6IG51bWJlciwgZXZ0OiBFdmVudCkge1xuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5kaXNhYmxlZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGZvdW5kID0gdGhpcy5pc1NlbGVjdGVkKGl0ZW0pO1xuICAgICAgICBsZXQgbGltaXQgPSB0aGlzLnNlbGVjdGVkSXRlbXMubGVuZ3RoIDwgdGhpcy5zZXR0aW5ncy5saW1pdFNlbGVjdGlvbiA/IHRydWUgOiBmYWxzZTtcblxuICAgICAgICBpZiAoIWZvdW5kKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5saW1pdFNlbGVjdGlvbikge1xuICAgICAgICAgICAgICAgIGlmIChsaW1pdCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZFNlbGVjdGVkKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uU2VsZWN0LmVtaXQoaXRlbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRTZWxlY3RlZChpdGVtKTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uU2VsZWN0LmVtaXQoaXRlbSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlU2VsZWN0ZWQoaXRlbSk7XG4gICAgICAgICAgICB0aGlzLm9uRGVTZWxlY3QuZW1pdChpdGVtKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5pc1NlbGVjdEFsbCB8fCB0aGlzLmRhdGEubGVuZ3RoID4gdGhpcy5zZWxlY3RlZEl0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5pc1NlbGVjdEFsbCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmRhdGEubGVuZ3RoID09IHRoaXMuc2VsZWN0ZWRJdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuaXNTZWxlY3RBbGwgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmdyb3VwQnkpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlR3JvdXBJbmZvKGl0ZW0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHB1YmxpYyB2YWxpZGF0ZShjOiBGb3JtQ29udHJvbCk6IGFueSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBwcml2YXRlIG9uVG91Y2hlZENhbGxiYWNrOiAoXzogYW55KSA9PiB2b2lkID0gbm9vcDtcbiAgICBwcml2YXRlIG9uQ2hhbmdlQ2FsbGJhY2s6IChfOiBhbnkpID0+IHZvaWQgPSBub29wO1xuXG4gICAgd3JpdGVWYWx1ZSh2YWx1ZTogYW55KSB7XG4gICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSAnJykge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3Muc2luZ2xlU2VsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zID0gW3ZhbHVlWzBdXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBNeUV4Y2VwdGlvbig0MDQsIHsgXCJtc2dcIjogXCJTaW5nbGUgU2VsZWN0aW9uIE1vZGUsIFNlbGVjdGVkIEl0ZW1zIGNhbm5vdCBoYXZlIG1vcmUgdGhhbiBvbmUgaXRlbS5cIiB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtcyA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZS5ib2R5Lm1zZyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5saW1pdFNlbGVjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbXMgPSB2YWx1ZS5zbGljZSgwLCB0aGlzLnNldHRpbmdzLmxpbWl0U2VsZWN0aW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtcyA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZWxlY3RlZEl0ZW1zLmxlbmd0aCA9PT0gdGhpcy5kYXRhLmxlbmd0aCAmJiB0aGlzLmRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzU2VsZWN0QWxsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbXMgPSBbXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vRnJvbSBDb250cm9sVmFsdWVBY2Nlc3NvciBpbnRlcmZhY2VcbiAgICByZWdpc3Rlck9uQ2hhbmdlKGZuOiBhbnkpIHtcbiAgICAgICAgdGhpcy5vbkNoYW5nZUNhbGxiYWNrID0gZm47XG4gICAgfVxuXG4gICAgLy9Gcm9tIENvbnRyb2xWYWx1ZUFjY2Vzc29yIGludGVyZmFjZVxuICAgIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiBhbnkpIHtcbiAgICAgICAgdGhpcy5vblRvdWNoZWRDYWxsYmFjayA9IGZuO1xuICAgIH1cbiAgICB0cmFja0J5Rm4oaW5kZXg6IG51bWJlciwgaXRlbTogYW55KSB7XG4gICAgICAgIHJldHVybiBpdGVtW3RoaXMuc2V0dGluZ3MucHJpbWFyeUtleV07XG4gICAgfVxuICAgIGlzU2VsZWN0ZWQoY2xpY2tlZEl0ZW06IGFueSkge1xuICAgICAgICBsZXQgZm91bmQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zICYmIHRoaXMuc2VsZWN0ZWRJdGVtcy5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgICAgaWYgKGNsaWNrZWRJdGVtW3RoaXMuc2V0dGluZ3MucHJpbWFyeUtleV0gPT09IGl0ZW1bdGhpcy5zZXR0aW5ncy5wcmltYXJ5S2V5XSkge1xuICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBmb3VuZDtcbiAgICB9XG4gICAgYWRkU2VsZWN0ZWQoaXRlbTogYW55KSB7XG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnNpbmdsZVNlbGVjdGlvbikge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zID0gW107XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbXMucHVzaChpdGVtKTtcbiAgICAgICAgICAgIHRoaXMuY2xvc2VEcm9wZG93bigpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtcy5wdXNoKGl0ZW0pO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlQ2FsbGJhY2sodGhpcy5zZWxlY3RlZEl0ZW1zKTtcbiAgICAgICAgdGhpcy5vblRvdWNoZWRDYWxsYmFjayh0aGlzLnNlbGVjdGVkSXRlbXMpO1xuICAgIH1cbiAgICByZW1vdmVTZWxlY3RlZChjbGlja2VkSXRlbTogYW55KSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtcyAmJiB0aGlzLnNlbGVjdGVkSXRlbXMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAgIGlmIChjbGlja2VkSXRlbVt0aGlzLnNldHRpbmdzLnByaW1hcnlLZXldID09PSBpdGVtW3RoaXMuc2V0dGluZ3MucHJpbWFyeUtleV0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbXMuc3BsaWNlKHRoaXMuc2VsZWN0ZWRJdGVtcy5pbmRleE9mKGl0ZW0pLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMub25DaGFuZ2VDYWxsYmFjayh0aGlzLnNlbGVjdGVkSXRlbXMpO1xuICAgICAgICB0aGlzLm9uVG91Y2hlZENhbGxiYWNrKHRoaXMuc2VsZWN0ZWRJdGVtcyk7XG4gICAgfVxuICAgIHRvZ2dsZURyb3Bkb3duKGV2dDogYW55KSB7XG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmRpc2FibGVkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pc0FjdGl2ZSA9ICF0aGlzLmlzQWN0aXZlO1xuICAgICAgICBpZiAodGhpcy5pc0FjdGl2ZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3Muc2VhcmNoQXV0b2ZvY3VzICYmIHRoaXMuc2VhcmNoSW5wdXQgJiYgdGhpcy5zZXR0aW5ncy5lbmFibGVTZWFyY2hGaWx0ZXIgJiYgIXRoaXMuc2VhcmNoVGVtcGwpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWFyY2hJbnB1dC5uYXRpdmVFbGVtZW50LmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm9uT3Blbi5lbWl0KHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5vbkNsb3NlLmVtaXQoZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGVEcm9wZG93bkRpcmVjdGlvbigpO1xuICAgICAgICB9LCAwKTtcblxuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gICAgcHVibGljIG9wZW5Ecm9wZG93bigpIHtcbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuZGlzYWJsZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmlzQWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3Muc2VhcmNoQXV0b2ZvY3VzICYmIHRoaXMuc2VhcmNoSW5wdXQgJiYgdGhpcy5zZXR0aW5ncy5lbmFibGVTZWFyY2hGaWx0ZXIgJiYgIXRoaXMuc2VhcmNoVGVtcGwpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VhcmNoSW5wdXQubmF0aXZlRWxlbWVudC5mb2N1cygpO1xuICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vbk9wZW4uZW1pdCh0cnVlKTtcbiAgICB9XG4gICAgcHVibGljIGNsb3NlRHJvcGRvd24oKSB7XG4gICAgICAgIGlmICh0aGlzLnNlYXJjaElucHV0ICYmIHRoaXMuc2V0dGluZ3MubGF6eUxvYWRpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoSW5wdXQubmF0aXZlRWxlbWVudC52YWx1ZSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc2VhcmNoSW5wdXQpIHtcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoSW5wdXQubmF0aXZlRWxlbWVudC52YWx1ZSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5maWx0ZXIgPSBcIlwiO1xuICAgICAgICB0aGlzLmlzQWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHRoaXMub25DbG9zZS5lbWl0KGZhbHNlKTtcbiAgICB9XG4gICAgcHVibGljIGNsb3NlRHJvcGRvd25PbkNsaWNrT3V0KCkge1xuICAgICAgICBpZiAodGhpcy5zZWFyY2hJbnB1dCAmJiB0aGlzLnNldHRpbmdzLmxhenlMb2FkaW5nKSB7XG4gICAgICAgICAgICB0aGlzLnNlYXJjaElucHV0Lm5hdGl2ZUVsZW1lbnQudmFsdWUgPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnNlYXJjaElucHV0KSB7XG4gICAgICAgICAgICB0aGlzLnNlYXJjaElucHV0Lm5hdGl2ZUVsZW1lbnQudmFsdWUgPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZmlsdGVyID0gXCJcIjtcbiAgICAgICAgdGhpcy5pc0FjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLm9uQ2xvc2UuZW1pdChmYWxzZSk7XG4gICAgfVxuICAgIHRvZ2dsZVNlbGVjdEFsbCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzU2VsZWN0QWxsKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbXMgPSBbXTtcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmdyb3VwQnkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3VwZWREYXRhLmZvckVhY2goKG9iaikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBvYmouc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgdGhpcy5ncm91cENhY2hlZEl0ZW1zLmZvckVhY2goKG9iaikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBvYmouc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbXMgPSB0aGlzLmRhdGEuc2xpY2UoKTtcbiAgICAgICAgICAgIHRoaXMuaXNTZWxlY3RBbGwgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5vbkNoYW5nZUNhbGxiYWNrKHRoaXMuc2VsZWN0ZWRJdGVtcyk7XG4gICAgICAgICAgICB0aGlzLm9uVG91Y2hlZENhbGxiYWNrKHRoaXMuc2VsZWN0ZWRJdGVtcyk7XG5cbiAgICAgICAgICAgIHRoaXMub25TZWxlY3RBbGwuZW1pdCh0aGlzLnNlbGVjdGVkSXRlbXMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuZ3JvdXBCeSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXBlZERhdGEuZm9yRWFjaCgob2JqKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5zZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXBDYWNoZWRJdGVtcy5mb3JFYWNoKChvYmopID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb2JqLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5pc1NlbGVjdEFsbCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5vbkNoYW5nZUNhbGxiYWNrKHRoaXMuc2VsZWN0ZWRJdGVtcyk7XG4gICAgICAgICAgICB0aGlzLm9uVG91Y2hlZENhbGxiYWNrKHRoaXMuc2VsZWN0ZWRJdGVtcyk7XG5cbiAgICAgICAgICAgIHRoaXMub25EZVNlbGVjdEFsbC5lbWl0KHRoaXMuc2VsZWN0ZWRJdGVtcyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZmlsdGVyR3JvdXBlZExpc3QoKSB7XG4gICAgICAgIGlmICh0aGlzLmZpbHRlciA9PSBcIlwiIHx8IHRoaXMuZmlsdGVyID09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuY2xlYXJTZWFyY2goKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdyb3VwZWREYXRhID0gdGhpcy5jbG9uZUFycmF5KHRoaXMuZ3JvdXBDYWNoZWRJdGVtcyk7XG4gICAgICAgIHRoaXMuZ3JvdXBlZERhdGEgPSB0aGlzLmdyb3VwZWREYXRhLmZpbHRlcihvYmogPT4ge1xuICAgICAgICAgICAgdmFyIGFyciA9IG9iai5saXN0LmZpbHRlcih0ID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdC5pdGVtTmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YodGhpcy5maWx0ZXIudG9Mb3dlckNhc2UoKSkgPiAtMTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgb2JqLmxpc3QgPSBhcnI7XG4gICAgICAgICAgICByZXR1cm4gYXJyLnNvbWUoY2F0ID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2F0Lml0ZW1OYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZih0aGlzLmZpbHRlci50b0xvd2VyQ2FzZSgpKSA+IC0xO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgKVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5ncm91cGVkRGF0YSk7XG4gICAgfVxuICAgIHRvZ2dsZUZpbHRlclNlbGVjdEFsbCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzRmlsdGVyU2VsZWN0QWxsKSB7XG4gICAgICAgICAgICBsZXQgYWRkZWQgPSBbXTtcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmdyb3VwQnkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3VwZWREYXRhLmZvckVhY2goKGl0ZW06IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5saXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmxpc3QuZm9yRWFjaCgoZWw6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5pc1NlbGVjdGVkKGVsKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZFNlbGVjdGVkKGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkZWQucHVzaChlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVHcm91cEluZm8oaXRlbSk7XG5cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZHMuZ2V0RmlsdGVyZWREYXRhKCkuZm9yRWFjaCgoaXRlbTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5pc1NlbGVjdGVkKGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZFNlbGVjdGVkKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYWRkZWQucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuaXNGaWx0ZXJTZWxlY3RBbGwgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5vbkZpbHRlclNlbGVjdEFsbC5lbWl0KGFkZGVkKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldCByZW1vdmVkID0gW107XG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5ncm91cEJ5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ncm91cGVkRGF0YS5mb3JFYWNoKChpdGVtOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0ubGlzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5saXN0LmZvckVhY2goKGVsOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pc1NlbGVjdGVkKGVsKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZVNlbGVjdGVkKGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlZC5wdXNoKGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kcy5nZXRGaWx0ZXJlZERhdGEoKS5mb3JFYWNoKChpdGVtOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNTZWxlY3RlZChpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVTZWxlY3RlZChpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZWQucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmlzRmlsdGVyU2VsZWN0QWxsID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLm9uRmlsdGVyRGVTZWxlY3RBbGwuZW1pdChyZW1vdmVkKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0b2dnbGVJbmZpbml0ZUZpbHRlclNlbGVjdEFsbCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzSW5maW5pdGVGaWx0ZXJTZWxlY3RBbGwpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YS5mb3JFYWNoKChpdGVtOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaXNTZWxlY3RlZChpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZFNlbGVjdGVkKGl0ZW0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmlzSW5maW5pdGVGaWx0ZXJTZWxlY3RBbGwgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kYXRhLmZvckVhY2goKGl0ZW06IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzU2VsZWN0ZWQoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVTZWxlY3RlZChpdGVtKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5pc0luZmluaXRlRmlsdGVyU2VsZWN0QWxsID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY2xlYXJTZWFyY2goKSB7XG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmdyb3VwQnkpIHtcbiAgICAgICAgICAgIHRoaXMuZ3JvdXBlZERhdGEgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuZ3JvdXBlZERhdGEgPSB0aGlzLmNsb25lQXJyYXkodGhpcy5ncm91cENhY2hlZEl0ZW1zKTtcbiAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5maWx0ZXIgPSBcIlwiO1xuICAgICAgICAgICAgdGhpcy5pc0ZpbHRlclNlbGVjdEFsbCA9IGZhbHNlO1xuXG4gICAgfVxuICAgIG9uRmlsdGVyQ2hhbmdlKGRhdGE6IGFueSkge1xuICAgICAgICBpZiAodGhpcy5maWx0ZXIgJiYgdGhpcy5maWx0ZXIgPT0gXCJcIiB8fCBkYXRhLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmlzRmlsdGVyU2VsZWN0QWxsID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNudCA9IDA7XG4gICAgICAgIGRhdGEuZm9yRWFjaCgoaXRlbTogYW55KSA9PiB7XG5cbiAgICAgICAgICAgIGlmICghaXRlbS5oYXNPd25Qcm9wZXJ0eSgnZ3JwVGl0bGUnKSAmJiB0aGlzLmlzU2VsZWN0ZWQoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICBjbnQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGNudCA+IDAgJiYgdGhpcy5maWx0ZXJMZW5ndGggPT0gY250KSB7XG4gICAgICAgICAgICB0aGlzLmlzRmlsdGVyU2VsZWN0QWxsID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjbnQgPiAwICYmIHRoaXMuZmlsdGVyTGVuZ3RoICE9IGNudCkge1xuICAgICAgICAgICAgdGhpcy5pc0ZpbHRlclNlbGVjdEFsbCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2RyLmRldGVjdENoYW5nZXMoKTtcbiAgICB9XG4gICAgY2xvbmVBcnJheShhcnI6IGFueSkge1xuICAgICAgICB2YXIgaSwgY29weTtcblxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShhcnIpKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgYXJyID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgdGhyb3cgJ0Nhbm5vdCBjbG9uZSBhcnJheSBjb250YWluaW5nIGFuIG9iamVjdCEnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGFycjtcbiAgICAgICAgfVxuICAgIH1cbiAgICB1cGRhdGVHcm91cEluZm8oaXRlbTogYW55KSB7XG4gICAgICAgIHZhciBrZXkgPSB0aGlzLnNldHRpbmdzLmdyb3VwQnk7XG4gICAgICAgIHRoaXMuZ3JvdXBlZERhdGEuZm9yRWFjaCgob2JqOiBhbnkpID0+IHtcbiAgICAgICAgICAgIHZhciBjbnQgPSAwO1xuICAgICAgICAgICAgaWYgKG9iai5ncnBUaXRsZSAmJiAoaXRlbVtrZXldID09IG9ialtrZXldKSkge1xuICAgICAgICAgICAgICAgIGlmIChvYmoubGlzdCkge1xuICAgICAgICAgICAgICAgICAgICBvYmoubGlzdC5mb3JFYWNoKChlbDogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pc1NlbGVjdGVkKGVsKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNudCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob2JqLmxpc3QgJiYgKGNudCA9PT0gb2JqLmxpc3QubGVuZ3RoKSAmJiAoaXRlbVtrZXldID09IG9ialtrZXldKSkge1xuICAgICAgICAgICAgICAgIG9iai5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChvYmoubGlzdCAmJiAoY250ICE9IG9iai5saXN0Lmxlbmd0aCkgJiYgKGl0ZW1ba2V5XSA9PSBvYmpba2V5XSkpIHtcbiAgICAgICAgICAgICAgICBvYmouc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZ3JvdXBDYWNoZWRJdGVtcy5mb3JFYWNoKChvYmo6IGFueSkgPT4ge1xuICAgICAgICAgICAgdmFyIGNudCA9IDA7XG4gICAgICAgICAgICBpZiAob2JqLmdycFRpdGxlICYmIChpdGVtW2tleV0gPT0gb2JqW2tleV0pKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9iai5saXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5saXN0LmZvckVhY2goKGVsOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzU2VsZWN0ZWQoZWwpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY250Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvYmoubGlzdCAmJiAoY250ID09PSBvYmoubGlzdC5sZW5ndGgpICYmIChpdGVtW2tleV0gPT0gb2JqW2tleV0pKSB7XG4gICAgICAgICAgICAgICAgb2JqLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG9iai5saXN0ICYmIChjbnQgIT0gb2JqLmxpc3QubGVuZ3RoKSAmJiAoaXRlbVtrZXldID09IG9ialtrZXldKSkge1xuICAgICAgICAgICAgICAgIG9iai5zZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgdHJhbnNmb3JtRGF0YShhcnI6IEFycmF5PGFueT4sIGZpZWxkOiBhbnkpOiBBcnJheTxhbnk+IHtcbiAgICAgICAgY29uc3QgZ3JvdXBlZE9iajogYW55ID0gYXJyLnJlZHVjZSgocHJldjogYW55LCBjdXI6IGFueSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFwcmV2W2N1cltmaWVsZF1dKSB7XG4gICAgICAgICAgICAgICAgcHJldltjdXJbZmllbGRdXSA9IFtjdXJdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwcmV2W2N1cltmaWVsZF1dLnB1c2goY3VyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcmV2O1xuICAgICAgICB9LCB7fSk7XG4gICAgICAgIGNvbnN0IHRlbXBBcnI6IGFueSA9IFtdO1xuICAgICAgICBPYmplY3Qua2V5cyhncm91cGVkT2JqKS5tYXAoKHg6IGFueSkgPT4ge1xuICAgICAgICAgICAgdmFyIG9iajogYW55ID0ge307XG4gICAgICAgICAgICBvYmpbXCJncnBUaXRsZVwiXSA9IHRydWU7XG4gICAgICAgICAgICBvYmpbdGhpcy5zZXR0aW5ncy5sYWJlbEtleV0gPSB4O1xuICAgICAgICAgICAgb2JqW3RoaXMuc2V0dGluZ3MuZ3JvdXBCeV0gPSB4O1xuICAgICAgICAgICAgb2JqWydzZWxlY3RlZCddID0gZmFsc2U7XG4gICAgICAgICAgICBvYmpbJ2xpc3QnXSA9IFtdO1xuICAgICAgICAgICAgZ3JvdXBlZE9ialt4XS5mb3JFYWNoKChpdGVtOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBpdGVtWydsaXN0J10gPSBbXTtcbiAgICAgICAgICAgICAgICBvYmoubGlzdC5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0ZW1wQXJyLnB1c2gob2JqKTtcbiAgICAgICAgICAgIC8vIG9iai5saXN0LmZvckVhY2goKGl0ZW06IGFueSkgPT4ge1xuICAgICAgICAgICAgLy8gICAgIHRlbXBBcnIucHVzaChpdGVtKTtcbiAgICAgICAgICAgIC8vIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRlbXBBcnI7XG4gICAgfVxuICAgIHB1YmxpYyBmaWx0ZXJJbmZpbml0ZUxpc3QoZXZ0OiBhbnkpIHtcbiAgICAgICAgdmFyIGZpbHRlcmVkRWxlbXM6IEFycmF5PGFueT4gPSBbXTtcbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuZ3JvdXBCeSkge1xuICAgICAgICAgICAgdGhpcy5ncm91cGVkRGF0YSA9IHRoaXMuZ3JvdXBDYWNoZWRJdGVtcy5zbGljZSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kYXRhID0gdGhpcy5jYWNoZWRJdGVtcy5zbGljZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKChldnQudGFyZ2V0LnZhbHVlICE9IG51bGwgfHwgZXZ0LnRhcmdldC52YWx1ZSAhPSAnJykgJiYgIXRoaXMuc2V0dGluZ3MuZ3JvdXBCeSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3Muc2VhcmNoQnkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHQgPSAwOyB0IDwgdGhpcy5zZXR0aW5ncy5zZWFyY2hCeS5sZW5ndGg7IHQrKykge1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YS5maWx0ZXIoKGVsOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbFt0aGlzLnNldHRpbmdzLnNlYXJjaEJ5W3RdLnRvU3RyaW5nKCldLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKS5pbmRleE9mKGV2dC50YXJnZXQudmFsdWUudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyZWRFbGVtcy5wdXNoKGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIC8qICAgICAgICAgICAgICAgICAgICBpZiAoZmlsdGVyICYmIGl0ZW1bc2VhcmNoQnlbdF1dICYmIGl0ZW1bc2VhcmNoQnlbdF1dICE9IFwiXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW1bc2VhcmNoQnlbdF1dLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKS5pbmRleE9mKGZpbHRlci50b0xvd2VyQ2FzZSgpKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9Ki9cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0YS5maWx0ZXIoZnVuY3Rpb24gKGVsOiBhbnkpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsW3Byb3BdLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKS5pbmRleE9mKGV2dC50YXJnZXQudmFsdWUudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyZWRFbGVtcy5wdXNoKGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5kYXRhID0gW107XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBmaWx0ZXJlZEVsZW1zO1xuICAgICAgICAgICAgdGhpcy5pbmZpbml0ZUZpbHRlckxlbmd0aCA9IHRoaXMuZGF0YS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2dC50YXJnZXQudmFsdWUudG9TdHJpbmcoKSAhPSAnJyAmJiB0aGlzLnNldHRpbmdzLmdyb3VwQnkpIHtcbiAgICAgICAgICAgIHRoaXMuZ3JvdXBlZERhdGEuZmlsdGVyKGZ1bmN0aW9uIChlbDogYW55KSB7XG4gICAgICAgICAgICAgICAgaWYgKGVsLmhhc093blByb3BlcnR5KCdncnBUaXRsZScpKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkRWxlbXMucHVzaChlbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBwcm9wIGluIGVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZWxbcHJvcF0udG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoZXZ0LnRhcmdldC52YWx1ZS50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZEVsZW1zLnB1c2goZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmdyb3VwZWREYXRhID0gW107XG4gICAgICAgICAgICB0aGlzLmdyb3VwZWREYXRhID0gZmlsdGVyZWRFbGVtcztcbiAgICAgICAgICAgIHRoaXMuaW5maW5pdGVGaWx0ZXJMZW5ndGggPSB0aGlzLmdyb3VwZWREYXRhLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChldnQudGFyZ2V0LnZhbHVlLnRvU3RyaW5nKCkgPT0gJycgJiYgdGhpcy5jYWNoZWRJdGVtcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IHRoaXMuY2FjaGVkSXRlbXM7XG4gICAgICAgICAgICB0aGlzLmluZmluaXRlRmlsdGVyTGVuZ3RoID0gMDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXNldEluZmluaXRlU2VhcmNoKCkge1xuICAgICAgICB0aGlzLmZpbHRlciA9IFwiXCI7XG4gICAgICAgIHRoaXMuaXNJbmZpbml0ZUZpbHRlclNlbGVjdEFsbCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmRhdGEgPSBbXTtcbiAgICAgICAgdGhpcy5kYXRhID0gdGhpcy5jYWNoZWRJdGVtcztcbiAgICAgICAgdGhpcy5ncm91cGVkRGF0YSA9IHRoaXMuZ3JvdXBDYWNoZWRJdGVtcztcbiAgICAgICAgdGhpcy5pbmZpbml0ZUZpbHRlckxlbmd0aCA9IDA7XG4gICAgfVxuICAgIG9uU2Nyb2xsRW5kKGU6IENoYW5nZUV2ZW50KSB7XG4gICAgICAgIHRoaXMub25TY3JvbGxUb0VuZC5lbWl0KGUpO1xuICAgIH1cbiAgICBuZ09uRGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICB9XG4gICAgc2VsZWN0R3JvdXAoaXRlbTogYW55KSB7XG4gICAgICAgIGlmIChpdGVtLnNlbGVjdGVkKSB7XG4gICAgICAgICAgICBpdGVtLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICBpdGVtLmxpc3QuZm9yRWFjaCgob2JqOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZVNlbGVjdGVkKG9iaik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGl0ZW0uc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgaXRlbS5saXN0LmZvckVhY2goKG9iajogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmlzU2VsZWN0ZWQob2JqKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZFNlbGVjdGVkKG9iaik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVwZGF0ZUdyb3VwSW5mbyhpdGVtKTtcblxuICAgIH1cbiAgICBhZGRGaWx0ZXJOZXdJdGVtKCkge1xuICAgICAgICB0aGlzLm9uQWRkRmlsdGVyTmV3SXRlbS5lbWl0KHRoaXMuZmlsdGVyKTtcbiAgICAgICAgdGhpcy5maWx0ZXJQaXBlID0gbmV3IExpc3RGaWx0ZXJQaXBlKHRoaXMuZHMpO1xuICAgICAgICB0aGlzLmZpbHRlclBpcGUudHJhbnNmb3JtKHRoaXMuZGF0YSwgdGhpcy5maWx0ZXIsIHRoaXMuc2V0dGluZ3Muc2VhcmNoQnkpO1xuICAgIH1cbiAgICBjYWxjdWxhdGVEcm9wZG93bkRpcmVjdGlvbigpIHtcbiAgICAgICAgbGV0IHNob3VsZE9wZW5Ub3dhcmRzVG9wID0gdGhpcy5zZXR0aW5ncy5wb3NpdGlvbiA9PSAndG9wJztcbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuYXV0b1Bvc2l0aW9uKSB7XG4gICAgICAgICAgICBjb25zdCBkcm9wZG93bkhlaWdodCA9IHRoaXMuZHJvcGRvd25MaXN0RWxlbS5uYXRpdmVFbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICAgICAgICAgIGNvbnN0IHZpZXdwb3J0SGVpZ2h0ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkTGlzdEJvdW5kcyA9IHRoaXMuc2VsZWN0ZWRMaXN0RWxlbS5uYXRpdmVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgICAgICBjb25zdCBzcGFjZU9uVG9wOiBudW1iZXIgPSBzZWxlY3RlZExpc3RCb3VuZHMudG9wO1xuICAgICAgICAgICAgY29uc3Qgc3BhY2VPbkJvdHRvbTogbnVtYmVyID0gdmlld3BvcnRIZWlnaHQgLSBzZWxlY3RlZExpc3RCb3VuZHMudG9wO1xuICAgICAgICAgICAgaWYgKHNwYWNlT25Cb3R0b20gPCBzcGFjZU9uVG9wICYmIGRyb3Bkb3duSGVpZ2h0IDwgc3BhY2VPblRvcCkge1xuICAgICAgICAgICAgICAgIHRoaXMub3BlblRvd2FyZHNUb3AodHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW5Ub3dhcmRzVG9wKGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEtlZXAgcHJlZmVyZW5jZSBpZiB0aGVyZSBpcyBub3QgZW5vdWdoIHNwYWNlIG9uIGVpdGhlciB0aGUgdG9wIG9yIGJvdHRvbVxuICAgICAgICAgICAgLyogXHRcdFx0aWYgKHNwYWNlT25Ub3AgfHwgc3BhY2VPbkJvdHRvbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzaG91bGRPcGVuVG93YXJkc1RvcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG91bGRPcGVuVG93YXJkc1RvcCA9IHNwYWNlT25Ub3A7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkT3BlblRvd2FyZHNUb3AgPSAhc3BhY2VPbkJvdHRvbTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9ICovXG4gICAgICAgIH1cblxuICAgIH1cbiAgICBvcGVuVG93YXJkc1RvcCh2YWx1ZTogYm9vbGVhbikge1xuICAgICAgICBpZiAodmFsdWUgJiYgdGhpcy5zZWxlY3RlZExpc3RFbGVtLm5hdGl2ZUVsZW1lbnQuY2xpZW50SGVpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLmRyb3Bkb3duTGlzdFlPZmZzZXQgPSAxNSArIHRoaXMuc2VsZWN0ZWRMaXN0RWxlbS5uYXRpdmVFbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZHJvcGRvd25MaXN0WU9mZnNldCA9IDA7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbkBOZ01vZHVsZSh7XG4gICAgaW1wb3J0czogW0NvbW1vbk1vZHVsZSwgRm9ybXNNb2R1bGVdLFxuICAgIGRlY2xhcmF0aW9uczogW0FuZ3VsYXJNdWx0aVNlbGVjdCwgQ2xpY2tPdXRzaWRlRGlyZWN0aXZlLCBTY3JvbGxEaXJlY3RpdmUsIHN0eWxlRGlyZWN0aXZlLCBMaXN0RmlsdGVyUGlwZSwgSXRlbSwgVGVtcGxhdGVSZW5kZXJlciwgQmFkZ2UsIFNlYXJjaCwgc2V0UG9zaXRpb24sIFZpcnR1YWxTY3JvbGxDb21wb25lbnQsIENJY29uXSxcbiAgICBleHBvcnRzOiBbQW5ndWxhck11bHRpU2VsZWN0LCBDbGlja091dHNpZGVEaXJlY3RpdmUsIFNjcm9sbERpcmVjdGl2ZSwgc3R5bGVEaXJlY3RpdmUsIExpc3RGaWx0ZXJQaXBlLCBJdGVtLCBUZW1wbGF0ZVJlbmRlcmVyLCBCYWRnZSwgU2VhcmNoLCBzZXRQb3NpdGlvbiwgVmlydHVhbFNjcm9sbENvbXBvbmVudCwgQ0ljb25dLFxuICAgIHByb3ZpZGVyczogW0RhdGFTZXJ2aWNlXVxufSlcbmV4cG9ydCBjbGFzcyBBbmd1bGFyTXVsdGlTZWxlY3RNb2R1bGUgeyB9XG4iXSwibmFtZXMiOlsiRXZlbnRFbWl0dGVyIiwiRGlyZWN0aXZlIiwiRWxlbWVudFJlZiIsIk91dHB1dCIsIkhvc3RMaXN0ZW5lciIsIklucHV0IiwiU3ViamVjdCIsIkluamVjdGFibGUiLCJQaXBlIiwiQ29tcG9uZW50IiwiQ29udGVudENoaWxkIiwiVGVtcGxhdGVSZWYiLCJWaWV3Q29udGFpbmVyUmVmIiwiVmlld0VuY2Fwc3VsYXRpb24iLCJSZW5kZXJlcjIiLCJOZ1pvbmUiLCJWaWV3Q2hpbGQiLCJOR19WQUxVRV9BQ0NFU1NPUiIsImZvcndhcmRSZWYiLCJOR19WQUxJREFUT1JTIiwiQ2hhbmdlRGV0ZWN0b3JSZWYiLCJOZ01vZHVsZSIsIkNvbW1vbk1vZHVsZSIsIkZvcm1zTW9kdWxlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0lBQUEsSUFBQTtRQUdDLHFCQUFZLE1BQWUsRUFBRSxJQUFVO1lBQ3RDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1NBQ2pCOzBCQU5GO1FBUUMsQ0FBQTs7Ozs7O0FDUkQ7UUFNSSwrQkFBb0IsV0FBdUI7WUFBdkIsZ0JBQVcsR0FBWCxXQUFXLENBQVk7Z0NBSXJCLElBQUlBLGlCQUFZLEVBQWM7U0FIbkQ7Ozs7OztRQU9NLHVDQUFPOzs7OztZQUZkLFVBRWUsS0FBaUIsRUFBRSxhQUEwQjtnQkFDeEQsSUFBSSxDQUFDLGFBQWEsRUFBRTtvQkFDaEIsT0FBTztpQkFDVjs7Z0JBRUQsSUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUM3RSxJQUFJLENBQUMsYUFBYSxFQUFFO29CQUNoQixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDakM7YUFDSjs7b0JBckJKQyxjQUFTLFNBQUM7d0JBQ1AsUUFBUSxFQUFFLGdCQUFnQjtxQkFDN0I7Ozs7O3dCQUptQkMsZUFBVTs7OzttQ0FTekJDLFdBQU07OEJBR05DLGlCQUFZLFNBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxRQUFRLEVBQUUsZUFBZSxDQUFDLGNBQzFEQSxpQkFBWSxTQUFDLHFCQUFxQixFQUFFLENBQUMsUUFBUSxFQUFFLGVBQWUsQ0FBQzs7b0NBYnBFOzs7UUE4QkkseUJBQW9CLFdBQXVCO1lBQXZCLGdCQUFXLEdBQVgsV0FBVyxDQUFZOzBCQUkzQixJQUFJSixpQkFBWSxFQUFjO1NBSDdDOzs7Ozs7UUFNTSxpQ0FBTzs7Ozs7WUFEZCxVQUNlLEtBQWlCLEVBQUUsYUFBMEI7Z0JBQ3hELElBQUks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