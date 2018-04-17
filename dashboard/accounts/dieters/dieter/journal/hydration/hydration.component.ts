import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ContextService, NotifierService } from '../../../../../../service';
import { DateNavigatorOutput } from '../../../../../../shared';
import { HydrationDatabase, HydrationDataSource } from '../../../services';

@Component({
  selector: 'app-dieter-journal-hydration',
  templateUrl: 'hydration.component.html',
  styleUrls: ['hydration.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HydrationComponent implements OnInit {
  @Input() dailyHydrationGoal: number;
  @Input()
  set dates(dates: DateNavigatorOutput) {
    this.date$.next(dates);
  }

  source: HydrationDataSource | null;
  date$ = new BehaviorSubject<DateNavigatorOutput>({});

  constructor(
    private context: ContextService,
    private notifier: NotifierService,
    private database: HydrationDatabase
  ) {}

  ngOnInit(): void {
    this.source = new HydrationDataSource(
      this.notifier,
      this.database,
      this.dailyHydrationGoal
    );
    this.source.addDefault({
      account: this.context.dieterId,
      unit: 'day'
    });

    this.source.addRequired(this.date$, () => {
      const dates = this.date$.getValue();
      return {
        startDate: dates.startDate,
        endDate: dates.endDate
      };
    });
  }
}
