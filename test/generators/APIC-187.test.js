import { assert } from '@open-wc/testing';
import { ApiSchemaGenerator } from '../../src/ApiSchemaGenerator.js';
import { TestHelper } from '../TestHelper.js';

/** @typedef {import('@api-components/amf-helper-mixin').AmfDocument} AmfDocument */
/** @typedef {import('@api-components/amf-helper-mixin').ApiAnyShape} ApiAnyShape */

describe('APIC-187', () => {
  /** @type TestHelper */
  let store;
  before(async () => {
    store = new TestHelper();
  });

  const jsonMime = 'application/json';
  const apiFile = 'APIC-187';

  [ true, false ].forEach((compact) => {
    describe(compact ? 'Compact model' : 'Full model', () => {
      /** @type AmfDocument */
      let model;

      before(async () => {
        model = await store.getGraph(apiFile, compact);
      });

      [
        ['AS400CityName', 'string', 'Omaha, DG'],
        ['AS400ECM', 'number', 401571.6],
        ['AcquiredDate', 'string', '2019-01-16'],
        ['Age', 'number', 1],
        ['TransmissionRearRearSN', 'string', '1'],
        ['TransmissionRearRatio', 'number', 1],
        ['Weight', 'number', 9300],
        ['Year', 'string', '2016'],
      ].forEach(item => {
        it(`returns ${item[1]} type (${item[0]})`, () => {
          const datatype = /** @type string */ (item[1]);
          const payload = store.getRequestPayloads(model, '/record', 'post')[0];
          const anyShape = /** @type ApiAnyShape */ (payload.schema);
          const result = ApiSchemaGenerator.asExample(anyShape, jsonMime, {
            renderExamples: true,
            renderOptional: true,
          });

          const data = JSON.parse(String(result.renderValue));
          assert.typeOf(
            data.records[0][item[0]],
            datatype,
            'Data type matches'
          );
          assert.equal(data.records[0][item[0]], item[2], 'Value matches');
        });
      });
    });
  });
});
