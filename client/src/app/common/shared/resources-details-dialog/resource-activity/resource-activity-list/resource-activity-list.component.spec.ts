import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ResourceActivityListComponent } from './resource-activity-list.component';

describe('ResourceActivityListComponent', () => {
  let component: ResourceActivityListComponent;
  let fixture: ComponentFixture<ResourceActivityListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ResourceActivityListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourceActivityListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
