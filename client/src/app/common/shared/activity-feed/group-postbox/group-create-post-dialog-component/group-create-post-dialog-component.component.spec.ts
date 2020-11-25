import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GroupCreatePostDialogComponentComponent } from './group-create-post-dialog-component.component';

describe('GroupCreatePostDialogComponentComponent', () => {
  let component: GroupCreatePostDialogComponentComponent;
  let fixture: ComponentFixture<GroupCreatePostDialogComponentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupCreatePostDialogComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupCreatePostDialogComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
