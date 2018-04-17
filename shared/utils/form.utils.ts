import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import * as lodash from 'lodash';
import * as moment from 'moment-timezone';
import { ConfigService } from '../../service/config.service';

@Injectable()
export class FormUtils {
  constructor(private config: ConfigService) {}

  /**
   * Makes visible the invalid fields of a form.
   * @param group Form to mark as touched
   */
  markAsTouched(group: FormGroup | FormArray): void {
    Object.keys(group.controls).map(field => {
      const control = group.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup || control instanceof FormArray) {
        this.markAsTouched(control);
      }
    });
  }

  /**
   * Returns an object with the validation errors.
   * @param group Form to mark as touched
   */
  getErrors(group: FormGroup | FormArray, errors = {}): any {
    Object.assign(errors, group.errors ? group.errors : {});
    Object.keys(group.controls).map(field => {
      const control = group.get(field);
      Object.assign(errors, control.errors ? control.errors : {});
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.getErrors(control, errors);
      }
    });

    return errors;
  }

  /**
   * Resolve the initial date for a form.
   */
  getInitialDate() {
    const initial = moment().set(this.config.get('default.startTime'));
    if (initial.isBefore(moment(), 'minutes')) {
      const day = initial.day();
      const add = day > 0 && day < 5 ? 1 : 6 - day + 2;
      initial.add(add, 'day');
    }
    return initial;
  }

  /**
   * View utils.
   */
  private _errors = {};

  hasErrors(group: FormGroup | FormArray) {
    this._errors = this.getErrors(group);
    return !lodash.isEmpty(this._errors);
  }

  getError(errorCode: string) {
    return lodash.get(this._errors, errorCode, null);
  }
}
