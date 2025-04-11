import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'countryFlag',
  standalone: true
})
export class CountryFlagPipe implements PipeTransform {
  transform(countryCode: string): string {
    if (!countryCode) {
      return '';
    }
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(letter => 127397 + letter.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }
}
