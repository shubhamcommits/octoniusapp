import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProjectStatisticsComponent } from './project-statistics.component';

describe('ProjectStatisticsComponent', () => {
  let component: ProjectStatisticsComponent;
  let fixture: ComponentFixture<ProjectStatisticsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectStatisticsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
