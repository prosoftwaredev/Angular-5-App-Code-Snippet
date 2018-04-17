import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { EventsService } from './events.service';

@Injectable()
export class LayoutService {
  constructor(private bus: EventsService) {
    this.initialState(window.innerWidth);
    this.bus.register(
      'right-panel.component.set',
      this.setActiveRightComponent.bind(this)
    );
    this.bus.register('right-panel.deactivate', this.deactivateRightPanel.bind(this));
  }

  /**
   * Sidenav Handling
   */
  sidenavState = new BehaviorSubject<boolean>(false);
  set IsSidenavOpen(v: boolean) {
    this.sidenavState.next(v);
  }
  get IsSidenavOpen(): boolean {
    return this.sidenavState.getValue();
  }

  toggleSidenav(): void {
    this.sidenavState.next(!this.IsSidenavOpen);
  }
  openSidenav(): void {
    if (!this.IsSidenavOpen) {
      this.IsSidenavOpen = true;
    }
  }
  closeSidenav(): void {
    if (this.IsSidenavOpen) {
      this.IsSidenavOpen = false;
    }
  }

  /**
   * Right Panel Handling
   */
  rightPanelState = new BehaviorSubject<boolean>(false);
  set IsRightPanelOpen(v: boolean) {
    this.rightPanelState.next(v);
  }
  get IsRightPanelOpen(): boolean {
    return this.rightPanelState.getValue();
  }

  toggleRightPanel(): void {
    this.rightPanelState.next(!this.IsRightPanelOpen);
  }
  openRightPanel(): void {
    if (!this.IsRightPanelOpen && this.RightPanelEnabled) {
      this.IsRightPanelOpen = true;
    }
  }
  closeRightPanel(): void {
    if (this.IsRightPanelOpen) {
      this.IsRightPanelOpen = false;
    }
  }

  /**
   * Right Panel Activation
   */
  rightPanelEnabled = new BehaviorSubject<boolean>(false);
  set RightPanelEnabled(v: boolean) {
    this.rightPanelEnabled.next(v);
  }
  get RightPanelEnabled(): boolean {
    return this.rightPanelEnabled.getValue();
  }

  activateRightPanel(): void {
    if (!this.RightPanelEnabled) {
      this.RightPanelEnabled = true;
    }
  }
  deactivateRightPanel(): void {
    if (this.RightPanelEnabled) {
      this.RightPanelEnabled = false;
    }
  }
  toggleRightPanelActivation(): void {
    this.rightPanelEnabled.next(!this.RightPanelEnabled);
  }

  /**
   *  Setting relevant component in the right-panel
   */
  onActiveComponentChange = new BehaviorSubject<string>('');
  setActiveRightComponent(c: string): void {
    !this.RightPanelEnabled && this.activateRightPanel();
    if (this.onActiveComponentChange.getValue() !== c) {
      this.onActiveComponentChange.next(c);
    }
  }

  /**
   * Grid Handling
   */
  circleCols = new BehaviorSubject<number>(4);
  colSpan = new BehaviorSubject<number>(2);
  rowSpan = new BehaviorSubject<boolean>(false);

  /**
   * Initial State Values.
   */
  initialState(width) {
    // sync the initial CSS with the variables
    this.sidenavState.next(width < 992 ? false : true);
    this.rightPanelState.next(width < 1200 ? false : true);
    this.circleCols.next(width < 980 ? 2 : 4);
    this.colSpan.next(width < 992 ? 1 : 2);
    this.rowSpan.next(width < 600 ? true : false);
  }

  /**
   * Resize Event Handlers.
   */
  resize(e: any): void {
    this.evalWidth(e.target.innerWidth);
  }

  evalWidth(width: number) {
    // if innerwidth goes to 992 and the sidenav is open then close it
    if (width < 992 && this.IsSidenavOpen) {
      this.closeSidenav();
    }
    if (width < 1200 && this.IsRightPanelOpen) {
      this.closeRightPanel();
    } else if (width > 1200 && !this.IsRightPanelOpen) {
      this.openRightPanel();
    }
    // circle grid setting
    this.circleCols.next(width < 980 ? 2 : 4);
    // colSpan and rowSpan settings
    this.colSpan.next(width < 992 ? 1 : 2);
    this.rowSpan.next(width < 600 ? true : false);
  }
}
