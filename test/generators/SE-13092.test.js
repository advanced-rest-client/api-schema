import { assert } from '@open-wc/testing';
import { ApiSchemaGenerator } from '../../src/ApiSchemaGenerator.js';
import { TestHelper } from '../TestHelper.js';

/** @typedef {import('@api-components/amf-helper-mixin').AmfDocument} AmfDocument */
/** @typedef {import('@api-components/amf-helper-mixin').ApiAnyShape} ApiAnyShape */

describe('SE-13092', () => {
  /** @type TestHelper */
  let store;
  before(async () => {
    store = new TestHelper();
  });

  const xmlMime = 'application/xml';
  const apiFile = 'SE-13092';

  [ true, false ].forEach((compact) => {
    describe(compact ? 'Compact model' : 'Full model', () => {
      /** @type AmfDocument */
      let model;

      before(async () => {
        model = await store.getGraph(apiFile, compact);
      });

      it('generates name from data type fragment included into types map', () => {
        const payload = store.getResponsePayloads(model, '/customer', 'post', '200')[0];
        const anyShape = /** @type ApiAnyShape */ (payload.schema);
        const result = ApiSchemaGenerator.asExample(anyShape, xmlMime, {
          renderExamples: true,
        });

        assert.typeOf(result, 'object', 'generates the example');
        assert.typeOf(result.renderValue, 'string', 'has the value');
        
        const { renderValue } = result;
        assert.include(renderValue, '<Person>', 'generates type name (opening tag)');
        assert.include(renderValue, '</Person>', 'generates type name (closing tag)');
      });

      // This should be incorrect but the AMF model includes name anyway.
      // Detailed discussion about this: https://www.mulesoft.org/jira/browse/SE-13092
      it('generates name from inline include for data type fragment included into types map', () => {
        const payload = store.getResponsePayloads(model, '/should-be-incorrect', 'post', '200')[0];
        const anyShape = /** @type ApiAnyShape */ (payload.schema);
        const result = ApiSchemaGenerator.asExample(anyShape, xmlMime, {
          renderExamples: true,
        });

        assert.typeOf(result, 'object', 'generates the example');
        assert.typeOf(result.renderValue, 'string', 'has the value');

        const { renderValue } = result;
        assert.include(renderValue, '<type>', 'generates type name (opening tag)');
        assert.include(renderValue, '</type>', 'generates type name (closing tag)');
      });

      it('uses default name for data type not fragment included into types map', () => {
        const payload = store.getResponsePayloads(model, '/incorrect-way', 'post', '200')[0];
        const anyShape = /** @type ApiAnyShape */ (payload.schema);
        const result = ApiSchemaGenerator.asExample(anyShape, xmlMime, {
          renderExamples: true,
        });

        assert.typeOf(result, 'object', 'generates the example');
        assert.typeOf(result.renderValue, 'string', 'has the value');
        
        const { renderValue } = result;
        assert.include(renderValue, '<type>', 'uses type name (opening tag)');
        assert.include(renderValue, '</type>', 'uses type name (closing tag)');
      });
    });
  });
});
