import { ChangeDetectorRef, Component, HostBinding, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationAssociation } from 'selvera-api';
import { NotifierService } from '../../../../service';
import { _, PromptDialog, PromptDialogData } from '../../../../shared';
import { DietersDataSource } from '../services';
import {
  AccountEditDialog,
  AccountEditDialogData
} from './../../dialogs/account-edit/account-edit.dialog';

@Component({
  selector: 'app-dieters-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class DietersTableComponent implements OnInit {
  @Input() columns = ['name', 'email', 'created', 'actions'];
  @Input() source: DietersDataSource | null;

  @Input()
  @HostBinding('class.ccr-edit-table')
  editable = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private association: OrganizationAssociation,
    private notifier: NotifierService
  ) {}

  ngOnInit() {
    this.cdr.detectChanges();
  }

  onEdit(dieter) {
    const data: AccountEditDialogData = {
      userId: dieter.id,
      firstName: dieter.firstName,
      lastName: dieter.lastName,
      email: dieter.email
    };
    this.dialog
      .open(AccountEditDialog, { data: data, width: '80vw' })
      .afterClosed()
      .subscribe((user: AccountEditDialogData) => {
        if (user) {
          this.notifier.success(_('NOTIFY.SUCCESS.PATIENT_UPDATED'));
          // trigger a table refresh
          this.source.refresh();
        }
      });
  }

  onRemove(dieter) {
    const data: PromptDialogData = {
      title: _('BOARD.PATIENT_REMOVE'),
      content: _('BOARD.PATIENT_REMOVE_PROMPT'),
      contentParams: { patient: `${dieter.firstName} ${dieter.lastName}` }
    };
    this.dialog
      .open(PromptDialog, { data: data })
      .afterClosed()
      .subscribe(confirm => {
        if (confirm) {
          this.association
            .deleteClientAssociation({
              clientId: +dieter.id,
              organizationId: +this.source.args.organization
            })
            .then(() => {
              this.notifier.success(_('NOTIFY.SUCCESS.PATIENT_REMOVED'));
              // trigger a table refresh
              this.source.refresh();
            })
            .catch(err => this.notifier.error(err));
        }
      });
  }

  showDieter(dieterId: string): void {
    this.router.navigate([dieterId], { relativeTo: this.route });
  }
}
