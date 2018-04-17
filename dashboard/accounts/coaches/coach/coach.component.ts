import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Account } from 'selvera-api';
import { ContextService, NotifierService } from '../../../../service';
import { FetchSingleAccountResponse } from '../../../../shared/selvera-api/index';

@Component({
  selector: 'app-coach',
  templateUrl: './coach.component.html',
  styleUrls: ['./coach.component.scss']
})
export class CoachComponent implements OnInit {
  coach: FetchSingleAccountResponse;

  constructor(
    private route: ActivatedRoute,
    private account: Account,
    private context: ContextService,
    private notifier: NotifierService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.context.coachId = params['id'];
      this.loadCoach();
    });
  }

  private loadCoach(): void {
    this.account
      .fetchSingle(+this.context.coachId)
      .then((account: FetchSingleAccountResponse) => {
        this.coach = account;
      })
      .catch(err => this.notifier.error(err));
  }
}
