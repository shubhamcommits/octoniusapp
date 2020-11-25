import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GroupInformationComponent } from './group-information.component';

describe('GroupInformationComponent', () => {
  let component: GroupInformationComponent;
  let fixture: ComponentFixture<GroupInformationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
