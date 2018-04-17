import { Injectable } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialog } from '../shared/dialogs/confirm.dialog';
import { _, TranslateMessage } from '../shared/utils';
import { ConfigService } from './config.service';

export enum NotifierStatus {
  success = 'ccr-snack-success',
  info = 'ccr-snack-info',
  warning = 'ccr-snack-warning',
  error = 'ccr-snack-error'
}

@Injectable()
export class NotifierService {
  private duration: number;

  constructor(
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private translator: TranslateService,
    config: ConfigService
  ) {
    this.duration = config.get('app.durations.notifier', 4500);
  }

  // TODO remove any and use an specific ComponentType
  snackFromComponent(component: any, duration = null): void {
    this.snackbar.openFromComponent(component, {
      duration: duration ? duration : this.duration
    });
  }

  snack(message: string, action = '', duration = null, status: NotifierStatus): void {
    if (!message) {
      return;
    }

    const show = (msg: string) => {
      this.snackbar.open(msg, action, {
        duration: duration ? duration : this.duration,
        extraClasses: [status]
      });
    };

    // TODO support action translations and predefined ones
    if (message.startsWith('NOTIFY.')) {
      // support translatable strings starting with NOTIFY.
      this.translator.get(message).subscribe((msg: string) => {
        show(msg);
      });
    } else {
      // direct error messages
      show(message);
    }
  }

  success(message, action = '', duration = null): void {
    this.snack(this.translate(message), action, duration, NotifierStatus.success);
  }

  info(message, action = '', duration = null): void {
    this.snack(this.translate(message), action, duration, NotifierStatus.info);
  }

  warning(message, action = '', duration = null): void {
    this.snack(this.translate(message), action, duration, NotifierStatus.warning);
  }

  error(message, action = '', duration = null): void {
    this.snack(this.translate(message), action, duration, NotifierStatus.error);
  }

  log(err, trace?: any) {
    // TODO any additional logging here
    console.error(err);
  }

  done(msg) {
    this.dialog.open(ConfirmDialog, {
      data: {
        title: _('GLOBAL.DONE'),
        content: this.translate(msg)
      }
    });
  }

  confirm(err) {
    this.dialog.open(ConfirmDialog, {
      data: {
        title: _('GLOBAL.ERROR'),
        content: this.translate(err)
      }
    });
  }

  translate(msg: any): string {
    // check for already thanslated messages
    if (typeof msg === 'string' && msg.startsWith('NOTIFY.')) {
      return msg;
    }
    // TODO convert any non-string input here
    if (typeof msg === 'object') {
      if (msg.message) {
        msg = msg.message;
      } else {
        // TODO
        console.error('Untranslated Input Object', msg);
      }
    }
    // translate plain error messages
    return TranslateMessage(msg);
  }
}
