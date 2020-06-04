import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupUpdateInformationComponent } from './group-update-information.component';

describe('GroupUpdateInformationComponent', () => {
  let component: GroupUpdateInformationComponent;
  let fixture: ComponentFixture<GroupUpdateInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupUpdateInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupUpdateInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
