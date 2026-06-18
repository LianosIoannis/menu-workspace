import { Component, input } from "@angular/core";
import { type Field, FormField } from "@angular/forms/signals";
import type { EditorLanguage } from "editor-lib";
import type { InputField, InputFieldOption } from "../form.models";
import { FormCheckbox } from "../form-checkbox/form-checkbox";
import { FormCode } from "../form-code/form-code";
import { FormDate } from "../form-date/form-date";
import { FormInput } from "../form-input/form-input";
import { FormSelect } from "../form-select/form-select";
import { FormSelectMulti } from "../form-select-multi/form-select-multi";

type InputValue = string | number | boolean | readonly string[] | readonly number[] | null;
type SelectValue = string | number | null;
type MultiSelectValue = readonly (string | number)[];

@Component({
	selector: "lib-form-field-value-control",
	imports: [FormField, FormCheckbox, FormCode, FormDate, FormInput, FormSelect, FormSelectMulti],
	templateUrl: "./form-field-value-control.html",
})
export class FormFieldValueControl {
	readonly field = input.required<InputField>();
	readonly control = input.required<Field<InputValue>>();
	readonly codeLanguage = input<EditorLanguage>("plaintext");

	protected selectValueField(): Field<SelectValue> {
		return this.control() as Field<SelectValue>;
	}

	protected multiSelectValueField(): Field<MultiSelectValue> {
		return this.control() as Field<MultiSelectValue>;
	}

	protected booleanValueField(): Field<boolean> {
		return this.control() as Field<boolean>;
	}

	protected textValueField(): Field<string | null> {
		return this.control() as Field<string | null>;
	}

	protected inputValueField(): Field<string | number | null> {
		return this.control() as Field<string | number | null>;
	}

	protected options(): readonly InputFieldOption[] {
		return this.field().options ?? [];
	}

	protected dateType(): "date" | "datetime-local" | "time" {
		if (this.field().type === "datetime") {
			return "datetime-local";
		}

		if (this.field().type === "time") {
			return "time";
		}

		return "date";
	}
}
