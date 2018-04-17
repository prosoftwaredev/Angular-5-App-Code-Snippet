import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FoodDataSource, FoodDayAmount } from '../../../../services';

@Component({
  selector: 'app-dieter-journal-food-table',
  templateUrl: 'expandable-table.component.html',
  styleUrls: ['expandable-table.component.scss']
})
export class FoodExpandableTable implements OnInit {
  @Input() columns = ['date', 'calories', 'protein', 'carb', 'fat'];
  @Input() source: FoodDataSource;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cdr.detectChanges();
  }

  toggleRow(row: FoodDayAmount) {
    if (row.isEmpty || row.level > 1) {
      return;
    }

    row.isExpanded = !row.isExpanded;

    switch (row.level) {
      case 0:
        row.types.forEach(t => {
          t.isHidden = !row.isExpanded;
          if (!row.isExpanded) {
            t.isExpanded = row.isExpanded;
            t.meals.forEach(m => (m.isHidden = !t.isExpanded));
          }
        });
        break;

      case 1:
        row.meals.forEach(m => (m.isHidden = !row.isExpanded || m.isEmpty));
        break;
    }
  }
}
