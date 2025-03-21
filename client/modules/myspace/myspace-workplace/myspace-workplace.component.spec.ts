import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyspaceWorkplaceComponent } from './myspace-workplace.component';

describe('MyspaceWorkplaceComponent', () => {
  let component: MyspaceWorkplaceComponent;
  let fixture: ComponentFixture<MyspaceWorkplaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyspaceWorkplaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyspaceWorkplaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
