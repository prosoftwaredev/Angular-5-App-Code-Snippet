import { Directive, HostBinding, Input } from '@angular/core';
import { ApiService } from 'selvera-api';

@Directive({
  selector: 'img[ccrAvatar]',
  exportAs: 'ccrAvatar',
  host: {
    '(error)': 'onError()'
  }
})
export class CcrAvatarDirective {
  @HostBinding('src') src: string;
  @Input() default = './assets/avatar.png';
  account: string;

  constructor(private api: ApiService) {}

  @Input()
  set ccrAvatar(account) {
    this.account = account;
    this.refresh();
  }

  onError() {
    this.src = this.default;
  }

  refresh(force = false) {
    this.src = this.account
      ? this.api.getUrl(
          `/account/${this.account}/avatar` + (force ? `?${+new Date()}` : ''),
          '2.0'
        )
      : this.default;
  }
}
