import { Injectable } from '@angular/core';
import { Schedule } from 'selvera-api';
import {
  AddAttendeeRequest,
  AddMeetingRequest,
  AddMeetingResponse,
  FetchMeetingResponse,
  FetchMeetingTypesResponse,
  UpdateMeetingRequest
} from '../../../shared/selvera-api';

@Injectable()
export class ScheduleDataService {
  constructor(private schedule: Schedule) {}

  public saveMeeting(req: AddMeetingRequest, meetingId = 0): Promise<void> {
    if (!meetingId) {
      return this.schedule
        .addMeeting(req)
        .then(res => {})
        .catch(err => Promise.reject(err));
    } else {
      const request: UpdateMeetingRequest = {
        meetingId: meetingId.toString(),
        title: req.title,
        startTime: req.startTime,
        endTime: req.endTime,
        meetingTypeId: req.meetingTypeId,
        recurring: req.recurring,
        location: req.location
      };
      return this.schedule.updateMeeting(request);
    }
  }

  public fetchMeetingTypes(organization: string): Promise<FetchMeetingTypesResponse[]> {
    return this.schedule.fetchTypes(organization);
  }

  public fetchMeeting(id: string): Promise<FetchMeetingResponse> {
    return this.schedule.fetchMeeting(id);
  }

  public deleteAttendee(meetingId: string, accountId: string): Promise<void> {
    return this.schedule.deleteAttendee(meetingId, accountId);
  }

  public addAttendee(addAttendeeRequest: AddAttendeeRequest): Promise<void> {
    return this.schedule.addAttendee(addAttendeeRequest);
  }
}
