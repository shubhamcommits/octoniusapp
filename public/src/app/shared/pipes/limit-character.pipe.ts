import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'limitCharacter'
})
export class LimitCharacterPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return null;
  }

}
