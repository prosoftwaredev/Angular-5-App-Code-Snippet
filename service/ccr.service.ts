import { Injectable } from '@angular/core';
import { OrganizationAssociation } from 'selvera-api';
import { FetchCoachAssociationResponse } from '../shared/selvera-api';

export interface ClinicSelectorItem {
  value: string;
  viewValue: string;
  permissions: {
    admin: boolean;
    accessall: boolean;
  };
}

/**
 * This is just a temporary service to be replaced with the CommonModule
 */
@Injectable()
export class CCRService {
  constructor(private association: OrganizationAssociation) {}

  clinicSelector(): Promise<ClinicSelectorItem[]> {
    return this.association.fetchCoachAssociation().then(clinics => {
      clinics.sort((a, b) => a.organizationName.localeCompare(b.organizationName));
      // map the organizations to the selector interface
      return clinics.map(c => ({
        value: c.organization,
        viewValue: c.organizationName,
        permissions: { admin: c.permissionAdmin, accessall: c.permissionAccessAll }
      }));
    });
  }
}
