import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import * as lodash from 'lodash';
import * as moment from 'moment-timezone';
import { Message } from 'selvera-api';
import { ConfigService, NotifierService } from '../../../service';
import { _ } from '../../../shared/utils';
import {
  AddMessageRequest,
  AddMessageResponse,
  AddThreadRequest,
  FetchAllThreadRequest,
  FetchAllThreadResponse,
  FetchSingleThreadRequest,
  FetchSingleThreadResponse,
  MessageContainer,
  Profile
} from '../../selvera-api';
import { MessageRecipient, MessageThread } from './messages.interfaces';

@Component({
  selector: 'ccr-messages',
  templateUrl: './messages.component.html',
  host: { class: 'ccr-messages' }
})
export class CcrMessagesComponent implements OnChanges, OnDestroy {
  @ViewChild('messageBody') private messageContainer: ElementRef;

  @Input() account: Profile;
  @Input() dieterId: string;
  @Input() thread: MessageThread;

  @Output() lastMessageSent = new EventEmitter<string>();
  @Output() viewed = new EventEmitter<string>();
  @Output() refresh = new EventEmitter<void>();
  @Output() gotoProfile = new EventEmitter<MessageRecipient>();

  disabled = false;
  loading = false;
  offset = 0;
  messages: Array<MessageContainer> = [];
  newMessage = '';

  private threadId: string = null;
  private previousScrollHeight = 0;
  private timers: any[] = [];

  constructor(
    private message: Message,
    private config: ConfigService,
    private notifier: NotifierService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.timers[0]) {
      this.timers[0] = clearInterval(this.timers[0]);
      this.timers[1] = clearInterval(this.timers[1]);
    }
    // reset dieterId based on thread change
    if (changes.thread && !changes.thread.firstChange && !changes.thread.currentValue) {
      this.dieterId = null;
      this.threadId = null;
    }
    // eval if there's something to load
    if (!this.account || (!this.dieterId && !this.thread)) {
      this.disabled = true;
      this.messages = [];
    } else {
      this.disabled = false;
      this.messages = [];
      if (this.thread) {
        if (this.thread.threadId) {
          this.threadId = this.thread.threadId;
          this.loadMessages();
        } else if (this.thread.recipients.length) {
          this.loadThread();
        } else {
          this.disabled = true;
        }
      } else if (this.dieterId) {
        this.loadThread();
      } else {
        this.disabled = false;
      }
    }
  }

  ngOnDestroy() {
    if (this.timers[0]) {
      clearInterval(this.timers[0]);
      clearInterval(this.timers[1]);
    }
  }

  public showProfile(account: MessageRecipient): void {
    this.gotoProfile.emit(account);
  }

  public loadPrevious(): void {
    this.loadMessages();
  }

  public sendMessage(): void {
    if (!this.newMessage.length) {
      return;
    }

    this.loading = true;
    if (this.threadId === null) {
      this.createNewThread();
    } else {
      this.addToThread();
    }
  }

  private setRefresh() {
    if (!this.timers[0]) {
      this.timers[0] = setInterval(() => {
        this.renderTimestamps();
      }, this.config.get('app.refresh.chat.updateTimestamps', 20000));

      this.timers[1] = setInterval(() => {
        this.checkNewMessages();
      }, this.config.get('app.refresh.chat.newMessages', 5000));
    }
  }

  private scrollMessagesToBottom(forceToBottom: boolean): void {
    setTimeout(() => {
      try {
        this.messageContainer.nativeElement.scrollTop = forceToBottom
          ? this.messageContainer.nativeElement.scrollHeight
          : this.messageContainer.nativeElement.scrollHeight - this.previousScrollHeight;
      } catch (err) {
        this.notifier.log('Error scrolling message container', err);
      }
    }, 25);
  }

  private resolveAccounts(): string[] {
    const accounts = this.dieterId
      ? [this.dieterId, this.account.id]
      : [this.account.id, ...this.thread.recipients.map(r => r.id)];
    return accounts.sort((x, y) => Number(x) - Number(y));
  }

  private loadThread(): void {
    if (this.disabled) {
      return;
    }

    const request: FetchAllThreadRequest = {
      accounts: this.resolveAccounts(),
      accountsExclusive: true
    };

    this.message.fetchAllThreads(request).then(
      (res: FetchAllThreadResponse) => {
        this.threadId = res.threads.length > 0 ? res.threads[0].id : null;
        this.loadMessages();
      },
      () => {
        this.loadMessages();
      }
    );
  }

  private checkNewMessages() {
    if (!this.messages.length) {
      return;
    }

    const threadRequest: FetchSingleThreadRequest = {
      threadId: this.threadId,
      offset: 0
    };

    this.message
      .fetchSingleThread(threadRequest)
      .then((res: FetchSingleThreadResponse) => {
        if (!res.messages.length) {
          return;
        }
        const latest = lodash.first(res.messages);
        const current = lodash.last(this.messages);
        if (latest.id !== current.id) {
          const newMessages: Array<MessageContainer> = res.messages
            .map(m => new MessageContainer(m))
            .reverse();
          this.messages = lodash.uniqBy(
            this.messages.filter(m => m.id !== null).concat(newMessages),
            'id'
          );
          this.renderTimestamps();
          this.scrollMessagesToBottom(true);
        }
      });
  }

  private loadMessages(): void {
    if (this.threadId === null) {
      this.loading = false;
      return;
    }

    const threadRequest: FetchSingleThreadRequest = {
      threadId: this.threadId,
      offset: this.offset
    };

    this.message.fetchSingleThread(threadRequest).then(
      (res: FetchSingleThreadResponse) => {
        try {
          this.previousScrollHeight = this.messageContainer.nativeElement.scrollHeight;
        } catch (err) {
          this.previousScrollHeight = 0;
        }

        const newMessages: Array<MessageContainer> = res.messages
          .map(m => new MessageContainer(m))
          .reverse();
        this.messages = [...newMessages, ...this.messages];
        this.renderTimestamps();
        this.setRefresh();
        if (this.thread && this.thread.unread) {
          this.viewed.emit(this.threadId);
        }
        this.offset = res.pagination.next ? res.pagination.next : null;

        this.loading = false;

        this.scrollMessagesToBottom(false);
      },
      () => {
        this.loading = false;
      }
    );
  }

  private addToThread(isNew = false): void {
    const request: AddMessageRequest = {
      threadId: this.threadId,
      subject: 'CoachCare Message',
      content: this.newMessage
    };

    this.message.addMessage(request).then(
      (res: AddMessageResponse) => {
        const message = new MessageContainer({
          id: null,
          subject: 'CoachCare Message',
          content: this.newMessage,
          created: moment().format(),
          account: this.account.id,
          firstName: this.account.firstName,
          lastName: this.account.lastName
        });

        this.messages.push(message);
        this.renderTimestamps();
        this.setRefresh();
        this.newMessage = '';

        this.loading = false;

        this.scrollMessagesToBottom(true);
        this.lastMessageSent.emit(message.content);

        if (isNew) {
          this.refresh.emit();
        }
      },
      () => {
        this.loading = false;
        this.notifier.error(_('NOTIFY.ERROR.MESSAGE_NOT_SEND'));
      }
    );
  }

  private createNewThread(): void {
    const request: AddThreadRequest = {
      subject: 'CoachCare Message',
      accounts: this.resolveAccounts()
    };

    this.message.addThread(request).then(
      (res: any) => {
        this.threadId = res.threadId;
        this.addToThread(true);
      },
      () => {
        this.loading = false;
        this.notifier.error(_('NOTIFY.ERROR.THREAD_NOT_CREATED'));
      }
    );
  }

  private renderTimestamps(): void {
    let lastShownTime: moment.Moment = moment('2000-01-01');

    for (const message of this.messages) {
      // Add a timestamp if one doesn't exist, as applicable
      if (moment(message.created).diff(lastShownTime, 'minutes') > 7) {
        message.timestamp =
          moment().diff(message.created, 'days') > 2
            ? moment(message.created).format('dddd, MMM D, YYYY, h:mm a')
            : moment(message.created).fromNow();
        lastShownTime = moment(message.created);
      } else {
        message.timestamp = null;
      }
    }
  }
}
