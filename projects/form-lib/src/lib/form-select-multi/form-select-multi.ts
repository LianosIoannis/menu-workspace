import { Component, input, model, output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import type { FormValueControl } from "@angular/forms/signals";
import { NgMultiLabelTemplateDirective, NgOptionTemplateDirective, NgSelectComponent } from "@ng-select/ng-select";

type OptionValue = string | number;
type Option = {
	readonly label: string;
	readonly value: OptionValue;
	readonly disabled?: boolean;
};

@Component({
	selector: "lib-form-select-multi",
	imports: [FormsModule, NgMultiLabelTemplateDirective, NgOptionTemplateDirective, NgSelectComponent],
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

	protected selectedLabel(): string {
		const selectedOptions = this.options().filter((option) => this.isSelected(option));

		if (selectedOptions.length === 0) {
			return "Select options";
		}

		if (selectedOptions.length === 1) {
			return selectedOptions[0].label;
		}

		return `${selectedOptions.length} selected`;
	}

	protected isSelected(option: Option): boolean {
		return this.value().includes(option.value);
	}

	protected updateValue(value: readonly OptionValue[] | null): void {
		this.value.set(value ?? []);
	}

	protected markTouched(): void {
		this.touch.emit();
	}
}
