import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {
  ContextService,
  LayoutService,
  NotifierService
} from '../../../../../../service';
import { DateNavigatorOutput } from '../../../../../../shared';
import { FoodData, FoodDatabase, FoodDataSource } from '../../../services';

@Component({
  selector: 'app-dieter-journal-food',
  templateUrl: 'food.component.html',
  styleUrls: ['food.component.scss']
})
export class FoodComponent implements OnInit {
  @Input()
  set dates(dates: DateNavigatorOutput) {
    this.date$.next(dates);
  }

  source: FoodDataSource | null;
  date$ = new BehaviorSubject<DateNavigatorOutput>({});
  data = new FoodData();
  cols: number;

  constructor(
    private context: ContextService,
    private layout: LayoutService,
    private notifier: NotifierService,
    private database: FoodDatabase
  ) {}

  ngOnInit() {
    this.source = new FoodDataSource(this.notifier, this.database);
    this.source.addDefault({
      account: +this.context.dieterId,
      noLimit: true
    });
    this.source.addRequired(this.date$, () => {
      const dates = this.date$.getValue();
      return {
        startDate: dates.startDate,
        endDate: dates.endDate
      };
    });

    this.source.stat$.subscribe(stats => {
      this.data = stats;
    });

    this.layout.circleCols.subscribe(val => (this.cols = val));
  }
}
