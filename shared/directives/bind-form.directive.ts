import {
  ChangeDetectorRef,
  Directive,
  EventEmitter,
  Inject,
  InjectionToken,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Self,
  SkipSelf
} from '@angular/core';
import { FormGroup } from '@angular/forms';

export interface BindForm {
  form: FormGroup;
}

export const BINDFORM_TOKEN = new InjectionToken<BindForm>('BindFormToken');

@Directive({
  selector: '[bindForm]'
})
export class BindFormDirective implements OnInit, OnDestroy {
  private controlName = null;

  @Input()
  set bindForm(value) {
    if (this.controlName) {
      throw new Error('Cannot change the bindForm on runtime!');
    }
    this.controlName = value;
  }

  @Input() initial = {};
  @Output() final = new EventEmitter<any>();

  constructor(
    private cdr: ChangeDetectorRef,
    @Inject(BINDFORM_TOKEN)
    @SkipSelf()
    private parent: BindForm,
    @Inject(BINDFORM_TOKEN)
    @Self()
    private child: BindForm
  ) {}

  ngOnInit() {
    if (!this.controlName) {
      throw new Error(
        'BindForm directive requires a value to be used as the subgroup name!'
      );
    }
    if (this.parent.form.get(this.controlName)) {
      throw new Error(`Control (${this.controlName}) already exists on the parent form!`);
    }
    // allow to setup the initial data on creation
    this.initial instanceof Object && this.child.form.patchValue(this.initial);
    // add a child control under the unique name
    this.parent.form.addControl(this.controlName, this.child.form);
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    // allow to recover the data before it's destroyed
    this.final.emit(this.child.form.value);
    // remove the component from the parent
    this.parent.form.removeControl(this.controlName);
  }
}
