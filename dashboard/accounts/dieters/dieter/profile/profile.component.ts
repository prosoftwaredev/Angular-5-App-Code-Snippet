import { Component, forwardRef, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Account, Goal, OrganizationAssociation } from 'selvera-api';
import { ContextService, EventsService, NotifierService } from '../../../../../service';
import { _, BindForm, BINDFORM_TOKEN, FormUtils } from '../../../../../shared';
import { DieterFormComponent } from '../../form/dieter.component';

@Component({
  selector: 'app-dieter-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: BINDFORM_TOKEN,
      useExisting: forwardRef(() => DieterProfileComponent)
    }
  ]
})
export class DieterProfileComponent implements BindForm, OnInit {
  form: FormGroup;
  dieterId: number;
  isLoading = false;

  constructor(
    private builder: FormBuilder,
    private account: Account,
    private goal: Goal,
    private association: OrganizationAssociation,
    private context: ContextService,
    private bus: EventsService,
    private notifier: NotifierService,
    private formUtils: FormUtils
  ) {}

  ngOnInit() {
    this.dieterId = +this.context.dieterId;
    this.createForm();

    this.bus.trigger('right-panel.component.set', 'reminders');
  }

  createForm() {
    this.form = this.builder.group({});
  }

  onSubmit() {
    if (this.form.valid) {
      this.isLoading = true;
      const { data, clinics, goals } = DieterFormComponent.preSave(
        this.form.value['dieter']
      );

      // save the account
      this.account
        .update(data)
        .then(() => {
          if (DieterFormComponent.initialClinic !== clinics[0]) {
            // delete the old association
            this.association
              .deleteClientAssociation({
                clientId: data.userId,
                organizationId: DieterFormComponent.initialClinic
              })
              .catch(err => this.notifier.error(err));

            // save the new association
            this.association
              .addClientAssociation({
                clientId: data.userId,
                organizationId: clinics[0]
              })
              .catch(err => this.notifier.error(err));
          }

          // save goals
          this.goal
            .update({
              account: data.userId,
              goal: goals
            })
            .catch(err => this.notifier.error(err));

          this.isLoading = false;
          this.notifier.success(_('NOTIFY.SUCCESS.PATIENT_UPDATED'));
        })
        .catch(err => this.notifier.error(err));
    } else {
      this.formUtils.markAsTouched(this.form);
    }
  }
}
