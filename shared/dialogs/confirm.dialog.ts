import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { _ } from '../utils/i18n.utils';

export interface ConfirmDialogData {
  title?: string;
  titleParams?: any;
  content: string;
  contentParams?: any;
  accept?: string;
  color?: string;
}

@Component({
  selector: 'app-dialog-confirm',
  templateUrl: 'confirm.dialog.html',
  host: { class: 'ccr-confirm' }
})
export class ConfirmDialog {
  title = '';
  content = '';

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {
    // WARNING be sure to have translated strings of the parameters
    // because after the extraction they are empty
    this.data = Object.assign(
      {
        titleParams: {},
        contentParams: {},
        accept: _('GLOBAL.OK'),
        color: ''
      },
      data
    );
  }
}
