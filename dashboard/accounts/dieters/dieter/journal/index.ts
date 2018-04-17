import { FoodExpandableTable } from './food/expandable-table/expandable-table.component';
import { FoodComponent } from './food/food.component';
import { HydrationComponent } from './hydration/hydration.component';
import { HydrationTableComponent } from './hydration/table/table.component';
import { DieterJournalComponent } from './journal.component';
import { SupplementsComponent } from './supplement/supplements.component';
import { SupplementsTableComponent } from './supplement/table/table.component';

export const JournalComponents = [
  DieterJournalComponent,
  FoodComponent,
  FoodExpandableTable,
  SupplementsComponent,
  SupplementsTableComponent,
  HydrationComponent,
  HydrationTableComponent
];

export const JournalEntryComponents = [];
