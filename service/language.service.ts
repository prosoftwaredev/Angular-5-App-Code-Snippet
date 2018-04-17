import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { CCRApp } from '../config';
import { Profile } from '../shared/selvera-api';
import { _ } from '../shared/utils';
import { ConfigService } from './config.service';
import { EventsService } from './events.service';

import * as moment from 'moment-timezone';
import '../../assets/i18n/moment.es.ts';

@Injectable()
export class LanguageService {
  private lang: string;

  constructor(
    private config: ConfigService,
    private bus: EventsService,
    private translate: TranslateService,
    private cookie: CookieService
  ) {}

  /**
   * LOCALE_ID
   */
  toLowerCase() {
    // console.log('LOCALE_ID');
    return this.lang;
  }

  initLanguage(): void {
    const config: CCRApp = this.config.get('app');

    this.translate.addLangs(config.lang.supported);
    this.translate.setDefaultLang(config.lang.default);

    this.translate.onLangChange.subscribe(v => {
      this.update(v.lang);
    });

    if (this.get() && this.translate.getLangs().indexOf(this.get()) > -1) {
      this.use(this.get());
    } else if (this.translate.getLangs().indexOf(this.translate.getBrowserLang()) > -1) {
      this.set(this.translate.getBrowserLang());
    } else {
      this.set(config.lang.default);
    }

    this.setupMoment();

    this.bus.register('user.data', this.setupTimezone.bind(this));
  }

  setupMoment() {
    // momentjs custom settings
    const values = this.config.get('app.moment.thresholds', {
      m: 57,
      h: 24,
      d: 28,
      M: 12
    });

    Object.keys(values).forEach(unit => {
      moment.relativeTimeThreshold(unit, values[unit]);
    });
  }

  setupTimezone(user: Profile) {
    moment.tz.setDefault(user.timezone);
  }

  get(): string {
    if (!this.lang) {
      this.lang = this.cookie.get('ccrStaticLanguage');
    }
    return this.lang;
  }

  save(language: string): void {
    this.cookie.set('ccrStaticLanguage', language, null, '/');
  }

  use(language: string): void {
    this.lang = language;
    this.translate.use(this.lang);
    moment.locale(this.lang);
  }

  set(language: string): void {
    this.use(language);
    this.save(language);
  }

  update(lang) {
    this.translate
      .get([
        _('MOMENTJS.YESTERDAY'),
        _('MOMENTJS.TODAY'),
        _('MOMENTJS.TOMORROW'),
        _('MOMENTJS.LASWEEK')
      ])
      .subscribe(translations => {
        moment.updateLocale(lang, {
          calendar: {
            lastDay: translations['MOMENTJS.YESTERDAY'],
            sameDay: translations['MOMENTJS.TODAY'],
            nextDay: translations['MOMENTJS.TOMORROW'],
            lastWeek: translations['MOMENTJS.LASWEEK'],
            nextWeek: 'dddd',
            sameElse: 'MMM D, YYYY'
          }
        });
      });
  }
}
