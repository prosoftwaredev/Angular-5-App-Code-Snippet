import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { MeasurementDataSource } from '../../../services';

@Component({
  selector: 'app-dieter-measurements-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class MeasurementTableComponent implements OnInit {
  @Input() source: MeasurementDataSource | null;
  @Input() columns: string[];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cdr.detectChanges();
  }
}
