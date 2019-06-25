import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'insertDecimalPoint'
})
export class InsertDecimalPointPipe implements PipeTransform {

  transform(number: number, point: number): number {
    return parseInt((number / 100).toFixed(point), 10);
  }

}
