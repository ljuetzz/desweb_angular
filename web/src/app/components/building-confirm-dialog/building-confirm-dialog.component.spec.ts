import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildingConfirmDialogComponent } from './building-confirm-dialog.component';

describe('BuildingConfirmDialogComponent', () => {
  let component: BuildingConfirmDialogComponent;
  let fixture: ComponentFixture<BuildingConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuildingConfirmDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuildingConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
