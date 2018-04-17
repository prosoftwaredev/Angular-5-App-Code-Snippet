import { Component, Input, OnChanges, QueryList, ViewChildren } from '@angular/core';

export interface SidenavItem {
  navName: string;
  navRoute?: string;
  navLink?: string;
  route?: string;
  icon?: string;
  children?: Array<SidenavItem>;
  expanded?: boolean;
  unread?: number;
}

@Component({
  selector: 'app-sidenav-item',
  templateUrl: './sidenav-item.component.html'
})
export class SidenavItemComponent implements OnChanges {
  @ViewChildren(SidenavItemComponent) children: QueryList<SidenavItemComponent>;
  @Input() sidenavItem: SidenavItem;
  @Input() level = 1;
  @Input() parent: SidenavItemComponent;
  @Input() isSidenavOpen = false;

  active = false;
  _this: SidenavItemComponent = this;

  constructor() {}

  ngOnChanges(changes) {
    this.active = this.sidenavItem.expanded;
  }

  get height(): number {
    let addedHeight = 0;
    if (this.children) {
      this.children.forEach(childComponent => {
        if (childComponent.active) {
          addedHeight += childComponent.height;
        }
      });
    }
    return this.sidenavItem.children.length * 36 + addedHeight;
  }

  get levelClass(): string {
    return `level${this.level}`;
  }

  get hasChildren(): boolean {
    if (!this.sidenavItem || !this.sidenavItem.children) {
      return false;
    }
    return this.sidenavItem.children.length > 0;
  }

  toggleDropdown(active: boolean): void {
    this.sidenavItem.expanded = active;
    this.active = active;
  }

  clicked(event: MouseEvent): void {
    this.toggleDropdown(!this.active);
  }

  openLink(link: string) {
    window.open(link, '_self');
  }

  newWindow(link: string) {
    window.open(link, '_blank');
  }
}
