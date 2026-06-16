import { Component, input, model, output } from "@angular/core";
import type { FormValueControl } from "@angular/forms/signals";

type OptionValue = string | number;
type Option = {
	readonly label: string;
	readonly value: OptionValue;
	readonly disabled?: boolean;
};

@Component({
	selector: "lib-form-select",
	imports: [],
	templateUrl: "./form-select.html",
})
export class FormSelect implements FormValueControl<OptionValue | null> {
	readonly value = model.required<OptionValue | null>();
	readonly disabled = input(false);
	readonly readonly = input(false);
	readonly name = input("");
	readonly required = input(false);
	readonly touch = output<void>();

	readonly options = input<readonly Option[]>([]);
	readonly placeholder = input("");

	protected optionValue(index: number): string {
		return String(index);
	}

	protected selectedOptionValue(): string {
		const selectedIndex = this.options().findIndex((option) => option.value === this.value());
		return selectedIndex === -1 ? "" : String(selectedIndex);
	}

	protected updateValue(event: Event): void {
		const selectElement = event.target;

		if (!(selectElement instanceof HTMLSelectElement) || this.readonly()) {
			return;
		}

		if (selectElement.value === "") {
			this.value.set(null);
			return;
		}

		const selectedIndex = Number(selectElement.value);
		this.value.set(this.options()[selectedIndex]?.value ?? null);
	}

	protected markTouched(): void {
		this.touch.emit();
	}
}
