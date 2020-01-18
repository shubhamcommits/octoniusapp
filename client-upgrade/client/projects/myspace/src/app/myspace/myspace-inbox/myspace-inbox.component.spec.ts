import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyspaceInboxComponent } from './myspace-inbox.component';

describe('MyspaceInboxComponent', () => {
  let component: MyspaceInboxComponent;
  let fixture: ComponentFixture<MyspaceInboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyspaceInboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyspaceInboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
