import { Injectable } from '@angular/core';
import * as moment from 'moment-timezone';
import { Schedule } from 'selvera-api';
import { ContextService } from '../../../service';
import {
  FetchAllMeetingRequest,
  FetchAllMeetingResponse,
  Profile
} from './../../../shared/selvera-api';

@Injectable()
export class NotificationsDataService {
  constructor(private schedule: Schedule, private context: ContextService) {}

  /**
   * Get user's upcoming meetings
   */
  public getMeetings(req: FetchAllMeetingRequest): Promise<FetchAllMeetingResponse> {
    return this.schedule
      .fetchAllMeeting(req)
      .then(response => response)
      .catch(err => Promise.reject(err));
  }

  public getUser(): Promise<Profile> {
    return this.context
      .getUser()
      .then((user: Profile) => user)
      .catch(err => Promise.reject(err));
  }

  public groupByDate(
    response: FetchAllMeetingResponse,
    dateFormat?: string,
    limit?: number
  ): Array<any> {
    const dateSections = [];

    for (const k of Array.from(response.data.keys())) {
      if (limit && k === limit) {
        return dateSections;
      }

      const meeting = response.data[k];
      const meetingDate = dateFormat
        ? moment(meeting.startTime).format(dateFormat)
        : moment(meeting.startTime).format('dddd, LL');

      const targetSection = dateSections.find(section => section.date === meetingDate);

      if (targetSection) {
        targetSection.meetings.push(meeting);
      } else {
        dateSections.push({ date: meetingDate, meetings: [meeting] });
      }
    }

    return dateSections;
  }
}
