import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface StateTaxData {
  [state: string]: {
    TaxBrackets: {
      Rate: string;
      StartAmount: number;
    }[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class StateInfoService {
  private url: string = 'assets/state-tax-brackets.json';
  private LIST_OF_NO_TAX_STATES: string[] = ['Alaska', 'Tennessee', 'Wyoming', 'New Hampshire', 'Florida', 'South Dakota', 'Texas', 'Nevada', 'Washington'];

  constructor(private http: HttpClient) { }

  getStateTotalTax(state: string, taxableIncome: number): Observable<number> {
    if (this.LIST_OF_NO_TAX_STATES.includes(state)) {
      return new Observable<number>((observer) => {
        observer.next(0);
        observer.complete();
      });
    } else {
      return this.http.get<StateTaxData>(this.url).pipe(
        map((data: StateTaxData) => {
          const stateTaxBracketList = data[state].TaxBrackets;
          let totalStateTax = 0;

          for (let i = 0; i < stateTaxBracketList.length; i++) {
            const stateTaxBracket = stateTaxBracketList[i];

            if (taxableIncome > stateTaxBracket.StartAmount) {
              const ratePercentage = parseFloat(stateTaxBracket.Rate) / 100;
              const nextBracketStartAmount =
                i === stateTaxBracketList.length - 1
                  ? Infinity
                  : stateTaxBracketList[i + 1].StartAmount;

              const taxableAmountInBracket = Math.min(taxableIncome - stateTaxBracket.StartAmount, nextBracketStartAmount - stateTaxBracket.StartAmount);
              const taxInBracket = taxableAmountInBracket * ratePercentage;
              totalStateTax += taxInBracket;
            }
          }

          return totalStateTax;
        })
      );
    }
  }
}
