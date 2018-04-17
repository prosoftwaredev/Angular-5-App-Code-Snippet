import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatSort, Sort } from '@angular/material';
import { findIndex } from 'lodash';
import * as lodash from 'lodash';
import { Subject } from 'rxjs/Subject';
import {
  CCRService,
  ContextService,
  EventsService,
  NotifierService
} from '../../../service';
import { _, CcrPaginator } from '../../../shared';
import { AccountCreateDialog } from '../dialogs';
import {
  CoachesDatabase,
  CoachesDataSource,
  CoachesDirection,
  CoachesOrder
} from './services';

interface ClinicPermissions {
  admin?: boolean;
  accessall?: boolean;
}

@Component({
  selector: 'app-coaches',
  templateUrl: './coaches.component.html',
  styleUrls: ['./coaches.component.scss'],
  providers: [CoachesDatabase],
  encapsulation: ViewEncapsulation.None
})
export class CoachesComponent implements OnInit {
  source: CoachesDataSource | null;

  clinics = []; // available options
  clinic$ = new Subject<number>(); // observable for source
  clinic; // selected value
  permissions: ClinicPermissions = {}; // current clinic permissions

  @ViewChild(CcrPaginator) paginator: CcrPaginator;
  sort: MatSort = new MatSort();

  constructor(
    private dialog: MatDialog,
    private ccr: CCRService,
    private context: ContextService,
    private bus: EventsService,
    private notifier: NotifierService,
    private database: CoachesDatabase
  ) {}

  ngOnInit() {
    const errorHandler = function(err) {
      switch (err) {
        case 'You do not have proper permission to access this endpoint':
          this.addError(_('NOTIFY.ERROR.NO_COACH_LISTING_PERMISSION'));
          break;
        default:
          this.addError(err);
      }
    };

    // setup the table source
    this.source = new CoachesDataSource(
      this.notifier,
      this.database,
      this.paginator,
      this.sort
    );
    this.source.showEmpty = false;
    this.source.errorHandler = errorHandler;
    // add the clinics filter
    this.source.addRequired(this.clinic$, () => ({
      organization: this.clinic
    }));

    // setup the clinics selector
    this.ccr
      .clinicSelector()
      .then(clinics => {
        this.clinics = clinics;
        // select the first organization with enough permissions
        const idx = findIndex(clinics, { permissions: { accessall: true } });
        this.clinic = this.clinics.length
          ? idx !== -1 ? this.clinics[idx].value : this.clinics[0].value
          : null;
        this.selectClinic(this.clinic);
      })
      .catch(err => this.notifier.error(err));

    this.bus.trigger('right-panel.component.set', 'notifications');
  }

  onSorted(sort: Sort): void {
    this.sort.active = sort.active;
    this.sort.direction = sort.direction;
    this.sort.sortChange.emit(sort);
  }

  selectClinic(value) {
    this.clinic$.next(value);
    this.permissions = this.clinics.reduce((prev, curr) => {
      return curr.value === value ? curr.permissions : prev;
    }, {});
    this.context.organizationId = value;
  }

  createDialog() {
    if (!this.permissions.admin) {
      this.notifier.error(_('NOTIFY.ERROR.CANNOT_CREATE_ACCOUNTS'));
      return;
    }

    this.dialog
      .open(AccountCreateDialog, {
        width: '80vw',
        disableClose: true,
        data: {
          accountType: 'coach'
        }
      })
      .afterClosed()
      .subscribe(user => {
        if (user) {
          this.notifier.success(_('NOTIFY.SUCCESS.COACH_CREATED'));
          this.source.refresh();
        }
      });
  }
}
