import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'split'
})
export class SplitPipe implements PipeTransform {

  transform(value: string, splitter: string = ","): string[] {
    return value.split(splitter);
  }

}
