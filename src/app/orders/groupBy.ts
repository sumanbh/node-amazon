import { PipeTransform, Pipe } from "@angular/core";

@Pipe({name: 'keys'})
export class KeysPipe implements PipeTransform {
  transform(value, args:string[]) : any {
    let keys = [];
    for (let key in value) {
      keys.push({key: key, value: value[key], total: value[key][0].order_total, date: value[key][0].date_added, fullname: value[key][0].fullname, address: value[key][0].address, city: value[key][0].city, state: value[key][0].state, zip: value[key][0].zip});
    }
    console.log(keys)
    return keys;
  }
}