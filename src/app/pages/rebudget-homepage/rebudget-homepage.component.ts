import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { US_States } from 'src/app/core/models/list-us-states';

@Component({
  selector: 'app-rebudget-homepage',
  templateUrl: './rebudget-homepage.component.html',
  styleUrls: ['./rebudget-homepage.component.css']
})
export class RebudgetHomepageComponent {

  listOfUS_States: string[] = [];
  initialUserStateMessage = 'Choose your state';

  budgetForm: FormGroup = this.fb.group({
    userWageInput: ['', Validators.required],
    userWageSelection: ['Hourly', Validators.required],
    userState: [this.initialUserStateMessage, Validators.required]
  },
    { updateOn: 'submit' }
  );

  get userWageInput(): string { return this.budgetForm.get('userWageInput')?.value; }
  get userWageSelection(): boolean { return this.budgetForm.get('userWageSelection')?.getRawValue() }
  get userState(): string { return this.budgetForm.get('userState')?.value; }

  checkUserValue() {
    if (this.budgetForm.valid && this.userState != this.initialUserStateMessage) {
      console.log(this.userWageInput);
      console.log(this.userWageSelection);
      console.log(this.userState)
    }
  }

  constructor(
    private fb: FormBuilder
  ) { }


  ngOnInit() {
    this.listOfUS_States = new US_States().US_States;
  }

}
