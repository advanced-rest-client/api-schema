import { assert } from '@open-wc/testing';
import { ApiSchemaGenerator } from '../../src/ApiSchemaGenerator.js';
import { TestHelper } from '../TestHelper.js';

/** @typedef {import('@api-components/amf-helper-mixin').AmfDocument} AmfDocument */
/** @typedef {import('@api-components/amf-helper-mixin').ApiAnyShape} ApiAnyShape */

describe('APIC-655', () => {
  /** @type TestHelper */
  let store;
  before(async () => {
    store = new TestHelper();
  });

  const xmlMime = 'application/xml';
  const apiFile = 'APIC-655';

  [ true, false ].forEach((compact) => {
    describe(compact ? 'Compact model' : 'Full model', () => {
      /** @type AmfDocument */
      let model;

      before(async () => {
        model = await store.getGraph(apiFile, compact);
      });

      it('generate XML tags correctly for payloads examples', () => {
        const payload = store.getRequestPayloads(model, '/delivery', 'post')[0];
        
        const anyShape = /** @type ApiAnyShape */ (payload.schema);
        const result = ApiSchemaGenerator.asExample(anyShape, xmlMime, {
          renderExamples: true,
          renderOptional: true,
        });
        
        assert.equal(result.renderValue,
          '<Delivery>\n' +
          '  <orderId>732482783718</orderId>\n' +
          '  <lineItems>\n' +
          '    <lineItemId>9738187235</lineItemId>\n' +
          '    <qty>10</qty>\n' +
          '  </lineItems>\n' +
          '  <lineItems>\n' +
          '    <lineItemId>9832837238</lineItemId>\n' +
          '    <qty>70</qty>\n' +
          '  </lineItems>\n' +
          '</Delivery>'
        );
      });
    });
  });
});
