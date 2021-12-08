import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLoungeComponent } from './edit-lounge.component';

describe('EditLoungeComponent', () => {
  let component: EditLoungeComponent;
  let fixture: ComponentFixture<EditLoungeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditLoungeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditLoungeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
