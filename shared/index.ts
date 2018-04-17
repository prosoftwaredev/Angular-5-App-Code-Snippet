export * from './components';
export * from './dialogs';
export * from './directives';
export * from './model';
export * from './utils';

import { CmpComponents, CmpEntryComponents } from './components';
import { Dialogs } from './dialogs';
import { Directives } from './directives';
import { IconComponents } from './icons';
import { Pipes } from './pipes';

export const Components = [...CmpComponents, ...IconComponents, ...Dialogs, ...Directives, ...Pipes];

export const EntryComponents = [...CmpEntryComponents, ...Dialogs];
