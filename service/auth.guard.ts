import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot
} from '@angular/router';
import { ContextService } from './context.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private context: ContextService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    return this.context.getUser().then(user => true);
  }
}
