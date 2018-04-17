import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material';
import { Account, Message } from 'selvera-api';
import { MessageRecipient } from '../../../shared';
import {
  AddMessageRequest,
  AddThreadRequest,
  Profile,
  SearchResultAccount
} from '../../../shared/selvera-api';

@Component({
  selector: 'app-messages-recipients',
  templateUrl: 'recipients.component.html',
  encapsulation: ViewEncapsulation.None
})
export class MessagesRecipientsComponent implements OnInit {
  @Input() current: Profile;
  @Input() total: number;

  @Output() changed = new EventEmitter<MessageRecipient[]>();

  @ViewChild(MatAutocompleteTrigger) trigger: MatAutocompleteTrigger;

  public searchCtrl: FormControl;
  public accounts: Array<SearchResultAccount>;
  public selected: Array<MessageRecipient> = [];

  constructor(private account: Account, private message: Message) {}

  ngOnInit() {
    this.searchCtrl = new FormControl();
    this.searchCtrl.valueChanges
      .debounceTime(500)
      .distinctUntilChanged()
      .subscribe(query => {
        if (query) {
          this.searchAccounts(query);
        } else {
          if (this.trigger) {
            this.trigger.closePanel();
          }
        }
      });
  }

  selectAccount(account: SearchResultAccount): void {
    if (!this.selected.some(a => a.id === account.id) && account.id !== this.current.id) {
      this.selected.push({
        id: account.id,
        name: `${account.firstName} ${account.lastName}`,
        firstName: account.firstName,
        lastName: account.lastName,
        accountType: account.accountType
      });
      this.emitChanged();
    }
    this.accounts = [];
  }

  removeAccount(account: SearchResultAccount): void {
    this.selected = this.selected.filter(a => a.id !== account.id);
    this.emitChanged();
  }

  private emitChanged() {
    this.changed.emit(this.selected);
  }

  private searchAccounts(query: string): void {
    this.account.search(query).then(res => {
      this.accounts = res.filter(
        a => a.id !== this.current.id && !this.selected.some(sa => sa.id === a.id)
      );
      if (this.accounts.length > 0) {
        this.trigger.openPanel();
      }
    });
  }
}
