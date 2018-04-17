import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { _ } from '../utils';

export interface PromptDialogData {
  title: string;
  titleParams?: any;
  content: string;
  contentParams?: any;
  no?: string;
  yes?: string;
  color?: string;
}

@Component({
  selector: 'app-dialog-prompt',
  templateUrl: 'prompt.dialog.html',
  host: { class: 'ccr-prompt' }
})
export class PromptDialog {
  title = '';
  content = '';

  constructor(
    public dialogRef: MatDialogRef<PromptDialog>,
    @Inject(MAT_DIALOG_DATA) public data: PromptDialogData
  ) {
    // WARNING be sure to have translated strings of the parameters
    // because after the extraction they are empty
    this.data = Object.assign(
      {
        titleParams: {},
        contentParams: {},
        no: _('GLOBAL.NO'),
        yes: _('GLOBAL.YES'),
        color: 'warn'
      },
      data
    );
  }
}
