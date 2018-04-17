import { CollectionViewer } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import * as lodash from 'lodash';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { NotifierService } from '../../service';
import { _, ImplementationOf } from '../../shared/utils';
import { CcrDatabase } from './generic.database';

export interface DataCriteria {
  [arg: string]: any;
}

export abstract class CcrDataSource<T, R, C extends DataCriteria> extends DataSource<T> {
  /**
   * Required services to be injected.
   */
  protected abstract notify: NotifierService;
  protected abstract database: CcrDatabase;

  /**
   * Flags to control outside behavior like css classes and components.
   * Updated by mapResult to hide spinner and empty message.
   */
  isLoading: boolean;
  isEmpty = true;

  /**
   * Error messages handling.
   */
  showErrors = true;
  showEmpty: boolean | string | (() => string) = true;
  protected _errors: string[] = [];
  addError(error: string) {
    this._errors.push(error);
  }
  getErrors() {
    return this._errors;
  }
  hasErrors(force = false): boolean {
    return (this.showErrors || force) && !!this._errors.length;
  }
  // overridable error handler
  errorHandler = function(err) {
    this.addError(err);
    // this.notify.error(err);
  };

  /**
   * Control members for the datasource processing.
   */
  protected criteria: C;
  protected defaults = {};
  protected overrides = null;
  // streams to listen
  protected required: Array<Observable<any>> = [];
  protected optional: Array<Observable<any>> = [];
  protected getters = [];
  // maps a name to its stream and getter
  protected regmap = new Map<string, [boolean, number, number]>();

  get args() {
    return this.criteria;
  }

  /**
   * Stream only used to trigger a refresh on the data.
   * Can receive some criteria overrides for a temporary update.
   * Must be used outside the datasource to prevent infinite loops.
   */
  public trigger$ = new Subject<any>();

  refresh(overrides: Partial<ImplementationOf<C>> = {}) {
    if (overrides) {
      this.overrides = overrides;
    }
    this.trigger$.next(true);
  }

  /**
   * DataSource.
   */
  constructor() {
    super();
    this.criteria = {} as C;

    // listen the internal trigger
    this.addOptional(this.trigger$, () => ({}));
  }

  addDefault(add: Partial<ImplementationOf<C>>) {
    Object.assign(this.defaults, add);
  }

  addRequired(stream: Observable<any>, getter: () => Partial<ImplementationOf<C>>) {
    this.required.push(stream);
    this.getters.push(getter);
  }

  addOptional(stream: Observable<any>, getter: () => Partial<ImplementationOf<C>>) {
    this.optional.push(stream);
    this.getters.push(getter);
  }

  register(
    name: string,
    isRequired: boolean,
    stream: Observable<any>,
    getter: () => Partial<ImplementationOf<C>>
  ) {
    let req, str, gtr;
    if (this.regmap.has(name)) {
      // stream is already mapped
      [req, str, gtr] = this.regmap.get(name);
      if (req) {
        this.required[str] = stream;
      } else {
        this.optional[str] = stream;
      }
      this.getters[gtr] = getter;
    } else {
      // map the stream positions
      str = isRequired ? this.required.push(stream) : this.optional.push(stream);
      gtr = this.getters.push(getter);
      this.regmap.set(name, [isRequired, str - 1, gtr - 1]);
    }
  }

  unregister(name: string) {
    if (this.regmap.has(name)) {
      // delete the mapped stream and getter
      const [req, str, gtr] = this.regmap.get(name);
      if (req) {
        this.required.splice(str, 1);
      } else {
        this.optional.splice(str, 1);
      }
      this.getters.splice(gtr, 1);
      this.regmap.delete(name);
    }
  }

  query(): Observable<R> {
    const values = this.getters.map(f => f());

    // add defaults at the beggining
    values.unshift(this.defaults);

    if (this.overrides) {
      // add overrides at the end
      values.push(this.overrides);
      this.overrides = null;
    }

    // merge all the getters outputs
    this.criteria =
      values.length > 1 ? values.reduce((a, b) => Object.assign({}, a, b)) : values[0];

    return this.fetch(this.criteria);
  }

  /**
   * Data processing that can be completely customized.
   */
  abstract defaultData(): R;

  abstract fetch(criteria: C): Observable<R>;

  abstract mapResult(result: R): T[];

  /**
   * All the required streams must emit one value to return an initial result.
   * The optional streams are supposed to emit values later on.
   */
  connect(collectionViewer?: CollectionViewer): Observable<T[]> {
    let stream = Observable.merge(
      Observable.combineLatest(...this.required),
      ...this.optional
    );
    // without required streams, fetch a result directly
    if (!this.required.length) {
      stream = stream.startWith(null);
    }
    return stream
      .switchMap(() => {
        this.isLoading = true;
        // disposable stream
        return this.query().catch(err => {
          this.errorHandler(err);
          return Observable.of(this.defaultData());
        });
      })
      .map((result: R) => this.mapResult(result))
      .map((result: T[]) => {
        this.isLoading = false;
        this.isEmpty = !result || !result.length;
        if (!this.isEmpty) {
          this._errors.length = 0;
        } else if (this.showEmpty && !this.hasErrors()) {
          const error =
            typeof this.showEmpty === 'boolean'
              ? _('BOARD.NO_DATA_AVAILABLE')
              : lodash.isFunction(this.showEmpty) ? this.showEmpty() : this.showEmpty;
          this.addError(error);
        }
        return result;
      });
  }

  disconnect(collectionViewer?: CollectionViewer) {}
}
