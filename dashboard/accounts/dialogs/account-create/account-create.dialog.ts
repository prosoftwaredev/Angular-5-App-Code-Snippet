import { Component, forwardRef, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Account, Goal, OrganizationAssociation } from 'selvera-api';
import { NotifierService } from '../../../../service';
import { BindForm, BINDFORM_TOKEN, FormUtils } from '../../../../shared';
import { CoachFormComponent } from '../../coaches/form/coach.component';
import { DieterFormComponent } from '../../dieters/form/dieter.component';

export interface AccountCreateDialogData {
  accountType?: string;
}

@Component({
  selector: 'app-account-create-dialog',
  templateUrl: 'account-create.dialog.html',
  host: { class: 'ccr-dialog' },
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: BINDFORM_TOKEN,
      useExisting: forwardRef(() => AccountCreateDialog)
    }
  ]
})
export class AccountCreateDialog implements BindForm, OnInit {
  form: FormGroup;
  temp: {};

  constructor(
    private builder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: AccountCreateDialogData,
    private dialogRef: MatDialogRef<AccountCreateDialog>,
    private account: Account,
    private goal: Goal,
    private association: OrganizationAssociation,
    private notifier: NotifierService,
    private formUtils: FormUtils
  ) {
    this.data = data ? data : {};
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.form = this.builder.group({
      accountType: 'dieter'
    });
    this.form.patchValue(this.data);
  }

  onTypeChange(values) {
    this.temp = Object.assign({}, this.temp, values);
  }

  onSubmit() {
    if (this.form.valid) {
      // collect and format the account data
      const type = this.data.accountType
        ? this.data.accountType
        : this.form.value.accountType;

      let data,
        clinics,
        goals = [];

      switch (type) {
        case 'dieter':
          ({ data, clinics, goals } = DieterFormComponent.preSave(this.form.value[type]));
          data.accountType = 3;
          break;
        case 'coach':
          ({ data, clinics } = CoachFormComponent.preSave(this.form.value[type]));
          data.accountType = 2;
          break;
      }

      // save the account
      this.account
        .add(data)
        .then(id => {
          data.userId = +id;

          // save associations
          switch (type) {
            case 'dieter':
              // patient single association
              this.association
                .addClientAssociation({
                  clientId: data.userId,
                  organizationId: clinics[0]
                })
                .then(() => {
                  this.goal.update({
                    account: data.userId,
                    goal: goals
                  });
                })
                .catch(err => this.notifier.error(err));

              break;

            case 'coach':
              // coach associations with its permissions
              clinics.filter(c => c.picked).forEach(c => {
                this.association
                  .addCoachAssociation({
                    providerId: data.userId,
                    organizationId: +c.clinicId
                  })
                  .then(() => {
                    this.association.updateCoachAssociation({
                      providerId: data.userId,
                      organizationId: +c.clinicId,
                      permissionAccessAll: c.accessall,
                      permissionAdmin: c.admin,
                      permissionAssignment: undefined
                    });
                  })
                  .catch(err => this.notifier.error(err));
              });
              break;
          }

          // return the result to the caller component
          this.dialogRef.close(data);
        })
        .catch(err => this.notifier.error(err));
    } else {
      this.formUtils.markAsTouched(this.form);
    }
  }
}
