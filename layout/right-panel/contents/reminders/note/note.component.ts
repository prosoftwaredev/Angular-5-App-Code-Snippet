import { Component, Input } from '@angular/core';
import * as moment from 'moment-timezone';
import { ConfigService } from '../../../../../service';
import { ConsultationListingResponse } from '../../../../../shared/selvera-api';

@Component({
  selector: 'app-rightpanel-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})
export class NoteComponent {
  @Input() note: ConsultationListingResponse;
  maxChars: number;
  maxLenght: number;

  constructor(private config: ConfigService) {
    this.maxLenght = this.config.get('app.default.noteMaxLenght', 100);
    this.maxChars = this.maxLenght;
  }

  toggleCompleteNote(): void {
    this.maxChars = !this.maxChars ? this.maxLenght : 0;
  }

  noteHasOverflow(privateNoteText: string): boolean {
    return privateNoteText.length > this.maxLenght;
  }
}
