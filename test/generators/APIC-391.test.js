import { assert } from '@open-wc/testing';
import { ApiSchemaGenerator } from '../../src/ApiSchemaGenerator.js';
import { TestHelper } from '../TestHelper.js';

/** @typedef {import('@api-components/amf-helper-mixin').AmfDocument} AmfDocument */
/** @typedef {import('@api-components/amf-helper-mixin').ApiAnyShape} ApiAnyShape */

describe('APIC-391', () => {
  /** @type TestHelper */
  let store;
  before(async () => {
    store = new TestHelper();
  });

  const xmlMime = 'application/xml';
  const apiFile = 'APIC-391';

  [ true, false ].forEach((compact) => {
    describe(compact ? 'Compact model' : 'Full model', () => {
      /** @type AmfDocument */
      let model;

      before(async () => {
        model = await store.getGraph(apiFile, compact);
      });

      it('generate XML tags correctly for payloads examples', () => {
        const payload = store.getRequestPayloads(model, '/shipment-requests', 'post')[0];
        
        const anyShape = /** @type ApiAnyShape */ (payload.schema);
        const result = ApiSchemaGenerator.asExample(anyShape, xmlMime, {
          renderExamples: true,
          renderOptional: true,
        });
        
        assert.equal(result.renderValue,
          '<unknown-type>\n' +
          '  <address>250 HIDEOUT LN</address>\n' +
          '  <comments>Orgin comments entered here.</comments>\n' +
          '  <references>\n' +
          '    <referenceType>Delivery Note</referenceType>\n' +
          '    <referenceValue>7328</referenceValue>\n' +
          '  </references>\n' +
          '</unknown-type>',
        );

      });
    });
  });
});
