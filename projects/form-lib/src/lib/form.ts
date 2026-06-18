import { Component, computed, input, linkedSignal, output } from "@angular/core";
import {
	disabled as disabledField,
	type Field,
	FormField,
	FormRoot,
	form,
	readonly as readonlyField,
	required,
	type SchemaPath,
} from "@angular/forms/signals";
import type { EditorLanguage } from "editor-lib";
import { FormFieldValueControl } from "./form-field-value-control/form-field-value-control";
import type { InputField, InputFieldOption } from "./form.models";
import { FormSelect } from "./form-select/form-select";

type InputValue = string | number | boolean | readonly string[] | readonly number[] | null;
type RangeInputValue = readonly [InputValue, InputValue];
type FormLibOutputValue = InputValue | RangeInputValue;
type OperatorValue = InputField["operators"][number] | null;
type FormLibFieldModel = {
	readonly operator: OperatorValue;
	readonly value: InputValue;
	readonly valueTo: InputValue;
};
type FormLibModel = Record<string, FormLibFieldModel>;
type FormLibSchemaPath = SchemaPath<FormLibValue> &
	Record<string, { value: SchemaPath<InputValue>; valueTo: SchemaPath<InputValue>; operator: SchemaPath<OperatorValue> }>;

export interface FormLibFieldValue {
	readonly operator: OperatorValue;
	readonly value: FormLibOutputValue;
}

export type FormLibValue = Record<string, FormLibFieldValue>;

@Component({
	selector: "lib-form-lib",
	imports: [FormRoot, FormField, FormFieldValueControl, FormSelect],
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
		computation: (fields, previous): FormLibModel => this.createModel(fields, previous?.value),
	});

	protected readonly formTree = form(this.model, (path) => {
		for (const field of this.fields()) {
			const fieldPath = this.schemaField(path, field.name);

			if (field.required) {
				required(fieldPath.value);
			}

			disabledField(fieldPath.value, { when: () => this.disabled() });
			readonlyField(fieldPath.value, { when: () => field.readonly ?? false });
			disabledField(fieldPath.valueTo, { when: () => this.disabled() });
			readonlyField(fieldPath.valueTo, { when: () => field.readonly ?? false });
			disabledField(fieldPath.operator, { when: () => this.disabled() });
			readonlyField(fieldPath.operator, { when: () => field.readonly ?? false });
		}
	});

	protected readonly value = computed(() => this.toOutputValue(this.formTree().value()));

	protected operatorField(field: InputField): Field<OperatorValue> {
		return this.formTree[field.name].operator as Field<OperatorValue>;
	}

	protected valueField(field: InputField): Field<InputValue> {
		return this.formTree[field.name].value as Field<InputValue>;
	}

	protected valueToField(field: InputField): Field<InputValue> {
		return this.formTree[field.name].valueTo as Field<InputValue>;
	}

	protected operatorOptions(field: InputField): readonly InputFieldOption[] {
		return field.operators.map((operator) => ({
			label: this.formatLabel(operator),
			value: operator,
		}));
	}

	protected codeLanguage(field: InputField): EditorLanguage {
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

	protected isRangeOperator(field: InputField): boolean {
		return this.isRangeOperatorValue(this.model()[field.name]?.operator);
	}

	protected submitForm(): void {
		this.formSubmit.emit(this.value());
	}

	private createModel(fields: readonly InputField[], previous?: FormLibModel): FormLibModel {
		return fields.reduce<FormLibModel>((model, field) => {
			const previousField = previous?.[field.name];
			const operator = this.resolveOperator(field, previousField?.operator);
			const value = this.resolveValue(field, previousField?.value, operator, 0);
			const valueTo = this.resolveValue(field, previousField?.valueTo, operator, 1);

			return {
				...model,
				[field.name]: { operator, value, valueTo },
			};
		}, {});
	}

	private resolveOperator(field: InputField, previousOperator?: OperatorValue): OperatorValue {
		if (previousOperator && field.operators.includes(previousOperator)) {
			return previousOperator;
		}

		return field.defaultOperator ?? field.operators[0] ?? null;
	}

	private resolveValue(field: InputField, previousValue: InputValue | undefined, operator: OperatorValue, index: 0 | 1): InputValue {
		if (previousValue !== undefined && this.valueMatchesField(field, previousValue)) {
			return previousValue;
		}

		if (field.defaultValue !== undefined) {
			if (this.isRangeOperatorValue(operator) && Array.isArray(field.defaultValue)) {
				const defaultValue = field.defaultValue[index];

				if (defaultValue !== undefined && this.valueMatchesField(field, defaultValue)) {
					return defaultValue;
				}
			}

			if (index === 1) {
				return null;
			}

			return field.defaultValue as InputValue;
		}

		if (index === 0 && field.multiple) {
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

	private toOutputValue(model: FormLibModel): FormLibValue {
		return Object.entries(model).reduce<FormLibValue>((output, [name, field]) => {
			const value: FormLibOutputValue = this.isRangeOperatorValue(field.operator)
				? [field.value, field.valueTo]
				: field.value;

			return {
				...output,
				[name]: {
					operator: field.operator,
					value,
				},
			};
		}, {});
	}

	private isRangeOperatorValue(operator: OperatorValue): boolean {
		return operator === "between" || operator === "notBetween";
	}

	private schemaField(path: SchemaPath<FormLibModel>, name: string): FormLibSchemaPath[string] {
		return (path as FormLibSchemaPath)[name];
	}
}
