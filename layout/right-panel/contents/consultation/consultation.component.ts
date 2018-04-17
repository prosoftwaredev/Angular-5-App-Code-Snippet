import { Component, OnDestroy, OnInit } from '@angular/core';
import { EventsService } from '../../../../service';
import { _, PromptDialog } from '../../../../shared';

export interface ConsultationFormArgs {
  form: 'addConsultation' | 'editConsultation' | 'addUnavailability';
  id: number;
}

@Component({
  selector: 'app-consultation',
  templateUrl: './consultation.component.html',
  styleUrls: ['./consultation.component.scss']
})
export class ConsultationComponent implements OnInit, OnDestroy {
  formType: string = 'addConsultation';
  editing = false;

  constructor(private bus: EventsService) {}

  ngOnInit() {
    // listen any events emitted to this component
    this.bus.register('right-panel.consultation.form', this.setForm.bind(this));
    this.bus.register('right-panel.consultation.editing', this.setEditing.bind(this));
  }

  ngOnDestroy() {
    this.bus.unregister('right-panel.consultation.form');
    this.bus.unregister('right-panel.consultation.editing');
  }

  setEditing(value: boolean) {
    this.editing = value;
  }

  setForm(args: ConsultationFormArgs): void {
    if (args.form === 'editConsultation') {
      this.editing = true;
    }
    this.formType = args.form;
    this.bus.trigger('right-panel.consultation.meeting', args.id);
  }
}
