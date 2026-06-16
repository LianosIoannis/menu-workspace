import { Component, computed, input, linkedSignal, output } from "@angular/core";
import {
	disabled as disabledField,
	FormField,
	form,
	FormRoot,
	readonly as readonlyField,
	required,
	type Field,
	type SchemaPath,
} from "@angular/forms/signals";
import { FormCheckbox } from "./form-checkbox/form-checkbox";
import { FormCode } from "./form-code/form-code";
import { FormDate } from "./form-date/form-date";
import { FormInput } from "./form-input/form-input";
import type { InputField, InputFieldOption } from "./form.models";
import { FormSelect } from "./form-select/form-select";
import { FormSelectMulti } from "./form-select-multi/form-select-multi";

type InputValue = string | number | boolean | readonly string[] | readonly number[] | null;
type SelectValue = string | number | null;
type MultiSelectValue = readonly (string | number)[];
type OperatorValue = InputField["operators"][number] | null;
type FormLibFieldModel = {
	readonly operator: OperatorValue;
	readonly value: InputValue;
};
type FormLibSchemaPath = SchemaPath<FormLibValue> & Record<string, { value: SchemaPath<InputValue>; operator: SchemaPath<OperatorValue> }>;

export interface FormLibFieldValue {
	readonly operator: OperatorValue;
	readonly value: InputValue;
}

export type FormLibValue = Record<string, FormLibFieldValue>;

@Component({
	selector: "lib-form-lib",
	imports: [FormRoot, FormField, FormCheckbox, FormCode, FormDate, FormInput, FormSelect, FormSelectMulti],
	templateUrl: "./form.html",
	styleUrl: "./form.css",
})
export class FormLib {
	readonly fields = input<readonly InputField[]>([]);
	readonly disabled = input(false);
	readonly submitLabel = input("Submit");
	readonly formSubmit = output<FormLibValue>();

	private readonly model = linkedSignal({
		source: this.fields,
		computation: (fields, previous): FormLibValue => this.createModel(fields, previous?.value),
	});

	protected readonly formTree = form(this.model, (path) => {
		for (const field of this.fields()) {
			const fieldPath = this.schemaField(path, field.name);

			if (field.required) {
				required(fieldPath.value);
			}

			disabledField(fieldPath.value, { when: () => this.disabled() });
			readonlyField(fieldPath.value, { when: () => field.readonly ?? false });
			disabledField(fieldPath.operator, { when: () => this.disabled() });
			readonlyField(fieldPath.operator, { when: () => field.readonly ?? false });
		}
	});

	protected readonly value = computed(() => this.formTree().value());

	protected operatorField(field: InputField): Field<OperatorValue> {
		return this.formTree[field.name].operator as Field<OperatorValue>;
	}

	protected valueField(field: InputField): Field<InputValue> {
		return this.formTree[field.name].value as Field<InputValue>;
	}

	protected selectValueField(field: InputField): Field<SelectValue> {
		return this.valueField(field) as Field<SelectValue>;
	}

	protected multiSelectValueField(field: InputField): Field<MultiSelectValue> {
		return this.valueField(field) as Field<MultiSelectValue>;
	}

	protected booleanValueField(field: InputField): Field<boolean> {
		return this.valueField(field) as Field<boolean>;
	}

	protected textValueField(field: InputField): Field<string | null> {
		return this.valueField(field) as Field<string | null>;
	}

	protected inputValueField(field: InputField): Field<string | number | null> {
		return this.valueField(field) as Field<string | number | null>;
	}

	protected operatorOptions(field: InputField): readonly InputFieldOption[] {
		return field.operators.map((operator) => ({
			label: this.formatLabel(operator),
			value: operator,
		}));
	}

	protected dateType(field: InputField): "date" | "datetime-local" | "time" {
		if (field.type === "datetime") {
			return "datetime-local";
		}

		if (field.type === "time") {
			return "time";
		}

		return "date";
	}

	protected codeLanguage(field: InputField): "javascript" | "typescript" | "sql" | "plaintext" | "json" | "css" {
		const operator = this.model()[field.name]?.operator;

		if (
			operator === "javascript" ||
			operator === "typescript" ||
			operator === "sql" ||
			operator === "plaintext" ||
			operator === "json" ||
			operator === "css"
		) {
			return operator;
		}

		return "plaintext";
	}

	protected submitForm(): void {
		this.formSubmit.emit(this.value());
	}

	private createModel(fields: readonly InputField[], previous?: FormLibValue): FormLibValue {
		return fields.reduce<FormLibValue>((model, field) => {
			const previousField = previous?.[field.name];
			const operator = this.resolveOperator(field, previousField?.operator);
			const value = this.resolveValue(field, previousField?.value);

			return {
				...model,
				[field.name]: { operator, value },
			};
		}, {});
	}

	private resolveOperator(field: InputField, previousOperator?: OperatorValue): OperatorValue {
		if (previousOperator && field.operators.includes(previousOperator)) {
			return previousOperator;
		}

		return field.defaultOperator ?? field.operators[0] ?? null;
	}

	private resolveValue(field: InputField, previousValue?: InputValue): InputValue {
		if (previousValue !== undefined && this.valueMatchesField(field, previousValue)) {
			return previousValue;
		}

		if (field.defaultValue !== undefined) {
			return field.defaultValue as InputValue;
		}

		if (field.multiple) {
			return [];
		}

		if (field.type === "boolean") {
			return false;
		}

		return null;
	}

	private valueMatchesField(field: InputField, value: InputValue): boolean {
		if (field.multiple) {
			return Array.isArray(value) && value.every((item) => this.scalarMatchesField(field, item));
		}

		if (Array.isArray(value)) {
			return false;
		}

		if (value === null) {
			return true;
		}

		if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
			return this.scalarMatchesField(field, value);
		}

		return false;
	}

	private scalarMatchesField(field: InputField, value: string | number | boolean): boolean {
		if (field.type === "date" || field.type === "datetime" || field.type === "time" || field.type === "code") {
			return typeof value === "string";
		}

		return typeof value === field.type;
	}

	private formatLabel(value: string): string {
		return value.replace(/[A-Z]/g, (match) => ` ${match}`).replace(/^./, (match) => match.toUpperCase());
	}

	private schemaField(path: SchemaPath<FormLibValue>, name: string): FormLibSchemaPath[string] {
		return (path as FormLibSchemaPath)[name];
	}
}
