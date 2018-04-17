import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { User } from 'selvera-api';
import { CCRPalette } from '../../config';
import {
  AuthService,
  ConfigService,
  ContextService,
  EventsService,
  LanguageService,
  LayoutService
} from '../../service';
import { _, TranslationsObject } from '../../shared';
import { Profile } from '../../shared/selvera-api';

@Component({
  selector: 'app-menubar',
  templateUrl: './menubar.component.html',
  styleUrls: ['./menubar.component.scss']
})
export class MenubarComponent implements OnInit {
  selectedLanguage: string;
  translations: TranslationsObject = {};
  rightPanelEnabled: boolean;
  palette: CCRPalette;

  constructor(
    private translator: TranslateService,
    private user: User,
    private auth: AuthService,
    private config: ConfigService,
    private context: ContextService,
    private bus: EventsService,
    private language: LanguageService,
    private layout: LayoutService
  ) {
    this.palette = this.config.get('palette');
  }

  ngOnInit() {
    this.selectedLanguage = this.language.get();
    this.translator.onLangChange.subscribe(() => {
      this.translateTexts();
    });
    this.layout.rightPanelEnabled.subscribe(v => {
      this.rightPanelEnabled = v;
    });
    this.bus.register('user.data', this.translateTexts.bind(this));
  }

  translateTexts() {
    this.context.getUser().then((user: Profile) => {
      const userName = user.firstName + ' ' + user.lastName.charAt(0);

      this.translator
        .get([_('MENU.HELLO')], {
          userName: userName
        })
        .subscribe((translations: TranslationsObject) => {
          this.translations = translations;
        });
    });
  }

  setLanguage(language: string): void {
    // wait for the mat-menu to fade off
    setTimeout(() => {
      this.language.set(language);
      this.selectedLanguage = language;
    }, 300);
  }

  logout(): void {
    this.user.logout().then(() => {
      this.auth.redirect();
    });
  }

  toggleSidenav(e: Event): void {
    this.layout.toggleSidenav();
    e.stopPropagation();
  }

  toggleRightPanel(e: Event): void {
    this.layout.toggleRightPanel();
    e.stopPropagation();
  }
}
