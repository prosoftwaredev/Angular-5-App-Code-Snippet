import { Component, HostBinding, Input, ViewChild } from '@angular/core';
import { Account } from 'selvera-api';
import { NotifierService } from '../../../service';
import { CcrAvatarDirective } from '../../directives';
import { SubmitAvatarRequest } from '../../selvera-api';
import { _ } from '../../utils';

@Component({
  selector: 'ccr-avatar',
  templateUrl: './avatar.component.html'
})
export class CcrAvatarComponent {
  @Input() account: string;
  @Input() size: string;

  @HostBinding('class.ccr-editable')
  @Input()
  editable = false;

  @ViewChild('avatar') avatar: CcrAvatarDirective;

  constructor(private api: Account, private notifier: NotifierService) {}

  uploadAvatar(e) {
    const file = e.target.files ? e.target.files[0] : null;

    if (file) {
      const reader = new FileReader();
      reader.onload = this.handleUpload.bind(this);
      reader.readAsBinaryString(file);
    }
  }

  private handleUpload(e) {
    const request: SubmitAvatarRequest = {
      client: this.account,
      avatar: btoa(e.target.result)
    };
    this.api
      .submitAvatar(request)
      .then(() => this.avatar.refresh(true))
      .catch(() => this.notifier.error(_('NOTIFY.ERROR.AVATAR_UPLOAD_FAILED')));
  }
}
