import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import * as moment from 'moment-timezone';
import { Consultation } from 'selvera-api';
import { ConfigService, ContextService, NotifierService } from '../../../../service';
import { _, FormUtils } from '../../../../shared';
import { ConsultationCreateRequest } from '../../../../shared/selvera-api';

@Component({
  selector: 'add-note-dialog',
  templateUrl: 'add-note.dialog.html',
  host: { class: 'ccr-dialog' },
  encapsulation: ViewEncapsulation.None
})
export class AddNoteDialog implements OnInit {
  form: FormGroup;
  consultationDate = moment();

  minDate: moment.Moment;
  maxDate = moment();

  constructor(
    private builder: FormBuilder,
    private dialogRef: MatDialogRef<AddNoteDialog>,
    private consultation: Consultation,
    private config: ConfigService,
    private context: ContextService,
    private notifier: NotifierService,
    private formUtils: FormUtils
  ) {
    const min = this.config.get('app.default.noteMinDate');
    this.minDate = moment().subtract(moment.duration(min)).startOf('month');
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.form = this.builder.group({
      consultationDate: this.consultationDate,
      internalNote: ''
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const formData = this.form.value;
      const req: ConsultationCreateRequest = {
        clientId: this.context.dieterId,
        consultationDate: moment(formData.consultationDate).format(),
        internalNote: formData.internalNote,
        type: 'private'
      };
      this.consultation
        .add(req)
        .then(res => {
          // change api response when available in api
          this.notifier.success(_('NOTIFY.SUCCESS.NOTE_ADDED'));
          this.resetForm();
          this.dialogRef.close();
        })
        .catch(err => {
          this.notifier.error(_('NOTIFY.ERROR.NOTE_ADDED'));
        });
    } else {
      this.formUtils.markAsTouched(this.form);
    }
  }

  resetForm(): void {
    this.consultationDate = this.form.value.consultationDate;
    this.createForm();
  }
}
