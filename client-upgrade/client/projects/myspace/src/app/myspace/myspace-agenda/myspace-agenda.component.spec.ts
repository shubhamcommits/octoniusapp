import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyspaceAgendaComponent } from './myspace-agenda.component';

describe('MyspaceAgendaComponent', () => {
  let component: MyspaceAgendaComponent;
  let fixture: ComponentFixture<MyspaceAgendaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyspaceAgendaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyspaceAgendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
