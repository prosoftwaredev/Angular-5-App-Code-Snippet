import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import * as lodash from 'lodash';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { OrganizationAssociation, Supplement } from 'selvera-api';
import { ContextService, NotifierService } from '../../../../../../service';
import { DateNavigatorOutput } from '../../../../../../shared';
import { FetchSupplementsSegment } from '../../../../../../shared/selvera-api';
import { SupplementDatabase, SupplementDataSource } from '../../../services';

@Component({
  selector: 'app-dieter-journal-supplements',
  templateUrl: 'supplements.component.html',
  styleUrls: ['supplements.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SupplementsComponent implements OnInit {
  @Input()
  set dates(dates: DateNavigatorOutput) {
    this.date$.next(dates);
  }

  clinics = []; // available options
  clinic$ = new Subject<number>(); // observable for source
  clinic; // selected value

  source: SupplementDataSource | null;
  date$ = new BehaviorSubject<DateNavigatorOutput>({});
  supplements: Array<FetchSupplementsSegment>;

  constructor(
    private association: OrganizationAssociation,
    private supplement: Supplement,
    private context: ContextService,
    private notifier: NotifierService,
    private database: SupplementDatabase
  ) {}

  ngOnInit(): void {
    this.source = new SupplementDataSource(this.notifier, this.database, this.supplement);
    this.source.addDefault({
      account: this.context.dieterId,
      unit: 'day'
    });
    this.source.addRequired(this.clinic$, () => ({
      organization: this.clinic
    }));
    this.source.addRequired(this.date$, () => {
      const dates = this.date$.getValue();
      return {
        startDate: dates.startDate,
        endDate: dates.endDate
      };
    });
    this.intersectOrganizations();
  }

  intersectOrganizations() {
    Promise.all([
      this.association.fetchCoachAssociation(),
      this.association.fetchClientAssociation(this.context.dieterId)
    ])
      .then(([ofCoach, ofClient]) => {
        const orgs = lodash.intersectionBy(ofCoach, ofClient, 'organization');
        // filter and map the intersected organizations
        this.clinics = orgs.map(c => ({
          value: c.organization,
          viewValue: c.organizationName
        }));
        // select one default organization
        this.clinic =
          this.context.organizationId &&
          orgs.some(o => o.organization === this.context.organizationId)
            ? this.context.organizationId
            : this.clinics.length ? this.clinics[0].value : null;
        this.selectClinic(this.clinic);
      })
      .catch(err => this.notifier.error(err));
  }

  selectClinic(value) {
    this.clinic$.next(value);
    this.context.organizationId = value;
  }
}
