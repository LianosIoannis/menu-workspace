import { Component, input, model, output } from "@angular/core";
import type { FormValueControl } from "@angular/forms/signals";
import { Editor, type EditorLanguage } from "editor-lib";

@Component({
	selector: "lib-form-code",
	imports: [Editor],
	templateUrl: "./form-code.html",
})
export class FormCode implements FormValueControl<string | null> {
	readonly value = model.required<string | null>();
	readonly disabled = input(false);
	readonly readonly = input(false);
	readonly name = input("");
	readonly required = input(false);
	readonly touch = output<void>();

	readonly language = input<EditorLanguage>("plaintext");
	readonly rows = input(8);

	protected updateValue(value: string): void {
		this.value.set(value || null);
	}

	protected markTouched(): void {
		this.touch.emit();
	}
}
