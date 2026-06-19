import { Component, input, model, output, ViewEncapsulation } from "@angular/core";
import { FormsModule } from "@angular/forms";
import type { FormValueControl } from "@angular/forms/signals";
import { NgSelectComponent } from "@ng-select/ng-select";

type OptionValue = string | number;
type Option = {
	readonly label: string;
	readonly value: OptionValue;
	readonly disabled?: boolean;
};

@Component({
	selector: "lib-form-select",
	imports: [FormsModule, NgSelectComponent],
	templateUrl: "./form-select.html",
	styleUrl: "../form-ng-select.css",
	encapsulation: ViewEncapsulation.None,
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

	protected updateValue(value: OptionValue | null): void {
		if (this.readonly()) {
			return;
		}

		this.value.set(value);
	}

	protected markTouched(): void {
		this.touch.emit();
	}
}
