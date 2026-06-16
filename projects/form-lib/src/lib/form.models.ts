import * as v from "valibot";

const inputTypeSchema = v.picklist(
	["string", "number", "boolean", "date", "datetime", "time", "code"],
	"Invalid input type",
);

const inputValueScalarSchema = v.union([v.string(), v.number(), v.boolean(), v.null()], "Invalid input value");

const stringValueSchema = v.union([v.string(), v.array(v.string()), v.null()]);
const numberValueSchema = v.union([v.number(), v.array(v.number()), v.null()]);
const booleanValueSchema = v.union([v.boolean(), v.array(v.boolean()), v.null()]);

const valueSchemaPerInputType = {
	string: stringValueSchema,
	number: numberValueSchema,
	boolean: booleanValueSchema,
	date: stringValueSchema,
	datetime: stringValueSchema,
	time: stringValueSchema,
	code: stringValueSchema,
} as const;

const inputValueSchema = v.union(
	[inputValueScalarSchema, v.array(v.nonNullable(inputValueScalarSchema))],
	"Invalid input value",
);

const inputFieldOptionValueSchema = v.union([v.string(), v.number()], "Invalid option value");

export const inputFieldOptionSchema = v.object({
	label: v.string("Invalid option label"),
	value: inputFieldOptionValueSchema,
	disabled: v.optional(v.boolean("Invalid option disabled value")),
});

const stringOperatorSchema = v.picklist(
	["equals", "notEquals", "contains", "notContains", "startsWith", "endsWith", "in", "notIn"],
	"Invalid operator for string input type",
);

const numberOperatorSchema = v.picklist(
	[
		"equals",
		"notEquals",
		"greaterThan",
		"lessThan",
		"greaterThanOrEqual",
		"lessThanOrEqual",
		"between",
		"notBetween",
		"in",
		"notIn",
	],
	"Invalid operator for number input type",
);

const booleanOperatorSchema = v.picklist(["equals", "notEquals"], "Invalid operator for boolean input type");

const dateLikeOperatorSchema = v.picklist(
	["equals", "notEquals", "greaterThan", "lessThan", "greaterThanOrEqual", "lessThanOrEqual", "between", "notBetween"],
	"Invalid operator for date-like input type",
);

const codeOperatorSchema = v.picklist(
	["javascript", "typescript", "sql", "plaintext", "json", "css"],
	"Invalid operator for code input type",
);

const operatorSchemaPerInputType = {
	string: stringOperatorSchema,
	number: numberOperatorSchema,
	boolean: booleanOperatorSchema,
	date: dateLikeOperatorSchema,
	datetime: dateLikeOperatorSchema,
	time: dateLikeOperatorSchema,
	code: codeOperatorSchema,
} as const;

const allOperatorSchema = v.union(
	[stringOperatorSchema, numberOperatorSchema, booleanOperatorSchema, dateLikeOperatorSchema, codeOperatorSchema],
	"Invalid operator",
);


export const inputFieldSchema = v.pipe(
	v.object({
		name: v.string("Invalid input name"),
		label: v.string("Invalid input label"),
		type: inputTypeSchema,
		operators: v.array(allOperatorSchema, "Invalid operators array"),
		defaultOperator: v.optional(allOperatorSchema),
		required: v.optional(v.boolean("Invalid required value")),
		defaultValue: v.optional(inputValueSchema),
		readonly: v.optional(v.boolean("Invalid readonly value")),
		options: v.optional(v.array(inputFieldOptionSchema, "Invalid options array")),
		multiple: v.optional(v.boolean("Invalid multiple value")),
	}),
	v.check((input) => {
		const operatorSchema = operatorSchemaPerInputType[input.type];

		return input.operators.every((operator) => v.safeParse(operatorSchema, operator).success);
	}, "Operators must match input type"),
	v.check((input) => {
		if (!input.defaultOperator) {
			return true;
		}

		return input.operators.includes(input.defaultOperator);
	}, "Default operator must be included in operators"),
	v.check((input) => {
		if (input.defaultValue === undefined) {
			return true;
		}

		const valueSchema = valueSchemaPerInputType[input.type];

		return v.safeParse(valueSchema, input.defaultValue).success;
	}, "Default value must match input type"),
	v.check((input) => {
		if (!input.multiple) {
			return true;
		}

		return input.options !== undefined;
	}, "Multiple fields must define options"),
	v.check((input) => {
		if (!input.options) {
			return true;
		}

		return input.type === "string" || input.type === "number";
	}, "Options are only supported for string and number input types"),
	v.check((input) => {
		if (!input.options) {
			return true;
		}

		return input.options.every((option) => typeof option.value === input.type);
	}, "Option values must match input type"),
	v.check((input) => {
		if (!input.options) {
			return true;
		}

		const values = input.options.map((option) => option.value);
		return new Set(values).size === values.length;
	}, "Option values must be unique"),
	v.check((input) => {
		if (!input.multiple || input.defaultValue === undefined) {
			return true;
		}

		return Array.isArray(input.defaultValue);
	}, "Multiple fields must use an array default value"),
	v.check((input) => {
		if (input.multiple || !input.options || input.defaultValue === undefined) {
			return true;
		}

		return !Array.isArray(input.defaultValue);
	}, "Single option fields must use a scalar default value"),
);

export type InputFieldOption = v.InferOutput<typeof inputFieldOptionSchema>;
export type InputField = v.InferOutput<typeof inputFieldSchema>;
