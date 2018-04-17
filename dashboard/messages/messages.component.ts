import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as lodash from 'lodash';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/sampleTime';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { Account } from 'selvera-api';
import {
  ConfigService,
  ContextService,
  EventsService,
  NotifierService
} from '../../service';
import { _, CcrPaginator, MessageRecipient, MessageThread } from '../../shared';
import {
  FetchAllThreadResponse,
  FetchSingleAccountResponse,
  Profile,
  SingleThreadResponse
} from '../../shared/selvera-api';
import { ThreadsDatabase, ThreadsDataSource } from './services';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit, OnDestroy {
  source: ThreadsDataSource | null;
  subscription: Subscription;
  disposeScroller: Subscription;
  interval: any;

  current: Profile;
  account$ = new Subject<string[]>(); // observable for source
  accounts: string[];
  pageIndex$ = new BehaviorSubject<number>(0);
  pageSize: number;

  threads: Array<MessageThread> = [];
  newThread: MessageThread;
  active = 0;

  @ViewChild('scroll') scroll: ElementRef;

  constructor(
    private account: Account,
    private database: ThreadsDatabase,
    private config: ConfigService,
    private context: ContextService,
    private bus: EventsService,
    private notifier: NotifierService
  ) {
    this.pageSize = this.config.get('app.limit.threads', 10);
  }

  ngOnInit() {
    this.bus.trigger('right-panel.deactivate');

    // setup the data source
    this.source = new ThreadsDataSource(this.notifier, this.database);
    this.source.showEmpty = () => {
      // check if search criteria is present and display error
      return _('BOARD.NO_MESSAGES_YET');
    };
    // setup defaults
    this.source.addRequired(this.account$, () => ({
      accounts: this.accounts
    }));
    this.source.addRequired(this.pageIndex$, () => ({
      offset: this.pageIndex$.getValue() * this.pageSize
    }));

    this.subscription = this.source.connect().subscribe(res => {
      this.threads = this.threads.concat(res.map(this.formatThread.bind(this)));
    });

    this.context
      .getUser()
      .then((info: Profile) => {
        this.current = info;
        this.selectAccounts();
      })
      .catch(err => this.notifier.error(err));

    this.setRefresh();
  }

  ngAfterContentInit() {
    const lastPosition = { scrolled: 0 };
    this.disposeScroller = Observable.fromEvent(this.scroll.nativeElement, 'scroll')
      .sampleTime(300)
      .mergeMap((ev: any) => Observable.of(this.calculatePoints()))
      .subscribe((pos: any) => this.handleScroll(pos, lastPosition));
  }

  ngOnDestroy() {
    if (this.disposeScroller) {
      this.disposeScroller.unsubscribe();
    }
    this.subscription.unsubscribe();
    this.source.disconnect();
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  setRefresh() {
    if (this.interval) {
      return;
    }

    this.interval = setInterval(() => {
      this.source.query().subscribe((res: FetchAllThreadResponse) => {
        const latest = res.threads.length ? res.threads[0].id : null;
        const current = this.threads.length ? this.threads[0].threadId : null;

        if (latest && latest !== current) {
          const active =
            current && this.threads[this.active] ? this.threads[this.active] : null;
          const threads = res.threads.map(
            this.formatThread.bind(this)
          ) as MessageThread[];

          if (active && !threads.some(t => t.threadId === active.threadId)) {
            threads.push(active);
          }

          this.threads = threads;
          this.active = lodash.findIndex(this.threads, { threadId: active.threadId });
        }
      });
    }, this.config.get('app.refresh.chat.updateThread', 30000));
  }

  selectAccounts(accounts: MessageRecipient[] = []) {
    // update the source
    this.resetThreads();
    this.accounts = [this.current.id, ...accounts.map(a => a.id)];
    this.account$.next(this.accounts);
    // update the ccr-messages component
    this.newThread = {
      recipients: accounts
    };
  }

  formatThread(t: SingleThreadResponse): MessageThread {
    const accounts = t.accountArray
      .map((uid, i) => ({
        id: uid,
        name: t.nameArray[i],
        firstName: t.firstNameArray[i],
        lastName: t.lastNameArray[i],
        accountType: null
      }))
      .filter(a => a.id !== this.current.id);

    return {
      threadId: t.id,
      recipients: accounts,
      lastMessageId: t.lastMessageId,
      lastMessageDate: t.lastMessageDate,
      lastMessageSent: t.lastMessageSent,
      unread: !t.viewed
    };
  }

  viewedThread(id) {
    this.threads.forEach((v, i, threads) => {
      if (threads[i].threadId === id) {
        threads[i].unread = false;
      }
    });
    this.bus.trigger('system.unread.threads');
  }

  resetThreads() {
    this.threads = [];
    this.active = 0;
    this.pageIndex$.next(0);
  }

  gotoProfile(account: MessageRecipient) {
    if (account.accountType) {
      this.context.gotoUserProfile(account);
    } else {
      this.account.fetchSingle(account.id).then((acc: FetchSingleAccountResponse) => {
        this.context.gotoUserProfile(acc);
      });
    }
  }

  // TODO move to a Directive with Output event
  private calculatePoints() {
    const el = this.scroll.nativeElement;
    return {
      height: el.offsetHeight,
      scrolled: el.scrollTop,
      total: el.scrollHeight
    };
  }

  private handleScroll(position, lastPosition) {
    if (position.height + position.scrolled === position.total) {
      if (!this.source.completed) {
        // scrolled to the bottom
        this.pageIndex$.next(this.pageIndex$.getValue() + 1);
      }
    }
    lastPosition.scrolled = position.scrolled;
  }
}
