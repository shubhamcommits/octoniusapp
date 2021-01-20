import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembersWorkloadCardComponent } from './members-workload-card.component';

describe('MembersWorkloadCardComponent', () => {
  let component: MembersWorkloadCardComponent;
  let fixture: ComponentFixture<MembersWorkloadCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MembersWorkloadCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MembersWorkloadCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
