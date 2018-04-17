import { Component, OnInit } from '@angular/core';
import { EventsService } from '../../../service';

@Component({
  selector: 'app-schedule-availability',
  templateUrl: './schedule-availability.component.html',
  styleUrls: ['./schedule-availability.component.scss']
})
export class ScheduleAvailabilityComponent implements OnInit {
  constructor(private bus: EventsService) {}

  ngOnInit() {
    this.bus.trigger('right-panel.component.set', 'addConsultation');
  }

  addUnavailableForm(): void {
    this.bus.trigger('right-panel.consultation.form', {
      form: 'addUnavailability'
    });
  }
}
