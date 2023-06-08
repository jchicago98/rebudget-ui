import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FederalInfoService } from 'src/app/core/federal-info-service/federal-info.service';
import { US_States } from 'src/app/core/models/list-us-states';

@Component({
  selector: 'app-rebudget-homepage',
  templateUrl: './rebudget-homepage.component.html',
  styleUrls: ['./rebudget-homepage.component.css']
})
export class RebudgetHomepageComponent {

  listOfUS_States: string[] = [];
  INITIAL_USER_STATE_MESSAGE = 'Choose your state';
  totalProjectSavings = 0;
  totalGrossPay = 0;
  incomeCardArray = ['Projected Gross Pay', 'Projected Federal Witholding', 'Projected Social Security', 'Projected Medicare', 'Projected State Witholding', 'Projected Net Pay', 'Total Projected Income']
  expenseCardArray = ['Housing', 'Transportation', 'Food', 'Insurance & Pension', 'Healthcare', 'Entertainment', 'Apparel', 'Misc', 'Total Projected Expenses'];
  expenseCostCardArray = ['1885', '913', '691', '656', '454', '297', '146', '82', '5124'];

  budgetForm: FormGroup = this.fb.group({
    userWageInput: ['', Validators.required],
    userWageSelection: ['Hourly', Validators.required],
    userState: [this.INITIAL_USER_STATE_MESSAGE, Validators.required],
    userAge: ['', Validators.required]
  },
    { updateOn: 'submit' }
  );

  get userWageInput(): string { return this.budgetForm.get('userWageInput')?.value; }
  get userWageSelection(): string { return this.budgetForm.get('userWageSelection')?.getRawValue() }
  get userState(): string { return this.budgetForm.get('userState')?.value; }
  get userAge(): string { return this.budgetForm.get('userAge')?.value; }

  calculateProjectedSavings() {
    if (this.budgetForm.valid && this.userState != this.INITIAL_USER_STATE_MESSAGE) {
      let ageDifference = 65 - parseFloat(this.userAge);
      if (this.userWageSelection == 'Hourly') {
        var annualWageHourly = parseFloat(this.userWageInput) * 40 * 52;
        this.totalProjectSavings = (annualWageHourly * ageDifference);
        console.log(this.totalProjectSavings)
      }
      else if (this.userWageSelection == 'Salary') {
        this.totalProjectSavings = parseFloat(this.userWageInput) * ageDifference;
      }
    }
  }


  constructor(
    private fb: FormBuilder,
    private federalInfoService: FederalInfoService
  ) { }


  ngOnInit() {
    this.listOfUS_States = new US_States().US_States;
    this.federalInfoService.getFederalTaxRate().subscribe((res: any) =>{
      res.TaxBrackets.forEach((progressiveTaxInfo:any)=>{
        console.log(progressiveTaxInfo.Rate, progressiveTaxInfo.StartAmount)
      })
        
    })
  }

}
