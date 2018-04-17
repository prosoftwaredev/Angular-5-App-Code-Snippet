import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { OrganizationAssociation } from 'selvera-api';
import { CcrDatabase } from '../../../../shared';
import { FetchCoachAssociationResponse } from '../../../../shared/selvera-api';

@Injectable()
export class ClinicsDatabase extends CcrDatabase {
  constructor(private association: OrganizationAssociation) {
    super();
  }

  fetch(): Observable<FetchCoachAssociationResponse[]> {
    // TODO handle any pagination, filtering or sorting here
    return Observable.fromPromise(this.association.fetchCoachAssociation());
  }
}
