import { Injectable } from '@angular/core';
import * as lodash from 'lodash';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export type CcrEvent = {
  name: string;
  data?: any;
};

export type CcrEventListener = (data: any) => void;

@Injectable()
export class EventsService {
  /**
   * Events Bus
   */
  bu$ = new BehaviorSubject<CcrEvent>({ name: 'boot' });

  /**
   * Event Listeners
   */
  listeners: { [name: string]: CcrEventListener[] } = {};

  constructor() {
    this.bu$.subscribe((e: CcrEvent) => {
      if (this.listeners[e.name]) {
        this.listeners[e.name].forEach(listener => listener(e.data));
      }
    });

    setInterval(() => {
      this.trigger('system.timer');
    }, 30000);
  }

  trigger(name: string, data: any = null) {
    this.bu$.next({ name, data });
  }

  register(name: string, listener: CcrEventListener) {
    // initialize the listeners
    if (!this.listeners[name]) {
      this.listeners[name] = [];
    }
    // add the subscription to the listeners
    this.listeners[name].push(listener);
  }

  unlisten(name: string, listener: CcrEventListener) {
    if (!this.listeners[name] || !this.listeners[name].length) {
      return;
    }

    // FIXME workaround for function comparision
    lodash.remove(this.listeners[name], f => f.toString() === listener.toString());
  }

  unregister(name: string) {
    if (this.listeners[name]) {
      this.listeners[name] = [];
    }
  }
}
