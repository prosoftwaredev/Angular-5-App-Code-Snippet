import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'ccr-stat-diff',
  templateUrl: './stat-diff.component.html',
  styleUrls: ['./stat-diff.component.scss']
})
export class StatDiffComponent implements OnInit {
  @Input() isEditable: boolean;

  @Input() title: string;
  @Input() starting: string;
  @Input() current: string;

  @Output() edit = new EventEmitter<void>();

  constructor() {}

  ngOnInit() {}

  onClick() {
    if (this.isEditable) {
      this.edit.emit();
    }
  }
}
