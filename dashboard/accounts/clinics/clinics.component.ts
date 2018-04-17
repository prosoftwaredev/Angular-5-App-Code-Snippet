import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { EventsService, NotifierService } from '../../../service';
import { ClinicsDatabase, ClinicsDataSource } from './services';

@Component({
  selector: 'app-clinics',
  templateUrl: './clinics.component.html',
  styleUrls: ['./clinics.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ClinicsComponent implements OnInit {
  source: ClinicsDataSource | null;

  // @ViewChild(CcrPaginator) paginator: CcrPaginator;

  constructor(
    private bus: EventsService,
    private notifier: NotifierService,
    private database: ClinicsDatabase
  ) {}

  ngOnInit() {
    // setup the table source
    this.source = new ClinicsDataSource(
      this.notifier,
      this.database
      /*, this.paginator*/
    );
    this.source.showEmpty = false;

    this.bus.trigger('right-panel.component.set', 'notifications');
  }
}
