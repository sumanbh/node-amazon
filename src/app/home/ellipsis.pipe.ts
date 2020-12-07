import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ellipsis'
})
export class EllipsisPipe implements PipeTransform {
  transform(val: string, maxLength?: number) {
    if (maxLength === undefined) {
      return val;
    }

    if (val.length > maxLength) {
      return `${val.substring(0, maxLength)}...`;
    }

    return val;
  }
}
