import { Component, forwardRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Account, OrganizationAssociation } from 'selvera-api';
import { ContextService, NotifierService } from '../../../../../service';
import { _, BindForm, BINDFORM_TOKEN, FormUtils } from '../../../../../shared';
import { CoachFormComponent } from '../../form/coach.component';

@Component({
  selector: 'app-coach-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [
    {
      provide: BINDFORM_TOKEN,
      useExisting: forwardRef(() => CoachProfileComponent)
    }
  ]
})
export class CoachProfileComponent implements BindForm, OnInit {
  form: FormGroup;
  coachId: number;
  isLoading = false;

  constructor(
    private builder: FormBuilder,
    private account: Account,
    private association: OrganizationAssociation,
    private context: ContextService,
    private notifier: NotifierService,
    private formUtils: FormUtils
  ) {}

  ngOnInit() {
    this.coachId = +this.context.coachId;
    this.createForm();
  }

  createForm() {
    this.form = this.builder.group({});
  }

  onSubmit() {
    if (this.form.valid) {
      this.isLoading = true;
      const { data, clinics } = CoachFormComponent.preSave(this.form.value['coach']);

      // save the account
      this.account
        .update(data)
        .then(() => {
          // process the associations
          clinics.forEach(c => {
            if (c.picked !== c.initial.picked) {
              // addition or removal
              if (c.picked) {
                this.addAssociation(data, c);
              } else {
                this.deleteAssociation(data, c);
              }
            } else if (
              c.admin !== c.initial.admin ||
              c.accessall !== c.initial.accessall
            ) {
              // update only
              this.updateAssociation(data, c);
            }
          });

          this.isLoading = false;
          this.notifier.success(_('NOTIFY.SUCCESS.COACH_UPDATED'));
        })
        .catch(err => this.notifier.error(err));
    } else {
      this.formUtils.markAsTouched(this.form);
    }
  }

  addAssociation(data, c) {
    this.association
      .addCoachAssociation({
        providerId: data.userId,
        organizationId: +c.clinicId
      })
      .then(() => {
        this.updateAssociation(data, c);
      })
      .catch(err => this.notifier.error(err));
  }

  updateAssociation(data, c) {
    this.association.updateCoachAssociation({
      providerId: data.userId,
      organizationId: +c.clinicId,
      permissionAccessAll: c.accessall,
      permissionAdmin: c.admin,
      permissionAssignment: undefined
    });
  }

  deleteAssociation(data, c) {
    this.association
      .deleteCoachAssociation({
        providerId: data.userId,
        organizationId: +c.clinicId
      })
      .catch(err => this.notifier.error(err));
  }
}
