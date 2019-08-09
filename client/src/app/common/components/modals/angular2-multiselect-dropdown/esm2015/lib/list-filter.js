/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
import { Pipe } from '@angular/core';
import { DataService } from './multiselect.service';
export class ListFilterPipe {
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
if (false) {
    /** @type {?} */
    ListFilterPipe.prototype.filteredList;
    /** @type {?} */
    ListFilterPipe.prototype.ds;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC1maWx0ZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyMi1tdWx0aXNlbGVjdC1kcm9wZG93bi8iLCJzb3VyY2VzIjpbImxpYi9saXN0LWZpbHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFFLElBQUksRUFBaUIsTUFBTSxlQUFlLENBQUM7QUFDcEQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBT3BELE1BQU07Ozs7SUFHRixZQUFvQixFQUFlO1FBQWYsT0FBRSxHQUFGLEVBQUUsQ0FBYTs0QkFEUixFQUFFO0tBRzVCOzs7Ozs7O0lBRUQsU0FBUyxDQUFDLEtBQVksRUFBRSxNQUFXLEVBQUUsUUFBYTtRQUM5QyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ25CLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3ZCLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBQ0QsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBUyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUMxRixJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDbkMsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO0tBQzVCOzs7Ozs7O0lBQ0QsV0FBVyxDQUFDLElBQVMsRUFBRSxNQUFXLEVBQUUsUUFBYTs7UUFDN0MsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ2xCLElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDckIsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNmLEtBQUssR0FBRyxJQUFJLENBQUM7YUFDaEI7aUJBQ0k7Z0JBQ0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3RDLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO3dCQUN4RCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFOzRCQUMvRSxLQUFLLEdBQUcsSUFBSSxDQUFDO3lCQUNoQjtxQkFDSjtpQkFDSjthQUNKO1NBRUo7YUFBTTtZQUNILElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDZixLQUFLLEdBQUcsSUFBSSxDQUFDO2FBQ2hCO2lCQUNJO2dCQUNELEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO29CQUNuQixJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7d0JBQ3RCLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7NEJBQ3hFLEtBQUssR0FBRyxJQUFJLENBQUM7eUJBQ2hCO3FCQUNKO2lCQUNKO2FBQ0o7U0FDSjtRQUVELE9BQU8sS0FBSyxDQUFDO0tBQ2hCOzs7WUFwREosSUFBSSxTQUFDO2dCQUNGLElBQUksRUFBRSxZQUFZO2dCQUNsQixJQUFJLEVBQUUsSUFBSTthQUNiOzs7O1lBTlEsV0FBVyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBpcGUsIFBpcGVUcmFuc2Zvcm0gfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IERhdGFTZXJ2aWNlIH0gZnJvbSAnLi9tdWx0aXNlbGVjdC5zZXJ2aWNlJztcblxuXG5AUGlwZSh7XG4gICAgbmFtZTogJ2xpc3RGaWx0ZXInLFxuICAgIHB1cmU6IHRydWVcbn0pXG5leHBvcnQgY2xhc3MgTGlzdEZpbHRlclBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcblxuICAgIHB1YmxpYyBmaWx0ZXJlZExpc3Q6IGFueSA9IFtdO1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgZHM6IERhdGFTZXJ2aWNlKSB7XG5cbiAgICB9XG5cbiAgICB0cmFuc2Zvcm0oaXRlbXM6IGFueVtdLCBmaWx0ZXI6IGFueSwgc2VhcmNoQnk6IGFueSk6IGFueVtdIHtcbiAgICAgICAgaWYgKCFpdGVtcyB8fCAhZmlsdGVyKSB7XG4gICAgICAgICAgICB0aGlzLmRzLnNldERhdGEoaXRlbXMpO1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW1zO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZmlsdGVyZWRMaXN0ID0gaXRlbXMuZmlsdGVyKChpdGVtOiBhbnkpID0+IHRoaXMuYXBwbHlGaWx0ZXIoaXRlbSwgZmlsdGVyLCBzZWFyY2hCeSkpO1xuICAgICAgICB0aGlzLmRzLnNldERhdGEodGhpcy5maWx0ZXJlZExpc3QpO1xuICAgICAgICByZXR1cm4gdGhpcy5maWx0ZXJlZExpc3Q7XG4gICAgfVxuICAgIGFwcGx5RmlsdGVyKGl0ZW06IGFueSwgZmlsdGVyOiBhbnksIHNlYXJjaEJ5OiBhbnkpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IGZvdW5kID0gZmFsc2U7XG4gICAgICAgIGlmIChzZWFyY2hCeS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBpZiAoaXRlbS5ncnBUaXRsZSkge1xuICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHQgPSAwOyB0IDwgc2VhcmNoQnkubGVuZ3RoOyB0KyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbHRlciAmJiBpdGVtW3NlYXJjaEJ5W3RdXSAmJiBpdGVtW3NlYXJjaEJ5W3RdXSAhPSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbVtzZWFyY2hCeVt0XV0udG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoZmlsdGVyLnRvTG93ZXJDYXNlKCkpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpdGVtLmdycFRpdGxlKSB7XG4gICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWx0ZXIgJiYgaXRlbVtwcm9wXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW1bcHJvcF0udG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoZmlsdGVyLnRvTG93ZXJDYXNlKCkpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZm91bmQ7XG4gICAgfVxufSJdfQ==