import { Component, OnInit } from '@angular/core';
import { ContextService, EventsService, NotifierService } from '../../service';
import { Profile, UpdateRequest } from './../../shared/selvera-api';
import { ProfileDataService } from './services/data.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profile: Profile;
  isLoading: boolean = true;
  isSaving: boolean = false;

  constructor(
    private context: ContextService,
    private bus: EventsService,
    private notifier: NotifierService,
    private profileService: ProfileDataService
  ) {}

  ngOnInit() {
    this.profileService
      .getUserData()
      .then((res: Profile) => {
        this.profile = res;
        this.isLoading = false;
      })
      .catch(err => {
        this.notifier.error(err);
        this.isLoading = false;
      });

    this.bus.trigger('right-panel.component.set', 'notifications');
  }

  saveProfile(updateRequest: UpdateRequest): void {
    this.isSaving = true;
    this.profileService
      .update(updateRequest)
      .then((res: String) => {
        this.notifier.success(res);
        this.context.updateUser();
        this.isSaving = false;
      })
      .catch(err => {
        this.notifier.error(err);
        this.isSaving = false;
      });
  }
}
