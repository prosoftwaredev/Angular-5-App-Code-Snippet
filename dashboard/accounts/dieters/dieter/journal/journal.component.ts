import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { EventsService } from '../../../../../service';
import { DateNavigatorOutput } from '../../../../../shared';
import { FetchGoalResponse } from '../../../../../shared/selvera-api';

@Component({
  selector: 'app-dieter-journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DieterJournalComponent implements OnInit, OnDestroy {
  // controls with their config
  components = ['food', 'supplements', 'water'];
  component = 'food';
  timeframe = 'week';
  goals: FetchGoalResponse;
  dates: DateNavigatorOutput = {};
  routerParamSub: Subscription;

  constructor(
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private bus: EventsService
  ) {}

  ngOnInit() {
    this.route.parent.data.forEach((data: any) => {
      this.goals = data.goals;
    });

    // component initialization
    this.routerParamSub = this.route.paramMap.subscribe((params: ParamMap) => {
      const s = params.get('s');
      this.section = this.components.indexOf(s) >= 0 ? s : this.component;
    });

    this.bus.trigger('right-panel.component.set', 'reminders');
  }

  ngOnDestroy() {
    this.routerParamSub.unsubscribe();
  }

  get section(): string {
    return this.component;
  }
  set section(target: string) {
    this.component = target;
  }

  public selectedDate(dates: DateNavigatorOutput): void {
    this.dates = dates;
    // prevents exception when changing timeframe from child component
    this.cdr.detectChanges();
  }
}
