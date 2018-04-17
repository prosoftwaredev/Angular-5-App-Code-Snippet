/**
 * App Configuration.
 */
import { CCRApp } from './config.interface';

function getProfileRoute(account: { id: any; accountType: any }): string {
  let role = '';
  switch (account.accountType.toString()) {
    case '1':
    case 'admin':
      role = 'admin';
      break;
    case '2':
    case 'provider':
      role = 'coaches';
      break;
    case '3':
    case 'client':
      role = 'patients';
      break;
  }

  return `/accounts/${role}/${account.id}`;
}

export const AppConfig: CCRApp = {
  accountType: {
    profileRoute: getProfileRoute
  },
  default: {
    startTime: {
      hours: 8,
      minutes: 0,
      seconds: 0
    },
    noteMinDate: { month: 1 },
    noteMaxLength: 100
  },
  durations: {
    notifier: 4500
  },
  lang: {
    default: 'es',
    supported: ['en', 'es']
  },
  limit: {
    notifications: 12,
    reminders: 3,
    threads: 10
  },
  moment: {
    thresholds: {
      m: 57,
      h: 24,
      d: 28,
      M: 12
    }
  },
  refresh: {
    chat: {
      newMessages: 5000,
      updateThread: 30000,
      updateTimestamps: 20000
    }
  },
  screen: {
    xs: 600,
    sm: 780,
    md: 992,
    lg: 1200
  }
};
