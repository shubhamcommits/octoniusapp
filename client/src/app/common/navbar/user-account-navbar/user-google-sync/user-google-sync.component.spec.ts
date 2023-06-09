import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserGoogleSyncComponent } from './user-google-sync.component';

describe('UserGoogleSyncComponent', () => {
  let component: UserGoogleSyncComponent;
  let fixture: ComponentFixture<UserGoogleSyncComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserGoogleSyncComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserGoogleSyncComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
