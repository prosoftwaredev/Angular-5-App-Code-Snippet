/**
 * CCR Site Configuration.
 */
import { InjectionToken } from '@angular/core';
import { DurationInputObject } from 'moment';

export const CCR_CONFIG = new InjectionToken<CCRConfig>('ccr.config');

export interface CCRApp {
  accountType: {
    profileRoute(account: { id: any; accountType: any }): string;
  };
  default: {
    startTime: {
      hours: number;
      minutes: number;
      seconds: number;
    };
    noteMinDate: DurationInputObject;
    noteMaxLength: number;
  };
  durations: {
    notifier: number;
  };
  lang: {
    default: string;
    supported: Array<string>;
  };
  limit: {
    notifications: number;
    reminders: number;
    threads: number;
  };
  moment?: {
    thresholds: {
      [key: string]: number;
    };
  };
  refresh: {
    chat: {
      newMessages: number;
      updateThread: number;
      updateTimestamps: number;
    };
  };
  screen: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
  };
}

export interface CCRPalette {
  [color: string]: string;
}

export type CCRColorsPalette = Array<[string, string]>;

export interface CCRColors {
  get(i: number, type?: 'default' | 'contrast');
}

export interface CCRConfig {
  app: CCRApp;
  chart: any;
  colors: CCRColors;
  palette: CCRPalette;
  // any custom config field
  [field: string]: any;
}
