/* eslint-disable class-methods-use-this */
import { ns } from '@api-components/amf-helper-mixin';
import { 
  ShapeBase,
  scalarShapeObject,
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
import { XmlDataNodeGenerator } from '../data-node/XmlDataNodeGenerator.js';
import { collectNodeProperties, formatXmlValue, getUnionMember } from '../Utils.js';

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

/** 
 * @typedef ProcessNodeOptions 
 * @property {string=} forceName
 * @property {number=} indent
 */

/**
 * Normalizes given name to a value that can be accepted by `createElement`
 * function on a document object.
 * @param {String} name A name to process
 * @return {String} Normalized name
 */
export const normalizeXmlTagName = name => name.replace(/[^a-zA-Z0-9-_.]/g, '');
const UNKNOWN_TYPE = 'unknown-type';

export const collectProperties = Symbol('collectProperties');
export const unionDefaultValue = Symbol('unionDefaultValue');
export const readCurrentUnion = Symbol('readCurrentUnion');

/**
 * @param {ApiAnyShape} shape
 */
export function shapeToXmlTagName(shape) {
  const { name, inherits=[], xmlSerialization } = shape;
  let label = xmlSerialization && xmlSerialization.name ? xmlSerialization.name : name || UNKNOWN_TYPE;
  if (label === 'schema' && inherits.length) {
    const n = inherits.find(i => i.name && i.name !== 'schema');
    if (n) {
      label = n.name === 'type' ? n.displayName || n.name : n.name;
    }
  }
  return normalizeXmlTagName(label);
}

export class ShapeXmlSchemaGenerator extends ShapeBase {
  /**
   * Generates a XML example from the structured value.
   * 
   * @param {ApiShapeUnion} schema The Shape definition
   * @returns {string}
   */
  generate(schema) {
    const value = this.processNode(schema);
    return value;
  }

  /**
   * Processes the Shape definition and returns a JavaScript object or array.
   * @param {ApiShapeUnion} schema
   * @param {ProcessNodeOptions=} options
   * @returns {string}
   */
  processNode(schema, options={}) {
    const { types } = schema;
    if (types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
      return this[scalarShapeObject](/** @type ApiScalarShape */ (schema), options);
    }
    if (types.includes(ns.w3.shacl.NodeShape)) {
      return this[nodeShapeObject](/** @type ApiNodeShape */ (schema), options);
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
    if (types.includes(ns.aml.vocabularies.shapes.ArrayShape) || types.includes(ns.aml.vocabularies.shapes.MatrixShape)) {
      return this[arrayShapeObject](/** @type ApiArrayShape */ (schema), options);
    }
    if (types.includes(ns.aml.vocabularies.shapes.TupleShape)) {
      return this[tupleShapeObject](/** @type ApiTupleShape */ (schema));
    }
    return this[anyShapeObject](/** @type ApiAnyShape */ (schema));
  }

  /**
   * Serializes generated JS value according to the mime type.
   * @param {any} value
   * @returns {string|undefined} 
   */
  serialize(value) {
    return value;
  }

  /**
   * Picks the union member to render.
   * @param {ApiShapeUnion[]} anyOf 
   * @returns {ApiShapeUnion}
   */
  [readCurrentUnion](anyOf) {
    const { selectedUnions } = this.opts;
    return getUnionMember(anyOf, selectedUnions);
  }

  /**
   * @param {ApiNodeShape} schema
   * @returns {ApiPropertyShape[]}
   */
  [collectProperties](schema) {
    const { selectedUnions } = this.opts;
    return collectNodeProperties(schema, selectedUnions);
  }

  /**
   * @param {ApiNodeShape} schema
   * @param {ProcessNodeOptions=} options
   * @returns {string}
   */
  [nodeShapeObject](schema, options={}) {
    const { inherits } = schema;
    let { examples=[] } = schema;
    if (Array.isArray(inherits) && inherits.length) {
      inherits.forEach((parent) => {
        let node = parent;
        if (node.types.includes(ns.aml.vocabularies.shapes.UnionShape)) {
          const union = /** @type ApiUnionShape */ (node);
          const { anyOf=[] } = union;
          node = this[readCurrentUnion](anyOf);
        }
        const anyShape = /** @type ApiAnyShape */ (node);
        if (Array.isArray(anyShape.examples) && anyShape.examples.length) {
          examples = examples.concat(anyShape.examples);
        }
      });
    }

    const label = options.forceName || shapeToXmlTagName(schema);
    const attributes = [];
    const parts = [];
    const currentIndent = (options.indent || 0);
    if (this.opts.renderExamples && examples && examples.length) {
      const example = examples.find((item) => !!item.value);
      const value = this[exampleToObject](example);
      if (typeof value !== 'undefined') {
        const fillTag = new Array(currentIndent * 2 + 0).fill(' ').join('');
        const fillValue = new Array(currentIndent * 2 + 2).fill(' ').join('');
        parts.push(`${fillTag}<${label}>`);
        parts.push(formatXmlValue(fillValue, value));
        parts.push(`${fillTag}</${label}>`);
        return parts.join('\n');
      }
    }
    const properties = this[collectProperties](schema);
    properties.forEach((property) => {
      const { range, minCount=0 } = property;
      if (minCount === 0 && !this.opts.renderOptional) {
        return;
      }
      const anyRange = /** @type ApiAnyShape */ (range);
      if (anyRange.xmlSerialization) {
        // Adds to the parent attributes list.
        // When a non-scalar shape has `attribute` serialization this is an API spec error.
        // Ignore such situation.
        if (anyRange.xmlSerialization.attribute && anyRange.types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
          let aLabel = normalizeXmlTagName(anyRange.xmlSerialization.name ? anyRange.xmlSerialization.name : property.name || anyRange.name || UNKNOWN_TYPE);
          if (anyRange.xmlSerialization.prefix) {
            aLabel = `${anyRange.xmlSerialization.prefix}:${aLabel}`;
          }
          const value = this[scalarValue](anyRange);
          attributes.push(`${aLabel}="${value}"`);
          return;
        }
      }
      const value = this[propertyShapeObject](property, { indent: currentIndent });
      if (typeof value !== 'undefined') {
        const fill = new Array(currentIndent * 2 + 2).fill(' ').join('');
        parts.push(formatXmlValue(fill, value));
      }
    });

    let opening = `<${label}`;
    if (attributes.length) {
      opening += ' ';
      opening += attributes.join(' ');
    }
    parts.unshift(`${opening}>`);
    const fill = new Array(currentIndent*2).fill(' ').join('');
    parts.push(`${fill}</${label}>`);
    return parts.join('\n');
  }

  /**
   * @param {ApiScalarShape} schema
   * @param {ProcessNodeOptions=} options
   * @returns {any|undefined}
   */
  [scalarShapeObject](schema, options={}) {
    const { xmlSerialization, defaultValue } = schema;
    let content;
    if (defaultValue) {
      const gen = new XmlDataNodeGenerator();
      content = gen.processNode(defaultValue);
    } else {
      content = this[scalarValue](schema);
    }
    let label = options.forceName || shapeToXmlTagName(schema);
    const attributes = [];
    const parts = [];
    if (xmlSerialization) {
      const { namespace, prefix } = xmlSerialization;
      if (namespace) {
        const attrName = prefix ? `xmlns:${prefix}` : 'xmlns';
        attributes.push(`${attrName}="${namespace}"`);
      }
      if (prefix) {
        label = `${prefix}:${label}`;
      }
    }
    let opening = `<${label}`;
    if (attributes.length) {
      opening += ' ';
      opening += attributes.join(' ');
    }
    opening += '>';
    parts.push(opening);
    parts.push(content);
    parts.push(`</${label}>`);
    
    return parts.join('');
  }

  /**
   * @param {ApiPropertyShape} schema
   * @param {ProcessNodeOptions=} options
   * @returns {string|undefined} The value for the property or undefined when cannot generate the value.
   */
  [propertyShapeObject](schema, options) {
    const { range, minCount=0 } = schema;
    if (minCount === 0 && !this.opts.renderOptional) {
      return undefined;
    }
    const { types } = range;
    if (types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
      return this[scalarShapeObject](/** @type ApiScalarShape */ (range));
    }
    return this.processNode(range, options);
  }

  /**
   * @param {ApiArrayShape} schema
   * @param {ProcessNodeOptions=} options
   * @returns {string}
   */
  [arrayShapeObject](schema, options={}) {
    const { items, xmlSerialization } = schema;
    const label = shapeToXmlTagName(schema);
    const currentIndent = (options.indent || 0);
    const rootFill = new Array(currentIndent*2).fill(' ').join('');
    const parts = [
      `${rootFill}<${label}>`
    ];
    let itemName = label;
    const anyItems = /** @type ApiAnyShape */ (items);
    if (anyItems.xmlSerialization && anyItems.xmlSerialization.name) {
      itemName = normalizeXmlTagName(anyItems.xmlSerialization.name);
    }
    const isWrapped = xmlSerialization && !!xmlSerialization.wrapped;
    const defaultValue = schema.defaultValue || items.defaultValue;
    // default values are always added to the schema.
    if (defaultValue) {
      const gen = new XmlDataNodeGenerator();
      const value = gen.generate(defaultValue);
      if (value) {
        const tagFill = new Array(currentIndent * 2 + 2).fill(' ').join('');
        const valueFill = new Array(currentIndent * 2 + 4).fill(' ').join('');
        parts.push(`${tagFill}<${itemName}>`);
        parts.push(`${valueFill}${value.trim()}`);
        parts.push(`${tagFill}</${itemName}>`);
      }
    } else {
      let { examples=[] } = schema;
      if (Array.isArray(anyItems.examples)) {
        examples = examples.concat(anyItems.examples);
      }
      if (this.opts.renderExamples && examples && examples.length) {
        const example = examples.find((item) => !!item.value);
        const value = this[exampleToObject](example);
        if (typeof value !== 'undefined') {
          const tagFill = new Array(currentIndent * 2 + 2).fill(' ').join('');
          const valueFill = new Array(currentIndent * 2 + 4).fill(' ').join('');
          parts.push(`${tagFill}<${itemName}>`);
          parts.push(`${valueFill}${value}`);
          parts.push(`${tagFill}</${itemName}>`);
        }
      } else if (items.types.includes(ns.w3.shacl.NodeShape)) {
        const typed = /** @type ApiNodeShape */ (items);
        const tagFill = new Array(currentIndent * 2 + 2).fill(' ').join('');
        const valueFill = isWrapped ? new Array(currentIndent * 2 + 4).fill(' ').join('') : tagFill;
        if (isWrapped) {
          parts.push(`${tagFill}<${itemName}>`);
        }
        const properties = this[collectProperties](typed);
        properties.forEach((prop) => {
          const value = this[propertyShapeObject](prop);
          if (value) {
            parts.push(`${valueFill}${value}`);
          }
        });
        if (isWrapped) {
          parts.push(`${tagFill}</${itemName}>`);
        }
      } else {
        const opts = {
          forceName: itemName,
          indent: currentIndent + 1,
        };
        const value = this.processNode(items, opts);
        if (typeof value !== 'undefined') {
          const fill = new Array(currentIndent * 2 + 2).fill(' ').join('');
          parts.push(`${fill}${value}`);
        }
      }
    }
    
    parts.push(`${rootFill}</${label}>`);
    return parts.join('\n');
  }

  /**
   * @param {ApiExample} example The example to turn into a JS object
   * @returns {any}
   */
  [exampleToObject](example) {
    if (example && example.structuredValue) {
      const generator = new XmlDataNodeGenerator();
      return generator.generate(example.structuredValue);
    }
    return undefined;
  }

  /**
   * @param {ApiUnionShape} schema
   * @param {ProcessNodeOptions=} options
   * @returns {any}
   */
  [unionShapeObject](schema, options={}) {
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
    if (Array.isArray(anyOf) && anyOf.length) {
      if (this[isNotRequiredUnion](anyOf)) {
        // This generates schema for required values.
        // This implicitly mean that the property is not required therefore the value should 
        // not be generated.
        return undefined;
      }
      const example = examples.find((item) => !!item.value);
      const value = this[exampleToObject](example);
      if (value !== undefined) {
        const label = shapeToXmlTagName(schema);
        const currentIndent = (options.indent || 0);
        const rootFill = new Array(currentIndent*2).fill(' ').join('');
        const valueFill = new Array(currentIndent * 2 + 2).fill(' ').join('');
        const parts = [];
        parts.push(`${rootFill}<${label}>`);
        const formatted = String(value).split('\n').filter(i => !!i).map(i => `${valueFill}${i}`).join('\n');
        parts.push(`${formatted}`);
        parts.push(`${rootFill}</${label}>`);
        return parts.join('\n');
      }
      if (schema.defaultValue) {
        return this[unionDefaultValue](schema, schema.defaultValue);
      }
      const member = this[readCurrentUnion](anyOf);
      if (member) {
        return this.processNode(member, { ...options, forceName: schema.name });
      }
    }
    return undefined;
  }

  /**
   * @param {ApiShapeUnion} schema The schema with unions
   * @param {ApiDataNodeUnion} defaultValue The definition of a default value.
   * @param {ProcessNodeOptions=} options
   * @returns {any|undefined}
   */
  [unionDefaultValue](schema, defaultValue, options={}) {
    const gen = new XmlDataNodeGenerator();
    const value = gen.generate(defaultValue);
    const anySchema = /** @type ApiAnyShape */ (schema);
    const label = shapeToXmlTagName(anySchema);
    const currentIndent = (options.indent || 0);
    const rootFill = new Array(currentIndent*2).fill(' ').join('');
    const parts = [
      `${rootFill}<${label}>`
    ];
    const valueFill = new Array(currentIndent * 2 + 2).fill(' ').join('');
    parts.push(`${valueFill}${String(value).trim()}`);
    parts.push(`${rootFill}</${label}>`);
    return parts.join('\n');
  }

  [fileShapeObject](schema) {
    return super[fileShapeObject](schema);
  }

  [schemaShapeObject](schema) {
    return super[schemaShapeObject](schema);
  }

  [tupleShapeObject](schema) {
    return super[tupleShapeObject](schema);
  }

  [anyShapeObject](schema) {
    return super[anyShapeObject](schema);
  }
}
