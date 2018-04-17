import {
  AfterContentInit,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { LayoutService } from '../../service';
import {
  AddMeasurementsComponent,
  ConsultationComponent,
  NotificationsComponent,
  RemindersComponent
} from './contents';

const Components = {
  addConsultation: ConsultationComponent,
  addMeasurements: AddMeasurementsComponent,
  notifications: NotificationsComponent,
  reminders: RemindersComponent
};

@Component({
  selector: 'app-right-panel',
  templateUrl: './right-panel.component.html',
  styleUrls: ['./right-panel.component.scss']
})
export class RightPanelComponent implements AfterContentInit {
  @ViewChild('entry', { read: ViewContainerRef })
  entry: ViewContainerRef;

  private activeChild: string = '';
  childComponent: ComponentRef<any>;

  constructor(
    private resolver: ComponentFactoryResolver,
    private layout: LayoutService
  ) {}

  ngAfterContentInit() {
    this.layout.onActiveComponentChange.subscribe(val => this.createChildComponent(val));
  }

  createChildComponent(c: string): void {
    if (c && this.activeChild !== c && Components[c]) {
      this.childComponent && this.childComponent.destroy();
      const componentFactory = this.resolver.resolveComponentFactory(Components[c]);
      this.entry.clear();
      this.childComponent = this.entry.createComponent(componentFactory);
    }
    this.activeChild = c;
  }
}
