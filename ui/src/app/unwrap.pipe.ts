import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'unwrap'
})
export class UnwrapPipe implements PipeTransform {

  transform(obj: any, prop?: string): any {
    if (!obj) return null;

    const firstKey = Object.keys(obj)[0];
    const value = obj[firstKey];

    return prop ? value?.[prop] : value;
  }

}
