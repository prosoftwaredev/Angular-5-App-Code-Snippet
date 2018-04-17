import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Account, User } from 'selvera-api';
import { FetchAllAccountObjectResponse, Profile } from '../shared/selvera-api';
import { AuthService } from './auth.service';
import { ConfigService } from './config.service';
import { EventsService } from './events.service';
import { NotifierService } from './notifier.service';

@Injectable()
export class ContextService {
  promises = [];

  constructor(
    private router: Router,
    private account: Account,
    private profile: User,
    private auth: AuthService,
    private config: ConfigService,
    private bus: EventsService,
    private notifier: NotifierService
  ) {
    this.fetchUser(true);
  }

  /**
   * Logged User
   */
  user: Profile;

  fetchUser(select = false) {
    this.profile
      .get(true)
      .then(info => {
        this.user = info;
        this.bus.trigger('user.data', info);
        this.promises.forEach(resolve => resolve(info));
        this.promises.length = 0;

        if (select) {
          this.account
            .fetchSingle(info.id)
            .then(current => {
              this.selected = current;
            })
            .catch(err => this.notifier.log(err));
        }
      })
      .catch(() => {
        this.auth.redirect();
        return false;
      });
  }

  getUser(): Promise<Profile> {
    return new Promise((resolve, reject) => {
      if (this.user) {
        resolve(this.user);
      } else {
        this.promises.push(resolve);
      }
    });
  }

  updateUser() {
    this.fetchUser();
    this.user = null;
  }

  gotoUserProfile(account: { id: any; accountType: any }) {
    const profileRoute = this.config.get('app.accountType.profileRoute')(account);
    this.router.navigate([profileRoute]);
  }

  /**
   * Selected User
   */
  selected$ = new BehaviorSubject<FetchAllAccountObjectResponse | Profile>(null);

  set selected(user: FetchAllAccountObjectResponse | Profile) {
    this.selected$.next(user);
  }
  get selected(): FetchAllAccountObjectResponse | Profile {
    return this.selected$.getValue();
  }

  /**
   * Current Organization
   */
  _organizationId: string;

  set organizationId(v: string) {
    this._organizationId = v;
  }
  get organizationId(): string {
    return this._organizationId;
  }

  /**
   * Current Dieter
   */
  _dieterId: string;

  set dieterId(v: string) {
    this._dieterId = v;
  }
  get dieterId(): string {
    return this._dieterId;
  }

  /**
   * Current Coach
   */
  _coachId: string;

  set coachId(v: string) {
    this._coachId = v;
  }
  get coachId(): string {
    return this._coachId;
  }
}
