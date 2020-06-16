import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffDetailModalComponent } from './staff-detail-modal.component';

describe('StaffDetailModalComponent', () => {
  let component: StaffDetailModalComponent;
  let fixture: ComponentFixture<StaffDetailModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffDetailModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
