import { HttpClient } from '@angular/common/http';
import { APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CookieService } from 'ngx-cookie-service';
import {
  Access as SelveraAccess,
  Account as SelveraAccount,
  ApiService as SelveraApiService,
  Consultation as SelveraConsultation,
  Food as SelveraFood,
  Goal as SelveraGoal,
  Hydration as SelveraHydration,
  IPSummaryData as SelveraIPSummaryData,
  MeasurementActivity as SelveraMeasurementActivity,
  MeasurementBody as SelveraMeasurementBody,
  MeasurementSleep as SelveraMeasurementSleep,
  Message as SelveraMessage,
  Organization as SelveraOrganization,
  OrganizationAssociation as SelveraOrganizationAssociation,
  Reports as SelveraReports,
  Schedule as SelveraSchedule,
  Supplement as SelveraSupplement,
  Timezone as SelveraTimezone,
  User as SelveraUser
} from 'selvera-api';
import { environment } from '../../environments/environment';
import { CCR_CONFIG, Config } from '../config';
import { FormUtils, ViewUtils } from '../shared/utils';
import {
  AuthGuard,
  AuthService,
  CCRService,
  ConfigService,
  ContextService,
  EventsService,
  LanguageService,
  LayoutService,
  NotifierService
} from './';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function selveraApiFactory() {
  const selveraApiService = new SelveraApiService();
  selveraApiService.setOptionHeaders({
    account: 'provider',
    cookieDomain: environment.cookieDomain,
    appName: environment.appName,
    appVersion: '1.0'
  });

  selveraApiService.setEnvironment(environment.selveraApiEnv, environment.apiUrl);

  return selveraApiService;
}

export function selveraAccessFactory(selveraApiService: SelveraApiService) {
  return new SelveraAccess(selveraApiService);
}
export function selveraIPSummaryDataFactory(selveraApiService: SelveraApiService) {
  return new SelveraIPSummaryData(selveraApiService);
}
export function selveraAccountFactory(selveraApiService: SelveraApiService) {
  return new SelveraAccount(selveraApiService);
}
export function selveraConsultationFactory(selveraApiService: SelveraApiService) {
  return new SelveraConsultation(selveraApiService);
}
export function selveraFoodFactory(selveraApiService: SelveraApiService) {
  return new SelveraFood(selveraApiService);
}
export function selveraGoalFactory(selveraApiService: SelveraApiService) {
  return new SelveraGoal(selveraApiService);
}
export function selveraHydrationFactory(selveraApiService: SelveraApiService) {
  return new SelveraHydration(selveraApiService);
}
export function selveraMeasurementActivityFactory(selveraApiService: SelveraApiService) {
  return new SelveraMeasurementActivity(selveraApiService);
}
export function selveraMeasurementBodyFactory(selveraApiService: SelveraApiService) {
  return new SelveraMeasurementBody(selveraApiService);
}
export function selveraMeasurementSleepFactory(selveraApiService: SelveraApiService) {
  return new SelveraMeasurementSleep(selveraApiService);
}
export function selveraOrganizationFactory(selveraApiService: SelveraApiService) {
  return new SelveraOrganization(selveraApiService);
}
export function selveraOrganizationAssociationFactory(
  selveraApiService: SelveraApiService
) {
  return new SelveraOrganizationAssociation(selveraApiService);
}
export function selveraMessageFactory(selveraApiService: SelveraApiService) {
  return new SelveraMessage(selveraApiService);
}
export function selveraReportsFactory(selveraApiService: SelveraApiService) {
  return new SelveraReports(selveraApiService);
}
export function selveraScheduleFactory(selveraApiService: SelveraApiService) {
  return new SelveraSchedule(selveraApiService);
}
export function selveraSupplementFactory(selveraApiService: SelveraApiService) {
  return new SelveraSupplement(selveraApiService);
}
export function selveraTimezoneFactory() {
  return new SelveraTimezone();
}
export function selveraUserFactory(selveraApiService: SelveraApiService) {
  return new SelveraUser(selveraApiService);
}

export function onAppInit(auth: AuthService, lang: LanguageService) {
  return (): Promise<any> => {
    return new Promise((resolve, reject) => {
      lang.initLanguage();
      if (!auth.check()) {
        auth.redirect();
        reject();
      }
      resolve();
    });
  };
}

export function AppProviders() {
  return [
    // api services
    {
      provide: SelveraApiService,
      useFactory: selveraApiFactory
    },
    {
      provide: SelveraAccount,
      useFactory: selveraAccountFactory,
      deps: [SelveraApiService]
    },
    {
      provide: SelveraConsultation,
      useFactory: selveraConsultationFactory,
      deps: [SelveraApiService]
    },
    {
      provide: SelveraFood,
      useFactory: selveraFoodFactory,
      deps: [SelveraApiService]
    },
    {
      provide: SelveraGoal,
      useFactory: selveraGoalFactory,
      deps: [SelveraApiService]
    },
    {
      provide: SelveraHydration,
      useFactory: selveraHydrationFactory,
      deps: [SelveraApiService]
    },
    {
      provide: SelveraMeasurementActivity,
      useFactory: selveraMeasurementActivityFactory,
      deps: [SelveraApiService]
    },
    {
      provide: SelveraMeasurementBody,
      useFactory: selveraMeasurementBodyFactory,
      deps: [SelveraApiService]
    },
    {
      provide: SelveraMeasurementSleep,
      useFactory: selveraMeasurementSleepFactory,
      deps: [SelveraApiService]
    },
    {
      provide: SelveraMessage,
      useFactory: selveraMessageFactory,
      deps: [SelveraApiService]
    },
    {
      provide: SelveraOrganization,
      useFactory: selveraOrganizationFactory,
      deps: [SelveraApiService]
    },
    {
      provide: SelveraOrganizationAssociation,
      useFactory: selveraOrganizationAssociationFactory,
      deps: [SelveraApiService]
    },
    {
      provide: SelveraReports,
      useFactory: selveraReportsFactory,
      deps: [SelveraApiService]
    },
    {
      provide: SelveraSchedule,
      useFactory: selveraScheduleFactory,
      deps: [SelveraApiService]
    },
    {
      provide: SelveraSupplement,
      useFactory: selveraSupplementFactory,
      deps: [SelveraApiService]
    },
    {
      provide: SelveraTimezone,
      useFactory: selveraTimezoneFactory
    },
    {
      provide: SelveraUser,
      useFactory: selveraUserFactory,
      deps: [SelveraApiService]
    },
    {
      provide: SelveraIPSummaryData,
      useFactory: selveraIPSummaryDataFactory,
      deps: [SelveraApiService]
    },
    // site services
    {
      provide: CCR_CONFIG,
      useValue: Config
    },
    AuthGuard,
    AuthService,
    ConfigService,
    CCRService,
    ContextService,
    CookieService,
    EventsService,
    LanguageService,
    LayoutService,
    NotifierService,
    {
      provide: LOCALE_ID,
      useExisting: LanguageService
    },
    {
      provide: APP_INITIALIZER,
      useFactory: onAppInit,
      deps: [AuthService, LanguageService],
      multi: true
    },
    // view helpers
    FormUtils,
    ViewUtils
  ];
}
