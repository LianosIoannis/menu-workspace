import { Component, input, model, output } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';

@Component({
  selector: 'lib-form-input',
  imports: [],
  templateUrl: './form-input.html',
  styleUrl: '../form.css',
})
export class FormInput implements FormValueControl<string | number | null> {
  readonly value = model.required<string | number | null>();
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly name = input('');
  readonly required = input(false);
  readonly touch = output<void>();

  readonly type = input<'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number'>(
    'text',
  );
  readonly placeholder = input('');

  protected updateValue(event: Event): void {
    const inputElement = event.target;

    if (!(inputElement instanceof HTMLInputElement)) {
      return;
    }

    if (this.type() === 'number') {
      const valueAsNumber = inputElement.valueAsNumber;
      this.value.set(
        inputElement.value === '' || Number.isNaN(valueAsNumber) ? null : valueAsNumber,
      );
      return;
    }

    this.value.set(inputElement.value);
  }

  protected markTouched(): void {
    this.touch.emit();
  }
}
