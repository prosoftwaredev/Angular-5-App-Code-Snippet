import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { LayoutService } from '../service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnDestroy {
  isSidenavOpen: boolean;
  isRightPanelOpen: boolean;
  rightPanel: boolean;
  sidenavSubscription: Subscription;
  rightPanelSub: Subscription;
  rightPanelEnabledSub: Subscription;

  constructor(private cdr: ChangeDetectorRef, private layout: LayoutService) {}

  ngOnInit() {
    this.sidenavSubscription = this.layout.sidenavState.subscribe(v => {
      this.isSidenavOpen = v;
      this.cdr.detectChanges();
    });

    this.rightPanelSub = this.layout.rightPanelState.subscribe(v => {
      this.isRightPanelOpen = v;
      this.cdr.detectChanges();
    });

    this.rightPanelEnabledSub = this.layout.rightPanelEnabled.subscribe(v => {
      this.rightPanel = v;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.sidenavSubscription.unsubscribe();
    this.rightPanelSub.unsubscribe();
    this.rightPanelEnabledSub.unsubscribe();
  }

  sidenavToggle(): void {
    this.layout.IsSidenavOpen = !this.isSidenavOpen;
  }

  openSidenav(e: Event): void {
    this.layout.IsSidenavOpen = true;
    e.stopPropagation();
  }
}
