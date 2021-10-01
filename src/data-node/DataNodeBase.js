/* eslint-disable class-methods-use-this */
import { ns } from '@api-components/amf-helper-mixin';
import { readTypedValue } from '../Utils.js';

/** @typedef {import('@api-components/amf-helper-mixin').ApiObjectNode} ApiObjectNode */
/** @typedef {import('@api-components/amf-helper-mixin').ApiArrayNode} ApiArrayNode */
/** @typedef {import('@api-components/amf-helper-mixin').ApiScalarNode} ApiScalarNode */
/** @typedef {import('@api-components/amf-helper-mixin').ApiDataNode} ApiDataNode */

/**
 * Base class for all schema generators based on AMF's DataNode which includes AMF's examples.
 */
export class DataNodeBase {
  /**
   * @param {ApiDataNode} node The AMF data node to turn into a schema.
   * @returns {any|undefined} Undefined when passed non-DataNode domain element.
   */
  processNode(node) {
    const { types } = node;
    if (types.includes(ns.aml.vocabularies.data.Scalar)) {
      return this.processScalarNode(/** @type ApiScalarNode */ (node));
    }
    if (types.includes(ns.aml.vocabularies.data.Array)) {
      return this.processArrayNode(/** @type ApiArrayNode */ (node));
    }
    if (types.includes(ns.aml.vocabularies.data.Object)) {
      return this.processObjectNode(/** @type ApiObjectNode */ (node));
    }
    return undefined;
  }

  /**
   * @param {ApiScalarNode} scalar The scalar node to process.
   * @returns {any} Scalar value.
   */
  processScalarNode(scalar) {
    return readTypedValue(scalar.value, scalar.dataType);
  }

  /**
   * @param {ApiArrayNode} array The array node to process.
   * @returns {any[]} Array value.
   */
  processArrayNode(array) {
    const container = [];
    array.members.forEach((member) => {
      const result = this.processNode(member);
      if (typeof result !== 'undefined') {
        container.push(result);
      }
    });
    return container;
  }

  /**
   * @param {ApiObjectNode} object The object node to process.
   * @returns {any} Object value.
   */
  processObjectNode(object) {
    const container = {};
    const { properties } = object;
    Object.keys(properties).forEach((key) => {
      const definition = properties[key];
      const result = this.processNode(definition);
      if (typeof result !== 'undefined') {
        const name = this.normalizePropertyName(key);
        container[name] = result;
      }
    });
    return container;
  }

  /**
   * Normalizes a property name. It decodes URL encoded values.
   * @param {string} name The property name to normalize
   * @returns {string}
   */
  normalizePropertyName(name) {
    let result = name;
    try {
      result = decodeURIComponent(result)
    } catch (e) {
      // ...
    }
    return result;
  }
}
