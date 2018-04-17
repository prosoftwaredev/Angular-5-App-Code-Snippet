import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatAutocompleteTrigger, MatDialogRef } from '@angular/material';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import { Account, OrganizationAssociation } from 'selvera-api';
import { ConfigService, NotifierService } from '../../service';
import {
  FetchAllAccountObjectResponse,
  FetchCoachAssociationResponse,
  Profile
} from '../selvera-api';

@Component({
  selector: 'app-schedule-select-dialog',
  templateUrl: 'schedule-select.dialog.html',
  host: { class: 'ccr-dialog' },
  encapsulation: ViewEncapsulation.None
})
export class ScheduleSelectDialog implements OnInit {
  @ViewChild(MatAutocompleteTrigger) trigger: MatAutocompleteTrigger;
  public searchCtrl: FormControl;
  public accounts: Array<FetchAllAccountObjectResponse>;
  public clinics: Array<FetchCoachAssociationResponse>;
  public selectedClinic: FetchCoachAssociationResponse;
  public isLoading = true;
  public onlyProviders: boolean;
  public fill: string;

  constructor(
    private account: Account,
    private dialogRef: MatDialogRef<ScheduleSelectDialog>,
    private association: OrganizationAssociation,
    private config: ConfigService,
    private notifier: NotifierService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      user: Profile;
      title: string;
      button: string;
      onlyProviders?: boolean;
    }
  ) {
    this.fill = this.config.get('palette.base');
  }

  ngOnInit() {
    this.onlyProviders = this.data.onlyProviders || false;

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

    this.association
      .fetchCoachAssociation(this.data.user.id)
      .then((clinics: Array<FetchCoachAssociationResponse>) => {
        this.clinics = clinics.filter(c => c.permissionAdmin);
        if (this.clinics.length > 0) {
          this.selectedClinic = this.clinics[0];
        }
        this.isLoading = false;
      })
      .catch(err => this.notifier.error(err));
  }

  public selectDefault() {
    this.dialogRef.close(this.data.user);
  }

  public select(account: FetchAllAccountObjectResponse): void {
    this.dialogRef.close(account);
  }

  private searchAccounts(query: string): void {
    const promises = [];

    promises.push(
      this.account.fetchAll({
        nameFilter: query,
        accountType: '2',
        organization: +this.selectedClinic.organization
      })
    );

    if (!this.onlyProviders) {
      promises.push(
        this.account.fetchAll({
          nameFilter: query,
          accountType: '3',
          organization: +this.selectedClinic.organization
        })
      );
    }

    Promise.all(promises)
      .then(results => {
        this.accounts = [];
        results.forEach(res => {
          this.accounts = this.accounts.concat(res.accounts);
        });
        if (this.accounts.length > 0) {
          this.trigger.openPanel();
        }
      })
      .catch(err => this.notifier.error(err));
  }
}
