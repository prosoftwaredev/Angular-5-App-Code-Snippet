import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material';
import { findIndex } from 'lodash';
import { Subject } from 'rxjs/Subject';
import {
  CCRService,
  ContextService,
  EventsService,
  NotifierService
} from '../../../service';
import { _, CcrPaginator } from '../../../shared';
import { AccountCreateDialog } from '../dialogs';
import { DietersDatabase, DietersDataSource } from './services';

interface ClinicPermissions {
  admin?: boolean;
  accessall?: boolean;
}

@Component({
  selector: 'app-dieters',
  templateUrl: './dieters.component.html',
  styleUrls: ['./dieters.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DietersComponent implements OnInit {
  recentsSource: DietersDataSource | null;
  dietersSource: DietersDataSource | null;

  clinics = []; // available options
  clinic$ = new Subject<number>(); // observable for source
  clinic; // selected value
  permissions: ClinicPermissions = {}; // current clinic permissions

  @ViewChild(CcrPaginator) paginator: CcrPaginator;

  constructor(
    private dialog: MatDialog,
    private ccr: CCRService,
    private context: ContextService,
    private bus: EventsService,
    private notifier: NotifierService,
    private database: DietersDatabase
  ) {}

  ngOnInit() {
    const errorHandler = function(err) {
      switch (err) {
        case 'You do not have proper permission to access this endpoint':
          this.addError(_('NOTIFY.ERROR.NO_PATIENT_LISTING_PERMISSION'));
          break;
        default:
          this.addError(err);
      }
    };

    // setup the recent registries table
    this.recentsSource = new DietersDataSource(this.notifier, this.database);
    this.recentsSource.showEmpty = false;
    this.recentsSource.errorHandler = errorHandler;
    this.recentsSource.addDefault({
      pageSize: 5,
      offset: 0,
      order: 'created',
      direction: 'desc'
    });
    this.recentsSource.addRequired(this.clinic$, () => ({
      organization: this.clinic
    }));

    // setup the main patients table
    this.dietersSource = new DietersDataSource(
      this.notifier,
      this.database,
      this.paginator
    );
    this.dietersSource.showEmpty = false;
    this.dietersSource.errorHandler = errorHandler;
    this.dietersSource.addRequired(this.clinic$, () => ({
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
          accountType: 'dieter'
        }
      })
      .afterClosed()
      .subscribe(user => {
        if (user) {
          this.notifier.success(_('NOTIFY.SUCCESS.PATIENT_CREATED'));
          this.recentsSource.refresh();
          this.dietersSource.refresh();
        }
      });
  }
}
