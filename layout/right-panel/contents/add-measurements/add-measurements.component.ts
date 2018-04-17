import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import * as moment from 'moment-timezone';
import { ContextService, EventsService, NotifierService } from '../../../../service';
import { _, DataObject, FormUtils } from '../../../../shared';
import {
  AddActivityRequest,
  AddBodyMeasurementRequest,
  AddManualSleepMeasurementRequest
} from '../../../../shared/selvera-api';
import { MeasurementsDataService } from '../../services';

@Component({
  selector: 'add-rightpanel-measurements',
  templateUrl: './add-measurements.component.html',
  styleUrls: ['./add-measurements.component.scss']
})
export class AddMeasurementsComponent implements OnInit, OnDestroy {
  form: FormGroup;
  errors: DataObject = {};

  measurementType: string = 'circumference';
  recordedDate: moment.Moment = moment();

  constructor(
    private builder: FormBuilder,
    private context: ContextService,
    private bus: EventsService,
    private notifier: NotifierService,
    private dataService: MeasurementsDataService,
    public formUtils: FormUtils
  ) {}

  ngOnInit() {
    this.initForm(this.measurementType);
    this.bus.register('add-measurement.section.change', this.sectionChanged.bind(this));
  }

  ngOnDestroy() {
    this.bus.unregister('add-measurement.section.change');
  }

  sectionChanged(section) {
    // temporary fix to stop food from trying to create its form
    if (!this.form.dirty && section !== 'food') {
      this.measurementType = section;
      this.initForm(section);
    }
  }

  get circumference(): FormArray {
    return this.form.get('circumference') as FormArray;
  }

  get composition(): FormArray {
    return this.form.get('composition') as FormArray;
  }

  get energy(): FormArray {
    return this.form.get('energy') as FormArray;
  }

  initForm(formType: string): void {
    this.form = this.builder.group({
      recordedAt: this.recordedDate,
      circumference: this.builder.array([]),
      composition: this.builder.array([]),
      energy: this.builder.array([])
    });
    (this.form.controls[formType] as FormArray).push(this.formFields(formType));
  }

  private formFields(formType: string): FormGroup {
    switch (formType) {
      default:
      case 'circumference':
        return this.builder.group(
          {
            waist: null,
            arm: null,
            chest: null,
            hip: null,
            thigh: null
          },
          {
            validator: this.validateCircumference
          }
        );

      case 'composition':
        return this.builder.group(
          {
            weight: [null, Validators.min(1)],
            bodyFat: null,
            bodyFatLbs: null,
            leanMass: null,
            leanMassLbs: null,
            waterPercentage: null,
            waterLbs: null
          },
          {
            validator: this.validateComposition
          }
        );

      case 'energy':
        return this.builder.group(
          {
            steps: null,
            sleepStartTime: null,
            sleepEndTime: null
          },
          {
            validator: this.validateEnergy
          }
        );
    }
  }

  validateComposition(control: AbstractControl) {
    const weight = Number(control.get('weight').value);
    const bodyfat = Number(control.get('bodyFat').value);
    const hydration = Number(control.get('waterPercentage').value);

    if (weight > 0 || bodyfat > 0 || hydration > 0) {
      return null;
    } else {
      return { validateComposition: true };
    }
  }

  validateCircumference(control: AbstractControl) {
    const waist = control.get('waist');
    const arm = control.get('arm');
    const chest = control.get('chest');
    const hip = control.get('hip');
    const thigh = control.get('thigh');

    if (waist.value || arm.value || chest.value || hip.value || thigh.value) {
      return null;
    } else {
      return { validateCircumference: true };
    }
  }

  validateEnergy(control: AbstractControl) {
    const steps = control.get('steps');
    const sleepStartTime = control.get('sleepStartTime');
    const sleepEndTime = control.get('sleepEndTime');

    if (sleepEndTime.value || sleepStartTime.value) {
      if (sleepEndTime.value && sleepStartTime.value) {
        return null;
      } else {
        return { validateSleepTimes: _('NOTIFY.ERROR.BOTH_SLEEP_TIMES') };
      }
    } else if (steps.value) {
      return null;
    } else {
      return { validateEnergy: false };
    }
  }

  onCompositionChange(field): void {
    const weight = this.form.get('composition.0.weight').value;

    const calcBodyFat = () => {
      const lbs = this.form.get('composition.0.bodyFatLbs').value;
      const value = weight > 0 ? lbs * 100 / weight : 0;
      this.form.get('composition.0.bodyFat').setValue(value.toFixed(1));
    };
    const calcBodyFatLbs = () => {
      const perc = this.form.get('composition.0.bodyFat').value;
      this.form.get('composition.0.bodyFatLbs').setValue((weight * perc / 100).toFixed());
    };
    const diffBodyFat = () => {
      const mass = this.form.get('composition.0.leanMass').value;
      this.form.get('composition.0.bodyFat').setValue((100 - mass).toFixed(1));
    };
    const diffLeanMass = () => {
      const fat = this.form.get('composition.0.bodyFat').value;
      this.form.get('composition.0.leanMass').setValue((100 - fat).toFixed(1));
    };
    const calcLeanMass = () => {
      const lbs = this.form.get('composition.0.leanMassLbs').value;
      const value = weight > 0 ? lbs * 100 / weight : 0;
      this.form.get('composition.0.leanMass').setValue(value.toFixed(1));
    };
    const calcLeanMassLbs = () => {
      const perc = this.form.get('composition.0.leanMass').value;
      const value = weight * perc / 100;
      this.form.get('composition.0.leanMassLbs').setValue(value.toFixed());
    };
    const calcWaterPercentage = () => {
      const lbs = this.form.get('composition.0.waterLbs').value;
      const value = weight > 0 ? lbs * 100 / weight : 0;
      this.form.get('composition.0.waterPercentage').setValue(value.toFixed());
    };
    const calcWaterLbs = () => {
      const perc = this.form.get('composition.0.waterPercentage').value;
      this.form.get('composition.0.waterLbs').setValue((weight * perc / 100).toFixed());
    };

    switch (field) {
      case 'weight':
        calcBodyFat();
        calcBodyFatLbs();
        diffLeanMass();
        calcLeanMassLbs();
        calcWaterPercentage();
        break;
      case 'bodyFat':
        calcBodyFatLbs();
        diffLeanMass();
        calcLeanMassLbs();
        break;
      case 'bodyFatLbs':
        calcBodyFat();
        diffLeanMass();
        calcLeanMassLbs();
        break;
      case 'leanMass':
        calcLeanMassLbs();
        diffBodyFat();
        calcBodyFatLbs();
        break;
      case 'leanMassLbs':
        calcLeanMass();
        diffBodyFat();
        calcBodyFatLbs();
        break;
      case 'waterPercentage':
        calcWaterLbs();
        break;
      case 'waterLbs':
        calcWaterPercentage();
        break;
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      const data = this.form.value;
      const formData = Object.assign(data, data[this.measurementType][0]);
      delete formData.circumference;
      delete formData.composition;
      delete formData.energy;

      formData.clientId = this.context.dieterId;
      formData.device = 3;
      formData.recordedAt = moment(formData.recordedAt).format();

      switch (this.measurementType) {
        case 'energy':
          this.addSteps(formData);
          this.addSleep(formData);
          break;

        default:
          if (formData.weight && Number(formData.weight) > 0) {
            formData.weight = (formData.weight * 453.59237).toFixed();
          } else {
            delete formData.weight;
          }
          if (formData.bodyFat && Number(formData.bodyFat) > 0) {
            formData.bodyFat = (formData.bodyFat * 1000).toFixed();
          } else {
            delete formData.bodyFat;
          }
          if (formData.waterPercentage && Number(formData.waterPercentage) > 0) {
            formData.waterPercentage = (formData.waterPercentage * 1000).toFixed();
          } else {
            delete formData.waterPercentage;
          }
          if (formData.waist) {
            formData.waist = (formData.waist * 25.4).toFixed();
          }
          if (formData.arm) {
            formData.arm = (formData.arm * 25.4).toFixed();
          }
          if (formData.chest) {
            formData.chest = (formData.chest * 25.4).toFixed();
          }
          if (formData.hip) {
            formData.hip = (formData.hip * 25.4).toFixed();
          }
          if (formData.thigh) {
            formData.thigh = (formData.thigh * 25.4).toFixed();
          }
          delete formData.bodyFatLbs;
          delete formData.leanMass;
          delete formData.leanMassLbs;
          delete formData.waterLbs;
          const addBodyMeasurementRequst: AddBodyMeasurementRequest = formData;
          this.dataService
            .addBodyMeasurementData(addBodyMeasurementRequst)
            .then(res => {
              // TODO proper responses when available in api
              this.notifier.success(_('NOTIFY.SUCCESS.MEASUREMENT_ADDED'));
              this.bus.trigger('dieter.measurement.refresh');
              this.resetForm();
            })
            .catch(err => this.notifier.error(err));
      }
    }
  }

  private addSteps(formData): void {
    if (formData.steps) {
      const activity = [
        {
          date: formData.recordedAt,
          steps: formData.steps,
          device: 3
        }
      ];
      const addActivityRequst: AddActivityRequest = {
        activity: activity,
        clientId: this.context.dieterId
      };
      this.dataService
        .addActivityData(addActivityRequst)
        .then(res => {
          // TODO proper responses when available in api
          this.notifier.success(_('NOTIFY.SUCCESS.STEPS_ADDED'));
          this.bus.trigger('dieter.measurement.refresh');
          this.resetForm();
        })
        .catch(err => this.notifier.error(err));
    }
  }

  private addSleep(formData): void {
    if (!formData.sleepStartTime || !formData.sleepEndTime) {
      return;
    }

    const addManualSleepMeasurementRequest: AddManualSleepMeasurementRequest = {
      clientId: this.context.dieterId,
      deviceId: 3,
      startTime: moment(formData.sleepStartTime).format(),
      endTime: moment(formData.sleepEndTime).format(),
      quality: 64
    };
    this.dataService
      .addSleepData(addManualSleepMeasurementRequest)
      .then(res => {
        // TODO proper responses when available in api
        this.notifier.success(_('NOTIFY.SUCCESS.SLEEP_ADDED'));
        this.bus.trigger('dieter.measurement.refresh');
        this.resetForm();
      })
      .catch(err => this.notifier.error(err));
  }

  sleepStartTimeChange(e): void {
    if (!this.form.get('energy.0.sleepEndTime').value) {
      this.form.get('energy.0.sleepEndTime').setValue(moment(e.value).add({ hours: 8 }));
    }
    this.checkTimeDifference();
  }

  sleepEndTimeChange(e): void {
    this.checkTimeDifference();
  }

  private checkTimeDifference(): void {
    const start = this.form.get('energy.0.sleepStartTime').value;
    const end = this.form.get('energy.0.sleepEndTime').value;
    if (start && end) {
      if (end.diff(start, 'hour', true) <= 0) {
        this.notifier.error(_('NOTIFY.ERROR.START_MUSTBE_BEFORE'));
        this.form.get('energy.0.sleepStartTime').setValue(end.subtract(8, 'hours'));
      }
      if (end.diff(start, 'hour', true) > 24) {
        this.notifier.error(_('NOTIFY.ERROR.SLEEP_LESSTHAN_24H'));
        this.form.get('energy.0.sleepEndTime').setValue(start.add(24, 'hours'));
      }
    }
  }

  private resetForm(): void {
    this.recordedDate = this.form.value.recordedAt;
    this.initForm(this.measurementType);
  }
}
