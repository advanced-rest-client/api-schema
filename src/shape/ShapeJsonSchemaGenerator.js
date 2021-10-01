/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { ns } from '@api-components/amf-helper-mixin';
import { 
  ShapeBase,
  scalarShapeObject,
  nilShapeObject,
  nodeShapeObject,
  unionShapeObject,
  fileShapeObject,
  schemaShapeObject,
  arrayShapeObject,
  tupleShapeObject,
  anyShapeObject,
  scalarValue,
  propertyShapeObject,
  exampleToObject,
  isNotRequiredUnion,
} from './ShapeBase.js';
import { JsonDataNodeGenerator } from '../data-node/JsonDataNodeGenerator.js';
// import { ApiSchemaValues } from '../ApiSchemaValues.js';

export const unionDefaultValue = Symbol('unionDefaultValue');

/** @typedef {import('@api-components/amf-helper-mixin').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('@api-components/amf-helper-mixin').ApiScalarShape} ApiScalarShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiNodeShape} ApiNodeShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiUnionShape} ApiUnionShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiFileShape} ApiFileShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiSchemaShape} ApiSchemaShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiArrayShape} ApiArrayShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiTupleShape} ApiTupleShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiAnyShape} ApiAnyShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiPropertyShape} ApiPropertyShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiExample} ApiExample */
/** @typedef {import('@api-components/amf-helper-mixin').ApiDataNodeUnion} ApiDataNodeUnion */

export class ShapeJsonSchemaGenerator extends ShapeBase {
  /**
   * Generates a schema from AMF's shape.
   * 
   * @param {ApiShapeUnion} schema The Shape definition
   * @returns {string}
   */
  generate(schema) {
    const result = this.toObject(schema);
    if (result !== null && typeof result === 'object') {
      return this.serialize(result);
    }
    return result;
  }

  /**
   * Processes the Shape definition and returns a JavaScript object or array.
   * @param {ApiShapeUnion} schema
   * @returns {any}
   */
  toObject(schema) {
    const { types } = schema;
    if (types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
      return this[scalarShapeObject](/** @type ApiScalarShape */ (schema));
    }
    if (types.includes(ns.w3.shacl.NodeShape)) {
      return this[nodeShapeObject](/** @type ApiNodeShape */ (schema));
    }
    if (types.includes(ns.aml.vocabularies.shapes.UnionShape)) {
      return this[unionShapeObject](/** @type ApiUnionShape */ (schema));
    }
    if (types.includes(ns.aml.vocabularies.shapes.FileShape)) {
      return this[fileShapeObject](/** @type ApiFileShape */ (schema));
    }
    if (types.includes(ns.aml.vocabularies.shapes.SchemaShape)) {
      return this[schemaShapeObject](/** @type ApiSchemaShape */ (schema));
    }
    if (types.includes(ns.aml.vocabularies.shapes.TupleShape)) {
      return this[tupleShapeObject](/** @type ApiTupleShape */ (schema));
    }
    if (types.includes(ns.aml.vocabularies.shapes.ArrayShape) || types.includes(ns.aml.vocabularies.shapes.MatrixShape)) {
      return this[arrayShapeObject](/** @type ApiArrayShape */ (schema));
    }
    return this[anyShapeObject](/** @type ApiAnyShape */ (schema));
  }

  /**
   * Serializes generated JS value according to the mime type.
   * @param {any} value
   * @returns {string|undefined} 
   */
  serialize(value) {
    return JSON.stringify(value, null, 2);
  }

  /**
   * @param {ApiScalarShape} schema
   * @returns {any|undefined}
   */
  [scalarShapeObject](schema) {
    return this[scalarValue](schema);
  }

  /**
   * @param {ApiScalarShape} schema
   * @returns {any|undefined}
   */
  [nilShapeObject](schema) {
    return null;
  }

  /**
   * @todo: render examples, when available, first.
   * @param {ApiNodeShape} schema
   * @returns {object}
   */
  [nodeShapeObject](schema) {
    const { inherits } = schema;
    let { examples=[] } = schema;
    if (Array.isArray(inherits) && inherits.length) {
      inherits.forEach((parent) => {
        const anyParent = /** @type ApiAnyShape */ (parent);
        if (Array.isArray(anyParent.examples) && anyParent.examples.length) {
          examples = examples.concat(anyParent.examples);
        }
      });
    }
    if (this.opts.renderExamples && examples.length) {
      const example = examples.find((item) => !!item.value);
      const value = this[exampleToObject](example);
      if (value !== undefined) {
        return value;
      }
    }
    let result = {};
    const { properties } = schema;
    if (Array.isArray(inherits) && inherits.length) {
      inherits.forEach(((s) => {
        const part = this.toObject(s);
        if (typeof part === 'object') {
          result = { ...result, ...part };
        }
      }));
    }
    properties.forEach((property) => {
      const { name } = property;
      const value = this[propertyShapeObject](property);
      if (typeof value !== 'undefined') {
        result[name] = value;
      }
    });
    return result;
  }

  /**
   * @param {ApiUnionShape} schema
   * @returns {any}
   */
  [unionShapeObject](schema) {
    let { anyOf=[], examples=[] } = schema;
    if (Array.isArray(schema.inherits) && schema.inherits) {
      schema.inherits.forEach((parent) => {
        const anyParent = /** @type ApiAnyShape */ (parent);
        if (Array.isArray(anyParent.examples) && anyParent.examples.length) {
          examples = examples.concat(anyParent.examples);
        }
        const typed = /** @type ApiUnionShape */ (parent);
        if (Array.isArray(typed.anyOf) && typed.anyOf.length) {
          anyOf = anyOf.concat(typed.anyOf);
        }
      });
    }
    const { opts } = this;
    if (Array.isArray(anyOf) && anyOf.length) {
      if (this[isNotRequiredUnion](anyOf)) {
        // This generates schema for required values.
        // This implicitly mean that the property is not required therefore the value should 
        // not be generated.
        return undefined;
      }
      if (this.opts.renderExamples) {
        const example = examples.find((item) => !!item.value);
        const value = this[exampleToObject](example);
        if (value !== undefined) {
          return value;
        }
      }
      if (schema.defaultValue) {
        return this[unionDefaultValue](anyOf, schema.defaultValue);
      }
      const { selectedUnions } = opts;
      let renderedItem = /** @type ApiShapeUnion */ (null);
      if (selectedUnions && selectedUnions.length) {
        renderedItem = anyOf.find((item) => selectedUnions.includes(item.id));
      } else {
        [renderedItem] = anyOf;
      }
      if (renderedItem) {
        return this.toObject(renderedItem);
      }
    }
    return undefined;
  }

  /**
   * @param {ApiShapeUnion[]} union The list of unions in the shape
   * @param {ApiDataNodeUnion} defaultValue The definition of a default value.
   * @returns {any|undefined}
   */
  [unionDefaultValue](union, defaultValue) {
    const gen = new JsonDataNodeGenerator();
    const result = gen.generate(defaultValue);
    let hasNumber = false;
    let hasBoolean = false;
    let hasNil = false;
    union.forEach((i) => {
      if (i.types.includes(ns.aml.vocabularies.shapes.NilShape)) {
        hasNil = true;
      }
      if (!i.types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
        return;
      }
      const scalar = /** @type ApiScalarShape */ (i);
      if (!hasBoolean) {
        hasBoolean = scalar.dataType === ns.w3.xmlSchema.boolean;
      }
      if (!hasNumber) {
        hasNumber = [
          ns.w3.xmlSchema.number,
          ns.w3.xmlSchema.long,
          ns.w3.xmlSchema.integer,
          ns.w3.xmlSchema.float,
          ns.w3.xmlSchema.double,
          ns.aml.vocabularies.shapes.number,
          ns.aml.vocabularies.shapes.long,
          ns.aml.vocabularies.shapes.integer,
          ns.aml.vocabularies.shapes.float,
          ns.aml.vocabularies.shapes.double,
        ].includes(scalar.dataType);
      }
      if (!hasNil) {
        hasNil = scalar.dataType === ns.w3.xmlSchema.nil;
      }
    });
    if (hasNumber) {
      const parsed = Number(result);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
    if (hasBoolean) {
      if (result === 'true') {
        return true;
      }
      if (result === 'false') {
        return false;
      }
    }
    if (hasNil && (result === 'null' || result === 'nil')) {
      return null;
    }
    return result;
  }

  /**
   * @param {ApiArrayShape} schema
   * @returns {array}
   */
  [arrayShapeObject](schema) {
    const { items } = schema;
    const defaultValue = schema.defaultValue || items.defaultValue;
    let { examples=[] } = schema;
    const anyItems = /** @type ApiAnyShape */ (items);
    if (Array.isArray(anyItems.examples)) {
      examples = examples.concat(anyItems.examples);
    }
    if (this.opts.renderExamples && examples && examples.length) {
      const example = examples.find((item) => !!item.value);
      const value = this[exampleToObject](example);
      if (Array.isArray(value)) {
        return value;
      }
      if (typeof value !== 'undefined') {
        return [value];
      }
    } 
    if (defaultValue) {
      const gen = new JsonDataNodeGenerator();
      const arr = gen.processNode(defaultValue);
      if (Array.isArray(arr)) {
        return arr;
      }
    }
    const value = this.toObject(items);
    if (typeof value !== 'undefined') {
      return [value];
    }
    return [];
  }

  /**
   * @param {ApiTupleShape} schema
   * @returns {any}
   */
  [tupleShapeObject](schema) {
    const { items, examples } = schema;
    if (this.opts.renderExamples && examples && examples.length) {
      const example = examples.find((item) => !!item.value);
      const value = this[exampleToObject](example);
      if (typeof value !== 'undefined') {
        return [value];
      }
    } 
    if (schema.defaultValue) {
      const gen = new JsonDataNodeGenerator();
      const arr = gen.processNode(schema.defaultValue);
      if (Array.isArray(arr)) {
        return arr;
      }
    }
    if (items.length) {
      const result = [];
      items.forEach((i) => {
        const value = this.toObject(i);
        if (typeof value !== 'undefined') {
          result.push(value);
        }
      });
      return result;
    }
    return [];
  }

  /**
   * @param {ApiAnyShape} schema
   * @returns {any}
   */
  [anyShapeObject](schema) {
    const { and=[] } = schema;
    if (and.length) {
      let result = {};
      and.forEach((item) => {
        const props = this.toObject(item);
        if (typeof props === 'object') {
          result = { ...result, ...props };
        }
      });
      return result;
    }
    return this[scalarShapeObject](schema);
  }

  /**
   * @param {ApiPropertyShape} schema
   * @returns {any|undefined} The value for the property or undefined when cannot generate the value.
   */
  [propertyShapeObject](schema) {
    const { range, minCount=0 } = schema;
    if (minCount === 0 && !this.opts.renderOptional) {
      return undefined;
    }
    const { types } = range;
    if (types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
      // const defaultValue = schema.defaultValue || range.defaultValue;
      // if (!this.opts.renderExamples && defaultValue) {
      //   const gen = new JsonDataNodeGenerator();
      //   const value = gen.generate(defaultValue);
      //   if (value) {
      //     return ApiSchemaValues.readTypedValue(value, /** @type ApiScalarShape */ (range).dataType);
      //   }
      // }
      const anyRange = /** @type ApiAnyShape */ (range);
      return this[scalarShapeObject](anyRange);
    }
    return this.toObject(range);
  }

  /**
   * @param {ApiExample} example The example to turn into a JS object
   * @returns {any}
   */
  [exampleToObject](example) {
    if (example && example.structuredValue) {
      const jsonGenerator = new JsonDataNodeGenerator();
      return jsonGenerator.processNode(example.structuredValue);
    }
    return undefined;
  }

  // eslint-disable-next-line no-unused-vars
  [fileShapeObject](schema) {
    return super[fileShapeObject](undefined);
  }
  
  // eslint-disable-next-line no-unused-vars
  [schemaShapeObject](schema) {
    return super[schemaShapeObject](undefined);
  }
}
