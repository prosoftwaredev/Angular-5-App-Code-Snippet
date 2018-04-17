import {
  MissingTranslationHandler,
  MissingTranslationHandlerParams
} from '@ngx-translate/core';

export class MissingStringsHandler implements MissingTranslationHandler {
  // helps to identify the missing key instead a blank value
  handle(params: MissingTranslationHandlerParams) {
    return params.key;
  }
}

/**
 * Utility to mark extract-able strings.
 */
export function _(text: string): string {
  return text;
}

/**
 * Translation facade.
 */
export function TranslateMessage(msg: string): string {
  switch (msg) {
    // api
    case 'You must be authenticated':
      return _('NOTIFY.ERROR.API_UNAUTHENTICATED');
    case 'You do not have proper permission to access this endpoint':
      return _('NOTIFY.ERROR.API_ACCESS_FORBIDDEN');
    case 'The submitted data already exists in the database':
      return _('NOTIFY.ERROR.API_CONFLICT_RESPONSE');
    case 'An error occurred':
      return _('NOTIFY.ERROR.API_ERROR_OCURRED');
    case 'An error occurred reading response data':
      return _('NOTIFY.ERROR.API_CANNOT_READ_RESPONSE');

    default:
      return msg;
  }
}
