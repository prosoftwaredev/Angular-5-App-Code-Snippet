import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { MatDialog, MatSort, Sort } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationAssociation } from 'selvera-api';
import { ContextService, NotifierService } from '../../../../service';
import { _, PromptDialog, PromptDialogData } from '../../../../shared';
import { AlertsDataSource } from '../services';

@Component({
  selector: 'app-alerts-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class AlertsTableComponent implements OnInit {
  @Input() columns = ['name', 'type'];
  @Input() source: AlertsDataSource | null;

  constructor(
    private cdr: ChangeDetectorRef,
    private association: OrganizationAssociation,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private context: ContextService,
    private notifier: NotifierService
  ) {}

  ngOnInit() {
    this.cdr.detectChanges();
  }

  showDieter(account: any): void {
    account.accountType = '3';
    this.context.gotoUserProfile(account);
  }
}
