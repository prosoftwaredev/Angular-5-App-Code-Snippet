import { Injectable } from '@angular/core';
import { User } from 'selvera-api';
import { Profile, UpdateRequest } from './../../../shared/selvera-api';

@Injectable()
export class ProfileDataService {
  constructor(private user: User) {}

  //
  // get data for filling form fields
  //
  public getUserData(): Promise<Profile> {
    return this.user
      .get(false)
      .then((res: Profile) => res as Profile)
      .catch(err => Promise.reject(err));
  }

  //
  // save the updated profile
  //
  public update(updateRequest: UpdateRequest): Promise<String> {
    return this.user
      .update(updateRequest)
      .then((res: String) => res as String)
      .catch(err => Promise.reject(err));
  }
}
