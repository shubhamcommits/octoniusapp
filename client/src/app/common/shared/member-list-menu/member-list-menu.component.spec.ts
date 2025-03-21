import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberListMenuComponent } from './member-list-menu.component';

describe('MemberListMenuComponent', () => {
  let component: MemberListMenuComponent;
  let fixture: ComponentFixture<MemberListMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MemberListMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberListMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
