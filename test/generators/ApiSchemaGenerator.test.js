import { ns } from '@api-components/amf-helper-mixin';
import { assert } from '@open-wc/testing';
import { ApiSchemaGenerator } from '../../src/ApiSchemaGenerator.js';
import { TestHelper } from '../TestHelper.js';

/** @typedef {import('@api-components/amf-helper-mixin').AmfDocument} AmfDocument */
/** @typedef {import('@api-components/amf-helper-mixin').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('@api-components/amf-helper-mixin').ApiUnionShape} ApiUnionShape */

describe('ApiSchemaGenerator', () => {
  /** @type TestHelper */
  let store;
  before(async () => {
    store = new TestHelper();
  });

  const jsonMime = 'application/json';
  const xmlMime = 'application/xml';

  describe('scalar values', () => {
    /** @type AmfDocument */
    let model;

    before(async () => {
      model = await store.getGraph('demo-api');
    });

    describe(jsonMime, () => {
      it('generates a schema without a value', async () => {
        const shape = store.getShape(model, 'ScalarType');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime);
        assert.strictEqual(result, '');
      });

      it('generates a schema with the default value', async () => {
        const shape = store.getShape(model, 'ScalarWithTraits');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime);
        assert.strictEqual(result, 'test');
      });

      it('generates a schema with the example value', async () => {
        const shape = store.getShape(model, 'ScalarWithExample');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime, {
          renderExamples: true,
        });
        assert.strictEqual(result, 'A string');
      });

      it('generates a schema with the first enum value', async () => {
        const shape = store.getShape(model, 'ScalarWithEnum');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime);
        assert.strictEqual(result, 'A');
      });

      // Apparently AMF does not move properties from the parent scalar shape
      it.skip('generates a schema for a parent', async () => {
        const shape = store.getShape(model, 'ScalarWithParent');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime);
        assert.strictEqual(result, 'test');
      });

      it('generates the example', async () => {
        const shape = store.getShape(model, 'ScalarWithExample');
        const result = ApiSchemaGenerator.asExample(shape, jsonMime, {
          renderExamples: true,
        });
        assert.typeOf(result, 'object', 'returns an object');
        assert.isTrue(result.strict, 'has the strict property');
        assert.deepEqual(result.types, [ns.aml.vocabularies.apiContract.Example], 'has the types property');
        assert.equal(result.mediaType, jsonMime, 'has the mediaType property');
        assert.strictEqual(result.renderValue, 'A string', 'has the value');
      });
    });

    describe(xmlMime, () => {
      it('generates a schema without a value', async () => {
        const shape = store.getShape(model, 'ScalarType');
        const result = ApiSchemaGenerator.asSchema(shape, xmlMime);
        assert.strictEqual(result, '<ScalarType></ScalarType>');
      });

      it('generates a schema with the default value', async () => {
        const shape = store.getShape(model, 'ScalarWithTraits');
        const result = ApiSchemaGenerator.asSchema(shape, xmlMime);
        assert.strictEqual(result, '<ScalarWithTraits>test</ScalarWithTraits>');
      });

      it('generates a schema with the example value', async () => {
        const shape = store.getShape(model, 'ScalarWithExample');
        const result = ApiSchemaGenerator.asSchema(shape, xmlMime, {
          renderExamples: true,
        });
        assert.strictEqual(result, '<ScalarWithExample>A string</ScalarWithExample>');
      });

      it('generates a schema with the first enum value', async () => {
        const shape = store.getShape(model, 'ScalarWithEnum');
        const result = ApiSchemaGenerator.asSchema(shape, xmlMime);
        assert.strictEqual(result, '<ScalarWithEnum>A</ScalarWithEnum>');
      });

      // Apparently AMF does not move properties from the parent scalar shape
      it.skip('generates a schema for a parent', async () => {
        const shape = store.getShape(model, 'ScalarWithParent');
        const result = ApiSchemaGenerator.asSchema(shape, xmlMime);
        assert.strictEqual(result, '<ScalarWithParent>test</ScalarWithParent>');
      });

      it('generates the example', async () => {
        const shape = store.getShape(model, 'ScalarWithExample');
        const result = ApiSchemaGenerator.asExample(shape, xmlMime, {
          renderExamples: true,
        });
        assert.typeOf(result, 'object', 'returns an object');
        assert.isTrue(result.strict, 'has the strict property');
        assert.deepEqual(result.types, [ns.aml.vocabularies.apiContract.Example], 'has the types property');
        assert.equal(result.mediaType, xmlMime, 'has the mediaType property');
        assert.strictEqual(result.renderValue, '<ScalarWithExample>A string</ScalarWithExample>', 'has the value');
      });
    });
  });

  describe('object values', () => {
    /** @type AmfDocument */
    let model;

    before(async () => {
      model = await store.getGraph('demo-api');
    });

    describe(jsonMime, () => {
      it('generates a schema for a simple object', async () => {
        const shape = store.getShape(model, 'SimpleObject');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime);
        assert.typeOf(result, 'string', 'is a string');
        const parsed = JSON.parse(String(result));
        assert.typeOf(parsed, 'object', 'represents an object');
        ['id', 'name', 'sex', 'tosAccepted'].forEach((key) => assert.isDefined(parsed[key], `${key} property is set`));
      });

      it('has only required fields with default values or enums', async () => {
        const shape = store.getShape(model, 'SimpleObject');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime);
        assert.typeOf(result, 'string', 'is a string');
        const schema = JSON.parse(String(result));

        assert.strictEqual(schema.id, '', 'sets a string type (id)');
        assert.strictEqual(schema.name, '', 'sets a string type (name)');
        assert.strictEqual(schema.sex, 'male', 'sets a string type (sex)');
        assert.strictEqual(schema.tosAccepted, false, 'sets a boolean type from examples');
        assert.isUndefined(schema.newsletter, 'sets a boolean type from examples');
        assert.isUndefined(schema.age, 'sets a boolean type from examples');
      });

      it('has default values and examples', async () => {
        const shape = store.getShape(model, 'SimpleObject');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime, {
          renderExamples: true,
        });
        const schema = JSON.parse(String(result));

        assert.strictEqual(schema.id, '', 'sets a string type (id)');
        assert.strictEqual(schema.name, 'Pawel Uchida-Psztyc', 'sets a string type (name)');
        assert.strictEqual(schema.sex, 'male', 'sets a string type (sex)');
        assert.strictEqual(schema.tosAccepted, false, 'sets a boolean type from examples');
      });

      it('has default values and examples with optional', async () => {
        const shape = store.getShape(model, 'SimpleObject');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime, {
          renderOptional: true,
          renderExamples: true,
        });
        const schema = JSON.parse(String(result));

        assert.strictEqual(schema.id, '', 'sets a string type (id)');
        assert.strictEqual(schema.name, 'Pawel Uchida-Psztyc', 'sets a string type (name)');
        assert.strictEqual(schema.sex, 'male', 'sets a string type (sex)');
        assert.strictEqual(schema.tosAccepted, false, 'sets a boolean type from examples');
        assert.strictEqual(schema.age, 21, 'has the age property');
        assert.isFalse(schema.newsletter, 'has the newsletter property');
      });

      it('gets the parent properties', async () => {
        const shape = store.getShape(model, 'ObjectWithParent');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime, {
          renderOptional: true,
          renderExamples: true,
        });
        const parsed = JSON.parse(String(result));
        assert.strictEqual(parsed.id, '', 'has parent id');
        assert.strictEqual(parsed.name, 'Pawel Uchida-Psztyc', 'has parent name');
        assert.strictEqual(parsed.age, 25, 'has child age');
        assert.strictEqual(parsed.newsletter, false, 'has parent newsletter');
        assert.strictEqual(parsed.tosAccepted, false, 'has parent tosAccepted');
        assert.match(parsed.addedProperty, /^[0-9]{2}:[0-9]{2}:[0-9]{2}$/, 'has child addedProperty');
      });

      it('renders object example value', async () => {
        const shape = store.getShape(model, 'ObjectWithExample');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime, {
          renderOptional: false,
          renderExamples: true,
        });
        const parsed = JSON.parse(String(result));
        assert.strictEqual(parsed.error, true, 'has schema.error');
        assert.strictEqual(parsed.message, 'Error message', 'has schema.message');
        assert.isUndefined(parsed.optional, 'has no optional property');
      });

      it('renders object with multiple level parents', async () => {
        const shape = store.getShape(model, 'ChildLvl2');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime);
        const parsed = JSON.parse(String(result));
        assert.strictEqual(parsed.id, '', 'has top most property');
        assert.strictEqual(parsed.ch1, false, 'has parent property');
        assert.strictEqual(parsed.ch2, '', 'has own property');
      });

      it('generates the example', async () => {
        const shape = store.getShape(model, 'SimpleObject');
        const result = ApiSchemaGenerator.asExample(shape, jsonMime);
        assert.typeOf(result, 'object', 'returns an object');
        assert.isTrue(result.strict, 'has the strict property');
        assert.deepEqual(result.types, [ns.aml.vocabularies.apiContract.Example], 'has the types property');
        assert.equal(result.mediaType, jsonMime, 'has the mediaType property');
        assert.typeOf(result.renderValue, 'string', 'has the renderValue');
        const parsed = JSON.parse(result.renderValue);
        assert.typeOf(parsed, 'object', 'represents an object');
      });
    });

    describe(xmlMime, () => {
      it('has only required fields with default values or enums', async () => {
        const shape = store.getShape(model, 'SimpleObject');
        const result = ApiSchemaGenerator.asSchema(shape, xmlMime);
        assert.typeOf(result, 'string', 'is a string');
        const parser = new DOMParser();
        const schema = parser.parseFromString(String(result), xmlMime);

        assert.strictEqual(schema.querySelector('id').textContent.trim(), '', 'sets a string type (id)');
        assert.strictEqual(schema.querySelector('name').textContent.trim(), '', 'sets a string type (name)');
        assert.strictEqual(schema.querySelector('sex').textContent.trim(), 'male', 'sets a string type (sex)');
        assert.strictEqual(schema.querySelector('tosAccepted').textContent.trim(), 'false', 'sets a boolean type from examples');
        assert.strictEqual(schema.querySelector('newsletter'), null, 'has no optional value (newsletter)');
        assert.strictEqual(schema.querySelector('age'), null, 'has no optional value (age)');
      });

      it('has default values and examples', async () => {
        const shape = store.getShape(model, 'SimpleObject');
        const result = ApiSchemaGenerator.asSchema(shape, xmlMime, {
          renderExamples: true,
        });
        const parser = new DOMParser();
        const schema = parser.parseFromString(String(result), xmlMime);

        assert.strictEqual(schema.querySelector('id').textContent.trim(), '', 'sets a string type (id)');
        assert.strictEqual(schema.querySelector('name').textContent.trim(), 'Pawel Uchida-Psztyc', 'sets a string type (name)');
        assert.strictEqual(schema.querySelector('sex').textContent.trim(), 'male', 'sets a string type (sex)');
        assert.strictEqual(schema.querySelector('tosAccepted').textContent.trim(), 'false', 'sets a boolean type from examples');
        assert.strictEqual(schema.querySelector('newsletter'), null, 'has no optional value (newsletter)');
        assert.strictEqual(schema.querySelector('age'), null, 'has no optional value (age)');
      });

      it('has default values and examples with optional', async () => {
        const shape = store.getShape(model, 'SimpleObject');
        const result = ApiSchemaGenerator.asSchema(shape, xmlMime, {
          renderOptional: true,
          renderExamples: true,
        });
        const parser = new DOMParser();
        const schema = parser.parseFromString(String(result), xmlMime);

        assert.strictEqual(schema.querySelector('id').textContent.trim(), '', 'sets a string type (id)');
        assert.strictEqual(schema.querySelector('name').textContent.trim(), 'Pawel Uchida-Psztyc', 'sets a string type (name)');
        assert.strictEqual(schema.querySelector('sex').textContent.trim(), 'male', 'sets a string type (sex)');
        assert.strictEqual(schema.querySelector('tosAccepted').textContent.trim(), 'false', 'sets a boolean type from examples');
        assert.strictEqual(schema.querySelector('age').textContent.trim(), '21', 'has the age property');
        assert.strictEqual(schema.querySelector('newsletter').textContent.trim(), 'false', 'has the newsletter property');
      });

      it('gets the parent properties', async () => {
        const shape = store.getShape(model, 'ObjectWithParent');
        const result = ApiSchemaGenerator.asSchema(shape, xmlMime, {
          renderOptional: true,
          renderExamples: true,
        });
        const parser = new DOMParser();
        const schema = parser.parseFromString(String(result), xmlMime);

        assert.strictEqual(schema.querySelector('id').textContent.trim(), '', 'sets a string type (id)');
        assert.strictEqual(schema.querySelector('name').textContent.trim(), 'Pawel Uchida-Psztyc', 'sets a string type (name)');
        assert.strictEqual(schema.querySelector('sex').textContent.trim(), 'male', 'sets a string type (sex)');
        assert.strictEqual(schema.querySelector('tosAccepted').textContent.trim(), 'false', 'sets a boolean type from examples');
        assert.strictEqual(schema.querySelector('age').textContent.trim(), '25', 'has the age property');
        assert.strictEqual(schema.querySelector('newsletter').textContent.trim(), 'false', 'has the newsletter property');
        const addedProperty = schema.querySelector('addedProperty').textContent.trim();
        assert.match(addedProperty, /^[0-9]{2}:[0-9]{2}:[0-9]{2}$/, 'has child addedProperty');
      });

      it('renders object example value', async () => {
        const shape = store.getShape(model, 'ObjectWithExample');
        const result = ApiSchemaGenerator.asSchema(shape, xmlMime, {
          renderOptional: false,
          renderExamples: true,
        });
        const parser = new DOMParser();
        const schema = parser.parseFromString(String(result), xmlMime);

        const root = schema.querySelector('ObjectWithExample');
        assert.ok(root, 'has the root node');
        assert.strictEqual(root.querySelector('error').textContent.trim(), 'true', 'has schema.error');
        assert.strictEqual(root.querySelector('message').textContent.trim(), 'Error message', 'has schema.message');
        assert.notOk(root.querySelector('optional'), 'has no optional property');
      });

      it('renders object with multiple level parents', async () => {
        const shape = store.getShape(model, 'ChildLvl2');
        const result = ApiSchemaGenerator.asSchema(shape, xmlMime);
        const parser = new DOMParser();
        const schema = parser.parseFromString(String(result), xmlMime);

        const root = schema.querySelector('ChildLvl2');
        assert.ok(root, 'has the root node');
        assert.strictEqual(root.querySelector('ch2').textContent.trim(), '', 'has own property');
        assert.strictEqual(root.querySelector('ch1').textContent.trim(), 'false', 'has parent property');
        assert.strictEqual(root.querySelector('id').textContent.trim(), '', 'has top most property');
      });

      it('generates the example', async () => {
        const shape = store.getShape(model, 'SimpleObject');
        const result = ApiSchemaGenerator.asExample(shape, xmlMime);
        assert.typeOf(result, 'object', 'returns an object');
        assert.isTrue(result.strict, 'has the strict property');
        assert.deepEqual(result.types, [ns.aml.vocabularies.apiContract.Example], 'has the types property');
        assert.equal(result.mediaType, xmlMime, 'has the mediaType property');
        assert.typeOf(result.renderValue, 'string', 'has the renderValue');
        const parser = new DOMParser();
        const schema = parser.parseFromString(result.renderValue, xmlMime);
        assert.strictEqual(schema.querySelector('tosAccepted').textContent.trim(), 'false', 'sets a boolean type from examples');
      });
    });
  });

  describe('array values', () => {
    /** @type AmfDocument */
    let model;

    before(async () => {
      model = await store.getGraph('demo-api');
    });

    describe(jsonMime, () => {
      it('generates a valid schema', async () => {
        const shape = store.getShape(model, 'ObjectWithArray');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime);
        assert.typeOf(result, 'string', 'is a string');
        const parsed = JSON.parse(String(result));
        assert.typeOf(parsed, 'object', 'result is an object');
      });

      it('has only required fields', async () => {
        const shape = store.getShape(model, 'ObjectWithArray');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime);
        assert.typeOf(result, 'string', 'is a string');
        const parsed = JSON.parse(String(result));
        assert.typeOf(parsed.tags, 'array', 'tags is set');
        assert.typeOf(parsed.exampleValue, 'array', 'exampleValue is set');
        assert.typeOf(parsed.examplesValue, 'array', 'examplesValue is set');
        assert.typeOf(parsed.defaultValue, 'array', 'defaultValue is set');
      });

      it('has only default values', async () => {
        const shape = store.getShape(model, 'ObjectWithArray');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime);
        assert.typeOf(result, 'string', 'is a string');
        const parsed = JSON.parse(String(result));
        assert.deepEqual(parsed.tags, [''], 'tags is set');
        assert.deepEqual(parsed.exampleValue, [0], 'exampleValue is set');
        assert.deepEqual(parsed.examplesValue, [''], 'examplesValue is set');
        assert.deepEqual(parsed.defaultValue, ['A tag'], 'defaultValue is set');
      });

      it('has default values and examples', async () => {
        const shape = store.getShape(model, 'ObjectWithArray');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime, {
          renderExamples: true,
        });
        assert.typeOf(result, 'string', 'is a string');
        const parsed = JSON.parse(String(result));
        assert.deepEqual(parsed.tags, [''], 'tags is set');
        assert.deepEqual(parsed.exampleValue, [123], 'exampleValue is set');
        assert.deepEqual(parsed.examplesValue, ['value 1'], 'examplesValue is set');
        assert.deepEqual(parsed.defaultValue, ['A tag'], 'defaultValue is set');
      });

      it('processes object items', async () => {
        const shape = store.getShape(model, 'ObjectWithArrayObject');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime, {
          renderExamples: true,
        });
        assert.typeOf(result, 'string', 'is a string');
        const parsed = JSON.parse(String(result));
        assert.typeOf(parsed, 'array', 'result is an array');
        const [schema] = parsed;
        assert.strictEqual(schema.id, '', 'sets a string type (id)');
        assert.strictEqual(schema.name, 'Pawel Uchida-Psztyc', 'sets a string type (name)');
        assert.strictEqual(schema.sex, 'male', 'sets a string type (sex)');
        assert.strictEqual(schema.tosAccepted, false, 'sets a boolean type from examples');
      });

      it('generates the example', async () => {
        const shape = store.getShape(model, 'ObjectWithArray');
        const result = ApiSchemaGenerator.asExample(shape, jsonMime);
        assert.typeOf(result, 'object', 'returns an object');
        assert.isTrue(result.strict, 'has the strict property');
        assert.deepEqual(result.types, [ns.aml.vocabularies.apiContract.Example], 'has the types property');
        assert.equal(result.mediaType, jsonMime, 'has the mediaType property');
        assert.typeOf(result.renderValue, 'string', 'has the renderValue');
        const parsed = JSON.parse(result.renderValue);
        assert.typeOf(parsed, 'object', 'result is an object');
      });
    });

    describe(xmlMime, () => {
      it('has only required fields', async () => {
        const shape = store.getShape(model, 'ObjectWithArray');
        const result = ApiSchemaGenerator.asSchema(shape, xmlMime);
        const parser = new DOMParser();
        const schema = parser.parseFromString(String(result), xmlMime);

        const tags = schema.querySelector('tags');
        assert.ok(tags, 'has tags array');
        assert.strictEqual(tags.querySelector('tags').textContent.trim(), '', 'has empty array item (tags)');

        const exampleValue = schema.querySelector('exampleValue');
        assert.ok(exampleValue, 'has exampleValue array');
        // this is a required field with integer value. This automatically adds number value to the schema.
        assert.strictEqual(exampleValue.querySelector('exampleValue').textContent.trim(), '0', 'has default generated value (exampleValue)');

        const examplesValue = schema.querySelector('examplesValue');
        assert.ok(examplesValue, 'has examplesValue array');
        assert.strictEqual(examplesValue.querySelector('examplesValue').textContent.trim(), '', 'has empty array item (examplesValue)');

        const defaultValue = schema.querySelector('defaultValue');
        assert.ok(defaultValue, 'has defaultValue array');
        assert.strictEqual(defaultValue.querySelector('defaultValue').textContent.trim(), 'A tag', 'has a default value (defaultValue)');
      });

      it('has default values and examples', async () => {
        const shape = store.getShape(model, 'ObjectWithArray');
        const result = ApiSchemaGenerator.asSchema(shape, xmlMime, {
          renderExamples: true,
        });
        const parser = new DOMParser();
        const schema = parser.parseFromString(String(result), xmlMime);

        const tags = schema.querySelector('tags');
        assert.ok(tags, 'has tags array');
        assert.strictEqual(tags.querySelector('tags').textContent.trim(), '', 'has empty array item (tag)');

        const exampleValue = schema.querySelector('exampleValue');
        assert.ok(exampleValue, 'has exampleValue array');
        assert.strictEqual(exampleValue.querySelector('exampleValue').textContent.trim(), '123', 'has example value (exampleValue)');

        const examplesValue = schema.querySelector('examplesValue');
        assert.ok(examplesValue, 'has examplesValue array');
        assert.strictEqual(examplesValue.querySelector('examplesValue').textContent.trim(), 'value 1', 'has example value (examplesValue)');

        const defaultValue = schema.querySelector('defaultValue');
        assert.ok(defaultValue, 'has defaultValue array');
        assert.strictEqual(defaultValue.querySelector('defaultValue').textContent.trim(), 'A tag', 'has a default value (defaultValue)');
      });

      it('processes object items', async () => {
        const shape = store.getShape(model, 'ObjectWithArrayObject');
        const result = ApiSchemaGenerator.asSchema(shape, xmlMime, {
          renderExamples: true,
        });
        const parser = new DOMParser();
        const schema = parser.parseFromString(String(result), xmlMime);

        const parent = schema.querySelector('ObjectWithArrayObject');
        assert.ok(parent, 'has ObjectWithArrayObject object');

        assert.strictEqual(parent.querySelector('id').textContent.trim(), '', 'sets a string type (id)');
        assert.strictEqual(parent.querySelector('name').textContent.trim(), 'Pawel Uchida-Psztyc', 'sets a string type (name)');
        assert.strictEqual(parent.querySelector('sex').textContent.trim(), 'male', 'sets a string type (sex)');
        assert.strictEqual(parent.querySelector('tosAccepted').textContent.trim(), 'false', 'sets a boolean type from examples');
        assert.strictEqual(parent.querySelector('newsletter'), null, 'has no optional value (newsletter)');
        assert.strictEqual(parent.querySelector('age'), null, 'has no optional value (age)');
      });

      it('generates the example', async () => {
        const shape = store.getShape(model, 'ObjectWithArray');
        const result = ApiSchemaGenerator.asExample(shape, xmlMime);
        assert.typeOf(result, 'object', 'returns an object');
        assert.isTrue(result.strict, 'has the strict property');
        assert.deepEqual(result.types, [ns.aml.vocabularies.apiContract.Example], 'has the types property');
        assert.equal(result.mediaType, xmlMime, 'has the mediaType property');
        assert.typeOf(result.renderValue, 'string', 'has the renderValue');
        const parser = new DOMParser();
        const schema = parser.parseFromString(result.renderValue, xmlMime);

        const tags = schema.querySelector('tags');
        assert.ok(tags, 'has tags array');
        assert.strictEqual(tags.querySelector('tags').textContent.trim(), '', 'has empty array item (tags)');
      });
    });
  });

  describe('union values', () => {
    /** @type AmfDocument */
    let model;

    before(async () => {
      model = await store.getGraph('demo-api');
    });

    describe(jsonMime, () => {
      it('generates schema for a scalar union', async () => {
        const shape = store.getShape(model, 'ScalarUnion');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime);
        assert.typeOf(result, 'string', 'is a string');
        assert.strictEqual(result, '', 'the result is empty');
      });

      it('generates schema for a scalar union with a default number value', async () => {
        const shape = store.getShape(model, 'ScalarUnionDefaultNumber');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime);
        assert.typeOf(result, 'number', 'is a number');
        assert.strictEqual(result, 123456, 'the result is set');
      });

      it('generates schema for a scalar union with a default string value', async () => {
        const shape = store.getShape(model, 'ScalarUnionDefaultString');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime);
        assert.typeOf(result, 'string', 'is a string');
        assert.strictEqual(result, 'abc123', 'the result is set');
      });

      it('generates schema for a scalar union with a default boolean value (true)', async () => {
        const shape = store.getShape(model, 'ScalarUnionDefaultBoolean');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime);
        assert.typeOf(result, 'boolean', 'is a boolean');
        assert.strictEqual(result, true, 'the result is set');
      });

      it('generates schema for a scalar union with a default boolean value (false)', async () => {
        const shape = store.getShape(model, 'ScalarUnionDefaultBoolean2');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime);
        assert.strictEqual(result, false, 'the result is set');
      });

      it('ignores implicit not-required unions (union with nil)', async () => {
        const shape = store.getShape(model, 'ScalarUnionDefaultNil');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime);
        assert.isUndefined(result);
      });

      it('generates schema for required union an example value (number)', async () => {
        const shape = store.getShape(model, 'ScalarUnionExampleNumber');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime, {
          renderExamples: true,
        });
        assert.strictEqual(result, 987654, 'the result is a number');
      });

      it('generates schema for required union an example value (string)', async () => {
        const shape = store.getShape(model, 'ScalarUnionExampleString');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime, {
          renderExamples: true,
        });
        assert.strictEqual(result, '098poi', 'the result is a string');
      });

      it('generates empty string for scalar-object union', async () => {
        const shape = store.getShape(model, 'ScalarObjectUnion');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime);
        assert.strictEqual(result, '', 'the result is a string');
      });

      it('generates schema for scalar-object union with an example', async () => {
        const shape = store.getShape(model, 'ScalarObjectUnionExample');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime, {
          renderExamples: true,
        });
        assert.typeOf(result, 'string', 'the result is a string');
        const parsed = JSON.parse(String(result));
        assert.strictEqual(parsed.id, '128a654bc54d898e43f', 'example.id is set');
        assert.strictEqual(parsed.name, 'Pawel Uchida-Psztyc', 'example.name is set');
        assert.strictEqual(parsed.age, 30, 'example.age is set');
        assert.strictEqual(parsed.sex, 'male', 'example.sex is set');
        assert.strictEqual(parsed.newsletter, false, 'example.newsletter is set');
        assert.strictEqual(parsed.tosAccepted, true, 'example.tosAccepted is set');
      });

      it('generates schema for objects union', async () => {
        const shape = store.getShape(model, 'ObjectUnions');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime);
        assert.typeOf(result, 'string', 'the result is a string');
        const parsed = JSON.parse(String(result));
        assert.strictEqual(parsed.id, '', 'schema.id is set');
        assert.strictEqual(parsed.name, '', 'schema.name is set');
        assert.isUndefined(parsed.age, 'optional item is not set (age)');
        assert.strictEqual(parsed.sex, 'male', 'schema.sex is set');
        assert.isUndefined(parsed.newsletter, 'optional item is not set (newsletter)');
        assert.strictEqual(parsed.tosAccepted, false, 'schema.tosAccepted is set');
      });

      it('generates schema for a selected union', async () => {
        const shape = /** @type ApiUnionShape */ (store.getShape(model, 'ObjectUnions'));
        const id = shape.anyOf[1].id;
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime, {
          selectedUnions: [id],
        });
        assert.typeOf(result, 'string', 'the result is a string');
        const parsed = JSON.parse(String(result));
        assert.strictEqual(parsed.id, '', 'has parent id');
        assert.strictEqual(parsed.name, '', 'has parent name');
        assert.strictEqual(parsed.age, 0, 'has child age');
        assert.strictEqual(parsed.sex, 'male', 'has parent sex');
        assert.isUndefined(parsed.newsletter, 'has no optional parent newsletter');
        assert.strictEqual(parsed.tosAccepted, false, 'has parent tosAccepted');
        assert.match(parsed.addedProperty, /^[0-9]{2}:[0-9]{2}:[0-9]{2}$/, 'has child addedProperty');
      });

      // examples are not correctly inherited with unions
      it.skip('renders example from an union object', async () => {
        const shape = store.getShape(model, 'ObjectUnionWithExample');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime, {
          renderExamples: true,
        });
        assert.typeOf(result, 'string', 'the result is a string');
        const parsed = JSON.parse(String(result));
        assert.strictEqual(parsed.error, true, 'has schema.error');
        assert.strictEqual(parsed.message, 'Error message', 'has schema.message');
        assert.isUndefined(parsed.optional, 'has no optional property');
      });

      it('does not renders example from an union object when not configured', async () => {
        const shape = store.getShape(model, 'ObjectUnionWithExample');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime);
        assert.typeOf(result, 'string', 'the result is a string');
        const parsed = JSON.parse(String(result));
        assert.strictEqual(parsed.error, false, 'has default schema.error');
        assert.strictEqual(parsed.message, '', 'has default schema.message');
        assert.isUndefined(parsed.optional, 'has no optional property');
      });

      it('marks scalar | nil union as optional', async () => {
        const shape = store.getShape(model, 'ObjectScalarUnionNill');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime);
        assert.equal(result, '{}', 'is a string');
      });
      
      // I am not sure how this should work.
      // In RAML spec it says that scalar + nil makes the scalar optional. 
      // Should it be the same for an object?
      it.skip('marks object | nil union as optional', async () => {
        const shape = store.getShape(model, 'UnionNill');
        const result = ApiSchemaGenerator.asSchema(shape, jsonMime);
        assert.equal(result, '{}', 'is a string');
      });
    });

    describe(xmlMime, () => {
      it('generates schema for a scalar union', async () => {
        const shape = store.getShape(model, 'ScalarUnion');
        const result = ApiSchemaGenerator.asSchema(shape, xmlMime);
        const parser = new DOMParser();
        const schema = parser.parseFromString(String(result), xmlMime);

        const root = schema.querySelector('ScalarUnion');
        assert.ok(root, 'has the root node');
        assert.strictEqual(root.textContent.trim(), '', 'the root node is empty');
      });

      it('generates schema for a scalar union with a default number value', async () => {
        const shape = store.getShape(model, 'ScalarUnionDefaultNumber');
        const result = ApiSchemaGenerator.asSchema(shape, xmlMime);
        const parser = new DOMParser();
        const schema = parser.parseFromString(String(result), xmlMime);

        const root = schema.querySelector('ScalarUnionDefaultNumber');
        assert.ok(root, 'has the root node');
        assert.equal(root.textContent.trim(), '123456', 'the root node has a number value');
      });

      it('generates schema for a scalar union with a default string value', async () => {
        const shape = store.getShape(model, 'ScalarUnionDefaultString');
        const result = ApiSchemaGenerator.asSchema(shape, xmlMime);
        const parser = new DOMParser();
        const schema = parser.parseFromString(String(result), xmlMime);

        const root = schema.querySelector('ScalarUnionDefaultString');
        assert.ok(root, 'has the root node');
        assert.equal(root.textContent.trim(), 'abc123', 'the root node has a string value');
      });

      it('generates schema for a scalar union with a default boolean value', async () => {
        const shape = store.getShape(model, 'ScalarUnionDefaultBoolean');
        const result = ApiSchemaGenerator.asSchema(shape, xmlMime);
        const parser = new DOMParser();
        const schema = parser.parseFromString(String(result), xmlMime);

        const root = schema.querySelector('ScalarUnionDefaultBoolean');
        assert.ok(root, 'has the root node');
        assert.equal(root.textContent.trim(), 'true', 'the root node has a boolean value');
      });

      it('ignores implicit not-required unions (union with nil)', async () => {
        const shape = store.getShape(model, 'ScalarUnionDefaultNil');
        const result = ApiSchemaGenerator.asSchema(shape, xmlMime);
        assert.isUndefined(result);
      });

      it('generates schema for required union an example value (number)', async () => {
        const shape = store.getShape(model, 'ScalarUnionExampleNumber');
        const result = ApiSchemaGenerator.asSchema(shape, xmlMime);
        const parser = new DOMParser();
        const schema = parser.parseFromString(String(result), xmlMime);

        const root = schema.querySelector('ScalarUnionExampleNumber');
        assert.ok(root, 'has the root node');
        assert.equal(root.textContent.trim(), '987654', 'the root node has the example value');
      });

      it('generates schema for required union an example value (string)', async () => {
        const shape = store.getShape(model, 'ScalarUnionExampleString');
        const result = ApiSchemaGenerator.asSchema(shape, xmlMime);
        const parser = new DOMParser();
        const schema = parser.parseFromString(String(result), xmlMime);

        const root = schema.querySelector('ScalarUnionExampleString');
        assert.ok(root, 'has the root node');
        assert.equal(root.textContent.trim(), '098poi', 'the root node has the example value');
      });

      it('generates empty string for scalar-object union', async () => {
        const shape = store.getShape(model, 'ScalarObjectUnion');
        const result = ApiSchemaGenerator.asSchema(shape, xmlMime);
        const parser = new DOMParser();
        const schema = parser.parseFromString(String(result), xmlMime);

        const root = schema.querySelector('ScalarObjectUnion');
        assert.ok(root, 'has the root node');
        assert.equal(root.textContent.trim(), '', 'the root node is empty');
      });

      it('generates schema for scalar-object union with an example', async () => {
        const shape = store.getShape(model, 'ScalarObjectUnionExample');
        const result = ApiSchemaGenerator.asSchema(shape, xmlMime);
        const parser = new DOMParser();
        const schema = parser.parseFromString(String(result), xmlMime);

        const root = schema.querySelector('ScalarObjectUnionExample');
        assert.ok(root, 'has the root node');
        assert.strictEqual(root.querySelector('id').textContent.trim(), '128a654bc54d898e43f', 'example.id is set');
        assert.strictEqual(root.querySelector('name').textContent.trim(), 'Pawel Uchida-Psztyc', 'example.name is set');
        assert.strictEqual(root.querySelector('age').textContent.trim(), '30', 'example.age is set');
        assert.strictEqual(root.querySelector('sex').textContent.trim(), 'male', 'example.sex is set');
        assert.strictEqual(root.querySelector('newsletter').textContent.trim(), 'false', 'example.newsletter is set');
        assert.strictEqual(root.querySelector('tosAccepted').textContent.trim(), 'true', 'example.tosAccepted is set');
      });

      it('generates schema for objects union', async () => {
        const shape = store.getShape(model, 'ObjectUnions');
        const result = ApiSchemaGenerator.asSchema(shape, xmlMime);
        const parser = new DOMParser();
        const schema = parser.parseFromString(String(result), xmlMime);

        const root = schema.querySelector('ObjectUnions');
        assert.ok(root, 'has the root node');
        assert.strictEqual(root.querySelector('id').textContent.trim(), '', 'example.id is set');
        assert.strictEqual(root.querySelector('name').textContent.trim(), '', 'example.name is set');
        assert.notOk(root.querySelector('age'), 'optional item is not set (age)');
        assert.strictEqual(root.querySelector('sex').textContent.trim(), 'male', 'example.sex is set');
        assert.notOk(root.querySelector('newsletter'), 'optional item is not set (newsletter)');
        assert.strictEqual(root.querySelector('tosAccepted').textContent.trim(), 'false', 'example.tosAccepted is set');
      });

      it('generates schema for a selected union', async () => {
        const shape = /** @type ApiUnionShape */ (store.getShape(model, 'ObjectUnions'));
        // const typedUnion = /** @type ApiUnionShape */ (shape.inherits[0]);
        const id = shape.anyOf[1].id;
        const result = ApiSchemaGenerator.asSchema(shape, xmlMime, {
          selectedUnions: [id],
        });
        const parser = new DOMParser();
        const schema = parser.parseFromString(String(result), xmlMime);

        const root = schema.querySelector('ObjectUnions');
        assert.ok(root, 'has the root node');
        assert.strictEqual(root.querySelector('id').textContent.trim(), '', 'has parent id');
        assert.strictEqual(root.querySelector('name').textContent.trim(), '', 'has parent name');
        assert.strictEqual(root.querySelector('age').textContent.trim(), '0', 'has child age');
        assert.strictEqual(root.querySelector('sex').textContent.trim(), 'male', 'has parent sex');
        assert.notOk(root.querySelector('newsletter'), 'has no optional parent newsletter');
        assert.strictEqual(root.querySelector('tosAccepted').textContent.trim(), 'false', 'has parent tosAccepted');
        const addedProperty = root.querySelector('addedProperty').textContent.trim();
        assert.match(addedProperty, /^[0-9]{2}:[0-9]{2}:[0-9]{2}$/, 'has child addedProperty');
      });

      // examples are not correctly inherited with unions
      it.skip('renders example from an union object', async () => {
        const shape = store.getShape(model, 'ObjectUnionWithExample');
        const result = ApiSchemaGenerator.asSchema(shape, xmlMime, {
          renderExamples: true,
        });
        const parser = new DOMParser();
        const schema = parser.parseFromString(String(result), xmlMime);

        const root = schema.querySelector('ObjectUnionWithExample');
        assert.ok(root, 'has the root node');
        assert.strictEqual(root.querySelector('error').textContent.trim(), 'true', 'has schema.error');
        assert.strictEqual(root.querySelector('message').textContent.trim(), 'Error message', 'has schema.message');
        assert.notOk(root.querySelector('optional'), 'has no optional property');
      });

      it('does not renders example from an union object when not configured', async () => {
        const shape = store.getShape(model, 'ObjectUnionWithExample');
        const result = ApiSchemaGenerator.asSchema(shape, xmlMime);
        const parser = new DOMParser();
        const schema = parser.parseFromString(String(result), xmlMime);

        const root = schema.querySelector('ObjectUnionWithExample');
        assert.ok(root, 'has the root node');
        assert.strictEqual(root.querySelector('error').textContent.trim(), 'false', 'has default schema.error');
        assert.strictEqual(root.querySelector('message').textContent.trim(), '', 'has default schema.message');
        assert.notOk(root.querySelector('optional'), 'has no optional property');
      });

      it('marks scalar | nil union as optional', async () => {
        const shape = store.getShape(model, 'ObjectScalarUnionNill');
        const result = ApiSchemaGenerator.asSchema(shape, xmlMime);
        assert.equal(result, '<ObjectScalarUnionNill>\n</ObjectScalarUnionNill>', 'is a string');
      });
      
      // I am not sure how this should work.
      // In RAML spec it says that scalar + nil makes the scalar optional. 
      // Should it be the same for an object?
      it.skip('marks object | nil union as optional', async () => {
        const shape = store.getShape(model, 'UnionNill');
        const result = ApiSchemaGenerator.asSchema(shape, xmlMime);
        assert.equal(result, '<UnionNill></UnionNill>', 'is a string');
      });
    });
  });

  describe('XML serialization', () => {
    /** @type AmfDocument */
    let model;

    before(async () => {
      model = await store.getGraph('demo-api');
    });

    it('serializes required properties', async () => {
      const shape = store.getShape(model, 'XmlSerializationObject');
      const result = ApiSchemaGenerator.asSchema(shape, xmlMime);
      const parser = new DOMParser();
      const schema = parser.parseFromString(String(result), xmlMime);

      const root = schema.querySelector('XmlSerializationObject');
      assert.ok(root, 'has the root node');
      assert.isTrue(root.hasAttribute('uuid'), 'the root has the renamed id attribute');
      assert.equal(root.getAttribute('uuid'), '', 'the id attribute has the default value');
      assert.isTrue(root.hasAttribute('notNamedId'), 'the root has the notNamedId attribute');
      assert.equal(root.getAttribute('notNamedId'), '', 'the notNamedId attribute has the default value');
      assert.isTrue(root.hasAttribute('attributeWithExample'), 'the root has the attributeWithExample attribute');
      assert.equal(root.getAttribute('attributeWithExample'), '', 'the attributeWithExample attribute has the default value');
      assert.isTrue(root.hasAttribute('attributeWithDefault'), 'the root has the attributeWithDefault attribute');
      assert.equal(root.getAttribute('attributeWithDefault'), 'attr default value', 'the attributeWithDefault attribute has the defined value');
      assert.isFalse(root.hasAttribute('invalidAttribute'), 'has no invalid attribute');
      assert.ok(root.querySelector('invalidAttribute'), 'the invalidAttribute is serialized as an element');
      const namespaceElement = root.querySelector('namespaceElement');
      assert.ok(namespaceElement, 'has the namespaceElement element');
      assert.equal(namespaceElement.getAttribute('xmlns'), 'urn:loc.gov:books', 'has the namespace value');
      const namespaceWithPrefix = root.getElementsByTagNameNS('urn:ISBN:0-395-36341-6', 'namespaceWithPrefix')[0];
      assert.ok(namespaceWithPrefix, 'has the namespaceWithPrefix element');
      assert.equal(namespaceWithPrefix.getAttributeNS('http://www.w3.org/2000/xmlns/', 'isbn'), 'urn:ISBN:0-395-36341-6', 'has the prefixed namespace value');
      assert.isFalse(root.hasAttribute('optionalAttribute'), 'has no optional attributes');
    });

    it('serializes optional properties', async () => {
      const shape = store.getShape(model, 'XmlSerializationObject');
      const result = ApiSchemaGenerator.asSchema(shape, xmlMime, {
        renderOptional: true,
      });
      const parser = new DOMParser();
      const schema = parser.parseFromString(String(result), xmlMime);

      const root = schema.querySelector('XmlSerializationObject');
      assert.ok(root, 'has the root node');
      assert.isTrue(root.hasAttribute('optionalAttribute'), 'has the optional attribute');
      assert.equal(root.getAttribute('optionalAttribute'), '', 'the optional attribute has no value');
      assert.ok(root.querySelector('optionalProperty'), 'has optionalProperty element');
    });

    it('serializes optional properties with examples', async () => {
      const shape = store.getShape(model, 'XmlSerializationObject');
      const result = ApiSchemaGenerator.asSchema(shape, xmlMime, {
        renderOptional: true,
        renderExamples: true,
      });
      const parser = new DOMParser();
      const schema = parser.parseFromString(String(result), xmlMime);

      const root = schema.querySelector('XmlSerializationObject');
      assert.ok(root, 'has the root node');
      const optionalProperty = root.querySelector('optionalProperty');
      assert.equal(optionalProperty.textContent.trim(), 'abcd', 'element has an example value');
      const namespaceWithPrefix = root.getElementsByTagNameNS('urn:ISBN:0-395-36341-6', 'namespaceWithPrefix')[0];
      assert.equal(namespaceWithPrefix.textContent.trim(), 'test namespace', 'namespace element has an example value');
      assert.equal(root.getAttribute('attributeWithExample'), 'attr example value', 'attribute has an example');
      const deep = root.querySelector('invalidAttribute > name');
      assert.equal(deep.textContent.trim(), 'Pawel Uchida-Psztyc', 'deep elements have examples');
    });

    it('does not wrap an array by default', async () => {
      const shape = store.getShape(model, 'XmlSerializationObject');
      const result = ApiSchemaGenerator.asSchema(shape, xmlMime, {
        renderOptional: true,
        renderExamples: true,
      });
      const parser = new DOMParser();
      const schema = parser.parseFromString(String(result), xmlMime);

      const root = schema.querySelector('address-array-4');
      assert.ok(root, 'has the renamed root element');
      assert.lengthOf(root.children, 2, 'has 2 children');
      assert.equal(root.children[0].localName, 'street', 'has the street child');
      assert.equal(root.children[1].localName, 'city', 'has the city child');
    });

    it('wraps an array via the XML serialization', async () => {
      const shape = store.getShape(model, 'XmlSerializationObject');
      const result = ApiSchemaGenerator.asSchema(shape, xmlMime, {
        renderOptional: true,
        renderExamples: true,
      });
      const parser = new DOMParser();
      const schema = parser.parseFromString(String(result), xmlMime);
      /* 
      <addresses>
        <addresses>
          <street></street>
          <city></city>
        </addresses>
      </addresses>
      */

      const topAddress = schema.querySelector('addresses');
      assert.ok(topAddress, 'has the wrapping "addresses" node');
      const nodes = topAddress.querySelectorAll('addresses');
      assert.lengthOf(nodes, 1, 'has a single addresses');
      const node = nodes[0];
      assert.ok(node.querySelector('street'), 'has the street child');
      assert.ok(node.querySelector('city'), 'has the street child');
    });

    it('renames wrapper and items', async () => {
      const shape = store.getShape(model, 'XmlSerializationObject');
      const result = ApiSchemaGenerator.asSchema(shape, xmlMime, {
        renderOptional: true,
        renderExamples: true,
      });
      const parser = new DOMParser();
      const schema = parser.parseFromString(String(result), xmlMime);

      /*
      <address-array-2> 
        <Address>
          <street></street>
          <city></city>
        </Address> 
      </address-array-2>
      */

      const topAddress = schema.querySelector('address-array-2');
      assert.ok(topAddress, 'has the wrapping "address-array-2" node');
      const nodes = topAddress.querySelectorAll('Address');
      assert.lengthOf(nodes, 1, 'has a single Address');
      const node = nodes[0];
      assert.ok(node.querySelector('street'), 'has the street child');
      assert.ok(node.querySelector('city'), 'has the street child');
    });

    it('renames wrapper only', async () => {
      const shape = store.getShape(model, 'XmlSerializationObject');
      const result = ApiSchemaGenerator.asSchema(shape, xmlMime, {
        renderOptional: true,
        renderExamples: true,
      });
      const parser = new DOMParser();
      const schema = parser.parseFromString(String(result), xmlMime);

      /*
      <address-array-3> 
        <address-array-3>
          <street></street>
          <city></city>
        </address-array-3> 
      </address-array-3>
      */

      const topAddress = schema.querySelector('address-array-3');
      assert.ok(topAddress, 'has the wrapping "address-array-3" node');
      const nodes = topAddress.querySelectorAll('address-array-3');
      assert.lengthOf(nodes, 1, 'has a single Address');
      const node = nodes[0];
      assert.ok(node.querySelector('street'), 'has the street child');
      assert.ok(node.querySelector('city'), 'has the street child');
    });

    it('renames wrapper only', async () => {
      const shape = store.getShape(model, 'XmlSerializationObject');
      const result = ApiSchemaGenerator.asSchema(shape, xmlMime, {
        renderOptional: true,
        renderExamples: true,
      });
      const parser = new DOMParser();
      const schema = parser.parseFromString(String(result), xmlMime);

      /*
      <address-array-3> 
        <address-array-3>
          <street></street>
          <city></city>
        </address-array-3> 
      </address-array-3>
      */

      const topAddress = schema.querySelector('address-array-3');
      assert.ok(topAddress, 'has the wrapping "address-array-3" node');
      const nodes = topAddress.querySelectorAll('address-array-3');
      assert.lengthOf(nodes, 1, 'has a single Address');
      const node = nodes[0];
      assert.ok(node.querySelector('street'), 'has the street child');
      assert.ok(node.querySelector('city'), 'has the street child');
    });

    it('renames without wrapping', async () => {
      const shape = store.getShape(model, 'XmlSerializationObject');
      const result = ApiSchemaGenerator.asSchema(shape, xmlMime, {
        renderOptional: true,
        renderExamples: true,
      });
      const parser = new DOMParser();
      const schema = parser.parseFromString(String(result), xmlMime);

      /*
      <address-array-4> 
        <street></street>
        <city></city>
      </address-array-4>
      */

      const nodes = schema.querySelectorAll('address-array-4');
      assert.lengthOf(nodes, 1, 'has a single object');
      const node = nodes[0];
      assert.ok(node.querySelector('street'), 'has the street child');
      assert.ok(node.querySelector('city'), 'has the street child');
    });

    it('serializes complex objects', async () => {
      const shape = store.getShape(model, 'XmlComplexProperty');
      const result = ApiSchemaGenerator.asSchema(shape, xmlMime, {
        renderOptional: true,
        renderExamples: true,
      });
      const parser = new DOMParser();
      const schema = parser.parseFromString(String(result), xmlMime);

      const root = schema.querySelector('XmlComplexProperty');
      assert.ok(root, 'has the root element');

      const complex = root.querySelector('complex');
      assert.ok(complex, 'has the complex element');
      assert.strictEqual(complex.getAttribute('correctedName'), '', 'has the property as attribute');

      const other = root.querySelector('other');
      assert.ok(other, 'has the other element');
      assert.strictEqual(other.textContent.trim(), 'some property', 'has the other property default value');
    });

    it('does not wrap an object when no serialization', async () => {
      const shape = store.getShape(model, 'NoXmlSerializationObject');
      const result = ApiSchemaGenerator.asSchema(shape, xmlMime, {
        renderOptional: true,
        renderExamples: true,
      });
      const parser = new DOMParser();
      const schema = parser.parseFromString(String(result), xmlMime);

      const root = schema.querySelector('NoXmlSerializationObject');
      const addresses = root.querySelector('addresses');
      assert.ok(addresses, 'has the addresses node');
      const nodes = addresses.querySelectorAll('Address');
      assert.lengthOf(nodes, 0, 'has no Address');
      assert.ok(addresses.querySelector('street'), 'has the street child');
      assert.ok(addresses.querySelector('city'), 'has the street child');
    });

    it('serializes the root array', async () => {
      const shape = store.getShape(model, 'XmlArray');
      const result = ApiSchemaGenerator.asSchema(shape, xmlMime, {
        renderOptional: true,
        renderExamples: true,
      });
      const parser = new DOMParser();
      const schema = parser.parseFromString(String(result), xmlMime);

      /*
      <XmlArray>
        <street></street>
        <city></city>
      </XmlArray>
      */

      const root = schema.querySelector('XmlArray');
      assert.ok(root, 'has the XmlArray node');
      assert.lengthOf(root.children, 2, 'has 2 children');
      assert.equal(root.children[0].localName, 'street', 'has the street child');
      assert.equal(root.children[1].localName, 'city', 'has the city child');
    });

    it('serializes wrapped and renamed root array', async () => {
      const shape = store.getShape(model, 'XmlArray2');
      const result = ApiSchemaGenerator.asSchema(shape, xmlMime, {
        renderOptional: true,
        renderExamples: true,
      });
      const parser = new DOMParser();
      const schema = parser.parseFromString(String(result), xmlMime);

      /*
      <addresses-array>
        <address>
          <city></city>
          <street></street>
        </address>
      </addresses-array>
      */
     
      const root = schema.querySelector('addresses-array');
      assert.ok(root, 'has the addresses-array node');
      const item = root.querySelector('address');
      assert.ok(item, 'has the wrapped item');
      assert.lengthOf(item.children, 2, 'has 2 children');
      assert.equal(item.children[0].localName, 'city', 'has the city child');
      assert.equal(item.children[1].localName, 'street', 'has the street child');
    });

    it('serializes schema from a library', async () => {
      const shape = store.getShape(model, 'LibraryRef');
      const result = ApiSchemaGenerator.asSchema(shape, xmlMime, {
        renderOptional: true,
        renderExamples: true,
      });
      const parser = new DOMParser();
      const schema = parser.parseFromString(String(result), xmlMime);
      const root = schema.querySelector('LibraryRef');
      assert.ok(root, 'has the LibraryRef node');
      assert.equal(root.querySelector('petType').textContent.trim(), 'Doggie', 'has the child petType node');
      assert.equal(root.querySelector('sound').textContent.trim(), 'Woof', 'has the child sound node');
      assert.equal(root.querySelector('friendly').textContent.trim(), 'true', 'has the child friendly node');
      assert.equal(root.querySelector('name').textContent.trim(), '', 'has the parent name node');
      assert.equal(root.querySelector('etag').textContent.trim(), '', 'has the parent etag node');
    });

    // AMF has a problem with restoring this value from the ld model
    // it('serializes an xsd schema', async () => {
    //   const shape = store.getShape(model, 'XmlRefSchema');
    //   const result = ApiSchemaGenerator.asSchema(shape, xmlMime, {
    //     renderOptional: true,
    //     renderExamples: true,
    //   });
    //   const parser = new DOMParser();
    //   const schema = parser.parseFromString(result, xmlMime);
    //   console.log(shape);
    // });

    // it('serializes an xsd schema with examples', async () => {
    //   const op = await store.getOperationRecursive('put', '/schemas');
    //   console.log(op.request.payloads[1].schema);
    //   // const shape = store.getShape(model, 'XmlRefSchemaExample');
    //   // const result = ApiSchemaGenerator.asSchema(shape, xmlMime, {
    //   //   renderOptional: true,
    //   //   renderExamples: true,
    //   // });
    //   // const parser = new DOMParser();
    //   // const schema = parser.parseFromString(result, xmlMime);
    //   // console.log(result);
    // });
  });

  describe('unknown media type', () => {
    const unknownMime = 'any/text';

    /** @type AmfDocument */
    let model;

    before(async () => {
      model = await store.getGraph('demo-api');
    });

    it('does not set the generator property', async () => {
      const inst = new ApiSchemaGenerator(unknownMime);
      assert.isUndefined(inst.generator);
    });

    it('returns null on generate() ', async () => {
      const shape = store.getShape(model, 'ScalarType');
      const inst = new ApiSchemaGenerator(unknownMime);
      const result = inst.generate(shape);
      assert.strictEqual(result, null);
    });

    it('returns null on toValue() ', async () => {
      const shape = store.getShape(model, 'ScalarType');
      const inst = new ApiSchemaGenerator(unknownMime);
      const result = inst.generate(shape);
      assert.strictEqual(result, null);
    });

    it('returns null on toExample() ', async () => {
      const shape = store.getShape(model, 'ScalarType');
      const inst = new ApiSchemaGenerator(unknownMime);
      const result = inst.toExample(shape);
      assert.strictEqual(result, null);
    });
  });
});
