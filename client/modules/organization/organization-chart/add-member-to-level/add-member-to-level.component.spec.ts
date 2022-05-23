import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMemberToLevelComponent } from './add-member-to-level.component';

describe('AddMemberToLevelComponent', () => {
  let component: AddMemberToLevelComponent;
  let fixture: ComponentFixture<AddMemberToLevelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddMemberToLevelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMemberToLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
