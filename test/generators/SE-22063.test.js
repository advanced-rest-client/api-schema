import { assert } from '@open-wc/testing';
import { ApiSchemaGenerator } from '../../src/ApiSchemaGenerator.js';
import { TestHelper } from '../TestHelper.js';

/** @typedef {import('@api-components/amf-helper-mixin').AmfDocument} AmfDocument */
/** @typedef {import('@api-components/amf-helper-mixin').ApiAnyShape} ApiAnyShape */

describe('SE-22063', () => {
  /** @type TestHelper */
  let store;
  before(async () => {
    store = new TestHelper();
  });

  const xmlMime = 'application/xml';
  const apiFile = 'SE-22063';

  [ true, false ].forEach((compact) => {
    describe(compact ? 'Compact model' : 'Full model', () => {
      /** @type AmfDocument */
      let model;

      before(async () => {
        model = await store.getGraph(apiFile, compact);
      });

      it('generates xml example using xml name and xml wrap', () => {
        const payload = store.getRequestPayloads(model, '/demo', 'post')[0];
        
        const anyShape = /** @type ApiAnyShape */ (payload.schema);
        const result = ApiSchemaGenerator.asExample(anyShape, xmlMime, {
          renderExamples: true,
          renderOptional: true,
        });

        assert.typeOf(result, 'object', 'generates the example');
        assert.typeOf(result.renderValue, 'string', 'has the value');

        assert.equal(
          result.renderValue,
          '<StockBalance>\n' +
          '  <type>site</type>\n' +
          '  <item>\n' +
          '    <StockLine>\n' +
          '      <ssccNumber>P19227</ssccNumber>\n' +
          '      <materialReference>CL54B</materialReference>\n' +
          '      <variantId>R0029</variantId>\n' +
          '      <batch>BA02931</batch>\n' +
          '      <quantity>1</quantity>\n' +
          '    </StockLine>\n' +
          '  </item>\n' +
          '</StockBalance>'
        );
      });
    });
  });
});
