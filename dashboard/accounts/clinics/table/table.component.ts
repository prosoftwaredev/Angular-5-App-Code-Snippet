import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { OrganizationAssociation } from 'selvera-api';
import { ContextService, NotifierService } from '../../../../service';
import { _, PromptDialog, PromptDialogData } from '../../../../shared';
import { ClinicsDataSource } from '../services';

@Component({
  selector: 'app-clinics-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class ClinicsTableComponent implements OnInit {
  @Input() columns = ['name', 'address', 'city', 'state', 'zip', 'actions'];
  @Input() source: ClinicsDataSource | null;

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private association: OrganizationAssociation,
    private context: ContextService,
    private notifier: NotifierService
  ) {}

  ngOnInit() {
    this.cdr.detectChanges();
  }

  onRemove(clinic) {
    const data: PromptDialogData = {
      title: _('BOARD.CLINIC_REMOVE'),
      content: _('BOARD.CLINIC_REMOVE_PROMPT'),
      contentParams: { clinic: `${clinic.organizationName}` }
    };
    this.dialog
      .open(PromptDialog, { data: data })
      .afterClosed()
      .subscribe(confirm => {
        if (confirm) {
          this.context
            .getUser()
            .then(user => {
              this.association
                .deleteCoachAssociation({
                  providerId: +user.id,
                  organizationId: +clinic.organization
                })
                .then(() => {
                  // trigger a table refresh
                  this.source.refresh();
                })
                .catch(err => this.notifier.error(err));
            })
            .catch(err => this.notifier.error(err));
        }
      });
  }
}
