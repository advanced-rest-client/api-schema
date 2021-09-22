/* eslint-disable class-methods-use-this */
import { wwwFormUrlEncode } from '../Utils.js';
import { DataNodeBase } from './DataNodeBase.js';

/** @typedef {import('@api-components/amf-helper-mixin').ApiDataNode} ApiDataNode */

export class UrlEncodedDataNodeGenerator extends DataNodeBase {
  /**
   * Generates a JSON example from the structured value.
   * @param {ApiDataNode} node The AMF's data node to transform into a schema.
   * @param {string=} shapeName When provided it wraps the returned value with the shape name.
   * @returns {string|undefined} Undefined when passed non-DataNode domain element.
   */
  generate(node, shapeName) {
    const result = this.processNode(node);
    const isArray = Array.isArray(result);
    if (shapeName && (typeof result !== 'object' || isArray)) {
      if (isArray) {
        return /** @type any[] */ (result).map(v => `${shapeName}[]=${v}`).filter(v => !!v).join('&');
      }
      return `${shapeName}=${result}`;
    }
    return this.createUrlEncoded(result);
  }

  /**
   * @param {any} obj
   * @returns {string} 
   */
  createUrlEncoded(obj) {
    if (typeof obj !== 'object') {
      return String(obj);
    }
    const parts = Object.keys(obj).map((key) => {
      let value = obj[key];
      if (typeof value === 'object') {
        value = this.createUrlEncoded(value);
      } else {
        value = wwwFormUrlEncode(value, true);
      }
      return `${key}=${value}`;
    });
    return parts.join('&');
  }
}
