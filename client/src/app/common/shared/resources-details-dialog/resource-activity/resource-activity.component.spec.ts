import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ResourceActivityComponent } from './resource-activity.component';

describe('ResourceActivityComponent', () => {
  let component: ResourceActivityComponent;
  let fixture: ComponentFixture<ResourceActivityComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ResourceActivityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourceActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
