import { assert } from '@open-wc/testing';
import { ApiSchemaGenerator } from '../../src/ApiSchemaGenerator.js';
import { TestHelper } from '../TestHelper.js';

/** @typedef {import('@api-components/amf-helper-mixin').AmfDocument} AmfDocument */
/** @typedef {import('@api-components/amf-helper-mixin').ApiAnyShape} ApiAnyShape */

describe('APIC-690', () => {
  /** @type TestHelper */
  let store;
  before(async () => {
    store = new TestHelper();
  });

  const xmlMime = 'application/xml';
  const apiFile = 'APIC-690';

  [ true ].forEach((compact) => {
    describe(compact ? 'Compact model' : 'Full model', () => {
      /** @type AmfDocument */
      let model;

      before(async () => {
        model = await store.getGraph(apiFile, compact);
      });

      it('generates xml examples for an array body', () => {
        const payload = store.getResponsePayloads(model, '/customers', 'get', '200')[0];
        const anyShape = /** @type ApiAnyShape */ (payload.schema);
        const result = ApiSchemaGenerator.asExample(anyShape, xmlMime, {
          renderExamples: true,
        });
  
        assert.typeOf(result, 'object', 'generates the example');
        assert.typeOf(result.renderValue, 'string', 'has the value');
        
        const parser = new DOMParser();
        const schema = parser.parseFromString(`<root>${result.renderValue}</root>`, xmlMime);
        
        const root = schema.querySelector('root');
        const nodes = root.querySelectorAll('schema');
        assert.lengthOf(nodes, 2, 'has both examples generated');
        const testNode = nodes[1];
        
        assert.equal(testNode.querySelector('customerID').textContent.trim(), '1fe1c22s-3d3a-9n3v', 'has the customerID');
        assert.equal(testNode.querySelector('firstName').textContent.trim(), 'Molly', 'has the firstName');
        assert.equal(testNode.querySelector('lastName').textContent.trim(), 'Mule', 'has the lastName');
        assert.equal(testNode.querySelector('displayName').textContent.trim(), 'Molly the Mule', 'has the displayName');
        assert.equal(testNode.querySelector('phone').textContent.trim(), '415-000-0000', 'has the phone');
        assert.equal(testNode.querySelector('email').textContent.trim(), 'molly@mulesoft.com', 'has the email');
        assert.equal(testNode.querySelector('ssn').textContent.trim(), '321-654-0987', 'has the ssn');
        assert.equal(testNode.querySelector('dateOfBirth').textContent.trim(), '1990-09-04', 'has the dateOfBirth');
        
        const address = testNode.querySelector('address');
        assert.ok(address, 'has the address node');
    
        assert.equal(address.querySelector('addressLine1').textContent.trim(), '123 Street', 'has the address.addressLine1');
        assert.equal(address.querySelector('addressLine2').textContent.trim(), 'Apt.#3D', 'has the address.addressLine2');
        assert.equal(address.querySelector('city').textContent.trim(), 'San Francisco', 'has the address.city');
        assert.equal(address.querySelector('state').textContent.trim(), 'California', 'has the address.state');
        assert.equal(address.querySelector('zipCode').textContent.trim(), '94110', 'has the address.zipCode');
        assert.equal(address.querySelector('country').textContent.trim(), 'United States', 'has the address.country');
      });

    });
  });
});
