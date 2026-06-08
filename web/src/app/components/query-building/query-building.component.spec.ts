import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryBuildingComponent } from './query-building.component';

describe('QueryBuildingComponent', () => {
  let component: QueryBuildingComponent;
  let fixture: ComponentFixture<QueryBuildingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QueryBuildingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QueryBuildingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
