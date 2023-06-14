import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface TaxBracket {
  Rate: string;
  StartAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class FederalInfoService {

  private url: string = 'assets/federal-tax-brackets.json';

  constructor(private http: HttpClient) { }

  getFederalTotalTax(taxableIncome: number): Observable<number> {
    return this.http.get<any>(this.url).pipe(
      map((data: any) => {
        const taxBrackets: TaxBracket[] = data.TaxBrackets;
        let totalTaxes = 0;

        for (let i = 0; i < taxBrackets.length; i++) {
          const { Rate, StartAmount } = taxBrackets[i];
          const ratePercentage = parseFloat(Rate) / 100;

          if (taxableIncome >= StartAmount) {
            const nextBracket = taxBrackets[i + 1];
            const taxableAmount = nextBracket ? Math.min(nextBracket.StartAmount - StartAmount, taxableIncome - StartAmount) : taxableIncome - StartAmount;
            const tax = taxableAmount * ratePercentage;
            totalTaxes += tax;
          } else {
            break;
          }
        }

        return totalTaxes;
      })
    );
  }
}
