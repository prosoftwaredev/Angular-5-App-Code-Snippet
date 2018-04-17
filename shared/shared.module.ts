/**
 * TODO build a date-format directive that listen lang changes like:
 * https://github.com/ngx-translate/core/blob/master/src/translate.directive.ts
 *
 * Details of CDK modules can be found on:
 * https://github.com/angular/material2/tree/master/src/cdk
 */
import { A11yModule } from '@angular/cdk/a11y';
// import { FocusMonitor } from '@angular/cdk/a11y';
// import { BidiModule } from '@angular/cdk/bidi';
import { ObserversModule } from '@angular/cdk/observers';
import { OverlayModule } from '@angular/cdk/overlay';
import { PlatformModule } from '@angular/cdk/platform';
import { PortalModule } from '@angular/cdk/portal';
import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MAT_DATEPICKER_SCROLL_STRATEGY_PROVIDER,
  MAT_PLACEHOLDER_GLOBAL_OPTIONS,
  MatAutocompleteModule,
  MatButtonModule,
  // MatButtonToggleModule,
  // MatCardModule,
  MatCheckboxModule,
  // MatChipsModule,
  MatCommonModule,
  // MatDatepickerModule,
  MatDialogModule,
  // MatExpansionModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  // MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  // MatStepperModule,
  MatTableModule,
  // MatTabsModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MomentModule } from 'angular2-moment';
import { ChartsModule } from 'ng2-charts';
import { Components, EntryComponents } from './';
import { MatDatepickerModule } from './components/datepicker/index'; // FORK

const SHARED_MODULES = [
  A11yModule,
  CdkTableModule,
  // BidiModule,
  ObserversModule,
  OverlayModule,
  PortalModule,
  FlexLayoutModule,
  FormsModule,
  ReactiveFormsModule,
  MatAutocompleteModule,
  MatButtonModule,
  // MatButtonToggleModule,
  // MatCardModule,
  MatCheckboxModule,
  // MatChipsModule,
  MatCommonModule,
  MatDatepickerModule,
  MatDialogModule,
  // MatExpansionModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  // MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  // MatStepperModule,
  MatTableModule,
  // MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  PlatformModule,
  TranslateModule,
  MomentModule,
  ChartsModule
];

@NgModule({
  imports: [CommonModule, RouterModule, ...SHARED_MODULES],
  declarations: Components,
  entryComponents: EntryComponents,
  exports: [...Components, ...SHARED_MODULES],
  providers: [
    MAT_DATEPICKER_SCROLL_STRATEGY_PROVIDER,
    { provide: MAT_PLACEHOLDER_GLOBAL_OPTIONS, useValue: { float: 'always' } }
  ]
})
export class SharedModule {}
