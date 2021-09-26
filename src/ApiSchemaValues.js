/* eslint-disable class-methods-use-this */

import { ns } from "@api-components/amf-helper-mixin";
import { Time } from '@pawel-up/data-mock';
import { JsonDataNodeGenerator } from "./data-node/JsonDataNodeGenerator.js";
import { parseBooleanInput, parseNumberInput, readTypedValue } from "./Utils.js";

/** @typedef {import('@api-components/amf-helper-mixin').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('@api-components/amf-helper-mixin').ApiScalarShape} ApiScalarShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiArrayShape} ApiArrayShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiTupleShape} ApiTupleShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiUnionShape} ApiUnionShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiFileShape} ApiFileShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiSchemaShape} ApiSchemaShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiAnyShape} ApiAnyShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiNodeShape} ApiNodeShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiParameter} ApiParameter */
/** @typedef {import('@api-components/amf-helper-mixin').ApiExample} ApiExample */
/** @typedef {import('@api-components/amf-helper-mixin').ApiScalarNode} ApiScalarNode */
/** @typedef {import('@api-components/amf-helper-mixin').ApiArrayNode} ApiArrayNode */
/** @typedef {import('./types').ApiSchemaReadOptions} ApiSchemaReadOptions */

/**
 * A utility class with helper functions to read values from a schema definition
 */
export class ApiSchemaValues {
  /**
   * Reads the value to be set on an input. This is for Scalar shapes only.
   *
   * @param {ApiParameter} parameter
   * @param {ApiScalarShape} schema
   * @param {ApiSchemaReadOptions=} opts
   * @returns {any} The value to set on the input. Note, it is not cast to the type.
   */
  static readInputValue(parameter, schema, opts={}) {
    const { required } = parameter;
    const { defaultValueStr, values } = schema;
    if (!required && opts.requiredOnly === true) {
      return undefined;
    }
    if (defaultValueStr) {
      return ApiSchemaValues.readTypedValue(defaultValueStr, schema.dataType);
    }
    if (Array.isArray(values) && values.length) {
      const firstEnum = /** @type ApiScalarNode */ (values[0]);
      return ApiSchemaValues.readTypedValue(firstEnum.value, firstEnum.dataType);
    }
    if (opts.fromExamples) {
      /** @type ApiExample[] */
      let examples;
      if (Array.isArray(parameter.examples) && parameter.examples.length) {
        // just in case when an ApiParameter was passed.
        examples = parameter.examples.filter(i => typeof i !== 'string');
      } else if (Array.isArray(schema.examples) && schema.examples.length) {
        examples = schema.examples;
      }
      if (examples && examples.length) {
        return ApiSchemaValues.inputValueFromExamples(examples);
      }
    }
    return ApiSchemaValues.generateDefaultValue(schema);
  }

  /**
   * @param {ApiParameter} parameter The parameter that has the array schema.
   * @param {ApiShapeUnion} schema The final schema to use to read the data from.
   * @param {ApiSchemaReadOptions=} opts
   * @returns {any[]}
   */
  static readInputValues(parameter, schema, opts={}) {
    if (!parameter.required && opts.requiredOnly === true) {
      // for a non required array items just skip showing example values
      // as they are not crucial to make an HTTP request.
      return [];
    }
    const { defaultValue } = schema;
    if (defaultValue) {
      const gen = new JsonDataNodeGenerator();
      const result = gen.processNode(defaultValue);
      if (Array.isArray(result)) {
        return result;
      }
    }
    const anySchema = /** @type ApiAnyShape */ (schema);
    if (opts.fromExamples) {
      /** @type ApiExample[] */
      let examples;
      if (Array.isArray(parameter.examples) && parameter.examples.length) {
        // just in case when an ApiParameter was passed.
        examples = parameter.examples.filter(i => typeof i !== 'string');
      } else if (Array.isArray(anySchema.examples) && anySchema.examples.length) {
        examples = anySchema.examples;
      }
      return ApiSchemaValues.arrayValuesFromExamples(examples);
    }
    return [];
  }

  /**
   * Reads the value for the form input(s) from examples.
   * @param {ApiExample[]} examples
   * @returns {any|null|undefined} 
   */
  static inputValueFromExamples(examples) {
    if (!Array.isArray(examples) || !examples.length) {
      return undefined;
    }
    const [example] = examples;
    const { structuredValue } = example;
    if (!structuredValue) {
      return undefined;
    }
    if (structuredValue.types.includes(ns.aml.vocabularies.data.Scalar)) {
      const value = /** @type ApiScalarNode */ (structuredValue);
      return ApiSchemaValues.readTypedValue(value.value, value.dataType);
    }
    return undefined;
  }

  /**
   * Reads the array value from examples.
   * @param {ApiExample[]} examples Examples set on an array item.
   * @returns {any[]} 
   */
  static arrayValuesFromExamples(examples) {
    /** @type any[] */
    const defaultReturn = [];
    if (!Array.isArray(examples) || !examples.length) {
      return defaultReturn;
    }
    const [example] = examples;
    if (!example.structuredValue || !example.structuredValue.types.includes(ns.aml.vocabularies.data.Array)) {
      return defaultReturn;
    }
    const value = /** @type ApiArrayNode */ (example.structuredValue);
    const { members } = value;
    if (!Array.isArray(members) || !members.length) {
      return defaultReturn;
    }
    const result = [];
    members.forEach((item) => {
      const scalar = /** @type ApiScalarNode */ (item);
      if (!scalar.value) {
        return;
      }
      const typedValue = ApiSchemaValues.readTypedValue(scalar.value, scalar.dataType);
      if (typeof value !== 'undefined' && value !== null) {
        result.push(typedValue);
      }
    });
    return result;
  }

  /**
   * Generates a default value from the schema type.
   * For booleans it returns `false`, for numbers `0`, nulls `null`, etc.
   * It does not generate a value for `string` types!
   * 
   * @param {ApiScalarShape} schema
   * @returns {any}
   */
  static generateDefaultValue(schema) {
    const { dataType } = schema;
    switch (dataType) {
      case ns.w3.xmlSchema.string: return '';
      // XML schema, for DataNode
      case ns.w3.xmlSchema.number:
      case ns.w3.xmlSchema.integer:
      case ns.w3.xmlSchema.float:
      case ns.w3.xmlSchema.long:
      case ns.w3.xmlSchema.double: return 0;
      // AML shapes, for Shape
      case ns.aml.vocabularies.shapes.number:
      case ns.aml.vocabularies.shapes.integer:
      case ns.aml.vocabularies.shapes.float:
      case ns.aml.vocabularies.shapes.long:
      case ns.aml.vocabularies.shapes.double: return 0;
      case ns.aml.vocabularies.shapes.boolean:
      case ns.w3.xmlSchema.boolean: return false;
      case ns.aml.vocabularies.shapes.nil:
      case ns.w3.xmlSchema.nil: return null;
      case ns.w3.xmlSchema.date: return new Time().dateOnly();
      case ns.w3.xmlSchema.dateTime: return new Time().dateTime(/** @type {"rfc3339" | "rfc2616"} */ (schema.format));
      case ns.aml.vocabularies.shapes.dateTimeOnly: return new Time().dateTimeOnly();
      case ns.w3.xmlSchema.time: return new Time().timeOnly();
      default: return undefined;
    }
  }

  /**
   * Casts the `value` to the corresponding data type
   * @param {any} value
   * @param {string} type The w3 schema type
   * @returns {any} 
   */
  static readTypedValue(value, type) {
    return readTypedValue(value, type);
  }

  /**
   * @param {string} schemaType Data type encoded in the parameter schema.
   * @returns {'number'|'boolean'|'date'|'time'|'datetime-local'|'text'} One of the HTML input element type values.
   */
  static readInputType(schemaType) {
    switch (schemaType) {
      case ns.aml.vocabularies.shapes.number:
      case ns.aml.vocabularies.shapes.integer:
      case ns.aml.vocabularies.shapes.float:
      case ns.aml.vocabularies.shapes.long:
      case ns.aml.vocabularies.shapes.double:
      case ns.w3.xmlSchema.number:
      case ns.w3.xmlSchema.integer:
      case ns.w3.xmlSchema.float:
      case ns.w3.xmlSchema.long:
      case ns.w3.xmlSchema.double: return 'number';
      case ns.w3.xmlSchema.date: return 'date';
      case ns.w3.xmlSchema.time: return 'time';
      case ns.w3.xmlSchema.dateTime:
      case ns.aml.vocabularies.shapes.dateTimeOnly: return 'datetime-local';
      case ns.aml.vocabularies.shapes.boolean:
      case ns.w3.xmlSchema.boolean: return 'boolean';
      default: return 'text';
    }
  }

  /**
   * Processes a value that should be a number.
   * @param {any} value
   * @param {number=} defaultValue
   * @returns {number|undefined} 
   */
  static parseNumberInput(value, defaultValue) {
    return parseNumberInput(value, defaultValue);
  }

  /**
   * Processes a value that should be a number.
   * @param {any} value
   * @param {boolean=} defaultValue
   * @returns {boolean|undefined} 
   */
  static parseBooleanInput(value, defaultValue) {
    return parseBooleanInput(value, defaultValue);
  }

  /**
   * Processes a value that should be a date formatted as yyyy-MM-dd.
   * @param {any} value
   * @returns {string|undefined} 
   */
  static parseDateOnlyInput(value) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      return undefined;
    }
    const result = d.toJSON();
    const timeSeparator = result.indexOf('T');
    return result.substr(0, timeSeparator);
  }

  /**
   * Processes a value that should be a date formatted as hh:mm:ss.
   * @param {any} input
   * @returns {string|undefined} 
   */
  static parseTimeOnlyInput(input) {
    const value = String(input).trim();
    if (/^\d\d:\d\d$/.test(value)) {
      return `${value}:00`;
    }
    if (/^\d\d:\d\d:\d\d$/.test(value)) {
      return value;
    }
    return undefined;
  }

  /**
   * Processes a value that should be a date formatted in one of the supported formats:
   * - rfc3339 (default): 2016-02-28T16:41:41.090Z
   * - rfc2616: Sun, 28 Feb 2016 16:41:41 GMT
   * @param {any} value
   * @param {string=} format
   * @returns {string|undefined} 
   */
  static parseDateTimeInput(value, format='rfc3339') {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      return undefined;
    }
    if (format === 'rfc2616') {
      return d.toUTCString();
    }
    if (format === 'rfc3339') {
      return d.toISOString();
    }
    return undefined;
  }

  /**
   * Processes a value that should be a date formatted as yyyy-MM-ddThh:mm
   * @param {any} value
   * @returns {string|undefined} 
   */
  static parseDateTimeOnlyInput(value) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      return undefined;
    }
    const jsonDate = d.toJSON(); // "yyyy-MM-ddThh:mm:ss.090Z"
    const dot = jsonDate.indexOf('.');
    return jsonDate.substr(0, dot);
  }

  /**
   * Parses the the value according to array schema value.
   * @param {any} value
   * @param {ApiArrayShape} schema
   * @returns {string|number|boolean|null|undefined}
   */
  static parseArrayInput(value, schema) {
    const { items } = schema;
    if (!items) {
      return String(value);
    }
    return ApiSchemaValues.parseUserInput(value, items);
  }

  /**
   * Parses the user entered value according to the schema definition.
   * @param {any} value
   * @param {ApiShapeUnion} schema
   * @returns {string|number|boolean|null|undefined}
   */
  static parseUserInput(value, schema) {
    if (!schema || value === undefined || value === null) {
      return value;
    }
    const { types } = schema;
    if (types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
      return ApiSchemaValues.parseScalarInput(value, /** @type ApiScalarShape */ (schema));
    }
    if (types.includes(ns.aml.vocabularies.shapes.ArrayShape) || types.includes(ns.aml.vocabularies.shapes.MatrixShape)) {
      return ApiSchemaValues.parseArrayInput(value, /** @type ApiArrayShape */ (schema));
    }
    return value;
  }

  /**
   * Parses the user entered value as scalar value.
   * @param {any} value
   * @param {ApiScalarShape} schema
   * @returns {string|number|boolean|null|undefined}
   */
  static parseScalarInput(value, schema) {
    switch (schema.dataType) {
      // AML shapes, for Shape
      case ns.aml.vocabularies.shapes.number:
      case ns.aml.vocabularies.shapes.integer:
      case ns.aml.vocabularies.shapes.float:
      case ns.aml.vocabularies.shapes.long:
      case ns.aml.vocabularies.shapes.double:
      case ns.w3.xmlSchema.number:
      case ns.w3.xmlSchema.integer:
      case ns.w3.xmlSchema.float:
      case ns.w3.xmlSchema.long:
      case ns.w3.xmlSchema.double: return ApiSchemaValues.parseNumberInput(value);
      case ns.aml.vocabularies.shapes.boolean:
      case ns.w3.xmlSchema.boolean: return ApiSchemaValues.parseBooleanInput(value);
      case ns.w3.xmlSchema.date: return ApiSchemaValues.parseDateOnlyInput(value);
      case ns.w3.xmlSchema.time: return ApiSchemaValues.parseTimeOnlyInput(value);
      case ns.w3.xmlSchema.dateTime: return ApiSchemaValues.parseDateTimeInput(value, schema.format);
      case ns.aml.vocabularies.shapes.dateTimeOnly: return ApiSchemaValues.parseDateTimeOnlyInput(value);
      default: return String(value);
    }
  }
}
