import { PipeTransform, Pipe } from '@angular/core';

@Pipe({ name: 'groupby' })
export class GroupByPipe implements PipeTransform {
  transform(value, args: string[]): any {
    const groupby = [];
    Object.keys(value || []).forEach((prop) => {
      groupby.push(
        {
          prop,
          value: value[prop],
          ...value[prop][0],
        }
      );
    });
    return groupby;
  }
}
