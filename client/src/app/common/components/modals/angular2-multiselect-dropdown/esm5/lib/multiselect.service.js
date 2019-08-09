/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
var DataService = /** @class */ (function () {
    function DataService() {
        this.filteredData = [];
        this.subject = new Subject();
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
        { type: Injectable }
    ];
    return DataService;
}());
export { DataService };
if (false) {
    /** @type {?} */
    DataService.prototype.filteredData;
    /** @type {?} */
    DataService.prototype.subject;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGlzZWxlY3Quc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXIyLW11bHRpc2VsZWN0LWRyb3Bkb3duLyIsInNvdXJjZXMiOlsibGliL211bHRpc2VsZWN0LnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFjLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQzs7OzRCQU1yQixFQUFFO3VCQUNKLElBQUksT0FBTyxFQUFPOzs7Ozs7SUFFcEMsNkJBQU87Ozs7SUFBUCxVQUFRLElBQVM7UUFFZixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztRQUN6QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUN6Qjs7OztJQUNELDZCQUFPOzs7SUFBUDtRQUNFLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQztLQUNwQzs7OztJQUNELHFDQUFlOzs7SUFBZjtRQUNFLElBQUksSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDckQsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO1NBQzFCO2FBQ0k7WUFDSCxPQUFPLEVBQUUsQ0FBQztTQUNYO0tBQ0Y7O2dCQXJCRixVQUFVOztzQkFKWDs7U0FLYSxXQUFXIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuXG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBEYXRhU2VydmljZSB7XG5cbiAgZmlsdGVyZWREYXRhOiBhbnkgPSBbXTtcbiAgcHJpdmF0ZSBzdWJqZWN0ID0gbmV3IFN1YmplY3Q8YW55PigpO1xuXG4gIHNldERhdGEoZGF0YTogYW55KSB7XG5cbiAgICB0aGlzLmZpbHRlcmVkRGF0YSA9IGRhdGE7XG4gICAgdGhpcy5zdWJqZWN0Lm5leHQoZGF0YSk7XG4gIH1cbiAgZ2V0RGF0YSgpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIHJldHVybiB0aGlzLnN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gIH1cbiAgZ2V0RmlsdGVyZWREYXRhKCkge1xuICAgIGlmICh0aGlzLmZpbHRlcmVkRGF0YSAmJiB0aGlzLmZpbHRlcmVkRGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5maWx0ZXJlZERhdGE7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfVxuXG59Il19