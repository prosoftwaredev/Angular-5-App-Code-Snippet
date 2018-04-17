import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ContextService } from '../../../service';
import { ScheduleSelectDialog } from '../../dialogs/schedule-select.dialog';
import { FetchAllAccountObjectResponse, Profile } from '../../selvera-api';

@Component({
  selector: 'ccr-select-user',
  templateUrl: './select-user.component.html',
  styleUrls: ['./select-user.component.scss']
})
export class CcrSelectUserComponent implements OnInit {
  @Input() title = '';
  @Input() default = '';
  @Input() onlyProviders = false;

  text = '';
  user: FetchAllAccountObjectResponse | Profile;

  constructor(private dialog: MatDialog, private context: ContextService) {}

  ngOnInit() {
    this.context.selected$.subscribe(user => {
      if (user) {
        this.user = user;
        this.resolveText(user);
      }
    });
  }

  openDialog(): void {
    this.dialog
      .open(ScheduleSelectDialog, {
        disableClose: true,
        data: {
          user: this.context.user,
          title: this.title,
          button: this.default,
          onlyProviders: this.onlyProviders
        }
      })
      .afterClosed()
      .subscribe(user => {
        if (user && this.user.id !== user.id) {
          this.context.selected = user;
          this.resolveText(user);
        }
      });
  }

  private resolveText(user) {
    this.text =
      this.context.user.id === user.id
        ? this.default
        : `${this.user.firstName} ${this.user.lastName}`;
  }
}
