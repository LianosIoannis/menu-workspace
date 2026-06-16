import { Component, input, model, output } from "@angular/core";
import type { FormValueControl } from "@angular/forms/signals";

@Component({
	selector: "lib-form-date",
	imports: [],
	templateUrl: "./form-date.html",
})
export class FormDate implements FormValueControl<string | null> {
	readonly value = model.required<string | null>();
	readonly disabled = input(false);
	readonly readonly = input(false);
	readonly name = input("");
	readonly required = input(false);
	readonly touch = output<void>();

	readonly type = input<"date" | "datetime-local" | "time">("date");
	readonly minValue = input("");
	readonly maxValue = input("");

	protected updateValue(event: Event): void {
		const inputElement = event.target;

		if (!(inputElement instanceof HTMLInputElement)) {
			return;
		}

		this.value.set(inputElement.value || null);
	}

	protected markTouched(): void {
		this.touch.emit();
	}
}
