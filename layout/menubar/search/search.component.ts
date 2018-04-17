import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material';
import { Router } from '@angular/router';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import { Account } from 'selvera-api';
import { ConfigService, ContextService, NotifierService } from '../../../service';
import { _ } from '../../../shared';
import { SearchResultAccount } from '../../../shared/selvera-api';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  @Input() fill;
  @ViewChild(MatAutocompleteTrigger) trigger: MatAutocompleteTrigger;

  searchCtrl: FormControl;
  accounts: Array<SearchResultAccount>;

  constructor(
    private router: Router,
    private account: Account,
    private config: ConfigService,
    private context: ContextService,
    private notifier: NotifierService
  ) {
    this.fill = this.config.get('palette.contrast');
  }

  ngOnInit() {
    this.searchCtrl = new FormControl();
    this.searchCtrl.valueChanges
      .debounceTime(500)
      .distinctUntilChanged()
      .subscribe(query => {
        if (query) {
          this.searchAccounts(query);
        } else {
          this.trigger.closePanel();
        }
      });
  }

  formatAccountType(accountType) {
    let result;
    if ([2, '2', 'provider'].indexOf(accountType) >= 0) {
      result = _('GLOBAL.COACH');
    } else if ([3, '3', 'client'].indexOf(accountType) >= 0) {
      result = _('GLOBAL.PATIENT');
    }
    return result ? result : '';
  }

  select(account: SearchResultAccount): void {
    this.accounts = [];
    this.context.gotoUserProfile(account);
  }

  private searchAccounts(query: string): void {
    this.account
      .search(query)
      .then((res: Array<SearchResultAccount>) => {
        this.accounts = res;
        if (this.accounts.length > 0) {
          this.trigger.openPanel();
        }
      })
      .catch(err => this.notifier.error(err));
  }
}
