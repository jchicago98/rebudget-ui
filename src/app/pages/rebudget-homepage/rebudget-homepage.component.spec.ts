import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RebudgetHomepageComponent } from './rebudget-homepage.component';

describe('RebudgetHomepageComponent', () => {
  let component: RebudgetHomepageComponent;
  let fixture: ComponentFixture<RebudgetHomepageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RebudgetHomepageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RebudgetHomepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
