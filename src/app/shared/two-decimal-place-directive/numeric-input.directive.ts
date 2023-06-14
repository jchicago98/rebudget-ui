import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[numericInput]'
})
export class NumericInputDirective {
  @HostListener('input', ['$event'])
  onInput(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const newValue = input.value.replace(/[^0-9.]/g, '');
    input.value = newValue;
  }
}
