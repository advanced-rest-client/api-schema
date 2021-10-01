import { assert } from '@open-wc/testing';
import { ApiSchemaGenerator } from '../../src/ApiSchemaGenerator.js';
import { TestHelper } from '../TestHelper.js';

/** @typedef {import('@api-components/amf-helper-mixin').AmfDocument} AmfDocument */
/** @typedef {import('@api-components/amf-helper-mixin').ApiAnyShape} ApiAnyShape */

describe('APIC-487', () => {
  /** @type TestHelper */
  let store;
  before(async () => {
    store = new TestHelper();
  });

  const xmlMime = 'application/xml';
  const apiFile = 'APIC-487';

  [ true, false ].forEach((compact) => {
    describe(compact ? 'Compact model' : 'Full model', () => {
      /** @type AmfDocument */
      let model;

      before(async () => {
        model = await store.getGraph(apiFile, compact);
      });

      it('returns an example when not XML wrapped', () => {
        const payload = store.getResponsePayloads(model, '/test1', 'get', '200')[0];
        const anyShape = /** @type ApiAnyShape */ (payload.schema);
        const result = ApiSchemaGenerator.asExample(anyShape, xmlMime, {
          renderExamples: true,
        });
        
        assert.typeOf(result, 'object', 'generates the example');
        const expectedExample =
          '<Person>\n  <addresses>\n    <street></street>\n    <city></city>\n  </addresses>\n</Person>';
        assert.equal(result.renderValue, expectedExample);
      });

      it('returns an example when XML wrapped', () => {
        const payload = store.getResponsePayloads(model, '/test2', 'post', '200')[0];
        const anyShape = /** @type ApiAnyShape */ (payload.schema);
        const result = ApiSchemaGenerator.asExample(anyShape, xmlMime, {
          renderExamples: true,
        });
        
        assert.typeOf(result, 'object', 'generates the example');
        const expectedExample =
          '<WrappedPerson>\n  <addresses>\n    <Address>\n      <street></street>\n      <city></city>\n    </Address>\n  </addresses>\n</WrappedPerson>';
        // this RAML has no name defined for a wrapped property so it inherits the name from the parent.
        assert.equal(result.renderValue, expectedExample);
      });
    });
  });
});
