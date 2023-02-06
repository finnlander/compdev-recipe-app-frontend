import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'ellipsis' })
export class EllipsisPipe implements PipeTransform {
  transform(
    value: string | null | undefined,
    limit = 255,
    completeWords = true,
    ellipsis = '...'
  ) {
    if (!value || value.length < limit) {
      return value;
    }

    const appliedLimit = completeWords
      ? value.substring(0, limit).lastIndexOf(' ')
      : limit;

    return value.substring(0, appliedLimit) + ellipsis;
  }
}
