export * from './faqs';
export * from './marketing';
export * from './support';

import { FaqsComponents, FaqsEntryComponents } from './faqs';
import { MarketingComponents, MarketingEntryComponents } from './marketing';
import { SupportComponents, SupportEntryComponents } from './support';

export const ResourcesComponents = [
  ...FaqsComponents,
  ...MarketingComponents,
  ...SupportComponents
];

export const ResourcesEntryComponents = [
  ...FaqsEntryComponents,
  ...MarketingEntryComponents,
  ...SupportEntryComponents
];
