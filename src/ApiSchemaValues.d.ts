import { ApiArrayShape, ApiExample, ApiParameter, ApiScalarShape, ApiShapeUnion } from "@api-components/amf-helper-mixin";
import { ApiSchemaReadOptions } from "./types.js";

/**
 * A utility class with helper functions to read values from a schema definition
 */
export declare class ApiSchemaValues {
  /**
   * Reads the value to be set on an input. This is for Scalar shapes only.
   * 
   * @returns The value to set on the input. Note, it is not cast to the type.
   */
  static readInputValue(parameter: ApiParameter, schema: ApiScalarShape, opts?: ApiSchemaReadOptions): any;

  /**
   * @param parameter The parameter that has the array schema.
   * @param schema The final schema to use to read the data from.
   */
  static readInputValues(parameter: ApiParameter, schema: ApiShapeUnion, opts?: ApiSchemaReadOptions): any[];

  /**
   * Reads the value for the form input(s) from examples.
   */
  static inputValueFromExamples(examples: ApiExample[]): any|null|undefined;

  /**
   * Reads the array value from examples.
   * @param examples Examples set on an array item.
   */
  static arrayValuesFromExamples(examples: ApiExample[]): any[];

  /**
   * Generates a default value from the schema type.
   * For booleans it returns `false`, for numbers `0`, nulls `null`, etc.
   * It does not generate a value for `string` types!
   */
  static generateDefaultValue(schema: ApiScalarShape): any;

  /**
   * Casts the `value` to the corresponding data type
   */
  static readTypedValue(value: any, type: string): any;

  /**
   * @param schemaType Data type encoded in the parameter schema.
   * @returns One of the HTML input element type values.
   */
  static readInputType(schemaType: string): 'number'|'boolean'|'date'|'time'|'datetime-local'|'text';

  /**
   * Processes a value that should be a number.
   */
  static parseNumberInput(value: any, defaultValue?: number): number|undefined;

  /**
   * Processes a value that should be a number.
   */
  static parseBooleanInput(value: any, defaultValue?: boolean): boolean|undefined;

  /**
   * Processes a value that should be a date formatted as yyyy-MM-dd.
   */
  static parseDateOnlyInput(value: any): string|undefined;

  /**
   * Processes a value that should be a date formatted as hh:mm:ss.
   */
  static parseTimeOnlyInput(input: any): string|undefined;

  /**
   * Processes a value that should be a date formatted in one of the supported formats:
   * - rfc3339 (default): 2016-02-28T16:41:41.090Z
   * - rfc2616: Sun, 28 Feb 2016 16:41:41 GMT
   */
  static parseDateTimeInput(value: any, format?: string): string|undefined;

  /**
   * Processes a value that should be a date formatted as yyyy-MM-ddThh:mm
   */
  static parseDateTimeOnlyInput(value: any): string|undefined;

  /**
   * Parses the the value according to array schema value.
   */
  static parseArrayInput(value: any, schema: ApiArrayShape): string|number|boolean|null|undefined;

  /**
   * Parses the user entered value according to the schema definition.
   */
  static parseUserInput(value: any, schema: ApiShapeUnion): string|number|boolean|null|undefined;

  /**
   * Parses the user entered value as scalar value.
   */
  static parseScalarInput(value: any, schema: ApiScalarShape): string|number|boolean|null|undefined;
}
