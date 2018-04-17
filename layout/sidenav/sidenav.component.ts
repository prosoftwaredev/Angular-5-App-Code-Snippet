import { Component, Input, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import * as lodash from 'lodash';
import { Message } from 'selvera-api';
import { CCRPalette } from '../../config';
import { ConfigService, EventsService } from '../../service';
import { _ } from '../../shared';
import { SidenavItem } from './sidenav-item/sidenav-item.component';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html'
})
export class SidenavComponent implements OnInit {
  @Input() isOpen = false;

  sidenavItems: SidenavItem[] = [];
  _this: SidenavComponent = this;
  route: string;
  palette: CCRPalette;

  constructor(
    private router: Router,
    private message: Message,
    private config: ConfigService,
    private bus: EventsService
  ) {
    this.palette = this.config.get('palette');

    router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.route = event.url.split('/')[1];
        this.updateNavigation();
      }
    });
  }

  ngOnInit() {
    this.initNavigation();
    // register event to refresh unread
    this.bus.register('system.timer', this.updateUnread.bind(this));
    this.bus.register('system.unread.threads', this.updateUnread.bind(this));
  }

  initNavigation() {
    this.sidenavItems = [
      {
        navName: _('SIDENAV.ACCOUNTS'),
        route: 'accounts',
        icon: 'people outline',
        children: [
          {
            navName: _('GLOBAL.PATIENTS'),
            navRoute: 'accounts/patients',
            icon: 'person'
          },
          {
            navName: _('GLOBAL.COACHES'),
            navRoute: 'accounts/coaches',
            icon: 'assignment_ind'
          },
          { navName: _('GLOBAL.CLINICS'), navRoute: 'accounts/clinics', icon: 'domain' }
        ]
      },
      {
        navName: _('SIDENAV.SCHEDULE'),
        route: 'schedule',
        icon: 'date_range',
        children: [
          {
            navName: _('SIDENAV.SCHEDULE_VIEW'),
            navRoute: 'schedule/view',
            icon: 'schedule'
          },
          {
            navName: _('SIDENAV.SCHEDULE_AVAILABLE'),
            navRoute: 'schedule/available',
            icon: 'event_available'
          }
        ]
      },
      {
        navName: _('SIDENAV.MESSAGES'),
        route: 'messages',
        navRoute: 'messages',
        icon: 'chat',
        unread: 0
      },
      {
        navName: _('SIDENAV.RESOURCES'),
        route: 'resources',
        icon: 'help',
        children: [
          {
            navName: _('SIDENAV.SUPPORT'),
            navLink: 'https://coachcare.zendesk.com/hc/en-us',
            icon: 'live_help'
          }
          // { navName: _('SIDENAV.MARKETING'), navRoute: 'resources/marketing' },
          // { navName: _('SIDENAV.FAQS'), navRoute: 'resources/faqs' }
        ]
      },
      {
        navName: _('SIDENAV.REPORTS'),
        navRoute: 'reports',
        icon: 'insert_chart',
        children: [
          {
            navName: _('SIDENAV.OVERVIEW'),
            navRoute: 'reports/overview',
            icon: 'equalizer'
          },
          {
            navName: _('SIDENAV.ALERTS'),
            navRoute: 'reports/alerts',
            icon: 'notifications'
          }
        ]
      }
    ];
    this.updateUnread();
  }

  updateNavigation() {
    this.sidenavItems = this.sidenavItems.map(item => {
      if (this.route === item.route && !item.expanded) {
        item.expanded = true;
        // only changes the reference when the status changes
        return { ...item };
      }
      return item;
    });
  }

  updateUnread() {
    Promise.all([this.message.fetchUnread()]).then(([threads]) => {
      // update the unread threads
      const m = lodash.findIndex(this.sidenavItems, { navRoute: 'messages' });
      if (this.sidenavItems[m].unread !== threads.unreadThread) {
        this.sidenavItems[m].unread = threads.unreadThread;
        this.sidenavItems[m] = Object.assign({}, this.sidenavItems[m]);
      }
    });
  }
}
