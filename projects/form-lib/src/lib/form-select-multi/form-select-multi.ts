import { Component, input, model, output } from "@angular/core";
import type { FormValueControl } from "@angular/forms/signals";

type OptionValue = string | number;
type Option = {
	readonly label: string;
	readonly value: OptionValue;
	readonly disabled?: boolean;
};

@Component({
	selector: "lib-form-select-multi",
	imports: [],
	templateUrl: "./form-select-multi.html",
})
export class FormSelectMulti implements FormValueControl<readonly OptionValue[]> {
	readonly value = model.required<readonly OptionValue[]>();
	readonly disabled = input(false);
	readonly readonly = input(false);
	readonly name = input("");
	readonly required = input(false);
	readonly touch = output<void>();

	readonly options = input<readonly Option[]>([]);
	readonly size = input(5);

	protected optionValue(index: number): string {
		return String(index);
	}

	protected isSelected(option: Option): boolean {
		return this.value().includes(option.value);
	}

	protected updateValue(event: Event): void {
		const selectElement = event.target;

		if (!(selectElement instanceof HTMLSelectElement) || this.readonly()) {
			return;
		}

		const selectedValues = Array.from(selectElement.selectedOptions)
			.map((selectedOption) => this.options()[Number(selectedOption.value)]?.value)
			.filter((value): value is OptionValue => value !== undefined);

		this.value.set(selectedValues);
	}

	protected markTouched(): void {
		this.touch.emit();
	}
}
