import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DietersComponent } from './dieters.component';

describe('DietersComponent', () => {
  let component: DietersComponent;
  let fixture: ComponentFixture<DietersComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [DietersComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(DietersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
