/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
/** @typedef {import('@api-components/amf-helper-mixin').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('@api-components/amf-helper-mixin').ApiNodeShape} ApiNodeShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiPropertyShape} ApiPropertyShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiScalarShape} ApiScalarShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiScalarNode} ApiScalarNode */
/** @typedef {import('@api-components/amf-helper-mixin').ApiArrayShape} ApiArrayShape */
/** @typedef {import('./types').MonacoSchema} MonacoSchema */
/** @typedef {import('./types').MonacoProperty} MonacoProperty */
/** @typedef {import('./types').MonacoScalarProperty} MonacoScalarProperty */
/** @typedef {import('./types').MonacoObjectProperty} MonacoObjectProperty */
/** @typedef {import('./types').MonacoArrayProperty} MonacoArrayProperty */

import { ns } from '@api-components/amf-helper-mixin';
import { collectNodeProperties } from './Utils.js';

/**
 * @param {string} name 
 * @returns {string}
 */
function cleanName(name) {
  if (!name) {
    return name;
  }
  return name.replace('?', '');
}

/**
 * A class to generate JSON schema from an ApiShapeUnion declaration to use with the Monaco editor schemas.
 */
export class ApiMonacoSchemaGenerator {
  /**
   * @param {ApiShapeUnion} schema
   * @param {string} parentUri The URI for the fileMatch property.
   */
  generate(schema, parentUri) {
    /** @type MonacoSchema[] */
    this.schemas = [];
    if (!schema) {
      return [];
    }
    const { types } = schema;
    if (types.includes(ns.w3.shacl.NodeShape)) {
      return this.fromNodeShape(/** @type ApiNodeShape */ (schema), parentUri);
    }
    return [];
  }

  /**
   * @param {ApiNodeShape} schema
   * @param {string=} parentUri The URI for the fileMatch property.
   * @returns {MonacoSchema[]}
   */
  fromNodeShape(schema, parentUri) {
    const { id, name } = schema;
    const properties = collectNodeProperties(schema);
    const content = /** @type MonacoObjectProperty */ ({
      title: cleanName(name),
      type: "object",
      properties: {},
      required: [],
    });
    const result = /** @type MonacoSchema */ ({
      uri: id,
      schema: content,
    });
    if (parentUri) {
      result.fileMatch = [parentUri];
    }
    this.schemas.push(result);
    if (!Array.isArray(properties) || !properties.length) {
      return this.schemas;
    }
    properties.forEach(property => this.appendSchemaProperty(content, property));
    return this.schemas;
  }

  /**
   * @param {MonacoObjectProperty} content
   * @param {ApiPropertyShape} property
   */
  appendSchemaProperty(content, property) {
    const { name, range, minCount } = property;
    const value = this.rangeToPropertySchema(range);
    if (value) {
      content.properties[name] = value;
      if (minCount === 1) {
        content.required.push(name);
      }
    }
  }

  /**
   * @param {ApiShapeUnion} range
   */
  rangeToPropertySchema(range) {
    const { types } = range;
    if (types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
      return this.scalarRangeToPropertySchema(/** @type ApiScalarShape */ (range));
    }
    if (types.includes(ns.w3.shacl.NodeShape)) {
      return this.nodeShapeRangeToPropertySchema(/** @type ApiNodeShape */ (range));
    }
    if (types.includes(ns.aml.vocabularies.shapes.ArrayShape)) {
      return this.arrayShapeRangeToPropertySchema(/** @type ApiArrayShape */ (range));
    }
    return undefined;
  }

  /**
   * @param {ApiScalarShape} schema
   * @returns {MonacoScalarProperty}
   */
  scalarRangeToPropertySchema(schema) {
    const { values, description, name, displayName, defaultValueStr, exclusiveMaximum, exclusiveMinimum, minimum, maximum, minLength, maxLength, id, multipleOf, pattern, readOnly, writeOnly } = schema;
    const type = this.schemaTypeToJsonDataType(schema.dataType);
    const result = /** @type MonacoScalarProperty */ ({
      '$id': id,
      type,
      title: cleanName(displayName || name),
    });
    if (description) {
      result.description = description;
    }
    if (defaultValueStr) {
      result.default = defaultValueStr;
    }
    if (typeof exclusiveMaximum === 'boolean') {
      result.exclusiveMaximum = exclusiveMaximum;
    }
    if (typeof exclusiveMinimum === 'boolean') {
      result.exclusiveMinimum = exclusiveMinimum;
    }
    if (typeof maxLength === 'number') {
      result.maxLength = maxLength;
    }
    if (typeof minLength === 'number') {
      result.minLength = minLength;
    }
    if (typeof minimum === 'number') {
      result.minimum = minimum;
    }
    if (typeof maximum === 'number') {
      result.maximum = maximum;
    }
    if (typeof multipleOf === 'number') {
      result.multipleOf = multipleOf;
    }
    if (typeof pattern === 'string') {
      result.pattern = pattern;
    }
    if (typeof readOnly === 'boolean') {
      result.readOnly = readOnly;
    }
    if (typeof writeOnly === 'boolean') {
      result.writeOnly = writeOnly;
    }
    switch (schema.dataType) {
      case ns.aml.vocabularies.shapes.dateTimeOnly: result.format = 'date-time'; break;
      case ns.w3.xmlSchema.date: result.format = 'date'; break;
      case ns.w3.xmlSchema.time: result.format = 'time'; break;
      default:
    }
    if (Array.isArray(values) && values.length) {
      // enum properties
      result.enum = [];
      values.forEach((value) => {
        const { types } = value;
        if (types.includes(ns.aml.vocabularies.data.Scalar)) {
          const typed = /** @type ApiScalarNode */ (value);
          if (typed.value) {
            result.enum.push(typed.value);
          }
        }
      });
    }
    return result;
  }

  /**
   * Translates AMF data type to JSON schema data type.
   * @param {string} schemaType
   * @return {string} 
   */
  schemaTypeToJsonDataType(schemaType) {
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
      case ns.w3.xmlSchema.boolean:
      case ns.aml.vocabularies.shapes.boolean: return 'boolean';
      case ns.aml.vocabularies.shapes.nil:
      case ns.w3.xmlSchema.nil: return 'null';
      default: return 'string';
    }
  }

  /**
   * @param {ApiNodeShape} schema
   * @returns {MonacoObjectProperty}
   */
  nodeShapeRangeToPropertySchema(schema) {
    const { description, name, displayName, id, readOnly, writeOnly, closed, minProperties, maxProperties } = schema;
    const properties = collectNodeProperties(schema);

    const result = /** @type MonacoObjectProperty */ ({
      '$id': id,
      type: 'object',
      title: cleanName(displayName || name),
      properties: {},
      required: [],
    });
    if (description) {
      result.description = description;
    }
    if (typeof readOnly === 'boolean') {
      result.readOnly = readOnly;
    }
    if (typeof writeOnly === 'boolean') {
      result.writeOnly = writeOnly;
    }
    if (typeof closed === 'boolean') {
      result.additionalProperties = !closed;
    }
    if (typeof minProperties === 'number') {
      result.minProperties = minProperties;
    }
    if (typeof maxProperties === 'number') {
      result.maxProperties = maxProperties;
    }
    properties.forEach(property => this.appendSchemaProperty(result, property));
    return result;
  }

  /**
   * @param {ApiArrayShape} schema
   * @returns {MonacoArrayProperty}
   */
  arrayShapeRangeToPropertySchema(schema) {
    const { description, name, displayName, id, readOnly, writeOnly, items, minItems, maxItems, uniqueItems } = schema;
    const result = /** @type MonacoArrayProperty */ ({
      '$id': id,
      type: 'array',
      title: cleanName(displayName || name),
      items: {
        anyOf: [],
      },
      required: [],
      additionalItems: false,
    });
    if (description) {
      result.description = description;
    }
    if (typeof readOnly === 'boolean') {
      result.readOnly = readOnly;
    }
    if (typeof writeOnly === 'boolean') {
      result.writeOnly = writeOnly;
    }
    if (typeof uniqueItems === 'boolean') {
      result.uniqueItems = uniqueItems;
    }
    if (items) {
      const value = this.rangeToPropertySchema(items);
      if (value) {
        result.items.anyOf.push(value);
      }
    }
    if (typeof minItems === 'number') {
      result.minItems = minItems;
    }
    if (typeof maxItems === 'number') {
      result.maxItems = maxItems;
    }
    return result;
  }
}
