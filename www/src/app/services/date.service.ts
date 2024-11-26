import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class DateService {
  private months: [] = [];

  constructor(private translate: TranslateService) {
    this.months = this.translate.instant('date.months');
  }

  format(format: string = 'short.day', date: Date = new Date()) {
    const dateFormat = this.translate.instant(`date.formats.${format}`);

    const firstDayOfYear = new Date(`${date.getFullYear()}-01-01`);
    if (firstDayOfYear.toISOString() === date.toISOString()) {
      return date.getFullYear();
    }

    const str = dateFormat
      .split(' ')
      .map((part: string) => {
        const regex = /%((?:d|D|m|M|y|Y)+)$/g;
        const datePart = regex.exec(part);

        if (datePart && datePart.length > 0) {
          switch (datePart[1]) {
            case 'd':
              return String(date.getDate());
            case 'D':
              return String(date.getDate()).padStart(2, '0');
            case 'm':
              return String(date.getMonth() + 1);
            case 'M':
              return String(this.months[date.getMonth()]);
            case 'y':
              return String(date.getFullYear()).substring(2, 4);
            case 'Y':
              return String(date.getFullYear());
            default:
              return '';
          }
        } else {
          return part;
        }
      })
      .join(' ');

    return str[0].toUpperCase() + str.slice(1);
  }
}
