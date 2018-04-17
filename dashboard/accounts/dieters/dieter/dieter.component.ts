import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Account } from 'selvera-api';
import { ContextService, NotifierService } from '../../../../service';
import { FetchSingleAccountResponse } from '../../../../shared/selvera-api';

@Component({
  selector: 'app-dieter',
  templateUrl: './dieter.component.html',
  styleUrls: ['./dieter.component.scss']
})
export class DieterComponent implements OnInit {
  dieter: FetchSingleAccountResponse;

  constructor(
    private route: ActivatedRoute,
    private account: Account,
    private context: ContextService,
    private notifier: NotifierService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.context.dieterId = params['id'];
      this.loadDieter();
    });
  }

  private loadDieter(): void {
    this.account
      .fetchSingle(+this.context.dieterId)
      .then((account: FetchSingleAccountResponse) => {
        this.dieter = account;
      })
      .catch(err => this.notifier.error(err));
  }
}
