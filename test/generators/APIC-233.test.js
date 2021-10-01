import { assert } from '@open-wc/testing';
import { ApiExampleGenerator } from '../../src/ApiExampleGenerator.js';
import { TestHelper } from '../TestHelper.js';

/** @typedef {import('@api-components/amf-helper-mixin').AmfDocument} AmfDocument */
/** @typedef {import('@api-components/amf-helper-mixin').ApiAnyShape} ApiAnyShape */

describe('APIC-233', () => {
  /** @type TestHelper */
  let store;
  before(async () => {
    store = new TestHelper();
  });

  const jsonMime = 'application/json';
  const apiFile = 'APIC-233';

  [ true, false ].forEach((compact) => {
    describe(compact ? 'Compact model' : 'Full model', () => {
      /** @type ApiExampleGenerator */
      let reader;
      /** @type AmfDocument */
      let model;

      before(async () => {
        model = await store.getGraph(apiFile, compact);
        reader = new ApiExampleGenerator();
      });

      it('renders examples for arabic letters', () => {
        const payload = store.getResponsePayloads(model, '/stuff', 'get', '200')[0];
        const anyShape = /** @type ApiAnyShape */ (payload.schema);
        
        const result = reader.read(anyShape.examples[0], jsonMime);
        const body = JSON.parse(result);
        assert.typeOf(body, 'object', 'has the result');
        assert.deepEqual(body, {
          "الحالة": "حسنا",
          "message": "Shop in الممل"
        });
      });
    });
  });
});
