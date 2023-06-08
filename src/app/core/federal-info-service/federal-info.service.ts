import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FederalInfoService {

  constructor(private http: HttpClient) { }

  url: string = 'assets/federal-tax-brackets.json';

  getFederalTaxRate(): Observable<any> {
    return this.http.get<any>(this.url);
  }

}
