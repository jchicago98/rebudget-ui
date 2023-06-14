import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FederalInfoService } from 'src/app/core/federal-info-service/federal-info.service';
import { AGE_LIST } from 'src/app/core/models/list-all-ages';
import { US_States } from 'src/app/core/models/list-us-states';
import { StateInfoService } from 'src/app/core/state-info-service/state-info.service';

@Component({
  selector: 'app-rebudget-homepage',
  templateUrl: './rebudget-homepage.component.html',
  styleUrls: ['./rebudget-homepage.component.css']
})
export class RebudgetHomepageComponent {

  LIST_ALL_US_STATES: string[] = [];
  LIST_ALL_RETIREMENT_AGES: string [] = [];
  INITIAL_USER_STATE_MESSAGE = 'Choose your state';
  INITIAL_USER_RETIREMENT_AGE_MESSAGE = 'Choose your retirement age';
  US_STANDARD_DEDUCTION = 12950;
  US_SOCIAL_SECURITY_TAX_RATE = 6.2 / 100;          //For employees only, not self-employed
  US_MEDICARE_TAX_RATE = 1.45 / 100;                //For employees only, not self-employed
  annualWage = 0;
  totalProjectSavings = 0;
  ageDifference = 0;
  InputValue = 1;

  expenseTableMap: Map<string, number> = new Map<string, number>([
    ['Housing', 1600],
    ['Transportation', 523],
    ['Food', 387],
    ['Healthcare', 454],
    ['Entertainment', 297],
    ['Apparel', 146],
    ['Misc', 82],
    ['Total Monthly Projected Expenses', 0],
    ['Total Annual Projected Expenses', 0],
    ['Total Projected Expenses', 0],
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
    userAge: ['', Validators.required],
    userRetirementAge: [this.INITIAL_USER_RETIREMENT_AGE_MESSAGE, Validators.required]
  },
    { updateOn: 'submit' }
  );

  get userWageInput(): string { return this.budgetForm.get('userWageInput')?.value; }
  get userWageSelection(): string { return this.budgetForm.get('userWageSelection')?.getRawValue() }
  get userState(): string { return this.budgetForm.get('userState')?.value; }
  get userAge(): string { return this.budgetForm.get('userAge')?.value; }
  get userRetirementAge(): string { return this.budgetForm.get('userRetirementAge')?.value;}

  getIncomeTableMap() {
    return Array.from(this.incomeTableMap.entries());
  }

  getExpenseTableMap() {
    return Array.from(this.expenseTableMap.entries())
  }

  updateExpenseTableMap(expenseItem: string, expenseCost: Event) {
    let inputValue = (expenseCost.target as HTMLInputElement).value;
    if(inputValue == ''){
      inputValue = '0';
    }
    let numericValue = inputValue.replace(/[^0-9.]/g, '');
    let truncatedValue = Math.floor(parseFloat(numericValue) * 100) / 100;

    this.expenseTableMap.set(expenseItem, truncatedValue);
    this.calculateProjectedExpenses();
  }

  async calculateProjectedSavings() {
    if (this.budgetForm.valid && this.userState != this.INITIAL_USER_STATE_MESSAGE && this.userRetirementAge != this.INITIAL_USER_RETIREMENT_AGE_MESSAGE) {
      let projectedGrossPay = 0;
      let annualGrossPay = 0;
      this.ageDifference = parseFloat(this.userRetirementAge) - parseFloat(this.userAge);

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

      await this.calculateFederalTax(annualGrossPay);
      this.calculateSocialSecurity(annualGrossPay);
      this.calculateMedicare(annualGrossPay);
      await this.calculateStateTax(annualGrossPay);
      this.calculateProjectedIncome();
      this.calculateProjectedExpenses();

      this.totalProjectSavings = (this.incomeTableMap.get('Total Projected Income') ?? 0) - (this.expenseTableMap.get('Total Projected Expenses') ?? 0);

    }
  }

  async calculateFederalTax(annualGrossPay: number) {
    let projectedFederalTax = 0;
    let taxableIncome = annualGrossPay - this.US_STANDARD_DEDUCTION;

    if (taxableIncome <= 0) {
      this.incomeTableMap.set('Projected Federal Witholding', projectedFederalTax);
    } else {
      const res = await this.federalInfoService.getFederalTotalTax(taxableIncome).toPromise() ?? 0;
      projectedFederalTax = res;
      this.incomeTableMap.set('Projected Federal Witholding', projectedFederalTax * this.ageDifference);
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

  async calculateStateTax(annualGrossPay: number) {
    let projectedStateTax = 0;
    let taxableIncome = annualGrossPay - this.US_STANDARD_DEDUCTION;

    if (taxableIncome <= 0) {
      this.incomeTableMap.set('Projected State Witholding', projectedStateTax);
    } else {
      const res = await this.stateInfoService.getStateTotalTax(this.userState, taxableIncome).toPromise() ?? 0;
      projectedStateTax = res;
      this.incomeTableMap.set('Projected State Witholding', projectedStateTax * this.ageDifference);
    }
  }

  calculateProjectedIncome() {
    let projectedIncome = (this.incomeTableMap.get('Projected Gross Pay') ?? 0) - (this.incomeTableMap.get('Projected Federal Witholding') ?? 0) - (this.incomeTableMap.get('Projected Social Security') ?? 0) - (this.incomeTableMap.get('Projected Medicare') ?? 0) - (this.incomeTableMap.get('Projected State Witholding') ?? 0);
    this.incomeTableMap.set('Total Projected Income', projectedIncome);
  }

  calculateProjectedExpenses() {
    const totalMonthlyExpenses = (this.expenseTableMap.get('Housing') ?? 0) + (this.expenseTableMap.get('Transportation') ?? 0) + (this.expenseTableMap.get('Food') ?? 0) + (this.expenseTableMap.get('Healthcare') ?? 0) + (this.expenseTableMap.get('Entertainment') ?? 0) + (this.expenseTableMap.get('Apparel') ?? 0) + (this.expenseTableMap.get('Misc') ?? 0);
    this.expenseTableMap.set('Total Monthly Projected Expenses', totalMonthlyExpenses);
    let monthlyProjectedExpenses = this.expenseTableMap.get('Total Monthly Projected Expenses') ?? 0;
    let annualProjectedExpenses = monthlyProjectedExpenses * 12;
    this.expenseTableMap.set('Total Annual Projected Expenses', annualProjectedExpenses);
    let totalProjectedExpenses = this.expenseTableMap.get('Total Annual Projected Expenses') ?? 0;
    totalProjectedExpenses = totalProjectedExpenses * this.ageDifference;
    this.expenseTableMap.set('Total Projected Expenses', totalProjectedExpenses);
  }


  constructor(
    private fb: FormBuilder,
    private federalInfoService: FederalInfoService,
    private stateInfoService: StateInfoService
  ) { }


  ngOnInit() {
    this.LIST_ALL_US_STATES = new US_States().US_States;
    this.LIST_ALL_RETIREMENT_AGES = new AGE_LIST().list_retirement_ages;
    this.calculateProjectedExpenses();
  }



}
