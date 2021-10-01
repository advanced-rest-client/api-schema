import { assert } from '@open-wc/testing';
import { ApiSchemaGenerator } from '../../src/ApiSchemaGenerator.js';
import { TestHelper } from '../TestHelper.js';

/** @typedef {import('@api-components/amf-helper-mixin').AmfDocument} AmfDocument */
/** @typedef {import('@api-components/amf-helper-mixin').ApiAnyShape} ApiAnyShape */

describe('RAML examples', () => {
  /** @type TestHelper */
  let store;
  before(async () => {
    store = new TestHelper();
  });

  const jsonMime = 'application/json';
  const xmlMime = 'application/xml';
  const apiFile = 'example-generator-api';

  [ true, false ].forEach((compact) => {
    describe(compact ? 'Compact model' : 'Full model', () => {
      /** @type AmfDocument */
      let model;

      before(async () => {
        model = await store.getGraph(apiFile, compact);
      });

      it('generates JSON example for a payload', () => {
        const payload = store.getRequestPayloads(model, '/employees', 'post')[1];
        const anyShape = /** @type ApiAnyShape */ (payload.schema);
        const result = ApiSchemaGenerator.asExample(anyShape, jsonMime, {
          renderExamples: true,
          renderOptional: true,
        });
        const { mediaType, value, renderValue } = result;
        assert.equal(mediaType, jsonMime, 'mediaType is set');
        assert.include(value, 'firstName: Other Pawel', 'value has the raw value');
        assert.include(renderValue, '"firstName": "Other Pawel",', 'renderValue has the example value');
      });

      it('generates XML example for a payload', () => {
        const payload = store.getRequestPayloads(model, '/employees', 'post')[1];
        const anyShape = /** @type ApiAnyShape */ (payload.schema);
        const result = ApiSchemaGenerator.asExample(anyShape, xmlMime, {
          renderExamples: true,
          renderOptional: true,
        });
        const { mediaType, value, renderValue } = result;
        assert.equal(mediaType, xmlMime, 'mediaType is set');
        assert.include(value, 'firstName: Other Pawel', 'value has the raw value');
        assert.include(renderValue, '<firstName>Other Pawel</firstName>', 'renderValue has the example value');
      });
    });
  });
});
