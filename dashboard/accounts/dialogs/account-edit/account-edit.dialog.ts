import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Account } from 'selvera-api';
import { NotifierService } from '../../../../service';
import { FormUtils } from '../../../../shared';

export interface AccountEditDialogData {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}

@Component({
  selector: 'app-account-edit-dialog',
  templateUrl: 'account-edit.dialog.html',
  host: { class: 'ccr-dialog' },
  encapsulation: ViewEncapsulation.None
})
export class AccountEditDialog implements OnInit {
  form: FormGroup;

  constructor(
    private builder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: AccountEditDialogData,
    private dialogRef: MatDialogRef<AccountEditDialog>,
    private account: Account,
    private notifier: NotifierService,
    private formUtils: FormUtils
  ) {}

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.form = this.builder.group({
      userId: undefined,
      firstName: '',
      lastName: '',
      email: ''
    });
    this.form.patchValue(this.data);
  }

  onSubmit() {
    if (this.form.valid) {
      // collect the account data
      const data = this.form.value;
      // save the account
      this.account
        .update(data)
        .then(() => {
          // return the result to the caller component
          this.dialogRef.close(data);
        })
        .catch(err => this.notifier.error(err));
    } else {
      this.formUtils.markAsTouched(this.form);
    }
  }
}
