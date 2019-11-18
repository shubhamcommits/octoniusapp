import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyspaceHeaderComponent } from './myspace-header.component';

describe('MyspaceHeaderComponent', () => {
  let component: MyspaceHeaderComponent;
  let fixture: ComponentFixture<MyspaceHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyspaceHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyspaceHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
