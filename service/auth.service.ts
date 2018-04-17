import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from 'selvera-api';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthService {
  constructor(api: ApiService, private cookie: CookieService) {
    api.onUnauthenticatedError.subscribe(() => this.redirect());
  }

  check(): boolean {
    const role = this.cookie.get('ccrStatic');
    return !role ? false : role === environment.role;
  }

  get(): string {
    return this.cookie.get('ccrStatic');
  }

  remove(): void {
    this.cookie.delete('ccrStatic', '/');
  }

  redirect(): void {
    this.remove();
    window.location.href = environment.loginSite;
  }
}
