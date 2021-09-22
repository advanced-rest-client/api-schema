/* eslint-disable max-classes-per-file */
/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { ns } from '@api-components/amf-helper-mixin';
import { Time } from '@pawel-up/data-mock';
import { ApiSchemaValues } from '../ApiSchemaValues.js';
import { JsonDataNodeGenerator } from '../data-node/JsonDataNodeGenerator.js';

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
/** @typedef {import('@api-components/amf-helper-mixin').ApiScalarNode} ApiScalarNode */
/** @typedef {import('../types').ShapeRenderOptions} ShapeRenderOptions */

export const scalarShapeObject = Symbol('scalarShapeObject');
export const nodeShapeObject = Symbol('nodeShapeObject');
export const unionShapeObject = Symbol('unionShapeObject');
export const fileShapeObject = Symbol('fileShapeObject');
export const schemaShapeObject = Symbol('schemaShapeObject');
export const arrayShapeObject = Symbol('arrayShapeObject');
export const tupleShapeObject = Symbol('tupleShapeObject');
export const anyShapeObject = Symbol('anyShapeObject');
export const propertyShapeObject = Symbol('propertyShapeObject');
export const exampleToObject = Symbol('exampleToObject');
// export const dataTypeToExample = Symbol('dataTypeToExample');
export const scalarValue = Symbol('scalarExampleValue');
export const isNotRequiredUnion = Symbol('isNotRequiredUnion');

/**
 * A base class for generators that generates a schema from AMF's shape definition.
 */
export class ShapeBase {
  /**
   * @param {ShapeRenderOptions=} opts
   */
  constructor(opts={}) {
    /**
     * @type Readonly<ShapeRenderOptions>
     */
    this.opts = Object.freeze({ ...opts });

    this.time = new Time();
  }

  /**
   * Generates a schema from AMF's shape.
   * @abstract
   * @param {ApiShapeUnion} schema The Shape definition
   * @returns {string|undefined} The generated example
   */
  generate(schema) {
    return undefined;
  }

  /**
   * Serializes generated values into the final mime type related form.
   * @abstract
   * @param {any} value
   * @returns {string|undefined} The generated example
   */
  serialize(value) {
    return undefined;
  }

  // /**
  //  * Transforms a scalar data type to a corresponding default example value.
  //  * @param {string} dataType The data type namespace value
  //  * @param {string=} format The data format
  //  * @return {string|number|boolean} 
  //  */
  // [dataTypeToExample](dataType, format) {
  //   switch (dataType) {
  //     case ns.w3.xmlSchema.string: return '';
  //     case ns.w3.xmlSchema.number: 
  //     case ns.w3.xmlSchema.float: 
  //     case ns.w3.xmlSchema.double: 
  //     case ns.w3.xmlSchema.integer: 
  //     case ns.w3.xmlSchema.long: 
  //     return 0;
  //     case ns.w3.xmlSchema.boolean: return false;
  //     case ns.w3.xmlSchema.nil: return null;
  //     case ns.w3.xmlSchema.date: return this.time.dateOnly();
  //     case ns.w3.xmlSchema.dateTime: return this.time.dateTime(/** @type {"rfc3339" | "rfc2616"} */ (format));
  //     case ns.aml.vocabularies.shapes.dateTimeOnly: return this.time.dateTimeOnly();
  //     case ns.w3.xmlSchema.time: return this.time.timeOnly();
  //     case ns.w3.xmlSchema.base64Binary: return '';
  //     default: return undefined;
  //   }
  // }

  /**
   * @param {ApiScalarShape} schema
   * @returns {string|number|boolean}
   */
  [scalarValue](schema) {
    const { defaultValue, examples, values, inherits, dataType } = schema;
    // check the default value
    if (defaultValue) {
      const gen = new JsonDataNodeGenerator();
      const processed = gen.processNode(defaultValue);
      // return ApiSchemaValues.readTypedValue(processed, dataType);
      return processed;
    }
    // check examples
    if (this.opts.renderExamples && examples && examples.length) {
      const example = examples.find((item) => !!item.value);
      const value = this[exampleToObject](example);
      if (typeof value !== 'undefined') {
        return ApiSchemaValues.readTypedValue(value, dataType);
      }
    }
    // check enum values
    if (values && values.length) {
      const typed = /** @type ApiScalarNode */ (values[0]);
      if (typed.value !== undefined) {
        return ApiSchemaValues.readTypedValue(typed.value, dataType);
      }
    }
    // check parents
    if (Array.isArray(inherits) && inherits.length) {
      for (let i = 0, len = inherits.length; i < len; i+=1) {
        const result = this[scalarValue](/** @type ApiScalarShape */ (inherits[i]));
        if (result !== undefined) {
          return result;
        }
      }
    }
    // return this[dataTypeToExample](dataType, format);
    // create a default value.
    return ApiSchemaValues.generateDefaultValue(schema);
  }

  /**
   * Checks whether the union represents a scalar + nil which is equivalent 
   * to having scalar that is not required.
   * 
   * See more about nil values in RAML:
   * https://github.com/raml-org/raml-spec/blob/master/versions/raml-10/raml-10.md#nil-type
   * 
   * @param {ApiShapeUnion[]} union The list of unions in the shape
   * @returns {boolean}
   */
  [isNotRequiredUnion](union) {
    let scalars = 0;
    let hasNil = false;

    union.forEach((i) => {
      if (i.types.includes(ns.aml.vocabularies.shapes.NilShape)) {
        hasNil = true;
      } else if (i.types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
        const scalar = /** @type ApiScalarShape */ (i);
        if (scalar.dataType === ns.w3.xmlSchema.nil) {
          hasNil = true;
        } else {
          scalars += 1;
        }
      } else if (i.types.includes(ns.aml.vocabularies.shapes.FileShape)) {
        scalars += 1;
      }
    });
    if (!hasNil) {
      return false;
    }
    // size of union minus the nil union
    if (scalars === union.length - 1) {
      return true;
    }
    return false;
  }

  /**
   * @abstract
   * @param {ApiExample} example The example to turn into a JS object
   * @returns {any}
   */
  [exampleToObject](example) {
    return undefined;
  }

  /**
   * @abstract
   * @param {ApiScalarShape} schema
   * @returns {any}
   */
  [scalarShapeObject](schema) {
    return undefined;
  }

  /**
   * @abstract
   * @param {ApiNodeShape} schema
   * @returns {any}
   */
  [nodeShapeObject](schema) {
    return undefined;
  }

  /**
   * @abstract
   * @param {ApiUnionShape} schema
   * @returns {any}
   */
  [unionShapeObject](schema) {
    return undefined;
  }

  /**
   * @abstract
   * @param {ApiFileShape} schema
   * @returns {any}
   */
  [fileShapeObject](schema) {
    return undefined;
  }

  /**
   * @abstract
   * @param {ApiSchemaShape} schema
   * @returns {any}
   */
  [schemaShapeObject](schema) {
    return undefined;
  }

  /**
   * @abstract
   * @param {ApiArrayShape} schema
   * @returns {any}
   */
  [arrayShapeObject](schema) {
    return undefined;
  }

  /**
   * @abstract
   * @param {ApiTupleShape} schema
   * @returns {any}
   */
  [tupleShapeObject](schema) {
    return undefined;
  }

  /**
   * @abstract
   * @param {ApiAnyShape} schema
   * @returns {any}
   */
  [anyShapeObject](schema) {
    return undefined;
  }

  /**
   * @abstract
   * @param {ApiPropertyShape} schema
   * @returns {any}
   */
  [propertyShapeObject](schema) {
    return undefined;
  }
}
