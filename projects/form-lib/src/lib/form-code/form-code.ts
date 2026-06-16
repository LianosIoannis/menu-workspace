import { Component, input, model, output } from "@angular/core";
import type { FormValueControl } from "@angular/forms/signals";

@Component({
	selector: "lib-form-code",
	imports: [],
	templateUrl: "./form-code.html",
})
export class FormCode implements FormValueControl<string | null> {
	readonly value = model.required<string | null>();
	readonly disabled = input(false);
	readonly readonly = input(false);
	readonly name = input("");
	readonly required = input(false);
	readonly touch = output<void>();

	readonly placeholder = input("");
	readonly rows = input(8);
	readonly spellcheck = input(false);

	protected updateValue(event: Event): void {
		const textareaElement = event.target;

		if (!(textareaElement instanceof HTMLTextAreaElement)) {
			return;
		}

		this.value.set(textareaElement.value || null);
	}

	protected markTouched(): void {
		this.touch.emit();
	}
}
