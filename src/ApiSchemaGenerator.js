/* eslint-disable max-classes-per-file */
/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { ns } from '@api-components/amf-helper-mixin';
import { ShapeJsonSchemaGenerator } from './shape/ShapeJsonSchemaGenerator.js';
import { ShapeXmlSchemaGenerator } from './shape/ShapeXmlSchemaGenerator.js';

/** @typedef {import('@api-components/amf-helper-mixin').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('@api-components/amf-helper-mixin').ApiAnyShape} ApiAnyShape */
/** @typedef {import('./types').SchemaExample} SchemaExample */
/** @typedef {import('./types').ShapeRenderOptions} ShapeRenderOptions */
/** @typedef {import('./shape/ShapeBase').ShapeBase} ShapeBase */

/**
 * A class that processes AMF's Shape to auto-generate a schema from examples/type for a given media type.
 * This should be used when examples for the Shape are not available but the application still needs to 
 * render an example or a schema from the Shape.
 * If examples can be found directly in the shape, use the `ApiExampleGenerator` instead.
 */
export class ApiSchemaGenerator {
  /**
   * 
   * @param {string} mime The example mime type to format the generated example.
   * @param {ShapeRenderOptions=} opts Optional configuration.
   */
  constructor(mime, opts={}) {
    this.mime = mime;
    /**
     * @type Readonly<ShapeRenderOptions>
     */
    this.opts = Object.freeze({ ...opts });
    /** 
     * @type {ShapeBase}
     */
    this.generator = undefined;
    if (mime.includes('json')) {
      this.generator = new ShapeJsonSchemaGenerator(opts);
    } else if (mime.includes('xml')) {
      this.generator = new ShapeXmlSchemaGenerator(opts);
    }
  }

  /**
   * @param {ApiShapeUnion} shape The Shape definition
   * @param {string} mime The mime type for the value.
   * @param {ShapeRenderOptions=} opts
   * @returns {SchemaExample|null} Customized Example with the `renderValue` that is the generated Example value.
   */
  static asExample(shape, mime, opts) {
    const generator = new ApiSchemaGenerator(mime, opts);
    return generator.toExample(shape);
  }

  /**
   * @param {ApiShapeUnion} shape The Shape definition
   * @param {string} mime The mime type for the value.
   * @param {ShapeRenderOptions=} opts
   * @returns {object|string|number|boolean|null|undefined} Generated schema
   */
  static asSchema(shape, mime, opts) {
    const generator = new ApiSchemaGenerator(mime, opts);
    return generator.toValue(shape);
  }

  /**
   * Generates the schema from the AMF shape.
   * 
   * @param {ApiShapeUnion} shape The Shape definition
   * @returns {object|string|number|boolean|null|undefined}
   */
  generate(shape) {
    const { generator } = this;
    if (!generator) {
      return null;
    }
    return generator.generate(shape);
  }

  /**
   * @link {#generate()}
   * @param {ApiShapeUnion} shape The Shape definition
   * @returns {object|string|number|boolean|null|undefined}
   */
  toValue(shape) {
    return this.generate(shape);
  }

  /**
   * Generates an API Example object with the value to render.
   * @param {ApiShapeUnion} shape The Shape definition
   * @returns {SchemaExample|null} Customized Example with the `renderValue` that is the generated Example value.
   */
  toExample(shape) {
    const renderValue = this.generate(shape);
    if (renderValue === null || renderValue === undefined) {
      return null;
    }
    const result = /** @type SchemaExample */ ({
      id: `${shape.id}/generated`,
      strict: true,
      types: [ns.aml.vocabularies.apiContract.Example],
      mediaType: this.mime,
      renderValue,
      customDomainProperties: [],
    });
    const typed = /** @type ApiAnyShape */ (shape);
    if (Array.isArray(typed.examples) && typed.examples.length) {
      const [example] = typed.examples;
      if (example.value) {
        result.value = example.value;
      }
    }
    return result;
  }
}
