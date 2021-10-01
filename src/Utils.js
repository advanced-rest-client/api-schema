import { ns } from "@api-components/amf-helper-mixin";

/** @typedef {import('@api-components/amf-helper-mixin').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('@api-components/amf-helper-mixin').ApiNodeShape} ApiNodeShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiPropertyShape} ApiPropertyShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiUnionShape} ApiUnionShape */

/**
   * @param {any} obj
   * @param {number=} indent The current indent
   * @return {string} 
   */
export function toXml(obj, indent=0) {
  if (typeof obj !== 'object') {
    return obj;
  }
  let xml = '';
  const tabs = new Array(indent).fill('  ').join('');
  Object.keys(obj).forEach((prop) => {
    xml += Array.isArray(obj[prop]) ? '' : `${tabs}<${prop}>`;
    if (Array.isArray(obj[prop])) {
      obj[prop].forEach((item) => {
        xml += `<${prop}>\n`;
        xml += tabs;
        xml += toXml({ ...item }, indent + 1);
        xml += `</${prop}>\n`;
      });
    } else if (typeof obj[prop] === "object") {
      xml += `\n`;
      xml += toXml({ ...obj[prop] }, indent + 1);
    } else {
      xml += `${obj[prop]}`;
    }
    xml += Array.isArray(obj[prop]) ? '' : `</${prop}>\n`;
  });
  xml = xml.replace(/<\/?[0-9]{1,}>/g, '');
  return xml
}

/**
 * @param {string} fill The fill value (spaces to put in front of the value)
 * @param {any} value The value to format
 * @returns {string}
 */
export function formatXmlValue(fill, value) {
  const typed = String(value);
  const parts = typed.split('\n').filter(i => !!i);
  const formatted = parts.map(i => `${fill}${i}`).join('\n');
  return formatted;
}

/**
 * @param {string} str A key or value to encode as x-www-form-urlencoded.
 * @param {boolean=} replacePlus When set it replaces `%20` with `+`.
 * @returns {string} .
 */
export function wwwFormUrlEncode(str, replacePlus=false) {
  // Spec says to normalize newlines to \r\n and replace %20 spaces with +.
  // jQuery does this as well, so this is likely to be widely compatible.
  if (str === undefined) {
    return '';
  }
  let result = encodeURIComponent(String(str).replace(/\r?\n/g, '\r\n'));
  if (replacePlus) {
    result = result.replace(/%20/g, '+');
  }
  return result;
}

/**
 * Processes a value that should be a number.
 * @param {any} value
 * @param {number=} [defaultValue=undefined]
 * @returns {number|undefined} 
 */
export function parseNumberInput(value, defaultValue=undefined) {
  if (typeof value === 'number') {
    return value;
  }
  const n = Number(value);
  if (Number.isNaN(n)) {
    return defaultValue;
  }
  return n;
}

/**
 * Processes a value that should be a number.
 * @param {any} value
 * @param {boolean=} [defaultValue=undefined]
 * @returns {boolean|undefined} 
 */
export function parseBooleanInput(value, defaultValue=undefined) {
  const type = typeof value;
  if (type === 'boolean') {
    return value;
  }
  if (type === 'string') {
    const trimmed = value.trim();
    if (trimmed === 'true') {
      return true;
    }
    if (trimmed === 'false') {
      return false;
    }
  }
  return defaultValue;
}

/**
 * Casts the `value` to the corresponding data type
 * @param {any} value
 * @param {string} type The w3 schema type
 * @returns {any} 
 */
export function readTypedValue(value, type) {
  if (value === undefined || value === null) {
    return value;
  }
  switch (type) {
    case ns.aml.vocabularies.shapes.number:
    case ns.aml.vocabularies.shapes.integer:
    case ns.aml.vocabularies.shapes.float:
    case ns.aml.vocabularies.shapes.long:
    case ns.aml.vocabularies.shapes.double:
    case ns.w3.xmlSchema.number:
    case ns.w3.xmlSchema.integer:
    case ns.w3.xmlSchema.float:
    case ns.w3.xmlSchema.long:
    case ns.w3.xmlSchema.double: return parseNumberInput(value, 0);
    case ns.aml.vocabularies.shapes.boolean:
    case ns.w3.xmlSchema.boolean: return parseBooleanInput(value, false);
    case ns.aml.vocabularies.shapes.nil:
    case ns.w3.xmlSchema.nil: 
      return null;
    default:
      return value;
  }
}

/**
 * Picks the union member to render.
 * @param {ApiShapeUnion[]} anyOf The list of union members
 * @param {string[]=} [selectedUnions=[]] Optional list of domain ids of currently selected unions. When set is returns a member that is "selected" or the first member otherwise.
 * @returns {ApiShapeUnion}
 */
export function getUnionMember(anyOf, selectedUnions=[]) {
  let renderedItem = /** @type ApiShapeUnion */ (null);
  if (Array.isArray(selectedUnions) && selectedUnions.length) {
    renderedItem = anyOf.find((item) => selectedUnions.includes(item.id));
  }
  if (!renderedItem) {
    [renderedItem] = anyOf;
  }
  return renderedItem;
}

/**
 * @param {ApiNodeShape} schema
 * @param {string[]=} [selectedUnions=[]]
 * @returns {ApiPropertyShape[]}
 */
export function collectNodeProperties(schema, selectedUnions) {
  /** @type ApiPropertyShape[] */
  let result = [];
  const { properties, inherits } = schema;
  if (properties.length) {
    result = [...properties];
  }
  if (Array.isArray(inherits) && inherits.length) {
    inherits.forEach((s) => {
      let node = s;
      if (node.types.includes(ns.aml.vocabularies.shapes.UnionShape)) {
        const union = /** @type ApiUnionShape */ (node);
        const { anyOf=[] } = union;
        node = getUnionMember(anyOf, selectedUnions);
      }
      if (!node.types.includes(ns.w3.shacl.NodeShape)) {
        return;
      }
      const typed = /** @type ApiNodeShape */ (node);
      // const p = typed.properties;
      // if (Array.isArray(p) && p.length) {
      //   result = result.concat(p);
      // }
      const upper = collectNodeProperties(typed);
      if (upper.length) {
        result = result.concat(upper)
      }
    });
  }
  /** @type ApiPropertyShape[] */
  const merged = [];
  result.forEach((item) => {
    const existing = merged.find(i => i.name === item.name);
    if (existing) {
      // this should (?) merge properties from the two.
      return;
    }
    merged.push(item);
  });
  return merged;
}
