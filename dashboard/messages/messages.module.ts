import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { MessagesComponents, MessagesEntryComponents, MessagesProviders } from './';

@NgModule({
  imports: [CommonModule, RouterModule, SharedModule],
  exports: MessagesComponents,
  declarations: MessagesComponents,
  providers: MessagesProviders,
  entryComponents: MessagesEntryComponents
})
export class MessagesModule {}

// export function MessagesEntrypoint() {
//   return MessagesModule;
// }
