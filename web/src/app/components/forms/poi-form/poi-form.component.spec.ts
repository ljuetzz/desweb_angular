import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoiFormComponent } from './poi-form.component';

describe('PoiFormComponent', () => {
  let component: PoiFormComponent;
  let fixture: ComponentFixture<PoiFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoiFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoiFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
