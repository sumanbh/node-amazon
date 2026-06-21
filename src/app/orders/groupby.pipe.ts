import { PipeTransform, Pipe } from '@angular/core';
import { OrderItem, GroupedOrder } from '../shared/types';

@Pipe({ name: 'groupby' })
export class GroupByPipe implements PipeTransform {
  transform(value: Record<string, OrderItem[]> | null | undefined): GroupedOrder[] {
    const groupby: GroupedOrder[] = [];
    if (!value) {
      return groupby;
    }
    Object.keys(value).forEach(prop => {
      groupby.push({
        prop,
        value: value[prop],
        ...value[prop][0]
      } as GroupedOrder);
    });
    return groupby;
  }
}
