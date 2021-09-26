import { assert } from '@open-wc/testing';
import { ApiSchemaValues } from '../../src/ApiSchemaValues.js';
import { TestHelper } from '../TestHelper.js';

/** @typedef {import('@api-components/amf-helper-mixin').AmfDocument} AmfDocument */
/** @typedef {import('@api-components/amf-helper-mixin').ApiScalarShape} ApiScalarShape */

describe('ApiSchemaValues', () => {
  describe('APIC-689', () => {
    const apiFile = 'APIC-689';

    /** @type TestHelper */
    let store;
    before(async () => {
      store = new TestHelper();
    });

    [true, false].forEach((compact) => {
      describe(compact ? 'Compact model' : 'Full model', () => {
        /** @type AmfDocument */
        let model;

        before(async () => {
          model = await store.getGraph(compact ? apiFile : `${apiFile}-compact`);
        });

        it('does not set URL query param for an optional enum', async () => {
          const param = store.getParameter(model, '/test', 'get', 'param1');
          const result = ApiSchemaValues.readInputValue(param, /** @type ApiScalarShape */ (param.schema), { requiredOnly: true });
          assert.isUndefined(result, 'has the empty default value (from schema type)');
        });

        it('returns the first enum value', async () => {
          const param = store.getParameter(model, '/test', 'post', 'param1');
          const result = ApiSchemaValues.readInputValue(param, /** @type ApiScalarShape */ (param.schema), { requiredOnly: true });
          assert.equal(result, 'A', 'has the first enum type');
        });
      });
    });
  });
});
