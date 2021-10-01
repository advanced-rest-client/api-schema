import { assert } from '@open-wc/testing';
import { ApiSchemaGenerator } from '../../src/ApiSchemaGenerator.js';
import { TestHelper } from '../TestHelper.js';

/** @typedef {import('@api-components/amf-helper-mixin').AmfDocument} AmfDocument */
/** @typedef {import('@api-components/amf-helper-mixin').ApiAnyShape} ApiAnyShape */

describe('SE-10469', () => {
  /** @type TestHelper */
  let store;
  before(async () => {
    store = new TestHelper();
  });

  const jsonMime = 'application/json';
  const apiFile = 'SE-10469';

  [ true, false ].forEach((compact) => {
    describe(compact ? 'Compact model' : 'Full model', () => {
      /** @type AmfDocument */
      let model;

      before(async () => {
        model = await store.getGraph(apiFile, compact);
      });

      it('generates example from JSON schema', () => {
        const payload = store.getRequestPayloads(model, '/purina/b2b/supplier/purchaseOrder', 'post')[0];
        const anyShape = /** @type ApiAnyShape */ (payload.schema);
        const result = ApiSchemaGenerator.asExample(anyShape, jsonMime, {
          renderExamples: true,
          renderOptional: true,
        });
        assert.typeOf(result, 'object', 'generates the example');
        assert.typeOf(result.renderValue, 'string', 'has the value');
        
        const data = JSON.parse(result.renderValue);
        assert.deepEqual(data, { actionCode: '', typeCode: '' });
      });
    });
  });
});
