/* eslint-disable class-methods-use-this */
import { DataNodeBase } from './DataNodeBase.js';
import { toXml } from '../Utils.js';

/** @typedef {import('@api-components/amf-helper-mixin').ApiDataNode} ApiDataNode */
/** @typedef {import('@api-components/amf-helper-mixin').ApiShapeUnion} ApiShapeUnion */
/**
 * A class that processes AMF's `structuredValue` into an XML example.
 */
export class XmlDataNodeGenerator extends DataNodeBase {
  /**
   * Generates a JSON example from the structured value.
   * 
   * @param {ApiDataNode} node The AMF's data node to transform into a schema.
   * @param {string=} shapeName When provided it wraps the returned value with the shape name.
   * @returns {string|undefined} Undefined when passed non-DataNode domain element.
   */
  generate(node, shapeName) {
    const result = this.processNode(node);
    if (!result) {
      return result;
    }
    if (shapeName) {
      if (Array.isArray(result)) {
        return result.map(v => `<${shapeName}>${v}</${shapeName}>`).filter(v => !!v).join('\n');
      }
      return `<${shapeName}>${result}</${shapeName}>`;
    }
    return toXml(result);
  }
}
