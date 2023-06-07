import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RebudgetHomepageComponent } from './pages/rebudget-homepage/rebudget-homepage.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { TwoDigitDecimaNumberDirective } from './shared/two-decimal-place-directive/two-decimal-place.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule} from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    RebudgetHomepageComponent,
    NavbarComponent,
    TwoDigitDecimaNumberDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
