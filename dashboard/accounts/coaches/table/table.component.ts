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
import { NotifierService } from '../../../../service/notifier.service';
import { _, PromptDialog, PromptDialogData } from '../../../../shared';
import { CoachesDataSource } from '../services';

@Component({
  selector: 'app-coaches-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class CoachesTableComponent implements OnInit {
  @Input() columns = ['name', 'email', 'date', 'actions'];
  @Input() source: CoachesDataSource | null;

  @Output() onSorted = new EventEmitter<Sort>();

  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private cdr: ChangeDetectorRef,
    private association: OrganizationAssociation,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private notifier: NotifierService
  ) {}

  ngOnInit() {
    this.cdr.detectChanges();
  }

  onSort(sort: Sort) {
    this.onSorted.emit(sort);
  }

  onRemove(coach) {
    const data: PromptDialogData = {
      title: _('BOARD.COACH_REMOVE'),
      content: _('BOARD.COACH_REMOVE_PROMPT'),
      contentParams: { coach: `${coach.firstName} ${coach.lastName}` }
    };
    this.dialog
      .open(PromptDialog, { data: data })
      .afterClosed()
      .subscribe(confirm => {
        if (confirm) {
          this.association
            .deleteCoachAssociation({
              providerId: +coach.id,
              organizationId: +this.source.args.organization
            })
            .then(() => {
              this.notifier.success(_('NOTIFY.SUCCESS.COACH_REMOVED'));
              // trigger a table refresh
              this.source.refresh();
            })
            .catch(err => this.notifier.error(err));
        }
      });
  }

  showCoach(coachId: string): void {
    this.router.navigate([coachId], { relativeTo: this.route });
  }
}
