import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { SupplementDataSource } from '../../../../services';

@Component({
  selector: 'app-dieter-journal-supplements-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class SupplementsTableComponent implements OnInit, OnDestroy {
  @Input() source: SupplementDataSource | null;

  sub: Subscription;
  heading: Array<string>;
  supplements: Array<string>;

  ngOnInit() {
    this.sub = this.source.connect().subscribe(v => {
      this.heading = [this.source.columns[0]];
      this.supplements = this.source.columns.slice(1);
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
