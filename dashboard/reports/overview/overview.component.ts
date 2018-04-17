import { Component, OnInit } from '@angular/core';
import { EventsService } from '../../../service';

@Component({
  selector: 'app-reports-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  constructor(private bus: EventsService) {}

  ngOnInit() {
    this.bus.trigger('right-panel.deactivate');
  }
}
