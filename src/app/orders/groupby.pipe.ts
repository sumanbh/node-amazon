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
          total: value[prop][0].order_total,
          date: value[prop][0].date_added,
          fullname: value[prop][0].fullname,
          address: value[prop][0].address,
          city: value[prop][0].city,
          state: value[prop][0].state,
          zip: value[prop][0].zip
        }
      );
    });
    return groupby;
  }
}
