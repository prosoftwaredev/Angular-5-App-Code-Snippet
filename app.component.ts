import { Component } from '@angular/core';
import { AuthService, LanguageService, LayoutService } from './service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private language: LanguageService, private layout: LayoutService) {}

  public onResize(e: any): void {
    this.layout.resize(event);
  }

  public closeSidenav(): void {
    this.layout.closeSidenav();
  }
}
