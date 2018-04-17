import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router/router';
import { FetchGoalResponse, Goal } from '../../../../shared/selvera-api';

@Injectable()
export class GoalsResolver implements Resolve<FetchGoalResponse> {
  constructor(private goal: Goal) {}

  resolve(route: ActivatedRouteSnapshot): Promise<FetchGoalResponse> {
    return this.goal.fetch({ account: route.params['id'] });
  }
}
