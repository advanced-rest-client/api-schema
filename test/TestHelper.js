import { AmfHelperMixin, AmfSerializer } from '@api-components/amf-helper-mixin';

/** @typedef {import('@api-components/amf-helper-mixin').AmfDocument} AmfDocument */
/** @typedef {import('@api-components/amf-helper-mixin').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('@api-components/amf-helper-mixin').ApiParameter} ApiParameter */
/** @typedef {import('@api-components/amf-helper-mixin').Shape} Shape */
/** @typedef {import('@api-components/amf-helper-mixin').EndPoint} EndPoint */
/** @typedef {import('@api-components/amf-helper-mixin').Operation} Operation */
/** @typedef {import('@api-components/amf-helper-mixin').Request} Request */

export class TestHelper extends AmfHelperMixin(Object) {
  /**
   * Reads AMF graph model as string
   * @param {string} [fileName='demo-api']
   * @returns {Promise<AmfDocument>} 
   */
  async getGraph(fileName='demo-api') {
    const file = `${fileName}.json`;
    const url = `${window.location.protocol}//${window.location.host}/demo/${file}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Unable to download API data model');
    }
    let result = await response.json();
    if (Array.isArray(result)) {
      [result] = result;
    }
    return result;
  }

  /**
   * @param {any} model
   * @param {string} endpoint
   * @return {EndPoint}
   */
  getEndpoint(model, endpoint) {
    this.amf = model;
    const webApi = this._computeApi(model);
    return this._computeEndpointByPath(webApi, endpoint);
  }

  /**
   * @param {Object} model
   * @param {string} endpoint
   * @param {string} operation
   * @return {Operation}
   */
  getOperation(model, endpoint, operation) {
    const endPoint = this.getEndpoint(model, endpoint);
    const opKey = this._getAmfKey(this.ns.aml.vocabularies.apiContract.supportedOperation);
    const ops = this._ensureArray(endPoint[opKey]);
    return ops.find((item) => this._getValue(item, this.ns.aml.vocabularies.apiContract.method) === operation);
  }

  /**
   * @param {Object} model
   * @param {string} endpoint
   * @param {string} operation
   * @return {Request}
   */
  getExpects(model, endpoint, operation) {
    const op = this.getOperation(model, endpoint, operation);
    if (!op) {
      throw new Error(`Unknown operation for path ${endpoint} and method ${operation}`);
    }
    let expects = op[this._getAmfKey(this.ns.aml.vocabularies.apiContract.expects)];
    if (!expects) {
      throw new Error(`Operation has no "expects" value.`);
    }
    if (Array.isArray(expects)) {
      [expects] = expects;
    }
    return expects;
  }

  /**
   * @param {AmfDocument} model 
   * @param {string} name
   * @returns {ApiShapeUnion} 
   */
  getShape(model, name) {
    this.amf = model;
    const items = this._computeDeclares(model);
    const type = items.find((item) => {
      const typed = /** @type Shape */ (item);
      const objectName = this._getValue(typed, this.ns.w3.shacl.name);
      return objectName === name;
    });
    if (!type) {
      throw new Error(`The shape ${name} does not exist in the API.`);
    }
    const serializer = new AmfSerializer(model);
    return serializer.unknownShape(type);
  }

  /**
   * Reads a request parameter from an operation for: URI, query params, headers, and cookies.
   * 
   * @param {AmfDocument} model 
   * @param {string} endpoint The endpoint path
   * @param {string} operation The operation path
   * @param {string} param The param name
   * @returns {ApiParameter} 
   */
  getParameter(model, endpoint, operation, param) {
    const expects = this.getExpects(model, endpoint, operation);
    if (!expects) {
      throw new Error(`The operation ${operation} of endpoint ${endpoint} has no request.`);
    }

    const serializer = new AmfSerializer(model);
    const request = serializer.request(expects);
    if (!request) {
      throw new Error(`The operation ${operation} of endpoint ${endpoint} has no request.`);
    }
    /** @type ApiParameter[] */
    let pool = [];
    if (Array.isArray(request.uriParameters)) {
      pool = pool.concat(request.uriParameters);
    }
    if (Array.isArray(request.cookieParameters)) {
      pool = pool.concat(request.cookieParameters);
    }
    if (Array.isArray(request.queryParameters)) {
      pool = pool.concat(request.queryParameters);
    }
    if (Array.isArray(request.headers)) {
      pool = pool.concat(request.headers);
    }
    const result = pool.find(i => i.name === param);
    if (!result) {
      throw new Error(`Parameter ${param} not found.`);
    }
    return result;
  }
}
