/* eslint-disable class-methods-use-this */
import { ns } from '@api-components/amf-helper-mixin';
import { JsonDataNodeGenerator } from './data-node/JsonDataNodeGenerator.js';
import { XmlDataNodeGenerator } from './data-node/XmlDataNodeGenerator.js';
import { UrlEncodedDataNodeGenerator } from './data-node/UrlEncodedDataNodeGenerator.js';
import { formatXmlValue } from './Utils.js';

/** @typedef {import('@api-components/amf-helper-mixin').ApiExample} ApiExample */
/** @typedef {import('@api-components/amf-helper-mixin').ApiDataNode} ApiDataNode */
/** @typedef {import('@api-components/amf-helper-mixin').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('@api-components/amf-helper-mixin').ApiArrayShape} ApiArrayShape */

/**
 * A class that processes AMF's Example object to read the example value
 * or to generate the example for the given media type.
 */
export class ApiExampleGenerator {
  /**
   * Reads or generates an example.
   * When the `mime` is set then it tries to "guess" whether the mime type corresponds to the value.
   * If it doesn't then it generates the example from the structured value, when possible.
   * @param {ApiExample} example The structured value of the example
   * @param {string=} mime The optional mime type of the example. When not set it won't generate example from the structured value.
   * @param {ApiShapeUnion=} shape The optional shape containing this example to use with the XML examples which needs wrapping into an element.
   * @returns {string|null} The read or generated example.
   */
  read(example, mime, shape) {
    const { value, structuredValue } = example;
    if (!value && !structuredValue) {
      return null;
    }
    if (structuredValue && !value && mime) {
      return this.fromStructuredValue(mime, structuredValue, shape);
    }
    if (!mime) {
      return value;
    }
    if (this.mimeMatches(mime, value)) {
      return value;
    }
    if (structuredValue) {
      return this.fromStructuredValue(mime, structuredValue, shape);
    }
    return null;
  }

  /**
   * Employs some basic heuristics to determine whether the given mime type patches the content.
   * @param {string} mime The mime type for the value.
   * @param {string} value The value.
   * @returns {boolean} True when the value matches the mime type.
   */
  mimeMatches(mime, value) {
    const trimmed = value.trim();
    if (mime.includes('json')) {
      // JSON string has to start with either of these characters
      return trimmed[0] === '{' || trimmed[0] === '[';
    }
    if (mime.includes('xml')) {
      return trimmed.startsWith('<');
    }
    if (mime.includes('x-www-form-urlencoded')) {
      return trimmed.includes('=') || trimmed.includes('&');
    }
    return true;
  }

  /**
   * Generates the example for the given structured value and the media type.
   * @param {string} mime The mime type for the value.
   * @param {ApiDataNode} structuredValue The structuredValue of the example.
   * @param {ApiShapeUnion=} shape The optional shape containing this example to use with the XML examples which needs wrapping into an element.
   * @returns {string|null} The generated example or null if couldn't process the data.
   */
  fromStructuredValue(mime, structuredValue, shape) {
    if (mime.includes('json')) {
      const generator = new JsonDataNodeGenerator();
      return generator.generate(structuredValue);
    }
    let shapeName;
    if (shape && shape.types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
      shapeName = shape.name;
    } else if (shape && shape.types.includes(ns.aml.vocabularies.shapes.ArrayShape)) {
      const typed = /** @type ApiArrayShape */ (shape);
      if (typed.items && typed.items.types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
        shapeName = typed.items.name || shape.name;
      }
    }
    if (mime.includes('xml')) {
      const generator = new XmlDataNodeGenerator();
      let value = generator.generate(structuredValue, shapeName);
      if (shape && !shapeName) {
        value = this.wrapXmlValue(value, shape);
      }
      return value;
    }
    if (mime.includes('x-www-form-urlencoded')) {
      const generator = new UrlEncodedDataNodeGenerator();
      return generator.generate(structuredValue, shapeName);
    }
    return null;
  }

  /**
   * Wraps the generated XML example into an element according to the `shape` properties.
   * @param {string|null} value 
   * @param {ApiShapeUnion} shape 
   * @returns {string|null}
   */
  wrapXmlValue(value, shape) {
    if (!value || !shape) {
      return value;
    }
    const { name } = shape;
    const parts = [`<${name}>`];
    parts.push(formatXmlValue('  ', value.trim()));
    parts.push(`</${name}>`);
    return parts.join('\n');
  }
}
