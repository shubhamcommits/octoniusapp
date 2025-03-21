import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserWorkloadComponent } from './user-workload.component';

describe('UserWorkloadComponent', () => {
  let component: UserWorkloadComponent;
  let fixture: ComponentFixture<UserWorkloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserWorkloadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserWorkloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
