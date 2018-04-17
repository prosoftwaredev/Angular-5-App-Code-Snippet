import {
  Attribute,
  Component,
  ElementRef,
  forwardRef,
  HostBinding,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { MatTable } from '@angular/material';
import { OrganizationAssociation } from 'selvera-api';
import { ContextService, NotifierService } from '../../../../../service';
import { ClinicsDatabase, ClinicsDataSource } from '../../services';

export interface ClinicsPickerValue {
  clinicId: string;
  picked: boolean;
  admin: boolean;
  accessall: boolean;
  initial: {
    picked: boolean;
    admin: boolean;
    accessall: boolean;
  };
}

@Component({
  selector: 'app-clinics-table-picker',
  templateUrl: './picker.component.html',
  styleUrls: ['./picker.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ClinicsPickerComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ClinicsPickerComponent),
      multi: true
    }
  ]
})
export class ClinicsPickerComponent implements ControlValueAccessor, OnInit {
  @HostBinding('class') classList = 'ccr-table-picker'; // to write new classes without Renderer
  @ViewChild('table') table: MatTable<any>;

  @Input() coachId: number;
  @Input() source: ClinicsDataSource | null;
  columns: Array<string>;

  @Input() disabled = null;
  @Input() required = null;

  propagator = (data: any) => {};
  isLoading = true;
  isOwnProfile = true;

  // array mapping the table
  data: ClinicsPickerValue[] = [];

  // getters
  get isDisabled() {
    return this.disabled === '' || this.disabled === true;
  }
  get isRequired() {
    return this.required === '' || this.required === true;
  }

  constructor(
    private association: OrganizationAssociation,
    private context: ContextService,
    private notifier: NotifierService,
    private database: ClinicsDatabase,
    private element: ElementRef
  ) {}

  ngOnInit() {
    this.isOwnProfile = this.coachId === +this.context.user.id;

    this.columns = this.isOwnProfile
      ? ['name', 'perm_viewall', 'perm_admin']
      : ['actions', 'name', 'perm_viewall', 'perm_admin'];

    // setup the table source
    this.source = new ClinicsDataSource(this.notifier, this.database);
    this.source.addDefault({ admin: true }); // show those with admin permissions
    // build the data model before the table
    this.source.connect().subscribe(clinics => {
      clinics.map(c => {
        this.data.push({
          clinicId: c.organization,
          picked: false,
          admin: false,
          accessall: false,
          initial: {
            picked: false,
            admin: false,
            accessall: false
          }
        });
      });
      if (this.coachId) {
        this.association
          .fetchCoachAssociation(this.coachId)
          .then(existing => {
            // process the initial state here
            existing.map(c => {
              const i = this.data.findIndex(x => x.clinicId === c.organization);
              if (i > -1) {
                this.data[i] = {
                  clinicId: c.organization,
                  picked: true,
                  admin: c.permissionAdmin,
                  accessall: c.permissionAccessAll,
                  initial: {
                    picked: true,
                    admin: c.permissionAdmin,
                    accessall: c.permissionAccessAll
                  }
                };
              }
            });
            this.propagator(this.data);
            this.isLoading = false;
          })
          .catch(err => this.notifier.log(err));
      } else {
        this.isLoading = false;
      }
    });
  }

  toggleHelp(contentClass = '') {
    // checks the nativeElement because this.classList doesn't update changes
    const classList = this.element.nativeElement.classList;
    // removes if already exists or if empty
    const baseClasses = [];
    let exists = false;
    classList.forEach(c => {
      if (contentClass && c === contentClass) {
        exists = true;
      } else if (c.indexOf('ng') === 0 || c.indexOf('ccr') === 0) {
        baseClasses.push(c);
      }
    });

    if (contentClass && !exists) {
      baseClasses.push(`help-enabled ${contentClass}`);
    }
    this.classList = baseClasses.join(' ');
  }

  onSelect(id) {
    const enabled = this.data[id] && this.data[id].picked;
    this.data[id].picked = !enabled;
    this.onChange();
  }

  onChange() {
    this.propagator(this.data);
  }

  /**
   * Control Value Accesor Methods
   */
  writeValue(value: any): void {
    // do not receive existing values but a coachId
  }

  registerOnChange(fn: any): void {
    this.propagator = fn;
  }

  registerOnTouched(fn: any): void {}

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  validate(c: FormControl) {
    if (!this.isDisabled && this.isRequired) {
      if (
        !c.value ||
        (c.value.length > 0 &&
          !c.value.reduce((prev, current) => (prev.picked ? prev : current), {
            picked: false
          }).picked)
      ) {
        return { clinicRequired: true };
      }
    }
  }
}
