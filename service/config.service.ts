import { Inject, Injectable } from '@angular/core';
import { get, set } from 'lodash';
import { CCR_CONFIG, CCRConfig } from '../config';

@Injectable()
export class ConfigService {
  /**
   * Config Values
   */
  config: CCRConfig;

  constructor(@Inject(CCR_CONFIG) config: CCRConfig) {
    this.config = config;
  }

  get(path: string, defaultValue: any = {}) {
    return get(this.config, path, defaultValue);
  }

  set(path: string, value: any) {
    return set(this.config, path, value);
  }
}
