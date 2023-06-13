import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FederalInfoService } from 'src/app/core/federal-info-service/federal-info.service';
import { US_States } from 'src/app/core/models/list-us-states';
import { StateInfoService } from 'src/app/core/state-info.service';

@Component({
  selector: 'app-rebudget-homepage',
  templateUrl: './rebudget-homepage.component.html',
  styleUrls: ['./rebudget-homepage.component.css']
})
export class RebudgetHomepageComponent {

  LIST_ALL_US_STATES: string[] = [];
  INITIAL_USER_STATE_MESSAGE = 'Choose your state';
  US_STANDARD_DEDUCTION = 12950;
  US_SOCIAL_SECURITY_TAX_RATE = 6.2 / 100;          //For employees only, not self-employed
  US_MEDICARE_TAX_RATE = 1.45 / 100;                //For employees only, not self-employed
  annualWage = 0;
  totalProjectSavings = 0;
  ageDifference = 0;

  expenseTableMap: Map<string, number> = new Map<string, number>([
    ['Housing', 1600],
    ['Transportation', 523],
    ['Food', 387],
    ['Healthcare', 454],
    ['Entertainment', 297],
    ['Apparel', 146],
    ['Misc', 82],
    ['Total Projected Expenses', 0]
  ]);
  incomeTableMap: Map<string, number> = new Map<string, number>([
    ['Projected Gross Pay', 0],
    ['Projected Federal Witholding', 0],
    ['Projected Social Security', 0],
    ['Projected Medicare', 0],
    ['Projected State Witholding', 0],
    ['Total Projected Income', 0]
  ]);

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

  getIncomeTableMap() {
    return Array.from(this.incomeTableMap.entries());
  }

  getExpenseTableMap() {
    return Array.from(this.expenseTableMap.entries())
  }

  calculateProjectedSavings() {
    if (this.budgetForm.valid && this.userState != this.INITIAL_USER_STATE_MESSAGE) {
      let projectedGrossPay = 0;
      let annualGrossPay = 0;
      this.ageDifference = 65 - parseFloat(this.userAge);

      if (this.userWageSelection == 'Hourly') {
        this.annualWage = parseFloat(this.userWageInput) * 40 * 52;
        projectedGrossPay = (this.annualWage * this.ageDifference);
        this.incomeTableMap.set('Projected Gross Pay', projectedGrossPay);
      }
      else if (this.userWageSelection == 'Salary') {
        this.annualWage = parseFloat(this.userWageInput);
        projectedGrossPay = parseFloat(this.userWageInput) * this.ageDifference;
        this.incomeTableMap.set('Projected Gross Pay', projectedGrossPay);
      }

      annualGrossPay = this.annualWage;

      this.calculateFederalTax(annualGrossPay);
      this.calculateSocialSecurity(annualGrossPay);
      this.calculateMedicare(annualGrossPay);
      this.calculateStateTax(annualGrossPay);
      this.calculateProjectedIncome();

      let totalProjectedExpenses = this.expenseTableMap.get('Total Projected Expenses') ?? 0;
      totalProjectedExpenses = totalProjectedExpenses * 12 * this.ageDifference;

      console.log(totalProjectedExpenses)

      this.totalProjectSavings = (this.incomeTableMap.get('Total Projected Income') ?? 0) - (totalProjectedExpenses);

    }
  }

  calculateFederalTax(annualGrossPay: number) {
    let projectedFederalTax = 0;
    let taxableIncome = annualGrossPay - this.US_STANDARD_DEDUCTION;
    //Standard deductions by the IRS are at 12950,
    //so anyone making less than this receives a full refund 
    //and does not have to pay federal taxes
    if (taxableIncome <= 0) {
      this.incomeTableMap.set('Projected Federal Witholding', projectedFederalTax);
    }
    else {
      this.federalInfoService.getFederalTotalTax(taxableIncome).subscribe((res: any) => {
        projectedFederalTax = res;
        this.incomeTableMap.set('Projected Federal Witholding', projectedFederalTax * this.ageDifference);
      }
      )
    }
  }

  calculateSocialSecurity(annualGrossPay: number) {
    let annualSocialSecurityTax = this.US_SOCIAL_SECURITY_TAX_RATE * annualGrossPay;
    this.incomeTableMap.set('Projected Social Security', annualSocialSecurityTax * this.ageDifference);
  }

  calculateMedicare(annualGrossPay: number) {
    let annualMedicareTax = this.US_MEDICARE_TAX_RATE * annualGrossPay;
    this.incomeTableMap.set('Projected Medicare', annualMedicareTax * this.ageDifference);
  }

  calculateStateTax(annualGrossPay: number) {
    let projectedStateTax = 0;
    let taxableIncome = annualGrossPay - this.US_STANDARD_DEDUCTION;
    if (taxableIncome <= 0) {
      this.incomeTableMap.set('Projected State Witholding', projectedStateTax);
    }
    else {
      this.stateInfoService.getStateTotalTax(this.userState, taxableIncome).subscribe((res: any) => {
        projectedStateTax = res;
        this.incomeTableMap.set('Projected State Witholding', projectedStateTax * this.ageDifference);
      }
      )
    }
  }

  calculateProjectedIncome(){
    let projectedIncome = (this.incomeTableMap.get('Projected Gross Pay') ?? 0) - (this.incomeTableMap.get('Projected Federal Witholding') ?? 0) - (this.incomeTableMap.get('Projected Social Security') ?? 0) - (this.incomeTableMap.get('Projected Medicare') ?? 0) - (this.incomeTableMap.get('Projected State Witholding') ?? 0);
    this.incomeTableMap.set('Total Projected Income', projectedIncome);
  }


  constructor(
    private fb: FormBuilder,
    private federalInfoService: FederalInfoService,
    private stateInfoService: StateInfoService
  ) { }


  ngOnInit() {
    this.LIST_ALL_US_STATES = new US_States().US_States;
    const sum = Array.from(this.expenseTableMap.values()).reduce((acc, curr) => acc + curr, 0);
    this.expenseTableMap.set('Total Projected Expenses', sum);

    // this.stateInfoService.getStateTotalTax('Alabama', 30000).subscribe((res)=>console.log(res));

    // this.federalInfoService.getFederalTaxRate().subscribe((res: any) => {
    //   res.TaxBrackets.forEach((progressiveTaxInfo: any) => {
    //     console.log(progressiveTaxInfo.Rate, progressiveTaxInfo.StartAmount)
    //   })
    // })

  }



}
