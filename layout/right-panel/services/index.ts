import { ConsultationsDataService } from './consultations-data.service';
import { MeasurementsDataService } from './measurements-data.service';
import { NotificationsDataService } from './notifications-data.service';
import { ScheduleDataService } from './schedule-data.service';

export { ConsultationsDataService, MeasurementsDataService, NotificationsDataService, ScheduleDataService };

export const RightPanelServices = [
  ConsultationsDataService,
  MeasurementsDataService,
  NotificationsDataService,
  ScheduleDataService
];
