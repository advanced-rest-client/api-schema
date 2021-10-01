import { assert } from '@open-wc/testing';
import { ApiSchemaGenerator } from '../../src/ApiSchemaGenerator.js';
import { TestHelper } from '../TestHelper.js';

/** @typedef {import('@api-components/amf-helper-mixin').AmfDocument} AmfDocument */
/** @typedef {import('@api-components/amf-helper-mixin').ApiAnyShape} ApiAnyShape */

describe('APIC-188', () => {
  /** @type TestHelper */
  let store;
  before(async () => {
    store = new TestHelper();
  });

  const jsonMime = 'application/json';
  const apiFile = 'APIC-188';

  [ true, false ].forEach((compact) => {
    describe(compact ? 'Compact model' : 'Full model', () => {
      /** @type AmfDocument */
      let model;

      before(async () => {
        model = await store.getGraph(apiFile, compact);
      });

      it(`computes a false example`, () => {
        const payload = store.getRequestPayloads(model, '/record', 'post')[0];
        const anyShape = /** @type ApiAnyShape */ (payload.schema);
        const result = ApiSchemaGenerator.asExample(anyShape, jsonMime, {
          renderExamples: true,
          renderOptional: true,
        });

        const data = JSON.parse(String(result.renderValue));
        assert.isFalse(data.allOrNone);
        assert.typeOf(data.records, 'array');
      });
    });
  });
});
