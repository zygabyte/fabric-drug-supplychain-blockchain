import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DrugAuthComponent } from './drug-auth.component';

describe('DrugAuthComponent', () => {
  let component: DrugAuthComponent;
  let fixture: ComponentFixture<DrugAuthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DrugAuthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrugAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
