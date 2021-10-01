import { assert } from '@open-wc/testing';
import { ApiSchemaGenerator } from '../../src/ApiSchemaGenerator.js';
import { TestHelper } from '../TestHelper.js';

/** @typedef {import('@api-components/amf-helper-mixin').AmfDocument} AmfDocument */
/** @typedef {import('@api-components/amf-helper-mixin').ApiAnyShape} ApiAnyShape */

describe('XML processing', () => {
  /** @type TestHelper */
  let store;
  before(async () => {
    store = new TestHelper();
  });

  const xmlMime = 'application/xml';
  [ true, false ].forEach((compact) => {
    describe(compact ? 'Compact model' : 'Full model', () => {
      /** @type AmfDocument */
      let model;

      before(async () => {
        model = await store.getGraph('example-generator-api', compact);
      });

      it('basic formatting and type name', () => {
        const payload = store.getRequestPayloads(model, '/IncludedInType', 'post')[0];
      
        const anyShape = /** @type ApiAnyShape */ (payload.schema);
        const result = ApiSchemaGenerator.asExample(anyShape, xmlMime, {
          renderExamples: true,
          renderOptional: true,
        });

        assert.typeOf(result, 'object', 'generates the example');
        assert.typeOf(result.renderValue, 'string', 'has the value');
        
        assert.include(result.renderValue, '<Person>', 'Type name is set');
        assert.include(result.renderValue, ' <error>false</error>', 'XML is formatted');
        assert.include(
          result.renderValue,
          ' <image>\n',
          'Complex type is formatted'
        );
        assert.include(
          result.renderValue,
          ' </image>\n',
          'Complex type is formatted at the end'
        );
      });

      it('adds attribute to parent type (no examples)', () => {
        const payload = store.getRequestPayloads(model, '/IncludedInType', 'post')[0];
      
        const anyShape = /** @type ApiAnyShape */ (payload.schema);
        const result = ApiSchemaGenerator.asExample(anyShape, xmlMime, {
          renderExamples: false,
          renderOptional: true,
        });
        
        assert.typeOf(result, 'object', 'generates the example');
        assert.typeOf(result.renderValue, 'string', 'has the value');

        assert.include(
          result.renderValue,
          '<Person error="false">',
          'Type has attributes'
        );
      });

      it('uses example from RAML example', () => {
        const payload = store.getRequestPayloads(model, '/typeExamples', 'post')[0];
      
        const anyShape = /** @type ApiAnyShape */ (payload.schema);
        const result = ApiSchemaGenerator.asExample(anyShape, xmlMime, {
          renderExamples: true,
          renderOptional: true,
        });
        
        assert.typeOf(result, 'object', 'generates the example');
        assert.typeOf(result.renderValue, 'string', 'has the value');

        assert.include(
          result.renderValue,
          '<firstName>Pawel</firstName>',
          'has example value'
        );
        assert.include(result.renderValue, '  <firstName>', 'example is formatted');
      });

      it('uses example from property example', () => {
        const payload = store.getRequestPayloads(model, '/propertyExamples', 'post')[0];
      
        const anyShape = /** @type ApiAnyShape */ (payload.schema);
        const result = ApiSchemaGenerator.asExample(anyShape, xmlMime, {
          renderExamples: true,
          renderOptional: true,
        });
        
        assert.typeOf(result, 'object', 'generates the example');
        assert.typeOf(result.renderValue, 'string', 'has the value');
        
        assert.include(result.renderValue, '<zip>00000</zip>', 'has example value');
        assert.include(result.renderValue, '<street></street>', 'has default empty value');
        assert.include(
          result.renderValue,
          '    <street></street>',
          'example value is formatted'
        );
      });

      it('renders array types', () => {
        const payload = store.getRequestPayloads(model, '/ArrayType', 'post')[0];
      
        const anyShape = /** @type ApiAnyShape */ (payload.schema);
        const result = ApiSchemaGenerator.asExample(anyShape, xmlMime, {
          renderExamples: true,
          renderOptional: true,
        });

        assert.typeOf(result, 'object', 'generates the example');
        assert.typeOf(result.renderValue, 'string', 'has the value');
        
        assert.include(result.renderValue, '<ArrayType>\n', 'has parent type name');
        // the type is not wrapped so it cannot have `Image` tag.
        // assert.include(result.renderValue, '  <Image>', 'has item type name');
      });

      it('generates examples for array type (inline included)', () => {
        const payload = store.getRequestPayloads(model, '/arrayPropertyGeneratedExamples', 'post')[0];
      
        const anyShape = /** @type ApiAnyShape */ (payload.schema);
        const result = ApiSchemaGenerator.asExample(anyShape, xmlMime, {
          renderExamples: true,
          renderOptional: true,
        });

        assert.typeOf(result, 'object', 'generates the example');
        assert.typeOf(result.renderValue, 'string', 'has the value');
        
        assert.include(result.renderValue, '<schema>\n', 'has parent type name');
        assert.include(result.renderValue, '  <test>false</test>', 'has property name');
        // the type is not wrapped so it cannot have `items` tag.
        // assert.include(result.renderValue, '  <items>', 'has item type name');
      });

      it('generates examples for wrapped annotation', () => {
        const payload = store.getRequestPayloads(model, '/wrappedXml', 'post')[0];
      
        const anyShape = /** @type ApiAnyShape */ (payload.schema);
        const result = ApiSchemaGenerator.asExample(anyShape, xmlMime, {
          renderExamples: true,
          renderOptional: true,
        });

        assert.typeOf(result, 'object', 'generates the example');
        assert.typeOf(result.renderValue, 'string', 'has the value');
        
        assert.include(result.renderValue, '<Imgs>\n', 'has parent type name');
        assert.include(
          result.renderValue,
          '  <something></something>',
          'has parent properties'
        );
        assert.include(result.renderValue, '  <images>', 'has wrapped outer element');
        assert.include(result.renderValue, '    <Image>', 'has wrapped object');
      });

      it('renders default name for an inline included types', () => {
        const payload = store.getRequestPayloads(model, '/user-raml-example', 'post')[0];
      
        const anyShape = /** @type ApiAnyShape */ (payload.schema);
        const result = ApiSchemaGenerator.asExample(anyShape, xmlMime, {
          renderExamples: true,
          renderOptional: true,
        });

        assert.typeOf(result, 'object', 'generates the example');
        assert.typeOf(result.renderValue, 'string', 'has the value');
        
        assert.include(result.renderValue, '<type>\n', 'has default name');
        assert.include(result.renderValue, '  <id>uid1</id>', 'has properties');
      });

      it('renders RAML named example', () => {
        const payload = store.getRequestPayloads(model, '/named-example', 'post')[0];
      
        const anyShape = /** @type ApiAnyShape */ (payload.schema);
        const result = ApiSchemaGenerator.asExample(anyShape, xmlMime, {
          renderExamples: true,
          renderOptional: true,
        });

        assert.typeOf(result, 'object', 'generates the example');
        assert.typeOf(result.renderValue, 'string', 'has the value');
        
        assert.include(result.renderValue, '<schema>\n', 'has AMF default name');
        assert.include(
          result.renderValue,
          '<countryCode>BE</countryCode>',
          'has properties'
        );
      });

      it('renders RAML linked named example', () => {
        const payload = store.getRequestPayloads(model, '/named-linked-example', 'post')[0];
      
        const anyShape = /** @type ApiAnyShape */ (payload.schema);
        const result = ApiSchemaGenerator.asExample(anyShape, xmlMime, {
          renderExamples: true,
          renderOptional: true,
        });

        assert.typeOf(result, 'object', 'generates the example');
        assert.typeOf(result.renderValue, 'string', 'has the value');
        
        assert.include(result.renderValue, '<schema>\n', 'has AMF default name');
        assert.include(result.renderValue, '<company>\n', 'has properties');
        assert.include(
          result.renderValue,
          '<countryCode>BE</countryCode>\n',
          'has deep properties'
        );
      });

      it('renders typed valued', () => {
        const payload = store.getRequestPayloads(model, '/data-types', 'post')[0];
      
        const anyShape = /** @type ApiAnyShape */ (payload.schema);
        const result = ApiSchemaGenerator.asExample(anyShape, xmlMime, {
          renderExamples: true,
          renderOptional: true,
        });

        assert.typeOf(result, 'object', 'generates the example');
        assert.typeOf(result.renderValue, 'string', 'has the value');
        
        const { renderValue } = result;

        assert.include(
          renderValue,
          '<typeString>String example</typeString>',
          'has string value'
        );
        assert.include(
          renderValue,
          '<typeNumber>123456</typeNumber>',
          'has number value'
        );
        assert.include(renderValue, '<typeInt>1234546</typeInt>', 'has int value');
        assert.include(
          renderValue,
          '<typeDecimal>10.67</typeDecimal>',
          'has decimal value'
        );
        assert.include(
          renderValue,
          '<typeBool>true</typeBool>',
          'has boolean value'
        );
        
        assert.include(renderValue, '<typeNull></typeNull>', 'has null value');
        assert.include(
          renderValue,
          '<typeNegativeInt>-12</typeNegativeInt>',
          'has negative int value'
        );
        assert.include(
          renderValue,
          '<typeNumberFormatInt64>8</typeNumberFormatInt64>',
          'has Int64 value'
        );
        assert.include(
          renderValue,
          '<typeNumFormatInt32>109298</typeNumFormatInt32>',
          'has Num32 value'
        );
        assert.include(
          renderValue,
          '<typeNumFormatInt16>2</typeNumFormatInt16>',
          'has Num16 value'
        );
        assert.include(
          renderValue,
          '<typeNumFormatInt8>1</typeNumFormatInt8>',
          'has Num8 value'
        );
        assert.include(
          renderValue,
          '<typeIntFormatInt8>12</typeIntFormatInt8>',
          'has Int8 value'
        );
        assert.include(
          renderValue,
          '<typeNumFormatInt>11</typeNumFormatInt>',
          'has Num value'
        );
        assert.include(
          renderValue,
          '<typeNumFormatLong>123456789</typeNumFormatLong>',
          'has long value'
        );
        assert.include(
          renderValue,
          '<typeNumFormatFloat>1234567.89</typeNumFormatFloat>',
          'has float value'
        );
        assert.include(
          renderValue,
          '<typeNumFormatDouble>1234.56789</typeNumFormatDouble>',
          'has double value'
        );
      });
    });
  });
});
