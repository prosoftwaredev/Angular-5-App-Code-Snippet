import { Component, OnInit } from '@angular/core';
import { ContextService, EventsService, NotifierService } from '../../../../../service';
import { Profile } from '../../../../../shared/selvera-api';

@Component({
  selector: 'app-dieter-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class DieterMessagesComponent implements OnInit {
  account: Profile;

  constructor(public context: ContextService, private bus: EventsService) {}

  ngOnInit() {
    this.context.getUser().then((info: Profile) => {
      this.account = info;
    });

    this.bus.trigger('right-panel.component.set', 'reminders');
  }
}
