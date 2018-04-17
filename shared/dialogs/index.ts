export * from './confirm.dialog';
export * from './prompt.dialog';
export * from './schedule-select.dialog';

import { ConfirmDialog } from './confirm.dialog';
import { PromptDialog } from './prompt.dialog';
import { ScheduleSelectDialog } from './schedule-select.dialog';

export const Dialogs = [ConfirmDialog, PromptDialog, ScheduleSelectDialog];
