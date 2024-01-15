import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'appFilter' })
export class FilterPipe implements PipeTransform {
  /**
   * Transform
   *
   * @param {any[]} items
   * @param {string} searchText
   * @returns {any[]}
   */
  transform(items: any[], searchText: string): any[] {
    if (!items) {
      return [];
    }
    if (!searchText) {
      return items;
    }
    searchText = searchText.toLocaleLowerCase();

    return items.filter(it => {
      if (!!it.first_name || !!it.last_name) {
        // searching on user entity
        return it.first_name.toLocaleLowerCase().includes(searchText)
          || it.last_name.toLocaleLowerCase().includes(searchText)
          || ((it.first_name + ' ' + it.last_name).toLocaleLowerCase().includes(searchText));
      } else if (!!it.name) {
        // searching on company entity
        return it.name.toLocaleLowerCase().includes(searchText);
      }
    });
  }
}
